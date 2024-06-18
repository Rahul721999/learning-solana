import {
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import { Instructions, InstructionSchema, InstructionType } from "./schema";
import { CONNECTION, PROGRAM_ID } from "./initialize";
import { serialize, } from "borsh";


export function serializeInstruction(
    instructionType: Instructions
): Uint8Array {
    return serialize(InstructionSchema, instructionType);
}

// export function deserializeInstruction(
//     schema: Schema,
//     classType: any,
//     buffer: Buffer
// ): CounterAccount {
//     return deserialize(schema, classType, buffer);
// }

export async function createTransactionInstruction(
    instructionType: InstructionType,
    dataAccountPublicKey: PublicKey
): Promise<Transaction> {
    const instructionData = new Instructions({
        instruction: instructionType,
    });
    const serializeData = serializeInstruction(instructionData);
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: dataAccountPublicKey, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(serializeData),
    });

    const transaction = new Transaction().add(instruction);
    return transaction;
}

export const sendTransaction = async (
    instructionType: InstructionType,
    payer: Keypair,
    dataAccountPublicKey: PublicKey
) => {
    const transaction = await createTransactionInstruction(
        instructionType,
        dataAccountPublicKey
    );

    const latestBlockHash = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = payer.publicKey;

    transaction.sign(payer);

    const rawTransaction = transaction.serialize();
    const signature = await CONNECTION.sendRawTransaction(rawTransaction);
    await CONNECTION.confirmTransaction(
        {
            signature,
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        },
        "confirmed"
    );
    return signature;
};
