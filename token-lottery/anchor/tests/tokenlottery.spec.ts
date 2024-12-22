import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Tokenlottery} from '../target/types/tokenlottery'

describe('tokenlottery', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tokenlottery as Program<Tokenlottery>

  const tokenlotteryKeypair = Keypair.generate()

  it('Initialize Tokenlottery', async () => {
    await program.methods
      .initialize()
      .accounts({
        tokenlottery: tokenlotteryKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([tokenlotteryKeypair])
      .rpc()

    const currentCount = await program.account.tokenlottery.fetch(tokenlotteryKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Tokenlottery', async () => {
    await program.methods.increment().accounts({ tokenlottery: tokenlotteryKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenlottery.fetch(tokenlotteryKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Tokenlottery Again', async () => {
    await program.methods.increment().accounts({ tokenlottery: tokenlotteryKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenlottery.fetch(tokenlotteryKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Tokenlottery', async () => {
    await program.methods.decrement().accounts({ tokenlottery: tokenlotteryKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenlottery.fetch(tokenlotteryKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set tokenlottery value', async () => {
    await program.methods.set(42).accounts({ tokenlottery: tokenlotteryKeypair.publicKey }).rpc()

    const currentCount = await program.account.tokenlottery.fetch(tokenlotteryKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the tokenlottery account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        tokenlottery: tokenlotteryKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.tokenlottery.fetchNullable(tokenlotteryKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
