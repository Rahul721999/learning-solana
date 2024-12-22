#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod tokenlottery {
    use super::*;

    pub fn initialize(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.tokenlottery.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTokenlottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Tokenlottery::INIT_SPACE,
  payer = payer
  )]
    pub tokenlottery: Account<'info, Tokenlottery>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTokenlottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
    pub tokenlottery: Account<'info, Tokenlottery>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub tokenlottery: Account<'info, Tokenlottery>,
}

#[account]
#[derive(InitSpace)]
pub struct Tokenlottery {
    count: u8,
}
