import { config } from "dotenv";
config();
import {PublicKey, Connection, LAMPORTS_PER_SOL} from "@solana/web3.js";

/// project to airdrop some solana on given wallet address

export const airdrop_sol =  async (address: string, amount: number) => {
    const publickey = new PublicKey(address);
    const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

    // airdrop signature    
    let airdropSignature = await connection.requestAirdrop(publickey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
}

// wallet address, where airdroping solana.
airdrop_sol(process.env.WALLET_SECRET_KEY!, 1);