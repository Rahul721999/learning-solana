import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";


export const Calculator: React.FC = () => {
    const [count, setCount] = useState<number>(0);


    const increment = () => {
        console.log("increasing..");
    };
    const decrement = () => {
        console.log("decrementing..");
    };

    return (
        <div className="Calculator">
            <h1>Solana Calculator</h1>
            <div>
                <label>
                    Public Key:
                    <input
                        type="text"
                        placeholder="Enter public key"
                    />
                </label>
            </div>
            <div>
                <button onClick={increment}>+</button>
                <span>{count}</span>
                <button onClick={decrement}>-</button>
            </div>
        </div>
    );
};
