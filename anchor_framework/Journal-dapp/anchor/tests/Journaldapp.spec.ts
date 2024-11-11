import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Journaldapp} from '../target/types/Journaldapp'

describe('Journaldapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Journaldapp as Program<Journaldapp>

  const JournaldappKeypair = Keypair.generate()

  it('Initialize Journaldapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        Journaldapp: JournaldappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([JournaldappKeypair])
      .rpc()

    const currentCount = await program.account.Journaldapp.fetch(JournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Journaldapp', async () => {
    await program.methods.increment().accounts({ Journaldapp: JournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Journaldapp.fetch(JournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Journaldapp Again', async () => {
    await program.methods.increment().accounts({ Journaldapp: JournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Journaldapp.fetch(JournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Journaldapp', async () => {
    await program.methods.decrement().accounts({ Journaldapp: JournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Journaldapp.fetch(JournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set Journaldapp value', async () => {
    await program.methods.set(42).accounts({ Journaldapp: JournaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Journaldapp.fetch(JournaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the Journaldapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        Journaldapp: JournaldappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.Journaldapp.fetchNullable(JournaldappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
