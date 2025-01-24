use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
pub struct Deposite<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds=[mint.key().as_ref()],
        bump
    )]
    pub bank: Account<'info, Bank>,

    #[account(
        mut,
        seeds=[b"treasury".as_ref(), mint.key().as_ref()],
        bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

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

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

/*
    1. CPI transfer from user's token account to bank's token account
    2. Calculate new shares to be added to the bank
    3. Update user's deposited amount and total collateral value
    4. Update bank's total deposited and total deposit shares
*/
pub fn process_deposite(ctx: Context<Deposite>, amount: u64) -> Result<()> {
    // prepare accounts required for CPI transfer
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.user_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.bank_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts);
    let decimals = ctx.accounts.mint.decimals;

    token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

    /* ------------Calculate the new shares to be added to the bank------------ */
    let bank = &mut ctx.accounts.bank;

    if bank.total_deposits == 0 {
        bank.total_deposits = amount;
        bank.total_deposit_shares = amount;
    }

    /*  NOTE: checked_ prefix performs a safe division operation. That returns a Option type, which will be none
       if the division results in a arithmatic overflow or zero
    */
    let deposit_ratio = amount.checked_div(bank.total_deposits).unwrap();
    let users_shares = deposit_ratio
        .checked_mul(bank.total_deposit_shares)
        .unwrap();

    let user = &mut ctx.accounts.user_account;

    // check if depositing usdc or sol
    match ctx.accounts.mint.to_account_info().key() {
        key if key == user.usdc_address => {
            user.deposited_usdc += amount;
            user.deposited_usdc_shares += users_shares;
        }
        _ => {
            user.deposited_sol += amount;
            user.deposited_sol_shares += users_shares;
        }
    }

    bank.total_deposits += amount;
    bank.total_deposit_shares += users_shares;

    user.last_updated = Clock::get()?.unix_timestamp;

    Ok(())
}
