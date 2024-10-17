import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { CustomError, ErrorType } from './custom-error';
import { logger } from '@/lib/solana/logger';

export interface PaymentInfo {
  payer: PublicKey;
  recipient: PublicKey;
  amount: bigint;
  timestamp: number;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export class MiltonPaymentProgram {
  private connection: Connection;
  private programId: PublicKey;
  private miltonTokenMint: PublicKey;

  constructor(connection: Connection, programId: PublicKey, miltonTokenMint: PublicKey) {
    this.connection = connection;
    this.programId = programId;
    this.miltonTokenMint = miltonTokenMint;
    logger.info(`MiltonPaymentProgram initialized with program ID: ${programId.toBase58()}`);
  }

  public async processPayment(payer: Keypair, recipient: PublicKey, amount: bigint): Promise<string> {
    try {
      const payerTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, payer.publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, recipient);

      const [paymentAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('payment'), payer.publicKey.toBuffer(), recipient.toBuffer()],
        this.programId
      );

      const processPaymentIx = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true },
          { pubkey: payerTokenAccount, isSigner: false, isWritable: true },
          { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
          { pubkey: paymentAccount, isSigner: false, isWritable: true },
          { pubkey: this.miltonTokenMint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          0, // Instruction index for process payment
          ...amount.toString().padStart(16, '0').split('').map(Number),
        ]),
      });

      const transaction = new Transaction().add(processPaymentIx);
      const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);

      logger.info(`Processed payment of ${amount} tokens from ${payer.publicKey.toBase58()} to ${recipient.toBase58()}`);
      return signature;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw new CustomError(ErrorType.PaymentProcessingFailed, 'Failed to process payment');
    }
  }

  public async refundPayment(payer: Keypair, recipient: PublicKey, amount: bigint): Promise<string> {
    try {
      const payerTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, payer.publicKey);
      const recipientTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, recipient);

      const [paymentAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('payment'), payer.publicKey.toBuffer(), recipient.toBuffer()],
        this.programId
      );

      const refundPaymentIx = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true },
          { pubkey: payerTokenAccount, isSigner: false, isWritable: true },
          { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
          { pubkey: paymentAccount, isSigner: false, isWritable: true },
          { pubkey: this.miltonTokenMint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          1, // Instruction index for refund payment
          ...amount.toString().padStart(16, '0').split('').map(Number),
        ]),
      });

      const transaction = new Transaction().add(refundPaymentIx);
      const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);

      logger.info(`Refunded payment of ${amount} tokens from ${recipient.toBase58()} to ${payer.publicKey.toBase58()}`);
      return signature;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw new CustomError(ErrorType.PaymentRefundFailed, 'Failed to refund payment');
    }
  }

  public async getPaymentInfo(payer: PublicKey, recipient: PublicKey): Promise<PaymentInfo> {
    try {
      const [paymentAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('payment'), payer.toBuffer(), recipient.toBuffer()],
        this.programId
      );

      const accountInfo = await this.connection.getAccountInfo(paymentAccount);
      if (!accountInfo) {
        throw new Error('Payment account not found');
      }

      const paymentInfo: PaymentInfo = {
        payer: payer,
        recipient: recipient,
        amount: BigInt(new DataView(accountInfo.data.buffer).getBigUint64(0, true)),
        timestamp: new DataView(accountInfo.data.buffer).getUint32(8, true),
        status: ['Completed', 'Pending', 'Refunded'][accountInfo.data[12]] as PaymentInfo['status'],
      };

      logger.info(`Retrieved payment info for payer ${payer.toBase58()} and recipient ${recipient.toBase58()}`);
      return paymentInfo;
    } catch (error) {
      logger.error('Error retrieving payment info:', error);
      throw new CustomError(ErrorType.PaymentInfoRetrievalFailed, 'Failed to retrieve payment info');
    }
  }

  public async getPaymentHistory(address: PublicKey): Promise<PaymentInfo[]> {
    try {
      const paymentAccounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: address.toBase58(),
            },
          },
        ],
      });

      const paymentHistory: PaymentInfo[] = paymentAccounts.map((account) => ({
        payer: new PublicKey(account.account.data.slice(0, 32)),
        recipient: new PublicKey(account.account.data.slice(32, 64)),
        amount: BigInt(new DataView(account.account.data.buffer).getBigUint64(64, true)),
        timestamp: new DataView(account.account.data.buffer).getUint32(72, true),
        status: ['Completed', 'Pending', 'Refunded'][account.account.data[76]] as PaymentInfo['status'],
      }));

      logger.info(`Retrieved payment history for address ${address.toBase58()}`);
      return paymentHistory;
    } catch (error) {
      logger.error('Error retrieving payment history:', error);
      throw new CustomError(ErrorType.PaymentHistoryRetrievalFailed, 'Failed to retrieve payment history');
    }
  }

  public async getTotalPaymentVolume(): Promise<bigint> {
    try {
      const [volumeAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('total_volume')],
        this.programId
      );

      const accountInfo = await this.connection.getAccountInfo(volumeAccount);
      if (!accountInfo) {
        throw new Error('Total volume account not found');
      }

      const totalVolume = BigInt(new DataView(accountInfo.data.buffer).getBigUint64(0, true));

      logger.info(`Retrieved total payment volume: ${totalVolume}`);
      return totalVolume;
    } catch (error) {
      logger.error('Error retrieving total payment volume:', error);
      throw new CustomError(ErrorType.TotalVolumeRetrievalFailed, 'Failed to retrieve total payment volume');
    }
  }

  public async getVersion(): Promise<string> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.programId);
      if (accountInfo === null) {
        throw new Error('Program account not found');
      }
      // Assuming the version is stored in the first 32 bytes of the account data
      const version = accountInfo.data.slice(0, 32).toString().replace(/\0/g, '');
      logger.info(`Retrieved MiltonPaymentProgram version: ${version}`);
      return version;
    } catch (error) {
      logger.error('Error retrieving program version:', error);
      throw new CustomError(ErrorType.VersionRetrievalFailed, 'Failed to retrieve program version');
    }
  }

  public updateConnection(newConnection: Connection): void {
    this.connection = newConnection;
    logger.info('Updated connection for MiltonPaymentProgram');
  }
}