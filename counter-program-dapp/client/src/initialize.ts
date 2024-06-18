import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createDataAcc, readKeyPairFromFile } from "./util";
import { getEnvVar } from "./config";

export let CONNECTION: Connection;
export let PROGRAM_ID: PublicKey;
export let FUND_PAYER: Keypair;
let DATA_ACCOUNT: PublicKey;

export const initialize = async () => {
    CONNECTION = new Connection(getEnvVar("SOLANA_RPC_URL"), "confirmed");
    PROGRAM_ID = new PublicKey(getEnvVar("PROGRAM_ID"));
    FUND_PAYER = readKeyPairFromFile("./fund_payer.json");
    DATA_ACCOUNT = await createDataAcc(FUND_PAYER, CONNECTION, PROGRAM_ID);
};

export { DATA_ACCOUNT };