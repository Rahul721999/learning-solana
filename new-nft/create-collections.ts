import {
    createNft,              // Function to create a new NFT on Solana.
    fetchDigitalAsset,      // Fetches metadata and details about an NFT.
    mplTokenMetadata        // Middleware to integrate token metadata features.
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
    LAMPORTS_PER_SOL        // Number of lamports (smallest unit of SOL) in one SOL.
} from "@solana/web3.js";

import { 
    generateSigner,         // Generates a new keypair for signing transactions.
    keypairIdentity,        // Associates a keypair with the Umi instance.
    percentAmount           // Helper to calculate percentages (e.g., royalties).
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

// Generate a new keypair for the NFT collection mint address.
const collectionMint = generateSigner(umi);

// Create a new NFT collection.
const transaction = await createNft(umi, {
    mint: collectionMint,           // Mint account for the collection.
    name: "My Collection",          // Name of the NFT collection.
    symbol: "MC",                   // Symbol for the collection.
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0), // Royalties for secondary sales (0% here).
    isCollection: true              // Indicates this is a collection.
});

// Send and confirm the transaction on Solana.
await transaction.sendAndConfirm(umi);

// Fetch details of the created collection NFT.
const createdCollectionNft = await fetchDigitalAsset(
    umi,  
    collectionMint.publicKey        // Public key of the NFT collection mint.
);

// Log the collection address and provide a link to view it on Solana Explorer.
console.log(
    `Created Collection! Address is ${getExplorerLink(
        "address",
        createdCollectionNft.mint.publicKey,
        "devnet"
    )}`
);
