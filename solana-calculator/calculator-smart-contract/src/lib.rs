use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};


entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount{
    pub counter: u32,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, PartialEq)]
pub enum CalculatorInstruction {
    Add{
        data: u32,
    },
    Subtract{
        data: u32,
    },
}


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    
    // destructuring election data..
    let instruction = CalculatorInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Iterating accounts..
    let account_iter = &mut accounts.iter();

    // Get the account to say hello to..
    let account = next_account_info(account_iter)?;

    // get the program id
    if account.owner != program_id{
        msg!("Counter account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId)
    }

    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    match instruction{
        CalculatorInstruction::Add{
            data
        } =>{
            msg!("Adding data");
            greeting_account.counter += data;
        },
        CalculatorInstruction::Subtract{
            data
        } =>{
            msg!("Adding data");
            greeting_account.counter -= data;
        }
    }

    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;
    msg!("Greeted {} time(s)!", greeting_account.counter);
    Ok(())
}
