# Counter Smart Contract

This project implements a simple counter smart contract on the Solana blockchain. The smart contract allows users to increment, decrement, and retrieve the current value of the counter.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

To deploy and interact with the smart contract, you need the following prerequisites:

- [Rust](https://www.rust-lang.org/) programming language
- [Solana Command Line Tool (CLI)](https://docs.solana.com/cli/installation)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (for building and deploying the client)

First, clone the repository and open two seperated terminal:

```bash
# first terminal
cd counter-smart-contract

# second terminal
cd client
```

## Usage

### Step 1: Build the smart-contract

```bash
# first terminal
cargo build-bpf
```

This will generate an `.sol` file in the following route: `target/deploy/<project_name>.so`, which will've to depoy on solana blockchain.

### Step 2: Deploy the smart-contract and get the Hash

```bash
    # to deploy the smart-contract
    solana program deploy ./target/deploy/<project-name>.so
```

This will return a hash / contractId / program's public Id. Copy that.

### Step 3: Build the client

Run the client code, providing the contractId, to enable interaction between your client code and smart-contract (that's now on-chain).

```bash
    # second terminal/ inside client project
    npm install
    npm run build
```
