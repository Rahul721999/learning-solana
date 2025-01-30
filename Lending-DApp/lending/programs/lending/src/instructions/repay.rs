use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token_interface::{Mint, transfer_checked, TokenAccount, TokenInterface, TransferChecked}
};

use crate::{error::ErrorCode, state::{Bank, User}};

#[derive(Accounts)]
pub struct Repay<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump
    )]
    pub bank_account: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [
            b"treasury",
            mint.key().as_ref()
        ],
        bump 
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [signer.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info,User>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/// Repay function just needs to make a CPI tranfer from the user's token account into Bank's token account;
pub fn process_repay_loan(ctx: Context<Repay>, amount: u64) -> Result<()>{
    let bank = &mut ctx.accounts.bank_account;
    let user = &mut ctx.accounts.user_account;

    let mint_key = ctx.accounts.mint.key();
    
    
    // find borrowed_asset
    let borrowed_asset = match mint_key{
        key if key == user.usdc_address =>{
            user.borrowed_usdc
        },
        _ =>{
            user.borrowed_sol
        }
    };


    // Check overpay
    if amount > borrowed_asset {
        return Err(ErrorCode::OverRepay.into())
    }

    /*  ----------------------Create CPI transfer---------------------- */
    // accounts needed for CPI transfer
    let transfer_cpi_accounts = TransferChecked{
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.bank_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts);
    let decimals = ctx.accounts.mint.decimals;

    transfer_checked(cpi_ctx, amount, decimals)?;

    // calculate user's share to the bank
    let borrowed_ratio = amount.checked_div(bank.total_borrowed).unwrap();
    let users_share = bank.total_borrowed_shares.checked_mul(borrowed_ratio).unwrap();

    // change the value to the bank
    match mint_key{
        key if key == user.usdc_address => {
            user.borrowed_usdc -= amount;
            user.borrowed_usdc_shares -= users_share;
        },
        _ => {
            user.borrowed_sol -= amount;
            user.borrowed_sol_shares -= users_share;
        }
    }

    bank.total_borrowed -= amount;
    bank.total_borrowed_shares -= users_share;
    Ok(())
}