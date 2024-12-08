use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>, // Sender Account
    to: &InterfaceAccount<'info, TokenAccount>,   // reciever Account
    amount: &u64, // Amount to be transfered (Specified in the Token's smallest unit)
    mint: &InterfaceAccount<'info, Mint>, // The mint account of the token
    authority: &Signer<'info>, // Signer of the transaction (usually the owner of the `from` account)
    token_program: &Interface<'info, TokenInterface>, // SPL token program interface, used to invoke the transfer
) -> Result<()> {
    let transfer_accounts_options = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    // Cross Program Invokation...
    let cpi_context = CpiContext::new(token_program.to_account_info(), transfer_accounts_options);

    transfer_checked(cpi_context, *amount, mint.decimals)
}
