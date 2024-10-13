import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { MiltonToken } from "../target/types/milton_token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

type TokenVersion = "token" | "token-2022";

interface TokenProgramConfig {
  programId: PublicKey;
  associatedProgramId: PublicKey;
}

const TOKEN_CONFIGS: Record<TokenVersion, TokenProgramConfig> = {
  "token": {
    programId: TOKEN_PROGRAM_ID,
    associatedProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
  },
  "token-2022": {
    programId: TOKEN_2022_PROGRAM_ID,
    associatedProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
  },
};

export class Milton {
  program: Program<MiltonToken>;
  miltonMint: PublicKey;
  tokenMint: PublicKey;
  authority: Keypair;
  decimals: number;
  tokenVersion: TokenVersion;
  transferFeeBasisPoints: number;
  mintRateLimit: bigint;
  lastMintTimestamp: number;
  totalSupplyLimit: bigint;
  currentSupply: bigint;

  private constructor(
    program: Program<MiltonToken>,
    miltonMint: PublicKey,
    tokenMint: PublicKey,
    authority: Keypair,
    decimals: number,
    tokenVersion: TokenVersion,
    transferFeeBasisPoints: number,
    mintRateLimit: bigint,
    totalSupplyLimit: bigint
  ) {
    this.program = program;
    this.miltonMint = miltonMint;
    this.tokenMint = tokenMint;
    this.authority = authority;
    this.decimals = decimals;
    this.tokenVersion = tokenVersion;
    this.transferFeeBasisPoints = transferFeeBasisPoints;
    this.mintRateLimit = mintRateLimit;
    this.lastMintTimestamp = 0;
    this.totalSupplyLimit = totalSupplyLimit;
    this.currentSupply = BigInt(0);
  }

  static async initialize(
    program: Program<MiltonToken>,
    authority: Keypair,
    decimals: number = 9,
    tokenVersion: TokenVersion = "token",
    transferFeeBasisPoints: number = 250, // 2.5%
    mintRateLimit: bigint = BigInt(1000000000) // 1 MILTON per second
  ): Promise<Milton> {
    const miltonMint = web3.Keypair.generate();
    const tokenMint = web3.Keypair.generate();
    const config = TOKEN_CONFIGS[tokenVersion];
    const totalSupplyLimit = BigInt("18640000000000000000"); // 18.640 Billion with 9 decimals

    try {
      await program.methods
        .initializeMint(decimals, transferFeeBasisPoints, mintRateLimit, totalSupplyLimit)
        .accounts({
          miltonMint: miltonMint.publicKey,
          tokenMint: tokenMint.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: config.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([miltonMint, tokenMint, authority])
        .rpc();

      console.log(`MILTON token initialized with mint: ${tokenMint.publicKey.toString()}`);
      return new Milton(program, miltonMint.publicKey, tokenMint.publicKey, authority, decimals, tokenVersion, transferFeeBasisPoints, mintRateLimit, totalSupplyLimit);
    } catch (err) {
      console.error("Failed to initialize MILTON token:", err);
      throw new Error(`Failed to initialize MILTON token: ${err}`);
    }
  }

  async createTokenAccount(owner: PublicKey): Promise<PublicKey> {
    const config = TOKEN_CONFIGS[this.tokenVersion];
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      config.associatedProgramId,
      config.programId,
      this.tokenMint,
      owner
    );

    try {
      await this.program.methods
        .createTokenAccount()
        .accounts({
          tokenAccount: associatedTokenAddress,
          mint: this.tokenMint,
          owner: owner,
          payer: this.program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: config.programId,
          associatedTokenProgram: config.associatedProgramId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(`MILTON token account created: ${associatedTokenAddress.toString()}`);
      return associatedTokenAddress;
    } catch (err) {
      console.error("Failed to create MILTON token account:", err);
      throw new Error(`Failed to create MILTON token account: ${err}`);
    }
  }

  async mintTo(tokenAccount: PublicKey, amount: bigint): Promise<void> {
    const config = TOKEN_CONFIGS[this.tokenVersion];
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime - this.lastMintTimestamp < 1) {
      throw new Error("Minting rate limit exceeded");
    }

    if (amount > this.mintRateLimit) {
      throw new Error(`Mint amount exceeds rate limit of ${this.mintRateLimit.toString()} tokens per second`);
    }

    if (this.currentSupply + amount > this.totalSupplyLimit) {
      throw new Error(`Minting ${amount.toString()} tokens would exceed the total supply limit of ${this.totalSupplyLimit.toString()} tokens`);
    }

    try {
      await this.program.methods
        .mintTo(amount)
        .accounts({
          miltonMint: this.miltonMint,
          tokenMint: this.tokenMint,
          tokenAccount: tokenAccount,
          authority: this.authority.publicKey,
          tokenProgram: config.programId,
        })
        .signers([this.authority])
        .rpc();

      this.lastMintTimestamp = currentTime;
      this.currentSupply += amount;
      console.log(`Minted ${this.formatAmount(amount)} MILTON tokens to ${tokenAccount.toString()}`);
      console.log(`Current supply: ${this.formatAmount(this.currentSupply)} / ${this.formatAmount(this.totalSupplyLimit)} MILTON tokens`);
    } catch (err) {
      console.error("Failed to mint MILTON tokens:", err);
      throw new Error(`Failed to mint MILTON tokens: ${err}`);
    }
  }

  async transfer(
    fromAccount: PublicKey,
    toAccount: PublicKey,
    owner: Keypair,
    amount: bigint
  ): Promise<void> {
    const config = TOKEN_CONFIGS[this.tokenVersion];
    const feeAmount = (amount * BigInt(this.transferFeeBasisPoints)) / BigInt(10000);
    const transferAmount = amount - feeAmount;

    try {
      await this.program.methods
        .transfer(amount)
        .accounts({
          miltonMint: this.miltonMint,
          from: fromAccount,
          to: toAccount,
          feeReceiver: this.authority.publicKey, // Fee goes to the authority for now
          owner: owner.publicKey,
          tokenProgram: config.programId,
        })
        .signers([owner])
        .rpc();

      console.log(`Transferred ${this.formatAmount(transferAmount)} MILTON tokens from ${fromAccount.toString()} to ${toAccount.toString()}`);
      console.log(`Fee: ${this.formatAmount(feeAmount)} MILTON tokens`);
    } catch (err) {
      console.error("Failed to transfer MILTON tokens:", err);
      throw new Error(`Failed to transfer MILTON tokens: ${err}`);
    }
  }

  async burn(tokenAccount: PublicKey, owner: Keypair, amount: bigint): Promise<void> {
    const config = TOKEN_CONFIGS[this.tokenVersion];
    try {
      await this.program.methods
        .burn(amount)
        .accounts({
          miltonMint: this.miltonMint,
          tokenMint: this.tokenMint,
          tokenAccount: tokenAccount,
          owner: owner.publicKey,
          tokenProgram: config.programId,
        })
        .signers([owner])
        .rpc();

      this.currentSupply -= amount;
      console.log(`Burned ${this.formatAmount(amount)} MILTON tokens from ${tokenAccount.toString()}`);
      console.log(`Current supply: ${this.formatAmount(this.currentSupply)} / ${this.formatAmount(this.totalSupplyLimit)} MILTON tokens`);
    } catch (err) {
      console.error("Failed to burn MILTON tokens:", err);
      throw new Error(`Failed to burn MILTON tokens: ${err}`);
    }
  }

  async createTokenSale(
    startTime: number,
    endTime: number,
    tokenPrice: bigint,
    tokensForSale: bigint
  ): Promise<PublicKey> {
    const tokenSale = web3.Keypair.generate();

    try {
      await this.program.methods
        .createTokenSale(
          new anchor.BN(startTime),
          new anchor.BN(endTime),
          new anchor.BN(tokenPrice),
          new anchor.BN(tokensForSale)
        )
        .accounts({
          tokenSale: tokenSale.publicKey,
          authority: this.authority.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([this.authority, tokenSale])
        .rpc();

      console.log(`Token sale created: ${tokenSale.publicKey.toString()}`);
      return tokenSale.publicKey;
    } catch (err) {
      console.error("Failed to create token sale:", err);
      throw new Error(`Failed to create token sale: ${err}`);
    }
  }

  async buyTokens(
    buyer: Keypair,
    amount: bigint,
    tokenSale: PublicKey,
    saleVault: PublicKey
  ): Promise<void> {
    const buyerTokenAccount = await this.createTokenAccount(buyer.publicKey);
    const config = TOKEN_CONFIGS[this.tokenVersion];

    try {
      await this.program.methods
        .buyTokens(new anchor.BN(amount))
        .accounts({
          tokenSale: tokenSale,
          miltonMint: this.miltonMint,
          tokenMint: this.tokenMint,
          buyer: buyer.publicKey,
          buyerTokenAccount: buyerTokenAccount,
          saleVault: saleVault,
          systemProgram: SystemProgram.programId,
          tokenProgram: config.programId,
        })
        .signers([buyer])
        .rpc();

      console.log(`Bought ${this.formatAmount(amount)} MILTON tokens for ${buyer.publicKey.toString()}`);
    } catch (err) {
      console.error("Failed to buy MILTON tokens:", err);
      throw new Error(`Failed to buy MILTON tokens: ${err}`);
    }
  }

  private formatAmount(amount: bigint): string {
    return (Number(amount) / Math.pow(10, this.decimals)).toFixed(this.decimals);
  }
}

// Usage example:
async function main() {
  // Set up the provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MiltonToken as Program<MiltonToken>;

  // Initialize the MILTON token
  const authority = web3.Keypair.generate();
  const milton = await Milton.initialize(program, authority, 9, "token-2022", 250, BigInt(1000000000));

  // Create token sale
  const startTime = Math.floor(Date.now() / 1000) + 60; // Start in 1 minute
  const endTime = startTime + 7 * 24 * 60 * 60; // End in 1 week
  const tokenPrice = BigInt(1000000); // 0.001 SOL per token
  const tokensForSale = BigInt(1000000000000); // 1,000,000 MILTON tokens
  const tokenSale = await milton.createTokenSale(startTime, endTime, tokenPrice, tokensForSale);

  // Create a buyer
  const buyer = web3.Keypair.generate();
  const saleVault = web3.Keypair.generate().publicKey;

  // Buy tokens
  await milton.buyTokens(buyer, BigInt(1000000000), tokenSale, saleVault);

  // Get token balance
  const buyerTokenAccount = await milton.createTokenAccount(buyer.publicKey);
  const balance = await milton.getTokenBalance(buyerTokenAccount);
  console.log(`Buyer token balance: ${milton.formatAmount(balance)} MILTON`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});