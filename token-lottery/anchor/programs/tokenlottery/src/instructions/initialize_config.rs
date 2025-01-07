use crate::*;
use anchor_lang::prelude::*;
use rand::Rng;

// Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
pub fn initialize_config(
    ctx: Context<InitializeLotteryConfig>,
    start_time: u64,
    end_time: u64,
    ticket_price: u64,
) -> Result<()> {
    let mut rng = rand::thread_rng();
    *ctx.accounts.token_lottery_account = TokenLotteryAccount {
        bump: ctx.bumps.token_lottery_account,
        winner: 0,
        winner_claimed: false,
        start_time,
        end_time,
        lottery_pot_amount: 0,
        ticket_price,
        ticket_num: rng.gen::<u64>(),
        winner_commitment: 0,
        winner_committed: false,
        winner_chosen: false,
        authority: *ctx.accounts.payer.key,
        randomness_account: Pubkey::default(),
    };
    Ok(())
}

/* ----------------------------Initialize Lottery Config---------------------------- */
#[derive(Accounts)]
#[instruction(start_time: u64, end_time: u64,  ticket_price: u64)]
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
    pub winner: u64,
    pub winner_claimed: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub lottery_pot_amount: u64,
    pub ticket_price: u64,
    pub ticket_num: u64,
    pub winner_commitment: u64,
    pub winner_committed: bool,
    pub winner_chosen: bool,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
