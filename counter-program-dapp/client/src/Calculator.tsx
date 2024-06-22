import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const Calculator: React.FC = () => {
    const [count, setCount] = useState<number>(0);
    const [hide, setHide] = useState<Boolean>(true);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // Conditional Rendering the Calculator UI.
    useEffect(() => {
        if (publicKey) { // Render if Wallet is connected
            setHide(false);
        }else{
            setHide(true); // Hide if Wallet not Connected
        }
    }, [publicKey]);
    const increment = () => {
        console.log("increasing..");
    };
    const decrement = () => {
        console.log("decrementing..");
    };

    return (
        <div className="Calculator">
            <h1>Solana Calculator</h1>

            {!hide && (
                <div>
                    <button onClick={increment}>+</button>
                    <span>{count}</span>
                    <button onClick={decrement}>-</button>
                </div>
            )}
        </div>
    );
};
