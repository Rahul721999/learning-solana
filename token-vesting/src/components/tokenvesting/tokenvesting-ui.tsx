'use client'
import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useTokenvestingProgram, userVestingProgramAccount } from './tokenvesting-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function TokenvestingCreate() {
  const { publicKey } = useWallet();
  const { createVestingAccount } = useTokenvestingProgram();
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
    <div className='flex space-x-2 py-4'>
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

export function ClaimTokens() {
  const { claimTokens } = useTokenvestingProgram();
  const [companyName, setCompanyName] = useState("");

  const handleSubmit = () => {
    console.log('sending tx');
    if (companyName.length > 5) {
      claimTokens.mutateAsync({ companyName })
      console.log('sent')
    }
  };
  return (
    <div className='flex space-x-2 py-4'>
      <input
        type="text"
        placeholder="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={claimTokens.isPending}
      >
        Claim Tokens
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
            <TokenvestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              owner={account.account.owner}
              treasury={account.account.treasuryTokenAccount}
              tokenMint={account.account.tokenMint}
            />
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


function TokenvestingCard({ account, owner, treasury, tokenMint }: {
  account: PublicKey,
  owner: PublicKey,
  treasury: PublicKey,
  tokenMint: PublicKey
}) {
  const { accountQuery, createEmployeeVestingAccount } = userVestingProgramAccount({
    account,
  })
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [cliffTime, setCliffTime] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? 0,
    [accountQuery.data?.companyName]
  );


  const isFormValid =
    startTime &&
    endTime &&
    cliffTime &&
    totalAmount &&
    beneficiary &&
    totalAmount > 0 &&
    beneficiary.length >= 43;

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content ">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {companyName}
          </h2>

          <div className='flex-col justify-start items-left relative w-full'>
            <h3 className='w-fit flex justify-between text-xs'><p className='font-semibold'>Owner: &nbsp;</p> {owner.toString()}</h3>
            <h3 className='w-fit flex justify-between text-xs'><p className='font-semibold'>Token-mint: &nbsp;</p>{tokenMint.toString()}</h3>
            <h3 className='w-fit flex justify-between text-xs'><p className='font-semibold'>Treasury: &nbsp;</p> {treasury.toString()}</h3>
          </div>
          <div className="card-actions">
            <DatePicker
              selected={startTime ? new Date(startTime * 1000) : null} // Convert seconds to milliseconds for Date object
              onChange={(date: Date | null) => setStartTime(date ? Math.floor(date.getTime() / 1000) : null)} // Convert milliseconds to seconds
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select Start Time"
              className="input input-bordered w-full max-w-xs"
            />
            <DatePicker
              selected={endTime ? new Date(endTime * 1000) : null}
              onChange={(date: Date | null) => setEndTime(date ? Math.floor(date.getTime() / 1000) : null)} // Convert milliseconds to seconds
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select End Time"
              className="input input-bordered w-full max-w-xs"
            />
            <DatePicker
              selected={cliffTime ? new Date(cliffTime * 1000) : null}
              onChange={(date: Date | null) => setCliffTime(date ? Math.floor(date.getTime() / 1000) : null)} // Convert milliseconds to seconds
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select Cliff Time"
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
              onClick={() => {
                if (isFormValid) {
                  createEmployeeVestingAccount.mutateAsync({
                    start_time: startTime,
                    end_time: endTime,
                    cliff_period: cliffTime,
                    total_token_amount: totalAmount,
                    beneficiary
                  })
                }
              }}
              disabled={!isFormValid || createEmployeeVestingAccount.isPending}
            >
              Create Employee Account
            </button>
          </div>
        </div>
      </div>
    </div >
  )
}
