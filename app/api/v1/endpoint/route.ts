async function handleMint(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientAddress, amount } = MintSchema.parse(body);

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT);
    const recipientPublicKey = new PublicKey(recipientAddress);

    const mintInfo = await getMint(connection, miltonTokenMint);
    const mintAmount = amount * Math.pow(10, mintInfo.decimals);

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      recipientPublicKey
    );

    const mintInstruction = createMintToInstruction(
      miltonTokenMint,
      recipientATA.address,
      authorityKeypair.publicKey,
      mintAmount
    );

    const transaction = new Transaction().add(mintInstruction);
    transaction.feePayer = authorityKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signature = await connection.sendTransaction(transaction, [authorityKeypair]);
    await connection.confirmTransaction(signature);

    return NextResponse.json({
      success: true,
      signature,
      message: `Successfully minted ${amount} MILTON tokens to ${recipientAddress}`,
    });
  } catch (error) {
    console.error('Mint error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
