// src/SolanaBalance.tsx
import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export const Balance: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [account, setAccount] = useState<string>("");

    const getBalance = async () => {
        try {
            const connection = new Connection(
                "https://api.devnet.solana.com",
                "confirmed"
            );
            const publicKey = new PublicKey(account);
            const balance = await connection.getBalance(publicKey, "confirmed");
            setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
            console.error("Error getting balance:", error);
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
            {balance !== null && (
                <div>
                    <h2>Balance: {balance} SOL</h2>
                </div>
            )}
        </div>
    );
};
