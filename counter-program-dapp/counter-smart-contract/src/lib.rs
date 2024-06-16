use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};


#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct CounterAccount{
    pub counter : u8,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, PartialEq, Clone)]
pub enum Instructions{
    Add{data: u8},
    Subtract{data: u8}
}


entrypoint!(main);
pub fn main(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    // Destructuring instruction data..
    let instruction = Instructions::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Get the account to say Hello to
    let account_iter = &mut accounts.iter();
    let account = next_account_info(account_iter)?;

    // Match the account id with program id
    if account.owner != program_id{
        msg!("Counter account doesn't have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut greeting_account = CounterAccount::try_from_slice(&account.data.borrow())?;
    match instruction{
        Instructions::Add{data} => {
            msg!("Adding data");
            greeting_account.counter += data;
        },
        Instructions::Subtract{data} =>{
            msg!("Subtracting data");
            greeting_account.counter -= data;
        }
    }

    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;
    msg!("Greeted {} times", greeting_account.counter);
    Ok(())
}