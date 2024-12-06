import {
    findMetadataPda,      // Fetches metadata and details about an NFT.
    mplTokenMetadata,        // Middleware to integrate token metadata features.
    verifyCollectionV1
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,      // Utility to airdrop SOL if needed for transactions.
    getExplorerLink,        // Generates a link to Solana Explorer for a given address.
    getKeypairFromFile      // Loads a keypair from a local file for authentication.
} from "@solana-developers/helpers";

import {
    createUmi               // Initializes a Umi instance for interacting with Solana.
} from "@metaplex-foundation/umi-bundle-defaults";

import {
    clusterApiUrl,          // Returns the RPC endpoint for the specified Solana cluster.
    Connection,             // Establishes a connection to the Solana blockchain.
    LAMPORTS_PER_SOL,        // Number of lamports (smallest unit of SOL) in one SOL.
} from "@solana/web3.js";

import {
    keypairIdentity,        // Associates a keypair with the Umi instance.
    publicKey
} from "@metaplex-foundation/umi";

// Connect to the Solana Devnet.
const connection = new Connection(clusterApiUrl("devnet"));

// Load the user's keypair from a local file.
const user = await getKeypairFromFile();

// Ensure the user has enough SOL for transactions by airdropping if necessary.
await airdropIfRequired(
    connection,
    user.publicKey,         // User's public key to receive the airdrop.
    1 * LAMPORTS_PER_SOL,   // Minimum balance required.
    0.5 * LAMPORTS_PER_SOL  // Threshold to trigger the airdrop.
);

console.log("Loaded user", user.publicKey.toBase58()); // Log the user's public key.

// Initialize a Umi instance using the RPC endpoint for interactions.
const umi = createUmi(connection.rpcEndpoint);

// Add the token metadata middleware to the Umi instance for NFT management.
umi.use(mplTokenMetadata());

// Convert the user's keypair to a format Umi understands.
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// Associate the user's keypair with the Umi instance for signing transactions.
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");


const collectionAddress = publicKey("CDBSUWbCCJPzcUqEHuKG1YSSg1pDyKKe3uFcSqNAqUVs");

const nftAddress = publicKey("LRvXz1ADi6sndYcvxJgoy5BfwwUqirMAgYe6Cb2rGgx");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {
        mint: nftAddress
    }),
    collectionMint: collectionAddress,
    authority: umi.identity,
})

// Send and confirm the transaction on Solana.
await transaction.sendAndConfirm(umi);


// Log the collection address and provide a link to view it on Solana Explorer.
console.log(
    `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
        "address",
        nftAddress,
        "devnet"
    )}`
);