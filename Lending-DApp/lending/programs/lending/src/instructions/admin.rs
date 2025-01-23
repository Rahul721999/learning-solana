use crate::constants::ANCHOR_DISCRIMINATOR;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct InitBank<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        space = ANCHOR_DISCRIMINATOR + Bank::INIT_SPACE,
        payer = signer,
        seeds = [mint.key().as_ref()],
        bump
    )]
    pub bank: Account<'info, Bank>,
    #[account(
        init,
        token::mint = mint,
        token::authority = bank_token_account,
        payer = signer,
        seeds = [b"treasury", mint.key().as_ref()],
        bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn process_initialize_bank(
    ctx: Context<InitBank>,
    liquidation_threshold: u64,
    max_ltv: u64,
) -> Result<()> {
    let bank = &mut ctx.accounts.bank;
    bank.mint_address = ctx.accounts.mint.key();
    bank.authority = ctx.accounts.signer.key();
    bank.liquidation_threashold = liquidation_threshold;
    bank.max_ltv = max_ltv;
    Ok(())
}


#[derive(Accounts)]
pub struct InitUser<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + User::INIT_SPACE,
        seeds = [signer.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,
    pub system_program : Program<'info, System>
}


pub fn process_initialize_user(ctx: Context<InitUser>, usdc_bank_account: Pubkey) -> Result<()>{
    let user = &mut ctx.accounts.user_account;
    user.owner = ctx.accounts.signer.key();
    user.usdc_address = usdc_bank_account;

    let now = Clock::get()?.unix_timestamp;
    user.last_updated = now;
    Ok(())
}