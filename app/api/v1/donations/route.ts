export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, donorPublicKey } = DonationSchema.parse(body);

    const donationWalletPublicKey = new PublicKey(DONATION_WALLET);
    const donationTokenMint = new PublicKey(DONATION_TOKEN_MINT);
    const donorPublicKeyObj = new PublicKey(donorPublicKey);

    // Get token mint info to determine decimals
    const mintInfo = await getMint(connection, donationTokenMint);

    // Calculate the actual amount to transfer based on token decimals
    const transferAmount = amount * Math.pow(10, mintInfo.decimals);

    // Get or create associated token accounts
    const donorATA = await getOrCreateAssociatedTokenAccount(
      connection,
      donorPublicKeyObj, // Use donor's public key directly
      donationTokenMint,
      donorPublicKeyObj
    );

    const donationWalletATA = await getOrCreateAssociatedTokenAccount(
      connection,
      donationWalletPublicKey, // Use donation wallet directly
      donationTokenMint,
      donationWalletPublicKey
    );

    // Check if the donor has enough tokens
    const donorBalance = await connection.getTokenAccountBalance(donorATA.address);
    if (donorBalance.value.uiAmount < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      donorATA.address,
      donationWalletATA.address,
      donorPublicKeyObj,
      transferAmount
    );

    // Create transaction
    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = donorPublicKeyObj;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
    const base64Transaction = serializedTransaction.toString('base64');

    return NextResponse.json({
      transaction: base64Transaction,
      message: 'Transaction created successfully. Please sign and send the transaction.',
    });
  } catch (error) {
    console.error('Donation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
