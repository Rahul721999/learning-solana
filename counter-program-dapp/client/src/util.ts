import {
    Connection,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";

// function to create provider
export function getProvider(connection: Connection, wallet: AnchorWallet | undefined){

    if (!wallet){console.error("wallet not initlialized");
        throw new Error("wallet not initialized");
    }
    else{
        const provider = new AnchorProvider(connection, wallet, {"preflightCommitment": "processed"});
        return provider;
    }
}