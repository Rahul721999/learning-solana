# token-lottery
The Token Lottery DApp is a decentralized application built on the Solana blockchain. It allows users to participate in a fair and transparent lottery using SPL tokens. Users purchase lottery tickets, and at the end of each round, a winner is selected randomly to receive the prize pool. The application emphasizes fairness, security, and user-friendly interactions.

### High level overview
- issue tickets (spl tokens)
- choose winner (randomly)
- transfer tokens to winner's account

## Workflow
- ### User Onboarding:
    - Connect wallet.
    - Fund wallet with SPL tokens.
- ### Ticket Purchase:
    - User selects the number of tickets and pays using SPL tokens.
- ### Lottery Execution:
    - A new round starts after a set number of tickets are sold or a specific timeframe expires.
    - Winner is selected randomly using an on-chain verifiable process.
- ### Prize Distribution:
    - The total prize pool is transferred to the winner.
---
## Instructions
- `Initialize_comfig` : used to setup the configuration for the Lottery system. Like: `startTime`, `endTime`, `prizeAmount` etc.
- `Intialize_lottery` : Starts a lottery round.
- `Buy_ticket` : Allows users to buy tickets.
- `Commit_a_winner` : Commits the winner in specific round(used in randomness process).
- `Choose_a_winner` : Finalize the winner selection based on randomness.
- `Claims_prize` : Allows the winner to claim prize.

