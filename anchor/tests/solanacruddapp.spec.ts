import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Solanacruddapp} from '../target/types/solanacruddapp'

describe('solanacruddapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solanacruddapp as Program<Solanacruddapp>

  const solanacruddappKeypair = Keypair.generate()

  it('Initialize Solanacruddapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        solanacruddapp: solanacruddappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanacruddappKeypair])
      .rpc()

    const currentCount = await program.account.solanacruddapp.fetch(solanacruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solanacruddapp', async () => {
    await program.methods.increment().accounts({ solanacruddapp: solanacruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanacruddapp.fetch(solanacruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solanacruddapp Again', async () => {
    await program.methods.increment().accounts({ solanacruddapp: solanacruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanacruddapp.fetch(solanacruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solanacruddapp', async () => {
    await program.methods.decrement().accounts({ solanacruddapp: solanacruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanacruddapp.fetch(solanacruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solanacruddapp value', async () => {
    await program.methods.set(42).accounts({ solanacruddapp: solanacruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.solanacruddapp.fetch(solanacruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solanacruddapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solanacruddapp: solanacruddappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solanacruddapp.fetchNullable(solanacruddappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
