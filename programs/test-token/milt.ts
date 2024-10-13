import * as anchor from "@coral-xyz/anchor";
import { Program, web3, BN } from "@coral-xyz/anchor";
import { MiltTestToken } from "../target/types/milt_test_token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

export class Milt {
  program: Program<MiltTestToken>;
  mint: PublicKey;
  authority: Keypair;
  decimals: number;

  private constructor(
    program: Program<MiltTestToken>,
    mint: PublicKey,
    authority: Keypair,
    decimals: number
  ) {
    this.program = program;
    this.mint = mint;
    this.authority = authority;
    this.decimals = decimals;
  }

  static async initialize(
    program: Program<MiltTestToken>,
    authority: Keypair,
    decimals: number = 9
  ): Promise<Milt> {
    const mint = web3.Keypair.generate();

    try {
      await program.methods
        .initializeMint(decimals)
        .accounts({
          mint: mint.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mint, authority])
        .rpc();

      console.log(`Milt test token initialized with mint: ${mint.publicKey.toString()}`);
      return new Milt(program, mint.publicKey, authority, decimals);
    } catch (err) {
      console.error("Failed to initialize Milt test token:", err);
      throw new Error(`Failed to initialize Milt test token: ${err}`);
    }
  }

  async createTokenAccount(owner: PublicKey): Promise<PublicKey> {
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.mint,
      owner
    );

    try {
      await this.program.methods
        .createTokenAccount()
        .accounts({
          tokenAccount: associatedTokenAddress,
          mint: this.mint,
          owner: owner,
          payer: this.program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(`Milt token account created: ${associatedTokenAddress.toString()}`);
      return associatedTokenAddress;
    } catch (err) {
      console.error("Failed to create Milt token account:", err);
      throw new Error(`Failed to create Milt token account: ${err}`);
    }
  }

  async mintTo(tokenAccount: PublicKey, amount: BN): Promise<void> {
    try {
      await this.program.methods
        .mintTo(amount)
        .accounts({
          mint: this.mint,
          tokenAccount: tokenAccount,
          authority: this.authority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([this.authority])
        .rpc();

      console.log(`Minted ${this.formatAmount(amount)} Milt tokens to ${tokenAccount.toString()}`);
    } catch (err) {
      console.error("Failed to mint Milt tokens:", err);
      throw new Error(`Failed to mint Milt tokens: ${err}`);
    }
  }

  async transfer(
    fromAccount: PublicKey,
    toAccount: PublicKey,
    owner: Keypair,
    amount: BN
  ): Promise<void> {
    try {
      await this.program.methods
        .transfer(amount)
        .accounts({
          from: fromAccount,
          to: toAccount,
          owner: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([owner])
        .rpc();

      console.log(`Transferred ${this.formatAmount(amount)} Milt tokens from ${fromAccount.toString()} to ${toAccount.toString()}`);
    } catch (err) {
      console.error("Failed to transfer Milt tokens:", err);
      throw new Error(`Failed to transfer Milt tokens: ${err}`);
    }
  }

  async burn(tokenAccount: PublicKey, owner: Keypair, amount: BN): Promise<void> {
    try {
      await this.program.methods
        .burn(amount)
        .accounts({
          mint: this.mint,
          tokenAccount: tokenAccount,
          owner: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([owner])
        .rpc();

      console.log(`Burned ${this.formatAmount(amount)} Milt tokens from ${tokenAccount.toString()}`);
    } catch (err) {
      console.error("Failed to burn Milt tokens:", err);
      throw new Error(`Failed to burn Milt tokens: ${err}`);
    }
  }

  async getTokenBalance(tokenAccount: PublicKey): Promise<number> {
    try {
      const balance = await this.program.provider.connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(balance.value.amount) / Math.pow(10, this.decimals);
    } catch (err) {
      console.error("Failed to get Milt token balance:", err);
      throw new Error(`Failed to get Milt token balance: ${err}`);
    }
  }

  async closeTokenAccount(tokenAccount: PublicKey, owner: Keypair, destination: PublicKey): Promise<void> {
    try {
      await this.program.methods
        .closeAccount()
        .accounts({
          tokenAccount: tokenAccount,
          destination: destination,
          owner: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([owner])
        .rpc();

      console.log(`Closed Milt token account: ${tokenAccount.toString()}`);
    } catch (err) {
      console.error("Failed to close Milt token account:", err);
      throw new Error(`Failed to close Milt token account: ${err}`);
    }
  }

  async batchTransfer(
    fromAccount: PublicKey,
    toAccounts: PublicKey[],
    owner: Keypair,
    amounts: BN[]
  ): Promise<void> {
    if (toAccounts.length !== amounts.length) {
      throw new Error("The number of recipient accounts must match the number of amounts");
    }

    const transaction = new Transaction();

    for (let i = 0; i < toAccounts.length; i++) {
      const ix = await this.program.methods
        .transfer(amounts[i])
        .accounts({
          from: fromAccount,
          to: toAccounts[i],
          owner: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction();

      transaction.add(ix);
    }

    try {
      await this.program.provider.sendAndConfirm(transaction, [owner]);
      console.log(`Batch transfer of Milt tokens completed: ${toAccounts.length} transfers`);
    } catch (err) {
      console.error("Failed to execute batch transfer of Milt tokens:", err);
      throw new Error(`Failed to execute batch transfer of Milt tokens: ${err}`);
    }
  }

  async getTotalSupply(): Promise<number> {
    try {
      const mintInfo = await this.program.provider.connection.getTokenSupply(this.mint);
      return parseFloat(mintInfo.value.amount) / Math.pow(10, this.decimals);
    } catch (err) {
      console.error("Failed to get total supply of Milt tokens:", err);
      throw new Error(`Failed to get total supply of Milt tokens: ${err}`);
    }
  }

  private formatAmount(amount: BN): string {
    return (amount.toNumber() / Math.pow(10, this.decimals)).toFixed(this.decimals);
  }
}

// Usage example:
async function main() {
  // Set up the provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MiltTestToken as Program<MiltTestToken>;

  // Initialize the Milt test token
  const authority = web3.Keypair.generate();
  const milt = await Milt.initialize(program, authority);

  // Create token accounts
  const owner1 = web3.Keypair.generate();
  const owner2 = web3.Keypair.generate();
  const tokenAccount1 = await milt.createTokenAccount(owner1.publicKey);
  const tokenAccount2 = await milt.createTokenAccount(owner2.publicKey);

  // Mint tokens
  await milt.mintTo(tokenAccount1, new BN(1000000000)); // Mint 1 MILT (assuming 9 decimals)

  // Get balance
  const balance1 = await milt.getTokenBalance(tokenAccount1);
  console.log(`Token balance for account 1: ${balance1} MILT`);

  // Transfer tokens
  await milt.transfer(tokenAccount1, tokenAccount2, owner1, new BN(500000000));

  // Get updated balances
  const balance1After = await milt.getTokenBalance(tokenAccount1);
  const balance2After = await milt.getTokenBalance(tokenAccount2);
  console.log(`Token balance for account 1 after transfer: ${balance1After} MILT`);
  console.log(`Token balance for account 2 after transfer: ${balance2After} MILT`);

  // Burn tokens
  await milt.burn(tokenAccount1, owner1, new BN(250000000));

  // Get total supply
  const totalSupply = await milt.getTotalSupply();
  console.log(`Total supply: ${totalSupply} MILT`);

  // Batch transfer
  const recipients = [web3.Keypair.generate(), web3.Keypair.generate(), web3.Keypair.generate()];
  const recipientAccounts = await Promise.all(recipients.map(r => milt.createTokenAccount(r.publicKey)));
  const amounts = [new BN(10000000), new BN(20000000), new BN(30000000)];
  await milt.batchTransfer(tokenAccount2, recipientAccounts, owner2, amounts);

  // Close token account
  await milt.closeTokenAccount(tokenAccount1, owner1, owner1.publicKey);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});