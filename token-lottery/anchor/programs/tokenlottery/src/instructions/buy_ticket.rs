use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint,MintTo, mint_to, TokenInterface, TokenAccount},
};
use anchor_spl::metadata::{
    Metadata,
    CreateMetadataAccountsV3,
    CreateMasterEditionV3,
    SetAndVerifySizedCollectionItem,
    create_master_edition_v3,
    create_metadata_accounts_v3,
    set_and_verify_sized_collection_item,
    mpl_token_metadata::types::{
            CollectionDetails,
            Creator, 
            DataV2,
        },
};
use anchor_lang::system_program;
use crate::{
    errors::ErrorCode, NAME, SYMBOL, URI,
};

use super::TokenLotteryAccount;

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"token_lottery".as_ref()],
        bump = token_lottery.bump
    )]
    pub token_lottery: Account<'info, TokenLotteryAccount>, // require to update the details like ticket counts

    #[account(
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        mint::token_program = token_program,
        seeds = [token_lottery.ticket_num.to_le_bytes().as_ref()],
        bump,
    )]
    pub ticket_mint: InterfaceAccount<'info, Mint>, // individual mint for each ticket

    #[account(
        init,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program
    )]
    pub buyer_token_account: InterfaceAccount<'info, TokenAccount>, // buyer's token account required to transfer the ticket

    #[account(
      mut,
      seeds = [b"collection_mint".as_ref()],
      bump  
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>, // collection mint
    
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
    /// CHECK: This account is initialized by metaplex program
    pub ticket_metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds=[
            b"metadata",
            token_metadata_program.key().as_ref(),
            ticket_mint.key().as_ref(),
            b"edition"
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This account is initialized by metaplex program
    pub ticket_master_editions: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds=[
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This account is initialized by metaplex program
    pub collection_metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds=[
            b"metadata",
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition"
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This account is initialized by metaplex program
    pub collection_master_editions: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
    // check current time is not exceeding the end time
    let clock = Clock::get()?;
    let ticket_name = NAME.to_string() + &ctx.accounts.token_lottery.ticket_num.to_string();

    msg!("Curr Slot: {}, start: {}, end: {}", clock.slot, ctx.accounts.token_lottery.start_time, ctx.accounts.token_lottery.end_time);
    if clock.slot < ctx.accounts.token_lottery.start_time ||
        clock.slot > ctx.accounts.token_lottery.end_time{
            return Err(ErrorCode::LotteryNotOpen.into());
        }

    // tranfer sol lamports from buyer account to token lottery program account
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer { 
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.token_lottery.to_account_info(),
            },
        ), 
        ctx.accounts.token_lottery.ticket_price,
    )?;

    ctx.accounts.token_lottery.lottery_pot_amount += ctx.accounts.token_lottery.ticket_price;

    // create ticket
    let signer_seeds : &[&[&[u8]]] = &[&[
        b"collection_mint".as_ref(),
        &[ctx.bumps.collection_mint],
    ]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo{
                mint: ctx.accounts.ticket_mint.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.collection_mint.to_account_info(),
            },
            signer_seeds
        ),
        1
    )?;

    msg!("Creating metadata account...");
    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3{
                metadata: ctx.accounts.ticket_metadata.to_account_info(),
                mint: ctx.accounts.ticket_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.buyer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            }, 
            &signer_seeds
        ), 
        DataV2{
            name: ticket_name,
            symbol: SYMBOL.to_string(),
            uri: URI.to_string(),
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator{
                address: ctx.accounts.collection_mint.key(),
                verified: false,
                share: 100,
            }]),
            collection: None,
            uses: None,
        }, 
        true, 
        true, 
        Some(CollectionDetails::V1 { size: 0 })
    )?;

    msg!("Creating master edition account...");
    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(), 
            CreateMasterEditionV3{
                payer:ctx.accounts.buyer.to_account_info(),
                mint:ctx.accounts.ticket_mint.to_account_info(),
                edition:ctx.accounts.ticket_master_editions.to_account_info(),
                mint_authority:ctx.accounts.collection_mint.to_account_info(),
                update_authority:ctx.accounts.collection_mint.to_account_info(),
                token_program:ctx.accounts.token_program.to_account_info(),
                system_program:ctx.accounts.system_program.to_account_info(),
                rent:ctx.accounts.rent.to_account_info(), 
                metadata: ctx.accounts.ticket_metadata.to_account_info(), 
            }, 
            &signer_seeds
        ), 
        Some(0)
    )?; 



    set_and_verify_sized_collection_item(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(), 
            SetAndVerifySizedCollectionItem{
                metadata: ctx.accounts.ticket_metadata.to_account_info(),
                collection_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.buyer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_editions.to_account_info(),
            }, 
            signer_seeds,
        ), 
        None
    )?;

    // Increase the ticket count
    ctx.accounts.token_lottery.ticket_num += 1;
    
    Ok(())
}
