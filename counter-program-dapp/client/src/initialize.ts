import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getEnvVar } from "./config";

export let CONNECTION: Connection;
export let PROGRAM_ID: PublicKey;
export let FUND_PAYER: Keypair;
let DATA_ACCOUNT: PublicKey;

export const initialize = async () => {
    CONNECTION = new Connection(getEnvVar("SOLANA_RPC_URL"), "processed");
    PROGRAM_ID = new PublicKey(getEnvVar("PROGRAM_ID"));
    // FUND_PAYER = readKeyPairFromFile("./fund_payer.json");
};

export { DATA_ACCOUNT };