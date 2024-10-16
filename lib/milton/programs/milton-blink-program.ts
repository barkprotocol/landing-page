import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from './bn';

export class MiltonBlinkProgram {
  private connection: Connection;
  private programId: PublicKey;

  // Define constants for instruction indices
  private static readonly INSTRUCTION_INDEX_CREATE_BLINK = 0;
  private static readonly INSTRUCTION_INDEX_ADD_DONATION = 1;
  private static readonly INSTRUCTION_INDEX_UPDATE_BLINK = 2;
  private static readonly INSTRUCTION_INDEX_SEND_TOKENS = 3;
  private static readonly INSTRUCTION_INDEX_RECEIVE_TOKENS = 4;
  private static readonly INSTRUCTION_INDEX_MINT_NFT = 5;
  private static readonly INSTRUCTION_INDEX_TRANSFER_NFT = 6;
  private static readonly INSTRUCTION_INDEX_CREATE_LINK = 7;
  private static readonly INSTRUCTION_INDEX_CLAIM_LINK = 8;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  async createBlinkInstruction(
    payer: PublicKey,
    nftMint: PublicKey,
    color: string,
    duration: number,
    text: string,
    font: string,
    backgroundColor: string,
    qrCodeAddress: string,
    qrCodeType: string
  ): Promise<TransactionInstruction> {
    const [blinkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), nftMint.toBuffer()],
      this.programId
    );

    const colorBuffer = Buffer.from(color.replace('#', ''), 'hex');
    const durationBuffer = Buffer.alloc(4);
    durationBuffer.writeFloatLE(duration);

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_CREATE_BLINK]),
      colorBuffer,
      durationBuffer,
      Buffer.from(text),
      Buffer.from(font),
      Buffer.from(backgroundColor.replace('#', ''), 'hex'),
      Buffer.from(qrCodeAddress),
      Buffer.from(qrCodeType),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: blinkAccount, isSigner: false, isWritable: true },
        { pubkey: nftMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async addDonationInstruction(
    payer: PublicKey,
    donationAddress: PublicKey,
    nftMint: PublicKey
  ): Promise<TransactionInstruction> {
    const [blinkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), nftMint.toBuffer()],
      this.programId
    );

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_ADD_DONATION]),
      donationAddress.toBuffer(),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: blinkAccount, isSigner: false, isWritable: true },
        { pubkey: donationAddress, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async updateBlinkInstruction(
    payer: PublicKey,
    nftMint: PublicKey,
    color: string,
    duration: number,
    text: string,
    font: string,
    backgroundColor: string,
    qrCodeAddress: string,
    qrCodeType: string
  ): Promise<TransactionInstruction> {
    const [blinkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), nftMint.toBuffer()],
      this.programId
    );

    const colorBuffer = Buffer.from(color.replace('#', ''), 'hex');
    const durationBuffer = Buffer.alloc(4);
    durationBuffer.writeFloatLE(duration);

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_UPDATE_BLINK]),
      colorBuffer,
      durationBuffer,
      Buffer.from(text),
      Buffer.from(font),
      Buffer.from(backgroundColor.replace('#', ''), 'hex'),
      Buffer.from(qrCodeAddress),
      Buffer.from(qrCodeType),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: blinkAccount, isSigner: false, isWritable: true },
        { pubkey: nftMint, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async getBlinkData(nftMint: PublicKey): Promise<any> {
    const [blinkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), nftMint.toBuffer()],
      this.programId
    );

    const accountInfo = await this.connection.getAccountInfo(blinkAccount);

    if (!accountInfo) {
      throw new Error('Blink account not found');
    }

    return {
      color: '#' + accountInfo.data.slice(0, 3).toString('hex'),
      duration: accountInfo.data.readFloatLE(3),
      text: accountInfo.data.slice(7, 39).toString().replace(/\0/g, ''),
      font: accountInfo.data.slice(39, 71).toString().replace(/\0/g, ''),
      backgroundColor: '#' + accountInfo.data.slice(71, 74).toString('hex'),
      qrCodeAddress: new PublicKey(accountInfo.data.slice(74, 106)).toBase58(),
      qrCodeType: accountInfo.data.slice(106).toString().replace(/\0/g, ''),
    };
  }

  async sendTokensInstruction(
    sender: PublicKey,
    recipient: PublicKey,
    mint: PublicKey,
    amount: BN
  ): Promise<TransactionInstruction> {
    const [senderATA] = await PublicKey.findProgramAddress(
      [sender.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const [recipientATA] = await PublicKey.findProgramAddress(
      [recipient.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_SEND_TOKENS]),
      amount.toArrayLike(Buffer, 'le', 8),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: senderATA, isSigner: false, isWritable: true },
        { pubkey: recipientATA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async receiveTokensInstruction(
    recipient: PublicKey,
    mint: PublicKey
  ): Promise<TransactionInstruction> {
    const [recipientATA] = await PublicKey.findProgramAddress(
      [recipient.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const data = Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_RECEIVE_TOKENS]);

    return new TransactionInstruction({
      keys: [
        { pubkey: recipient, isSigner: true, isWritable: true },
        { pubkey: recipientATA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async mintNFTInstruction(
    minter: PublicKey,
    metadata: string
  ): Promise<TransactionInstruction> {
    const [nftMint] = await PublicKey.findProgramAddress(
      [Buffer.from('nft'), minter.toBuffer()],
      this.programId
    );

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_MINT_NFT]),
      Buffer.from(metadata),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: minter, isSigner: true, isWritable: true },
        { pubkey: nftMint, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async transferNFTInstruction(
    sender: PublicKey,
    recipient: PublicKey,
    nftMint: PublicKey
  ): Promise<TransactionInstruction> {
    const [senderATA] = await PublicKey.findProgramAddress(
      [sender.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), nftMint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const [recipientATA] = await PublicKey.findProgramAddress(
      [recipient.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), nftMint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const data = Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_TRANSFER_NFT]);

    return new TransactionInstruction({
      keys: [
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
        { pubkey: senderATA, isSigner: false, isWritable: true },
        { pubkey: recipientATA, isSigner: false, isWritable: true },
        { pubkey: nftMint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async createLinkInstruction(
    creator: PublicKey,
    amount: BN,
    expirationTime: BN
  ): Promise<TransactionInstruction> {
    const [linkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('link'), creator.toBuffer()],
      this.programId
    );

    const data = Buffer.concat([
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_CREATE_LINK]),
      amount.toArrayLike(Buffer, 'le', 8),
      expirationTime.toArrayLike(Buffer, 'le', 8),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: creator, isSigner: true, isWritable: true },
        { pubkey: linkAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  async claimLinkInstruction(
    claimer: PublicKey,
    linkAccount: PublicKey
  ): Promise<TransactionInstruction> {
    const data = Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_CLAIM_LINK]);

    return new TransactionInstruction({
      keys: [
        { pubkey: claimer, isSigner: true, isWritable: true },
        { pubkey: linkAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }
}