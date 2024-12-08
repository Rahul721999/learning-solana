use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,                    // Unique key for the offer
    pub maker: Pubkey,              // Pubkey of the maker of this offer.
    pub token_mint_a: Pubkey,       // Pubkey of the Token, the offer-maker wants to offer
    pub token_mint_b: Pubkey,       // Pubkey of the Token, The offer-maker wants in return
    pub token_b_wanted_amount: u64, // Amount of Token_B the offer-maker expects to recieve in this swap
    pub bump: u8, // A Bump seed used for generating the Program Derived Address (PDA) for this account.
}
