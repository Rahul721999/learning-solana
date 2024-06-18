import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import { GREETING_SIZE } from "./schema";
import * as fs from "fs";

// function to read keypair from the given path
export function readKeyPairFromFile(filePath: string): Keypair {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const secretKey = JSON.parse(fileContent);
    if (!Array.isArray(secretKey)) {
        throw new Error(`Invalid key format in ${filePath}`);
    }
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

// function to create a Data acc and initialize
export const createDataAcc = async (
    fund_payer: Keypair,
    connection: Connection,
    programId: PublicKey
): Promise<PublicKey> => {
    const dataAccount = Keypair.generate();
    const createDataAccTX = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: fund_payer.publicKey,
            newAccountPubkey: dataAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                GREETING_SIZE
            ),
            space: GREETING_SIZE,
            programId,
        })
    );
    const signature = await sendAndConfirmTransaction(
        connection,
        createDataAccTX,
        [fund_payer, dataAccount]
    );
    console.info(`Created Data Acc with signature: ${signature}`);
    return dataAccount.publicKey;
};
