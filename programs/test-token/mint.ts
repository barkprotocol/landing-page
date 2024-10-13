import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MiltonTestToken } from "../../target/types/milton_test_token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function createTokenAccount(
  program: Program<MiltonTestToken>,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedTokenAddress = await anchor.utils.token.associatedAddress({
    mint: mint,
    owner: owner,
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
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return associatedTokenAddress;
  } catch (err) {
    console.error("Failed to create token account:", err);
    throw new Error(`Failed to create token account: ${err}`);
  }
}

export async function mintTokens(
  program: Program<MiltonTestToken>,
  mint: PublicKey,
  tokenAccount: PublicKey,
  authority: Keypair,
  amount: anchor.BN
): Promise<void> {
  try {
    await program.methods
      .mintTo(amount)
      .accounts({
        mint: mint,
        tokenAccount: tokenAccount,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([authority])
      .rpc();
  } catch (err) {
    console.error("Failed to mint tokens:", err);
    throw new Error(`Failed to mint tokens: ${err}`);
  }
}