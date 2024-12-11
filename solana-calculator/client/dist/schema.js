"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeData = exports.CalculatorInstructionSchema = exports.GreetingAccountSchema = exports.InstructionData = exports.CalculatorInstruction = exports.GreetingAccount = void 0;
const borsh_1 = require("borsh");
// Greeting class that holds the counter number
class GreetingAccount {
    constructor(properties) {
        this.counter = properties.counter;
    }
}
exports.GreetingAccount = GreetingAccount;
// Enum for Calculator Instructions
var CalculatorInstruction;
(function (CalculatorInstruction) {
    CalculatorInstruction["Add"] = "Add";
    CalculatorInstruction["Subtract"] = "Subtract";
})(CalculatorInstruction || (exports.CalculatorInstruction = CalculatorInstruction = {}));
// Instruction Data Class
class InstructionData {
    constructor(properties) {
        this.instruction = properties.instruction;
        this.data = properties.data;
    }
}
exports.InstructionData = InstructionData;
// define schemas for Borsh serialization
exports.GreetingAccountSchema = new Map([
    [
        GreetingAccount,
        {
            kind: "struct",
            fields: [["counter", "u32"]],
        },
    ],
]);
exports.CalculatorInstructionSchema = new Map([
    [
        InstructionData,
        {
            kind: "struct",
            fields: [["instruction", "u8"], ["data", "u32"]],
        },
    ],
]);
// Deserialize data using the schema
function deserializeData(schema, classType, buffer) {
    return (0, borsh_1.deserialize)(schema, classType, buffer);
}
exports.deserializeData = deserializeData;
