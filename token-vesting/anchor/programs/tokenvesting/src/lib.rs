#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};
mod error;
// use error::ErrorCode;

const ANCHOR_DISCRIMINATOR: usize = 8;
declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod tokenvesting {
    use error::ErrorCode;

    use super::*;

    pub fn create_employee_vesting(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        *ctx.accounts.vesting_account = VestingAccount {
            owner: ctx.accounts.signer.key(),
            company_name,
            token_mint: ctx.accounts.token_mint.key(),
            treasury_token_account: ctx.accounts.treasury_token_account.key(),
            treasury_bump: ctx.bumps.treasury_token_account,
            bump: ctx.bumps.vesting_account,
        };
        Ok(())
    }

    pub fn create_employee_account(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        cliff_period: i64,
        total_token_amount: i64,
    ) -> Result<()> {
        *ctx.accounts.employee_account = EmployeeAccount {
            beneficiary: ctx.accounts.beneficiary.key(),
            start_time,
            end_time,
            cliff_period,
            vesting_account: ctx.accounts.vesting_account.key(),
            total_token_amount,
            total_token_withdrawn: 0,
            bump: ctx.bumps.employee_account,
        };

        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>, _company_name: String) -> Result<()> {
        let employee_account = &mut ctx.accounts.employee_account;
        let curr_timestamp = Clock::get()?.unix_timestamp;

        // validate cliff period
        if curr_timestamp < employee_account.cliff_period {
            return Err(ErrorCode::ClaimNotAvailableYet.into());
        }

        // calculate the vested amount
        let time_since_start = curr_timestamp.saturating_sub(employee_account.start_time);
        let total_vesting_time = employee_account
            .end_time
            .saturating_sub(employee_account.start_time);

        if total_vesting_time == 0 {
            return Err(ErrorCode::InvalidVestingPeriod.into());
        };

        let vested_amount = if curr_timestamp >= employee_account.end_time {
            employee_account.total_token_amount
        } else {
            match employee_account
                .total_token_amount
                .checked_mul(time_since_start as i64)
            {
                Some(product) => product / total_vesting_time as i64,
                None => return Err(ErrorCode::CalcultionOverflow.into()),
            }
        };

        // find the claimable amount
        let claimable_amount = vested_amount.saturating_sub(employee_account.total_token_withdrawn);
        if claimable_amount == 0 {
            return Err(ErrorCode::NothingToClaim.into());
        };

        // contruct the transaction
        let transfer_cpi_accounts = TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.employee_token_account.to_account_info(),
            authority: ctx.accounts.treasury_token_account.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vesting_tresury",
            ctx.accounts.vesting_account.company_name.as_ref(),
            &[ctx.accounts.vesting_account.treasury_bump],
        ]];

        let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts).with_signer(signer_seeds);

        let decimals = ctx.accounts.token_mint.decimals;
        token_interface::transfer_checked(cpi_ctx, claimable_amount as u64, decimals)?;
        employee_account.total_token_withdrawn += claimable_amount;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + VestingAccount::INIT_SPACE,
        seeds = [company_name.as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>, // Holds the company metadata

    #[account(
        init,
        payer = signer,
        token::mint = token_mint,
        token::authority = treasury_token_account,
        seeds =  [b"vesting_treasury", company_name.as_bytes()],
        bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>, // Holds the actual token
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

// Vesting Account: Storest the metadata of the company configued vesting Schedule
#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    #[max_len(50)]
    pub company_name: String,
    pub owner: Pubkey,
    pub token_mint: Pubkey,             // token mint address
    pub treasury_token_account: Pubkey, // account that holds the actual token
    pub treasury_bump: u8,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateEmployeeAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>, // Employee will be the signer here
    pub beneficiary: SystemAccount<'info>,

    #[account(has_one = owner)]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + EmployeeAccount::INIT_SPACE,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
        bump
    )]
    pub employee_account: Account<'info, EmployeeAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_period: i64,
    pub vesting_account: Pubkey,
    pub total_token_amount: i64,
    pub total_token_withdrawn: i64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,

    #[account(
        mut,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
        bump = employee_account.bump,
        has_one = beneficiary,
        has_one = vesting_account
    )]
    pub employee_account: Account<'info, EmployeeAccount>,

    #[account(
        mut,
        seeds = [company_name.as_ref()],
        bump = vesting_account.bump,
        has_one = treasury_token_account,
        has_one = token_mint
)]
    pub vesting_account: Account<'info, VestingAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = token_mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
