import { config } from "dotenv";
config();
import {PublicKey, Connection, LAMPORTS_PER_SOL} from "@solana/web3.js";

/// project to airdrop some solana on given wallet address

export const airdrop_sol =  async (publicKey: PublicKey, amount: number) => {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

    // airdrop signature    
    let airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
}

// wallet address, where airdroping solana.
airdrop_sol(new PublicKey(process.env.WALLET_SECRET_KEY!), 1);