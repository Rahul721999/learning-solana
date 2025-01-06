use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode{
    #[msg("Lottery is not open")]
    LotteryNotOpen,
    #[msg("Not Authorized")]
    NotAuthorized,
    #[msg("Randomness Already Revealed")]
    RandomnessAlreadyRevealed
    
}