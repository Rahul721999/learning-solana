/* ------------------------Helper functions------------------------*/
import { config } from "dotenv";
config();

// function to get Env
export function getEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Env variable ${name} is not set`);
    }
    return value;
}
