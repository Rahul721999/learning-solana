import { deserialize, Schema } from "borsh";

// Greeting class that holds the counter number
export class GreetingAccount {
    counter: number;

    constructor(properties: { counter: number }) {
        this.counter = properties.counter;
    }
}

// Enum for Calculator Instructions
export enum CalculatorInstruction {
    Add = "Add",
    Subtract = "Subtract",
}

// Instruction Data Class
export class InstructionData {
    instruction: CalculatorInstruction;
    data: number;

    constructor(properties: { instruction: CalculatorInstruction; data: number }) {
        this.instruction = properties.instruction;
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
export const CalculatorInstructionSchema: Schema = new Map([
    [
        InstructionData,
        {
            kind: "struct",
            fields: [["instruction", "u8"], ["data", "u32"]],
        },
    ],
]);



// Deserialize data using the schema
export function deserializeData(schema: Schema, classType: any, buffer: Buffer): any {
    return deserialize(schema, classType, buffer);
}