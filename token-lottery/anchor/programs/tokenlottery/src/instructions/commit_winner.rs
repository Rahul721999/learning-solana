use crate::{errors::ErrorCode, TokenLotteryAccount};
use anchor_lang::prelude::*;
use switchboard_on_demand::RandomnessAccountData;

pub fn commit_winner(ctx: Context<CommitWinner>) -> Result<()> {
    let clock = Clock::get()?;
    let token_lottery = &mut ctx.accounts.token_lottery_account;

    // check if payer is the Lottery-Creator
    if ctx.accounts.payer.key() != token_lottery.authority {
        return Err(ErrorCode::NotAuthorized.into());
    }

    let randomness_data =
        RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow()).unwrap();

    if randomness_data.seed_slot != clock.slot - 1 {
        return Err(ErrorCode::RandomnessAlreadyRevealed.into());
    }

    // update token_lottery_account data
    token_lottery.randomness_account = ctx.accounts.randomness_account_data.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CommitWinner<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"token_lottery".as_ref()],
        bump = token_lottery_account.bump
    )]
    pub token_lottery_account: Account<'info, TokenLotteryAccount>,

    /// CHECK
    pub randomness_account_data: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
