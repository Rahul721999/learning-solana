import {
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import * as fs from "fs";
import {
    GreetingAccount,
    CalculatorInstructionSchema,
    InstructionData,
} from "./schema";
import { serialize, deserialize, Schema } from "borsh";
import { CONNECTION, PROGRAM_ID } from ".";

export function serializeInstruction(instruction: any): Uint8Array {
    return serialize(CalculatorInstructionSchema, instruction);
}
export function deserializeInstruction(
    schema: Schema,
    classType: any,
    buffer: Buffer
): GreetingAccount {
    return deserialize(schema, classType, buffer);
}

export async function createTransactionInstruction(
    instructionType: any,
    data: number,
    programId: PublicKey,
    accountPublicKey: PublicKey
): Promise<Transaction> {
    const instructionData = new InstructionData({
        instruction: instructionType,
        data,
    });

    const serializeData = serializeInstruction(instructionData);

    const instruction = new TransactionInstruction({
        keys: [{ pubkey: accountPublicKey, isSigner: false, isWritable: true }],
        programId: programId,
        data: Buffer.from(serializeData),
    });

    const transaction = new Transaction().add(instruction);
    return transaction;
}

export async function sendTransaction(
    instructionType: any,
    data: number,
    payer: Keypair,
    accountPublicKey: PublicKey
) {
    const transaction = await createTransactionInstruction(
        instructionType,
        data,
        PROGRAM_ID,
        accountPublicKey
    );

    const latestBlockHash = await CONNECTION.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = payer.publicKey;

    // signing the transaction
    transaction.sign(payer);

    // serialize and send the transaction
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
}

/* ----------------------------------Helper functions----------------------------------*/
export function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

export function readKeypairFromFile(filePath: string): Keypair {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const secretKey = JSON.parse(fileContent);
    if (!Array.isArray(secretKey)) {
        throw new Error(`Invalid key format in ${filePath}`);
    }
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
}
