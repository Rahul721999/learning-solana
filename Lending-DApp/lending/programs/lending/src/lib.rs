mod constants;
mod error;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("GHeNTmRLi6cM8mxrgz5jhys5kwnVPJEUNp19ykyWofqP");

#[program]
pub mod lending {
    use instructions::borrow::process_borrow;

    use super::*;

    /// initialize bank account
    pub fn initialize_bank(
        ctx: Context<InitBank>,
        liquidation_threshold: u64,
        max_ltv: u64,
    ) -> Result<()> {
        process_initialize_bank(ctx, liquidation_threshold, max_ltv)
    }

    /// initialize_user account
    pub fn initialize_user(ctx: Context<InitUser>, usdc_bank_account: Pubkey) -> Result<()> {
        process_initialize_user(ctx, usdc_bank_account)
    }

    /// deposite token
    pub fn deposite(ctx: Context<Deposite>, amount: u64) -> Result<()> {
        process_deposite(ctx, amount)
    }
    // withdraw token
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        process_withdraw(ctx, amount)
    }

    // borrow Loan
    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        process_borrow(ctx, amount)
    }

    // repay Loan
    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        process_repay_loan(ctx, amount)
    }

    // liquidate
    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        process_liquidate(ctx)
    }
}
