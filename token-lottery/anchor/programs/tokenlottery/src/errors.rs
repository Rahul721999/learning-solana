use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode{
    #[msg("Lottery is not open")]
    LotteryNotOpen,
    #[msg("Lottery is not open")]
    LotteryNotCompleted,
    #[msg("Not Authorized")]
    NotAuthorized,
    #[msg("Randomness Already Revealed")]
    RandomnessAlreadyRevealed,
    #[msg("Incorrect Randomness Account")]
    IncorrectRandomnessAccount,
    #[msg("Randomness Not Resolved")]
    RandomnessNotResolved,
    #[msg("Winner already chosen")]
    WinnerAlreadyChosen
}