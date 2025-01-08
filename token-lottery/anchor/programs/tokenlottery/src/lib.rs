#![allow(unexpected_cfgs)]
mod instructions;
use instructions::*;
mod errors;
use anchor_lang::prelude::*;

declare_id!("5m1SMwjzymVG7MSX4DEvu9v354StReHGvxJL6oPDWsXo");

#[constant]
pub const NAME: &str = "Token Lottery Ticket #";
#[constant]
pub const SYMBOL: &str = "TLT";
#[constant]
pub const URI: &str =
    "https://github.com/Rahul721999/learning-solana/blob/main/token-lottery/anchor/metadata.json";

const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod tokenlottery {
    use super::*;

    // Invoked by the lottery creator to initialize the lottery (startTime, endTime etc.).
    pub fn initialize_lottery_config(
        ctx: Context<InitializeLotteryConfig>,
        start_time: u64,
        end_time: u64,
        ticket_price: u64,
    ) -> Result<()> {
        instructions::initialize_config(ctx, start_time, end_time, ticket_price)
    }

    // Responsible for initializing the mint collection, metadata, master edition and associated token account.
    pub fn initialize_lottery(ctx: Context<InitializeLottery>) -> Result<()> {
        instructions::initialize_lottery(ctx)
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        instructions::buy_ticket(ctx)
    }
    pub fn commit_a_winner(ctx: Context<CommitWinner>) -> Result<()> {
        instructions::commit_winner(ctx)
    }
    
    pub fn choose_a_winner(ctx: Context<ChooseWinner>) -> Result<()> {
        instructions::choose_winner(ctx)
    }
    // pub fn claim_prize(_ctx: Context<InitializeTokenlottery>) -> Result<()> {
    //     Ok(())
    // }
}
