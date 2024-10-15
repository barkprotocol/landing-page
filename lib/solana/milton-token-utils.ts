/**
 * Transfer MILTON tokens from one account to another
 */
export async function transferMiltonTokens(
  connection: Connection,
  payer: Keypair,
  fromAddress: PublicKey,
  toAddress: PublicKey,
  amount: number
): Promise<string> {
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, fromAddress);
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, toAddress);
    
    await createMiltonAccountIfNotExist(connection, payer, toAddress);
    
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)));
    
    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        MILTON_MINT_ADDRESS,
        toTokenAccount,
        fromAddress,
        tokenAmount,
        MILTON_DECIMALS
      )
    );
    
    return await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error);
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to transfer MILTON tokens');
  }
}
