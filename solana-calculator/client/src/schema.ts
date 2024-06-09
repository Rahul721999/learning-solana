import { deserialize, Schema } from "borsh";

// Greeting class that holds the counter number
export class GreetingAccount {
    counter: number;

    constructor(properties: { counter: number }) {
        this.counter = properties.counter;
    }
}

// Add Class used to increase counter
export class Add {
    data: number;

    constructor(properties: { data: number }) {
        this.data = properties.data;
    }
}
// Add Class used to decrease counter
export class Subtract {
    data: number;

    constructor(properties: { data: number }) {
        this.data = properties.data;
    }
}

// define schemas for Borsh serialization
export const GreetingAccountSchema : Schema = new Map([
    [
        GreetingAccount,
        {
            kind: "struct",
            fields: [["counter", "u32"]],
        },
    ],
]);

export const CalculatorInstructionSchema : Schema = new Map([
    [
        Add,
        {
            kind: "struct",
            fields: [["data", "u32"]],
        },
    ],
    [
        Subtract,
        {
            kind: "struct",
            fields: [["data", "u32"]],
        },
    ],
]);


// Deserialize data using the schema
export function deserializeData(schema: Schema, classType: any, buffer: Buffer): any {
    return deserialize(schema, classType, buffer);
}