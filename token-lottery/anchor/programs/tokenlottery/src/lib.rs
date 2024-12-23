#![allow(clippy::result_large_err, unused_imports)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{TokenAccount, TokenInterface},
};

declare_id!("8BwyWuqMWnNay4a2d2FKX93vKA9YZjK4ddHDcYZRACAn");

const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod tokenlottery {
    use super::*;

    /// Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
    pub fn initialize_config(
        ctx: Context<InitializeLotteryConfig>,
        start_time: u64,
        end_time: u64,
        ticket_price: u64,
        prize_amount: u64,
    ) -> Result<()> {
        *ctx.accounts.token_lottery_account = TokenLotteryAccount {
            bump: ctx.accounts.token_lottery_account.bump,
            winner: Pubkey::default(),
            winner_claimed: false,
            start_time,
            end_time,
            prize_amount,
            ticket_price,
            ticket_count: 0,
            winner_commitment: 0,
            winner_committed: false,
            winner_chosen: false,
            authority: *ctx.accounts.payer.key,
            randomness_account: Pubkey::default(),
        };
        Ok(())
    }
    // pub fn initialize_lottery(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn buy_ticket(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn commit_a_winner(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn choose_a_winner(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
    // pub fn claim_prize(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
}

#[derive(Accounts)]
#[instruction(start_time: u64, end_time: u64, prize_amount: u64, ticket_price: u64)]
pub struct InitializeLotteryConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        space = ANCHOR_DISCRIMINATOR + TokenLotteryAccount::INIT_SPACE,
        payer = payer,
        seeds = [b"token_lottery".as_ref()],
        bump
    )]
    pub token_lottery_account: Account<'info, TokenLotteryAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct TokenLotteryAccount {
    pub bump: u8,
    pub winner: Pubkey,
    pub winner_claimed: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub prize_amount: u64,
    pub ticket_price: u64,
    pub ticket_count: u64,
    pub winner_commitment: u64,
    pub winner_committed: bool,
    pub winner_chosen: bool,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
