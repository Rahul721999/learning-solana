use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    error::ErrorCode,
    state::{Bank, User},
};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub signer: Signer<'info>, // Person withdrawing token
    pub mint: InterfaceAccount<'info, Mint>, // The token being withdrawn (usdc / sol)

    // bank account
    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump
    )]
    pub bank_account: Account<'info, Bank>,

    // bank token account
    #[account(
        mut,
        seeds=[b"treasury".as_ref(), mint.key().as_ref()],
        bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    // user account
    #[account(
        mut,
        seeds = [signer.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_account: Program<'info, AssociatedToken>,
}

/*
 *1. CPI transfer from bank token account to user's account.
 *2. Calculate new shares to be removed from the bank
 *3. Update user's deposited amount and total collateral value
 *4. Update bank's total deposit and total deposited shares
*/
pub fn process_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user_account;
    let bank = &mut ctx.accounts.bank_account;

    // Check deposited token is USDC or SOL
    let mint_key = ctx.accounts.mint.key();
    let deposited_value = match mint_key {
        key if key == user.usdc_address => user.deposited_usdc,
        _ => user.deposited_sol,
    };

    // Check user balance
    if amount > deposited_value {
        return Err(ErrorCode::InsufficientFund.into());
    };
    // calculate shares to remove safely
    let shares_to_remove = amount
        .checked_mul(bank.total_deposit_shares)
        .ok_or(ErrorCode::ArithmeticError)?
        .checked_div(bank.total_deposits)
        .ok_or(ErrorCode::ArithmeticError)?;

    // Ensure the user hash enough shares:
    if mint_key == user.usdc_address && shares_to_remove > user.deposited_usdc_shares{
        return Err(ErrorCode::InsufficientShares.into())
    }
    if mint_key != user.usdc_address && shares_to_remove > user.deposited_sol_shares{
        return Err(ErrorCode::InsufficientShares.into())
    }

    // prepare accounts required for transfer
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.bank_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        authority: ctx.accounts.bank_token_account.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"treasury",
        mint_key.as_ref(),
        &[ctx.bumps.bank_token_account],
    ]];
    let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts).with_signer(signer_seeds);
    let decimals = ctx.accounts.mint.decimals;

    transfer_checked(cpi_ctx, amount, decimals)?;

    // update user balance
    match mint_key{
        key if key == user.usdc_address => {
            user.deposited_usdc -= amount;
            user.deposited_usdc_shares -= shares_to_remove;
        }
        _ => {
            user.deposited_sol -=  amount;
            user.deposited_sol_shares -= shares_to_remove;
        }
    }

    // update bank totals
    bank.total_deposit_shares -= shares_to_remove;
    bank.total_deposits -= amount;

    Ok(())
}
