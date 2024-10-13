import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MiltonTestToken } from "../../target/types/milt_test_token";
import { MiltonToken } from "../../target/types/milt_test_token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID , ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

type MiltonProgram = Program<MiltonTestToken> | Program<MiltonToken>;

interface TokenProgramConfig {
  programId: PublicKey;
  associatedProgramId: PublicKey;
}

const TOKEN_CONFIGS: { [key: string]: TokenProgramConfig } = {
  "token": {
    programId: TOKEN_PROGRAM_ID,
    associatedProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
  },
  "token-2022": {
    programId: TOKEN_2022_PROGRAM_ID,
    associatedProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
  },
};

export async function createTokenAccount(
  program: MiltonProgram,
  mint: PublicKey,
  owner: PublicKey,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<PublicKey> {
  const config = TOKEN_CONFIGS[tokenVersion];
  const associatedTokenAddress = await anchor.utils.token.associatedAddress({
    mint: mint,
    owner: owner,
    programId: config.programId,
  });

  try {
    await program.methods
      .createTokenAccount()
      .accounts({
        tokenAccount: associatedTokenAddress,
        mint: mint,
        payer: program.provider.wallet.publicKey,
        owner: owner,
        systemProgram: SystemProgram.programId,
        tokenProgram: config.programId,
        associatedTokenProgram: config.associatedProgramId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(`Token account created: ${associatedTokenAddress.toString()}`);
    return associatedTokenAddress;
  } catch (err) {
    console.error("Failed to create token account:", err);
    throw new Error(`Failed to create token account: ${err}`);
  }
}

export async function mintTokens(
  program: MiltonProgram,
  mint: PublicKey,
  tokenAccount: PublicKey,
  authority: Keypair,
  amount: anchor.BN,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .mintTo(amount)
      .accounts({
        mint: mint,
        tokenAccount: tokenAccount,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Minted ${amount.toString()} tokens to ${tokenAccount.toString()}`);
  } catch (err) {
    console.error("Failed to mint tokens:", err);
    throw new Error(`Failed to mint tokens: ${err}`);
  }
}

export async function transferTokens(
  program: MiltonProgram,
  fromAccount: PublicKey,
  toAccount: PublicKey,
  authority: Keypair,
  amount: anchor.BN,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .transfer(amount)
      .accounts({
        from: fromAccount,
        to: toAccount,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Transferred ${amount.toString()} tokens from ${fromAccount.toString()} to ${toAccount.toString()}`);
  } catch (err) {
    console.error("Failed to transfer tokens:", err);
    throw new Error(`Failed to transfer tokens: ${err}`);
  }
}

export async function burnTokens(
  program: MiltonProgram,
  mint: PublicKey,
  tokenAccount: PublicKey,
  authority: Keypair,
  amount: anchor.BN,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .burn(amount)
      .accounts({
        mint: mint,
        tokenAccount: tokenAccount,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Burned ${amount.toString()} tokens from ${tokenAccount.toString()}`);
  } catch (err) {
    console.error("Failed to burn tokens:", err);
    throw new Error(`Failed to burn tokens: ${err}`);
  }
}

export async function getTokenBalance(
  connection: anchor.web3.Connection,
  tokenAccount: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.amount) / Math.pow(10, balance.value.decimals);
  } catch (err) {
    console.error("Failed to get token balance:", err);
    throw new Error(`Failed to get token balance: ${err}`);
  }
}

export async function closeTokenAccount(
  program: MiltonProgram,
  tokenAccount: PublicKey,
  authority: Keypair,
  destination: PublicKey,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .closeAccount()
      .accounts({
        tokenAccount: tokenAccount,
        destination: destination,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Closed token account: ${tokenAccount.toString()}`);
  } catch (err) {
    console.error("Failed to close token account:", err);
    throw new Error(`Failed to close token account: ${err}`);
  }
}

export async function freezeTokenAccount(
  program: MiltonProgram,
  mint: PublicKey,
  tokenAccount: PublicKey,
  authority: Keypair,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .freezeAccount()
      .accounts({
        mint: mint,
        tokenAccount: tokenAccount,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Frozen token account: ${tokenAccount.toString()}`);
  } catch (err) {
    console.error("Failed to freeze token account:", err);
    throw new Error(`Failed to freeze token account: ${err}`);
  }
}

export async function thawTokenAccount(
  program: MiltonProgram,
  mint: PublicKey,
  tokenAccount: PublicKey,
  authority: Keypair,
  tokenVersion: "token" | "token-2022" = "token"
): Promise<void> {
  const config = TOKEN_CONFIGS[tokenVersion];
  try {
    await program.methods
      .thawAccount()
      .accounts({
        mint: mint,
        tokenAccount: tokenAccount,
        authority: authority.publicKey,
        tokenProgram: config.programId,
      })
      .signers([authority])
      .rpc();

    console.log(`Thawed token account: ${tokenAccount.toString()}`);
  } catch (err) {
    console.error("Failed to thaw token account:", err);
    throw new Error(`Failed to thaw token account: ${err}`);
  }
}