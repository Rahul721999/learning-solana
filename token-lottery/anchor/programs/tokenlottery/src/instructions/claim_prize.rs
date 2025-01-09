use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{Metadata, MetadataAccount}, 
    token_interface::{Mint, TokenInterface, TokenAccount}};
use crate::{errors::ErrorCode, TokenLotteryAccount, NAME};

#[derive(Accounts)]
pub struct ClaimPrize<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"token_lottery".as_ref()],
        bump = token_lottery_account.bump
    )]
    pub token_lottery_account: Account<'info, TokenLotteryAccount>,

    #[account(
        mut,
        seeds = [b"collection_mint".as_ref()],
        bump,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        seeds = [token_lottery_account.winner.to_le_bytes().as_ref()],
        bump
    )]
    pub ticket_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds=[
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            ticket_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub ticket_metadata: Account<'info, MetadataAccount>, 

    #[account(
        associated_token::mint = ticket_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program
    )]
    pub winner_ticket_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        seeds=[
            b"metadata".as_ref(),
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub collection_metadata: Account<'info, MetadataAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_metadata_program: Program<'info, Metadata>
}

pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()>{
    // Check if winner has been chosen
    let token_lottery  = &mut ctx.accounts.token_lottery_account;
    if !token_lottery.winner_chosen{
        return Err(ErrorCode::WinnerNotChosen.into());
    }
    msg!("Winner Chosen: {}", token_lottery.winner);

    // check if the token belongs to collection
    require!(ctx.accounts.ticket_metadata.collection.as_ref().unwrap().verified, ErrorCode::NotVerifiedTicket);
    require!(
        ctx.accounts.ticket_metadata.collection.as_ref().unwrap().key == ctx.accounts.collection_mint.key(), 
        ErrorCode::IncorrectTicket
    );

    // check ticket name matches the metadata name
    let ticket_name = NAME.to_owned() + &ctx.accounts.token_lottery_account.winner.to_string();
    let metadata_name = ctx.accounts.ticket_metadata.name.replace("\u{0}", "");

    msg!("Ticket name: {}", ticket_name);
    msg!("Metadata name: {}", metadata_name);
    
    require!(ticket_name == metadata_name, ErrorCode::IncorrectTicket);

    // winner ticket account should be empty
    require!(ctx.accounts.winner_ticket_account.amount > 0, ErrorCode::IncorrectTicket);

    // if everything is correct, transfer the pot amount to winner token account
    let jackpot_amount = ctx.accounts.token_lottery_account.lottery_pot_amount;
    
    **ctx.accounts.token_lottery_account.to_account_info().try_borrow_mut_lamports()? -= jackpot_amount;
    **ctx.accounts.payer.try_borrow_mut_lamports()? += jackpot_amount;

    // empty the lottery pot
    ctx.accounts.token_lottery_account.lottery_pot_amount = 0;

    Ok(())
}