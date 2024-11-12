// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import JournaldappIDL from '../target/idl/journal.json'
import type { Journal } from '../target/types/journal'

// Re-export the generated IDL and type
export { Journal, JournaldappIDL }

// The programId is imported from the program IDL.
export const JOURNALDAPP_PROGRAM_ID = new PublicKey('HpHawHV3Y4EpxakG3LsVP5Wfewcc9VBDWQxwzSXV9ZBy')

// This is a helper function to get the Journaldapp Anchor program.
export function getJournaldappProgram(provider: AnchorProvider) {
  return new Program(JournaldappIDL as Journal, provider)
}

// This is a helper function to get the program ID for the Journaldapp program depending on the cluster.
export function getJournaldappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Journaldapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return JOURNALDAPP_PROGRAM_ID
  }
}
