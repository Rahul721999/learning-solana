# Simple Lending Protocol

## What is a Lending Protocol?

A lending protocol is a decentralized platform that enables users to lend and borrow digital assets without intermediaries. It operates on a blockchain network using smart contracts to enforce the rules and handle transactions. The protocol typically works as follows:

- **Lenders** deposit assets to earn interest.
- **Borrowers** provide collateral to secure loans, borrowing against it while paying interest.

Lending protocols are a fundamental part of decentralized finance (DeFi) ecosystems and are commonly used for yield generation, liquidity access, and leverage trading.

## Features of this Lending Protocol

- **Deposits**: Users can deposit supported tokens into lending pools to earn interest.
- **Borrowing**: Borrowers can take loans by providing collateral in supported tokens.
- **Interest Rates**: Dynamically calculated based on supply and demand within each pool.
- **Collateral Management**: Monitors and ensures that borrowers maintain sufficient collateral.
- **Liquidation**: Automatically liquidates under-collateralized positions to protect the protocol.
- **Multi-Token Support**: Supports various tokens for both lending and borrowing.
- **Transparent and Secure**: Built on Solana blockchain for speed, low fees, and transparency.

## How It Works

1. `Deposit` : Lenders deposit tokens into the protocol's liquidity pool and start earning interest. The interest rate adjusts dynamically based on the pool's utilization.

2. `Borrow` : Borrowers deposit collateral to secure a loan. They can then borrow a portion of their collateral's value (Loan-to-Value ratio) in a supported token.

3. `Repayment` : Borrowers repay the loan along with accrued interest. Once the loan is repaid, the collateral is returned to the borrower.

4. `Liquidation` : If the value of the collateral falls below a specified threshold, the protocol liquidates the position to recover the borrowed amount.

### Supported Tokens

- Token A (e.g., USDC)
- Token B (e.g., SOL)
