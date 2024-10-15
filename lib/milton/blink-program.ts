import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { BN } from 'bn.js';

export class MiltonBlinkProgram {
  private connection: Connection;
  private programId: PublicKey;

  // Define constants for instruction indices
  private static readonly INSTRUCTION_INDEX_CREATE_BLINK = 0;
  private static readonly INSTRUCTION_INDEX_ADD_DONATION = 1;
  private static readonly INSTRUCTION_INDEX_UPDATE_BLINK = 2;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  /**
   * Creates a blink instruction.
   * 
   * @param payer The public key of the payer.
   * @param nftMint The public key of the NFT mint.
   * @param color The color for the blink.
   * @param duration The duration of the blink.
   * @param text The text for the blink.
   * @param font The font for the text.
   * @param backgroundColor The background color for the blink.
   * @param qrCodeAddress The QR code address.
   * @param qrCodeType The type of the QR code.
   * @returns A TransactionInstruction for creating a blink.
   */
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
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_CREATE_BLINK]), // Use constant for instruction index
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

  /**
   * Creates an instruction to add a donation to an existing blink.
   * 
   * @param payer The public key of the payer.
   * @param donationAddress The public key of the donation address.
   * @param nftMint The public key of the NFT mint.
   * @returns A TransactionInstruction for adding a donation.
   */
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
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_ADD_DONATION]), // Use constant for instruction index
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

  /**
   * Creates an instruction to update an existing blink.
   * 
   * @param payer The public key of the payer.
   * @param nftMint The public key of the NFT mint.
   * @param color The new color for the blink.
   * @param duration The new duration of the blink.
   * @param text The new text for the blink.
   * @param font The new font for the text.
   * @param backgroundColor The new background color for the blink.
   * @param qrCodeAddress The new QR code address.
   * @param qrCodeType The new type of the QR code.
   * @returns A TransactionInstruction for updating a blink.
   */
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
      Buffer.from([MiltonBlinkProgram.INSTRUCTION_INDEX_UPDATE_BLINK]), // Use constant for instruction index
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

  /**
   * Retrieves the blink data associated with an NFT mint.
   * 
   * @param nftMint The public key of the NFT mint.
   * @returns The parsed blink data.
   * @throws Will throw an error if the blink account is not found.
   */
  async getBlinkData(nftMint: PublicKey): Promise<any> {
    const [blinkAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('blink'), nftMint.toBuffer()],
      this.programId
    );

    const accountInfo = await this.connection.getAccountInfo(blinkAccount);

    if (!accountInfo) {
      throw new Error('Blink account not found');
    }

    // Parse the account data based on your program's data structure
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
}
