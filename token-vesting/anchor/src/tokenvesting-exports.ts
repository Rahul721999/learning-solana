// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TokenvestingIDL from '../target/idl/tokenvesting.json'
import type { Tokenvesting } from '../target/types/tokenvesting'

// Re-export the generated IDL and type
export { Tokenvesting, TokenvestingIDL }

// The programId is imported from the program IDL.
export const TOKENVESTING_PROGRAM_ID = new PublicKey(TokenvestingIDL.address)

// This is a helper function to get the Tokenvesting Anchor program.
export function getTokenvestingProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...TokenvestingIDL, address: address ? address.toBase58() : TokenvestingIDL.address } as Tokenvesting, provider)
}

// This is a helper function to get the program ID for the Tokenvesting program depending on the cluster.
export function getTokenvestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tokenvesting program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return TOKENVESTING_PROGRAM_ID
  }
}
