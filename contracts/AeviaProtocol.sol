// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AeviaProtocol is EIP712 {
    enum TokenType { ERC20, ERC721, ERC1155 }

    using ECDSA for bytes32;

    // Mapping to track revoked legacies
    mapping(address => mapping(uint256 => bool)) public revokedLegacies;

    // Type definition and its fields for EIP-712
    bytes32 public constant LEGACY_TYPEHASH = keccak256(
        "Legacy(uint256 legacyId,uint8 tokenType,address tokenAddress,uint256 tokenId,uint256 amount,address from,address to)"
    );

    event LegacyExecuted(
        uint256 indexed legacyId,
        uint8 tokenType,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        address from,
        address to
    );

    event LegacyRevoked(
        address indexed from,
        uint256 indexed legacyId
    );

    constructor() EIP712("AeviaProtocol", "1.0.0") {}

    function executeLegacy(
        uint256 legacyId,
        TokenType tokenType,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        address from,
        address to,
        bytes memory signature
    ) external {
        // Check if legacy is revoked
        require(!revokedLegacies[from][legacyId], "Legacy has been executed or revoked");

        // Create structured hash according to EIP-712
        bytes32 structHash = keccak256(
            abi.encode(
                LEGACY_TYPEHASH,
                legacyId,
                uint8(tokenType),
                tokenAddress,
                tokenId,
                amount,
                from,
                to
            )
        );

        // Get final hash according to EIP-712
        bytes32 hash = _hashTypedDataV4(structHash);

        // Recover signer
        address signer = ECDSA.recover(hash, signature);

        // Verify that the signer is the from address
        require(signer == from, "Invalid signature");

        // Perform the transfer based on token type
        if (tokenType == TokenType.ERC20) {
            require(tokenId == 0, "ERC20: tokenId must be 0");
            require(amount > 0, "ERC20: amount must be greater than 0");
            bool success = IERC20(tokenAddress).transferFrom(
                from,
                to,
                amount
            );
            require(success, "ERC20: Transfer failed");
        }
        else if (tokenType == TokenType.ERC721) {
            require(amount == 1, "ERC721: amount must be 1");
            IERC721(tokenAddress).transferFrom(
                from,
                to,
                tokenId
            );
        }
        else if (tokenType == TokenType.ERC1155) {
            require(amount > 0, "ERC1155: amount must be greater than 0");
            IERC1155(tokenAddress).safeTransferFrom(
                from,
                to,
                tokenId,
                amount,
                ""
            );
        }

        // Mark legacy as revoked after use to prevent replay
        revokedLegacies[from][legacyId] = true;

        emit LegacyExecuted(
            legacyId,
            uint8(tokenType),
            tokenAddress,
            tokenId,
            amount,
            from,
            to
        );
    }

    function revokeLegacy(uint256 legacyId) external {
        revokedLegacies[msg.sender][legacyId] = true;
        emit LegacyRevoked(msg.sender, legacyId);
    }

    // Helper function to get the domainSeparator
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // Helper function to check if a legacy is revoked
    function isLegacyRevoked(address from, uint256 legacyId) external view returns (bool) {
        return revokedLegacies[from][legacyId];
    }
} 