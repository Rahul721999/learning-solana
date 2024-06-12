// src/SolanaBalance.tsx
import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export const Balance: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [account, setAccount] = useState<string>("");

    // get connection
    const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
    if (connection == null) {
        console.error("failed to establish connection with BlockChain");
    }

    // get balance
    const getBalance = async () => {
        try {
            const publicKey = new PublicKey(account);

            const balance = await connection.getBalance(publicKey, "confirmed");
            setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
            console.error("Error getting balance:", error);
        }
    };

    // airdrop solana
    const airdropSol = async () => {
        try {
            const publicKey = new PublicKey(account);
            await connection.requestAirdrop(publicKey, 2);
        } catch (err) {
            console.error("failed to airdrop sol");
        }
    };
    return (
        <div>
            <h1>Solana Balance Checker</h1>
            <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Enter Solana account address"
            />
            <button onClick={getBalance}>Check Balance</button>
            <button onClick={airdropSol}>Airdrop 2 Sol</button>
            {balance !== null && (
                <div>
                    <h2>Balance: {balance} SOL</h2>
                </div>
            )}
        </div>
    );
};
