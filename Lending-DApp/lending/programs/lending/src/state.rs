use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    /// Pubkey of the user's wallet
    pub owner: Pubkey,
    /// User's deposited tokens in the SOL bank
    pub deposited_sol: u64,
    /// User's deposited shares in the SOL bank
    pub deposited_sol_shares: u64,
    /// User's borrowed tokens in the SOL bank
    pub borrowed_sol: u64,
    /// User's borrowed shares in the SOL bank
    pub borrowed_sol_shares: u64,
    /// User's deposited tokens in the USDC bank
    pub deposited_usdc: u64,
    /// User's deposited shares in the USDC bank
    pub deposited_usdc_shares: u64,
    /// User's borrowed tokens in the USDC bank
    pub borrowed_usdc: u64,
    /// User's borrowed shares in the USDC bank
    pub borrowed_usdc_shares: u64,
    /// USDC mint address
    pub usdc_address: Pubkey,
    /// Current health factor of the user
    pub health_factor: u64,
    /// Last updated timestamp
    pub last_updated: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Bank {
    /// Authority to make changes to Bank State
    pub authority: Pubkey,
    /// Mint addres of the asset
    pub mint_address: Pubkey,
    /// Current number of tokens in the bank
    pub total_deposits: u64,
    /// Current number of deposited shares in the bank
    pub total_deposit_shares: u64,
    /// Current number of borrowed tokens in the bank
    pub total_borrowed : u64,
    /// Current number of borrowed shares in the bank
    pub total_borrowed_shares: u64,
    /// Loan-to-Value (LTV) ratio: at which the loan is defined as under collateralized and can be liquidated 
    pub liquidation_threashold: u64,
    /// Liquidation-bonus: A percentage bonus of collateral given to liquidators for closing under-collaterized loans
    pub liquidation_bonus: u64,
    /// Close-Factor: Specifies the max percentage of the collateral that can be liquidated in a single transaction
    pub liquidation_close_factor: u64,
    /// max_ltv: Defines max LTV ratio allowed for borrowers to prevent under-collaterization
    pub max_ltv: u64,
    /// last update timestamp
    pub last_updated: i64,
    /// Current interest rate for the loans
    pub interest_rate: u64,
}
