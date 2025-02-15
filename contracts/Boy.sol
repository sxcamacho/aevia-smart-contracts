// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../lib/ERC721A.sol";

contract JustABoy is ERC721A, Ownable, ReentrancyGuard {
    error MintingNotActive();
    error NonexistentToken();
    error MaxGaslessMinted();

    event TokensMinted(address indexed to, uint256 quantity);

    bool public isActive;
    string private _tokenUri;
    uint256 public pricePerToken = 1 ether;

    constructor() ERC721A("JustABoy", "BOY") Ownable(msg.sender) {}

    modifier whenActive() {
        if (!isActive) revert MintingNotActive();
        _;
    }

    function mint(address to) external whenActive nonReentrant {
        if (_numberMinted(to) >= 69) revert MaxGaslessMinted();
        _safeMint(to, 1);
        emit TokensMinted(to, 1);
    }

    function batchMint(address to, uint256 quantity) external payable whenActive nonReentrant {
        uint256 requiredPayment = quantity * pricePerToken;
        require(msg.value >= requiredPayment, "Insufficient payment");

        _safeMint(to, quantity);
        emit TokensMinted(to, quantity);

        uint256 excess = msg.value - requiredPayment;
        if (excess > 0) {
            (bool success,) = payable(msg.sender).call{value: excess}("");
            require(success, "Refund failed");
        }
    }

    function toggleMinting() external onlyOwner {
        isActive = !isActive;
    }

    function _baseURI() internal view override returns (string memory) {
        return _tokenUri;
    }

    function setTokenUri(string memory uri) external onlyOwner {
        _tokenUri = uri;
    }

    function setPrice(uint256 price) external onlyOwner {
        pricePerToken = price;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert NonexistentToken();
        return _baseURI();
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}