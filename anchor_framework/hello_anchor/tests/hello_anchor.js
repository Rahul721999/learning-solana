const assert = require("assert");
const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;

describe("hello_anchor", () => {
    // Use a local provider.
    const provider = anchor.AnchorProvider.env();

    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const program = anchor.workspace.HelloAnchor;

    let _myAccount = null;

    /* ------------------------------------TEST: Initialize account------------------------------------*/
    // it : Individual Tests
    it("Creates and initializes an account in a single atomic transaction (simplified)", async () => {
        // The Account to create.
        const myAccount = anchor.web3.Keypair.generate();

        // Create the new account and initialize it with the program.
        await program.methods
            .initialize(new anchor.BN(0)) // Setting initial data value explicitly
            .accounts({
                myAccount: myAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([myAccount])
            .rpc();

        // Fetch the newly created account from the cluster.
        const account = await program.account.myAccount.fetch(myAccount.publicKey);

        // Check its state was initialized.
        assert.equal(account.data.toNumber(), 0); // toNumber() to correctly compare BN with a number

        // Store the account for the next test.
        _myAccount = myAccount;
    });

    /* ------------------------------------TEST: Update data ------------------------------------*/
    it("Updates a previously created account", async () => {
        const myAccount = _myAccount;

        // Invoke the update rpc.
        await program.methods
            .update(new anchor.BN(100))
            .accounts({
                myAccount: myAccount.publicKey,
            })
            .rpc();

        // Fetch the newly updated account.
        const account = await program.account.myAccount.fetch(myAccount.publicKey);

        // Check its state was mutated.
        assert.equal(account.data.toNumber(), 100);
    });

    /* ------------------------------------TEST: Increment data------------------------------------*/
    it("Increments data of a previously created account", async () => {
        const myAccount = _myAccount;

        // Invoke the increment rpc.
        await program.methods
            .increment()
            .accounts({
                myAccount: myAccount.publicKey,
            })
            .rpc();

        // Fetch the newly updated account.
        const account = await program.account.myAccount.fetch(myAccount.publicKey);

        // Check its state was incremented.
        assert.equal(account.data.toNumber(), 101);
    });

    /* ------------------------------------TEST: Decrement data------------------------------------*/
    it("Decrements data of a previously created account", async () => {
        const myAccount = _myAccount;

        // Invoke the decrement rpc.
        await program.methods
            .decrement()
            .accounts({
                myAccount: myAccount.publicKey,
            })
            .rpc();

        // Fetch the newly updated account.
        const account = await program.account.myAccount.fetch(myAccount.publicKey);

        // Check its state was decremented.
        assert.equal(account.data.toNumber(), 100);
    });
});
