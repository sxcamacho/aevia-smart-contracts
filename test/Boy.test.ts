import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { JustABoy } from "../typechain-types";

describe("JustABoy", function () {
  let boy: JustABoy;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Boy = await ethers.getContractFactory("JustABoy");
    boy = await Boy.deploy();
    
    // Activate minting
    await boy.connect(owner).toggleMinting();
  });

  describe("Minting", function () {
    it("Should mint a single boy", async function () {
      await expect(boy.connect(user).mint(user.address))
        .to.emit(boy, "Transfer")
        .withArgs(ethers.ZeroAddress, user.address, 0);

      expect(await boy.balanceOf(user.address)).to.equal(1);
      expect(await boy.ownerOf(0)).to.equal(user.address);
    });

    it("Should mint multiple boys", async function () {
      await boy.connect(user).mint(user.address);
      await boy.connect(user).mint(user.address);
      await boy.connect(user).mint(user.address);

      expect(await boy.balanceOf(user.address)).to.equal(3);

      for (let i = 0; i < 3; i++) {
        expect(await boy.ownerOf(i)).to.equal(user.address);
      }
    });
  });
});