use crate::{errors::ErrorCode, TokenLotteryAccount};
use anchor_lang::prelude::*;
use switchboard_on_demand::RandomnessAccountData;


pub fn choose_winner(ctx: Context<ChooseWinner>) -> Result<()>{
    let clock = Clock::get()?;
    let token_lottery = &mut ctx.accounts.token_lottery_account;

    // check randomeness account data
    if ctx.accounts.randomness_account_data.key() != token_lottery.randomness_account{
        return Err(ErrorCode::IncorrectRandomnessAccount.into());
    }

    // check if payer is the lottery-creator
    if ctx.accounts.payer.key() != token_lottery.authority {
        return Err(ErrorCode::NotAuthorized.into());
    }
    
    // check if lottery is ended
    if clock.slot < token_lottery.end_time{
        msg!("Current slot: {}", clock.slot);
        msg!("End slot: {}", token_lottery.end_time);
        return Err(ErrorCode::LotteryNotCompleted.into());
    }

    // check if winner is already chosen
    require!(token_lottery.winner_chosen == false, ErrorCode::WinnerAlreadyChosen);

    let randomness_data = 
        RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())
        .unwrap();
    let revealed_random_value = randomness_data.get_value(&clock)
        .map_err(|_| ErrorCode::RandomnessNotResolved)?;

    msg!("Randomness result: {}", revealed_random_value[0]);
    msg!("Ticket num: {}", token_lottery.ticket_num);

    let randomness_result = revealed_random_value[0] as u64 % token_lottery.ticket_num;

    msg!("Winner: {}", randomness_result);

    // update the token_lottery data
    token_lottery.winner = randomness_result;
    token_lottery.winner_chosen = true;

    Ok(())
}

#[derive(Accounts)]
pub struct ChooseWinner<'info> {
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
