import { Schema, serialize } from "borsh";
import { Buffer } from 'buffer';

export class CounterAccount {
    counter: number;
    constructor(data: { counter: number }) {
        this.counter = data.counter;
    }
}

export enum InstructionType {
    Add,
    Subtract,
}

export class Instructions {
    instruction: InstructionType;
    constructor(properties: { instruction: InstructionType }) {
        this.instruction = properties.instruction;
    }
}

export const CalculatorSchema: Schema = new Map([
    [
        CounterAccount,
        {
            kind: "struct",
            fields: [["counter", "u8"]],
        },
    ],
]);

export const InstructionSchema: Schema = new Map([
    [
        Instructions,
        {
            kind: "struct",
            fields: [["instruction", "u8"]],
        },
    ],
]);

export const GREETING_SIZE = serialize(
    CalculatorSchema,
    new CounterAccount({ counter: 0 })
).length;
