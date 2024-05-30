# Airdrop Project

## Project Description

This project is a simple TypeScript application designed to airdrop Solana (SOL) tokens to a specified wallet address. The project demonstrates basic interaction with the Solana blockchain using TypeScript, including building the TypeScript code into JavaScript and running the generated JavaScript file.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- TypeScript (installed globally)

## Project Structure

The project structure is as follows:

- **src/index.ts**: The main TypeScript file containing the logic for airdropping SOL tokens.
- **dist/index.js**: The generated JavaScript file after building the TypeScript code.
- **package.json**: Contains project metadata and dependencies.
- **tsconfig.json**: TypeScript configuration file.

## Installation

1. Clone the repository:
   ```
   cd airdrop-project
   ```

## Configuration

1. Create a .env file in the root directory and add your Solana wallet details and RPC URL
   ```
   WALLET_SECRET_KEY=<your-wallet-secret-key>
   SOLANA_RPC_URL=<solana-rpc-url>
   ```

## Building the Project

    npm run build

- This command uses the TypeScript compiler to transpile the code from src/index.ts to dist/index.js

## Running the Project

After building the project, you can run the generated JavaScript file with Node.js:

```
node dist/index.js
```

This will execute the code in index.js, which performs the airdrop of SOL tokens to the specified wallet address.

## Additional Information

This project uses the Solana web3.js library to interact with the Solana blockchain. Ensure your wallet has sufficient SOL tokens to perform the airdrop and cover the transaction fees.
