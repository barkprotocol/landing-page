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
        Buffer.from([0]), // Instruction index for CreateBlink
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
        Buffer.from([1]), // Instruction index for AddDonation
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
        Buffer.from([2]), // Instruction index for UpdateBlink
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
  
      // Parse the account data based on your program's data structure
      // This is a placeholder implementation and should be adjusted based on your actual data structure
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