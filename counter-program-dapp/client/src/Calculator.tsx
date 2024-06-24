import React, { useEffect, useState } from "react";
import {SystemProgram } from "@solana/web3.js";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import idl from "./idl.json";
import { getProvider } from "./util";
import { Program, web3 } from "@project-serum/anchor";

export const Calculator: React.FC = () => {
    const [count, setCount] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);
    const [hide, setHide] = useState<boolean>(true); // Use lowercase 'boolean'
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const wallet = useAnchorWallet();

    // Fetch wallet balance and update state
    useEffect(() => {
        const fetchBalance = async () => {
            if (publicKey) {
                const accountInfo = await connection.getAccountInfo(
                    publicKey,
                    "confirmed"
                );
                if (accountInfo) {
                    const lamports = accountInfo.lamports;
                    const solBalance = lamports / 1e9; // Convert lamports to SOL
                    setBalance(solBalance);
                    setHide(false);
                }
            } else {
                setHide(true);
            }
        };

        fetchBalance();
    }, [publicKey, connection]);

    // Create a new counter
    const createCounter = async () => {
        if (!publicKey) {
            console.log("Wallet not connected!");
            return;
        }

        try {
            // Setting work environment to Dev chain
            const provider = getProvider(connection, wallet);
            const baseAccount = web3.Keypair.generate();

            // Create new data account or use existing one
            const program = new Program(idl as any, idl.address, provider);

            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount],
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log(`Account: ${account}`);
        } catch (err) {
            console.log("Transaction error: ", err);
        }
    };

    const increment = () => {
        console.log("Increasing...");
        setCount(1);
    };

    const decrement = () => {
        console.log("Decreasing...");
        setCount(-1);
    };

    return (
        <div className="Calculator">
            <h1>Solana Counter DAPP</h1>

            {!hide && (
                <div>
                    <h1>{`Wallet Balance: ${balance}`}</h1>
                    <button onClick={createCounter}>Initialize</button>
                    <button onClick={increment}>+</button>
                    <span>{count}</span>
                    <button onClick={decrement}>-</button>
                </div>
            )}
        </div>
    );
};
