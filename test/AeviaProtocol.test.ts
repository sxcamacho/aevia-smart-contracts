import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  AeviaProtocol,
  ERC20Mock,
  ERC721Mock,
  ERC1155Mock
} from "../typechain-types";

describe("AeviaProtocol", function () {
  let aeviaProtocol: AeviaProtocol;
  let erc20Token: ERC20Mock;
  let erc721Token: ERC721Mock;
  let erc1155Token: ERC1155Mock;
  let owner: SignerWithAddress;
  let from: SignerWithAddress;
  let to: SignerWithAddress;

  const TokenType = {
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2,
  };

  beforeEach(async function () {
    // Get signers
    [owner, from, to] = await ethers.getSigners();

    // Deploy mock tokens
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    erc20Token = await ERC20Mock.deploy("MockToken", "MTK");

    const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
    erc721Token = await ERC721Mock.deploy("MockNFT", "MNFT");

    const ERC1155Mock = await ethers.getContractFactory("ERC1155Mock");
    erc1155Token = await ERC1155Mock.deploy("");

    // Deploy AeviaProtocol
    const AeviaProtocol = await ethers.getContractFactory("AeviaProtocol");
    aeviaProtocol = await AeviaProtocol.deploy();

    // Mint tokens to 'from' address
    await erc20Token.mint(from.address, ethers.parseEther("1000"));
    await erc721Token.mint(from.address, 1);
    await erc1155Token.mint(from.address, 1, 100, "0x");

    // Approve AeviaProtocol
    await erc20Token.connect(from).approve(aeviaProtocol.target, ethers.parseEther("1000"));
    await erc721Token.connect(from).setApprovalForAll(aeviaProtocol.target, true);
    await erc1155Token.connect(from).setApprovalForAll(aeviaProtocol.target, true);
  });

  async function getSignature(legacyId: bigint, tokenType: number, tokenAddress: string, tokenId: bigint, amount: bigint, fromAddress: string, toAddress: string, signer: SignerWithAddress) {
    const domain = {
      name: "AeviaProtocol",
      version: "1.0.0",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await aeviaProtocol.getAddress()
    };

    const types = {
      Legacy: [
        { name: "legacyId", type: "uint256" },
        { name: "tokenType", type: "uint8" },
        { name: "tokenAddress", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "from", type: "address" },
        { name: "to", type: "address" }
      ]
    };

    const value = {
      legacyId,
      tokenType,
      tokenAddress,
      tokenId,
      amount,
      from: fromAddress,
      to: toAddress
    };

    return await signer.signTypedData(domain, types, value);
  }

  describe("ERC20 Transfers", function () {
    it("Should transfer ERC20 tokens with valid signature", async function () {
      const legacyId = 1n;
      const amount = ethers.parseEther("100");
      
      const signature = await getSignature(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        from
      );

      await expect(aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        signature
      )).to.emit(aeviaProtocol, "LegacyExecuted")
        .withArgs(legacyId, TokenType.ERC20, await erc20Token.getAddress(), 0n, amount, from.address, to.address);

      expect(await erc20Token.balanceOf(to.address)).to.equal(amount);
    });
  });

  describe("ERC721 Transfers", function () {
    it("Should transfer ERC721 token with valid signature", async function () {
      const legacyId = 1n;
      const tokenId = 1n;
      
      const signature = await getSignature(
        legacyId,
        TokenType.ERC721,
        await erc721Token.getAddress(),
        tokenId,
        1n,
        from.address,
        to.address,
        from
      );

      await expect(aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC721,
        await erc721Token.getAddress(),
        tokenId,
        1n,
        from.address,
        to.address,
        signature
      )).to.emit(aeviaProtocol, "LegacyExecuted");

      expect(await erc721Token.ownerOf(tokenId)).to.equal(to.address);
    });
  });

  describe("Signature Revocation", function () {
    it("Should not allow using revoked signature", async function () {
      const legacyId = 1n;
      const amount = ethers.parseEther("100");
      
      const signature = await getSignature(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        from
      );

      await aeviaProtocol.connect(from).revokeLegacy(legacyId);

      await expect(aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        signature
      )).to.be.revertedWith("Legacy has been executed or revoked");
    });
  });

  describe("Invalid Scenarios", function () {
    it("Should not allow reusing same legacyId", async function () {
      const legacyId = 1n;
      const amount = ethers.parseEther("50");
      
      const signature = await getSignature(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        from
      );

      await aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        signature
      );

      await expect(aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        signature
      )).to.be.revertedWith("Legacy has been executed or revoked");
    });

    it("Should not allow invalid signature", async function () {
      const legacyId = 1n;
      const amount = ethers.parseEther("100");
      
      const signature = await getSignature(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        to // Signing with wrong account
      );

      await expect(aeviaProtocol.executeLegacy(
        legacyId,
        TokenType.ERC20,
        await erc20Token.getAddress(),
        0n,
        amount,
        from.address,
        to.address,
        signature
      )).to.be.revertedWith("Invalid signature");
    });
  });
}); 