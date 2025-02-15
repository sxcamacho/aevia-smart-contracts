<p align="center">
  <img src="aevia.png" alt="Aevia Image"/>
</p>

# Aevia Protocol

The Aevia Protocol is a smart contract that enables secure token transfers through signed messages. It allows users to pre-authorize token transfers that can be executed later by authorized operators. This is particularly useful for inheritance planning, scheduled transfers, or any scenario where you want to prepare a transfer in advance.

## Features
- Supports ERC20, ERC721, and ERC1155 tokens
- Role-based access control for operators
- Signature-based authorization
- Legacy revocation system
- EIP-712 compliant signatures

## Contract Methods

### Administrative Functions

#### `addOperator(address operator)`
- Adds a new operator to execute legacy transfers
- Only callable by admin
- Parameters:
  - `operator`: Address to be granted operator role

#### `removeOperator(address operator)`
- Removes an operator's privileges
- Only callable by admin
- Parameters:
  - `operator`: Address to be removed from operator role

### User Functions

#### `revokeLegacy(uint256 legacyId)`
- Allows a user to revoke a previously signed legacy
- Parameters:
  - `legacyId`: Unique identifier of the legacy to revoke
- Emits: `LegacyRevoked` event

#### `isLegacyRevoked(address from, uint256 legacyId)`
- Checks if a specific legacy has been revoked
- Parameters:
  - `from`: Address of the legacy owner
  - `legacyId`: ID of the legacy to check
- Returns: `bool` indicating if the legacy is revoked

### Operator Functions

#### `executeLegacy(uint256 legacyId, TokenType tokenType, address tokenAddress, uint256 tokenId, uint256 amount, address from, address to, bytes memory signature)`
- Executes a legacy transfer based on a valid signature
- Only callable by operators
- Parameters:
  - `legacyId`: Unique identifier for the legacy
  - `tokenType`: Type of token (0=ERC20, 1=ERC721, 2=ERC1155)
  - `tokenAddress`: Address of the token contract
  - `tokenId`: ID of the token (for ERC721/ERC1155)
  - `amount`: Amount to transfer (for ERC20/ERC1155)
  - `from`: Address of the token owner
  - `to`: Address of the recipient
  - `signature`: EIP-712 signature authorizing the transfer
- Emits: `LegacyExecuted` event

## Development

#### Install dependencies
```
npm install or yarn install
```

#### Show hardhat help
```
npx hardhat help
```

#### Compile
```
npx hardhat compile
```

#### Execute tests
```
npx hardhat test
```

#### Execute test with gas report
```
REPORT_GAS=true npx hardhat test
```

#### Run local node
```
npx hardhat node
```

#### Deploy AeviaProtocol
```
npx hardhat ignition deploy ignition/modules/AeviaProtocol.ts --network sepolia --verify
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

⚠️ Never commit your `.env` file or expose your private keys

#### Network Configuration
```
ETHEREUM_NODE_URL=         # Infura URL for Ethereum mainnet
SEPOLIA_NODE_URL=          # Infura URL for Sepolia network
MANTLE_SEPOLIA_NODE_URL=   # Infura URL for Mantle testnet
MANTLE_NODE_URL=           # Infura URL for Mantle mainnet
BASE_NODE_URL=             # Infura URL for Base mainnet
MODE_NODE_URL=             # Infura URL for Mode mainnet
FUJI_NODE_URL=             # Infura URL for Fuji network
```

#### API Keys
```
MANTLESCAN_API_KEY=        # API key for Mantle block explorer
BASESCAN_API_KEY=          # API key for Base block explorer
ETHERSCAN_API_KEY=         # API key for Etherscan
MODESCAN_API_KEY=          # API key for Mode block explorer
SNOWTRACE_API_KEY=         # API key for Snowtrace
```

#### Private Keys
```
PRIVATE_KEY=              # Deployer's private key (without 0x prefix)
OPERATOR_PRIVATE_KEY=     # Operator's private key (without 0x prefix)
```
