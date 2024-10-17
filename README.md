# Learning Solana

Welcome to my Solana learning repository! This repo contains various projects and experiments as I learn about Solana development using Rust and TypeScript.

## Environment Setup

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [Yarn](https://yarnpkg.com/)
-   [Rust](https://www.rust-lang.org/) (install via `rustup`)
-   [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
-   [Anchor CLI](https://project-serum.github.io/anchor/getting-started/installation.html)

## Install Solana web3.js

```bash
   npm install @solana/web3.js
```

## Set Up Local Solana Test Validator

-   Command to start solana env locally

```bash
   solana-test-validator
```

-   Connect to the local validator:

```bash
   solana config set --url localhost
```

## 1. Start development workflow

-   For Rust-based Solana programs: You can use the Anchor framework to create and deploy your smart contracts.

```
   anchor init my_solana_project
   cd my_solana_project
```

## Project Structure

```
my_solana_project/
├── Anchor.toml
├── Cargo.toml
├── programs/
│   └── my_solana_project/
│       └── src/
│           └── lib.rs
├── migrations/
├── tests/
│   └── my_solana_project.ts
└── target/
```

-   Anchor.toml: Configuration file for the Anchor framework.
-   Cargo.toml: Configuration for Rust dependencies and project settings.
-   programs/: Contains the Rust smart contract (program).
-   lib.rs: The main Rust source file where you’ll write your Solana program.
-   tests/: Contains the TypeScript tests for your program.

## 2. Write your On-chain program on lib.rs

## 3. Build project

-   build the project with following command

```
   anchor build
```

-   sync the 32Bit hash generated in the build process with the following command

```
   anchor keys sync
```

## 4. Deploy the program

### before deploying ensure your `Anchor.toml` file config

```bash
[programs.localnet]
    my_solana_project = "onchain-program-address"

[registry]
    url = "https://api.apr.dev"

[provider]
    cluster = "devnet" // change it accordinglly
    wallet = "~/localwallet1.json" // change the provider wallet address accordinglly

```

### Deploy with the following command

```
anchor deploy
```
