import React, { useEffect, useState } from "react";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import idl from "./idl.json";
import { getProvider } from "./util";
import { Program, web3 } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";

export const Calculator: React.FC = () => {
    const [count, setCount] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);
    const [StorageAccount, setStorageAccPubkey] = useState<Keypair | null>(
        null
    );
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
                }
            }
        };

        fetchBalance();
    }, [publicKey, connection]);

    // Create a new counter
    const createCounter = async () => {
        if (!publicKey || !wallet) {
            console.log("Wallet not connected!");
            return;
        }

        try {
            // Setting work environment to Dev chain
            const provider = getProvider(connection, wallet);
            const storageAcc = web3.Keypair.generate();
            console.log(`Greeting Account ID: ${storageAcc.publicKey}`);

            const a = JSON.stringify(idl);
            const b = JSON.parse(a);
            // Create new data account or use existing one
            const program = new Program(b, idl.metadata.address, provider);

            await program.methods
                .initialize() // Setting initial data value explicitly
                .accounts({
                    my_account: storageAcc.publicKey,
                    user: provider.wallet.publicKey,
                    system_program: SystemProgram.programId,
                })
                .signers([storageAcc])
                .rpc();

            console.log("requested successsfully");
            setStorageAccPubkey(storageAcc);

            const account = await program.account.my_account.fetch(
                storageAcc.publicKey
            );
            console.log(`Account: ${account}`);
        } catch (err) {
            console.error("Transaction error: ", err);
        }
    };

    const increment = async () => {
        console.log("Increasing...");
        if (!publicKey || !wallet) {
            console.log("Wallet not connected!");
            return;
        }
        if (!StorageAccount) {
            console.error(`Data Account not initialized`);
            return;
        }
        try {
            const provider = getProvider(connection, wallet);
            const a = JSON.stringify(idl);
            const b = JSON.parse(a);
            // Create new data account or use existing one
            const program = new Program(b, idl.metadata.address, provider);

            // Fetch the account to increment

            await program.methods
                .increment()
                .accounts({
                    my_account: StorageAccount.publicKey,
                })
                .rpc();
            
            console.log("Incremented successfully");
            const account = await program.account.my_account.fetch(
                StorageAccount.publicKey
            );
            setCount(+1);
            console.info(account);
        } catch (err) {
            console.error("Transaction error: ", err);
        }
    };

    const decrement = () => {
        console.log("Decreasing...");
        if (!publicKey || !wallet) {
            console.log("Wallet not connected!");
            return;
        }
        if (!StorageAccount) {
            console.error(`Data Account not initialized`);
        }
        setCount(-1);
    };

    return (
        <div className="Calculator">
            <h1>Solana Counter DAPP</h1>

            {publicKey != null && (
                <div>
                    <h1>{`Wallet Balance: ${balance}`}</h1>
                    <span>{count}</span>
                    <div className="butt">
                        <button onClick={createCounter}>Initialize</button>
                        <button onClick={increment}>+</button>
                        <button onClick={decrement}>-</button>
                    </div>
                </div>
            )}
        </div>
    );
};
