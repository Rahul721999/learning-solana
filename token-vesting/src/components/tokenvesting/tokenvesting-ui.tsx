'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useTokenvestingProgram, userVestingProgramAccount } from './tokenvesting-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function TokenvestingCreate() {
  const { publicKey } = useWallet();
  const { createVestingAccount } = useTokenvestingProgram()
  const [companyName, setCompanyName] = useState("");
  const [mint, setMint] = useState("");

  const isFormValid = companyName.length > 5 && mint.length >= 43;

  const handleSubmit = () => {
    if (isFormValid && publicKey) {
      createVestingAccount.mutateAsync({ companyName, mint })
    }
  }

  if (!publicKey) {
    return (<p>Connect your wallet</p>)
  }

  return (
    <div >
      <input
        type="text"
        placeholder="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        placeholder="Token Mint"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending}
      >
        Create new vesting account {createVestingAccount.isPending || !isFormValid}
      </button>
    </div>
  )
}

export function TokenvestingList() {
  const { accounts, getProgramAccount } = useTokenvestingProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <TokenvestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function TokenvestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVestingAccount } = userVestingProgramAccount({
    account,
  })
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? 0,
    [accountQuery.data?.companyName]
  );


  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {companyName}
          </h2>
          <div className="card-actions justify-around">
            <input
              type="text"
              placeholder="Start Time"
              value={startTime || ''}
              onChange={(e) => setStartTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="End Time"
              value={endTime || ''}
              onChange={(e) => setEndTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Cliff Time"
              value={cliffTime || ''}
              onChange={(e) => setCliffTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Total-Token-Allocation"
              value={totalAmount || ''}
              onChange={(e) => setTotalAmount(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Beneficiary Wallet Address"
              value={beneficiary || ''}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="input input-bordered w-full max-w-xs"
            />

            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => createEmployeeVestingAccount.mutateAsync({
                start_time: startTime,
                end_time: endTime,
                cliff_period: cliffTime,
                total_token_amount: totalAmount,
                beneficiary
              })}
              disabled={createEmployeeVestingAccount.isPending}
            >
              Create Employee Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
