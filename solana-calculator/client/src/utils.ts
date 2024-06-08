import { Keypair, PublicKey } from "@solana/web3.js";
import {
    GreetingAccount,
    Add,
    Subtract,
    GreetingAccountSchema,
    CalculatorInstructionSchema,
} from "./schemas";
import { serialize, deserialize, Schema } from 'borsh';




// export async function createTransactionInstruction(
//     instruction: any,
//     data: number,
//     payer: Keypair,
//     programId: PublicKey,
//     accountPublicKey: PublicKey
// ): Promise<Transation>{
//     const instruction = serializeInstruction()
// }

// export async function sendTransaction(
//     instruction: any,
//     data: number,
//     payer: Keypair,
//     programId: PublicKey,
//     accountPublicKey: PublicKey
// ): Promise<string>{
//     const transaction = await createTransactionInstruction()
// }