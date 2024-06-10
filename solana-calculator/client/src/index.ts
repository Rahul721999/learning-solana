import { config } from "dotenv";
config();
import * as fs from "fs";
import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
} from "@solana/web3.js";
import { sendTransaction } from "./utils";
import {
    InstructionData,
    CalculatorInstructionSchema,
    deserializeData,
    CalculatorInstruction,
    GreetingAccountSchema,
    GreetingAccount,
} from "./schema";

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

export const PROGRAM_ID = new PublicKey(getEnvVar("PROGRAM_ID"));
const SOLANA_RPC_URL = getEnvVar("SOLANA_RPC_URL");
export const CONNECTION = new Connection(SOLANA_RPC_URL, "confirmed");

function readKeypairFromFile(filePath: string): Keypair {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const secretKey = JSON.parse(fileContent);
    if (!Array.isArray(secretKey)) {
        throw new Error(`Invalid key format in ${filePath}`);
    }
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

const FUND_PAYER = readKeypairFromFile("./fund_payer.json");

(async () => {
    console.log(`ProgramID: ${PROGRAM_ID}`); // smart-contract ID..
    console.log(`Fund Payer: ${FUND_PAYER.publicKey}`); // PublicKey of the wallet paying for the transaction..

    /* -----------------------------------creating data account----------------------------------- */
    const calculatorAccount = Keypair.generate();

    // allocate space for the account
    const createCalculatorTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: FUND_PAYER.publicKey,
            newAccountPubkey: calculatorAccount.publicKey,
            lamports: await CONNECTION.getMinimumBalanceForRentExemption(4 + 4), // size of the greeting acc and borsh overhead
            space: 4, // size of the greeting account
            programId: PROGRAM_ID,
        })
    );

    const createAccountSignature = await sendAndConfirmTransaction(
        CONNECTION,
        createCalculatorTx,
        [FUND_PAYER, calculatorAccount]
    );
    console.log(
        "Created GreetingAccount with signature:",
        createAccountSignature
    );

    /* ------------------------------ Add Instructions------------------------------ */
    const addSignature = await sendTransaction(
        CalculatorInstruction.Add,
        10,
        FUND_PAYER,
        calculatorAccount.publicKey
    );
    console.log("Added data with signature: ", addSignature);

    /* ------------------------------ Subtrct Instructions------------------------------ */
    const subtractSignature = await sendTransaction(
        CalculatorInstruction.Subtract,
        5,
        FUND_PAYER,
        calculatorAccount.publicKey
    );
    console.log("Subtracted data with signature: ", subtractSignature);

    // Fetch account data
    const accountInfo = await CONNECTION.getAccountInfo(
        calculatorAccount.publicKey
    );
    if (accountInfo?.data) {
        const calculatorData = deserializeData(
            GreetingAccountSchema,
            GreetingAccount,
            accountInfo.data
        );

        console.log("Calculator account counter: ", calculatorData.counter);
    } else {
        console.error("Failed to retrieve account data.");
    }
})();
