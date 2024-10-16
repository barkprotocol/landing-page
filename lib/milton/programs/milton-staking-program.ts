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
  import { logger } from '../solana/logger';
  
  export interface StakeInfo {
    staker: PublicKey;
    amount: bigint;
    stakedAt: number;
    lastClaimTime: number;
  }
  
  export class MiltonStakingProgram {
    private connection: Connection;
    private programId: PublicKey;
    private miltonTokenMint: PublicKey;
  
    constructor(connection: Connection, programId: PublicKey, miltonTokenMint: PublicKey) {
      this.connection = connection;
      this.programId = programId;
      this.miltonTokenMint = miltonTokenMint;
      logger.info(`MiltonStakingProgram initialized with program ID: ${programId.toBase58()}`);
    }
  
    public async stake(payer: Keypair, amount: bigint): Promise<string> {
      try {
        const stakerTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, payer.publicKey);
        const [stakeAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('stake'), payer.publicKey.toBuffer()],
          this.programId
        );
  
        const stakeIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: stakerTokenAccount, isSigner: false, isWritable: true },
            { pubkey: stakeAccount, isSigner: false, isWritable: true },
            { pubkey: this.miltonTokenMint, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data: Buffer.from([
            0, // Instruction index for stake
            ...amount.toString().padStart(16, '0').split('').map(Number),
          ]),
        });
  
        const transaction = new Transaction().add(stakeIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Staked ${amount} tokens for ${payer.publicKey.toBase58()}`);
        return signature;
      } catch (error) {
        logger.error('Error staking tokens:', error);
        throw new CustomError(ErrorType.StakingFailed, 'Failed to stake tokens');
      }
    }
  
    public async unstake(payer: Keypair, amount: bigint): Promise<string> {
      try {
        const stakerTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, payer.publicKey);
        const [stakeAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('stake'), payer.publicKey.toBuffer()],
          this.programId
        );
  
        const unstakeIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: stakerTokenAccount, isSigner: false, isWritable: true },
            { pubkey: stakeAccount, isSigner: false, isWritable: true },
            { pubkey: this.miltonTokenMint, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data: Buffer.from([
            1, // Instruction index for unstake
            ...amount.toString().padStart(16, '0').split('').map(Number),
          ]),
        });
  
        const transaction = new Transaction().add(unstakeIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Unstaked ${amount} tokens for ${payer.publicKey.toBase58()}`);
        return signature;
      } catch (error) {
        logger.error('Error unstaking tokens:', error);
        throw new CustomError(ErrorType.UnstakingFailed, 'Failed to unstake tokens');
      }
    }
  
    public async claimRewards(payer: Keypair): Promise<string> {
      try {
        const stakerTokenAccount = await getAssociatedTokenAddress(this.miltonTokenMint, payer.publicKey);
        const [stakeAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('stake'), payer.publicKey.toBuffer()],
          this.programId
        );
  
        const claimRewardsIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: stakerTokenAccount, isSigner: false, isWritable: true },
            { pubkey: stakeAccount, isSigner: false, isWritable: true },
            { pubkey: this.miltonTokenMint, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data: Buffer.from([2]), // Instruction index for claim rewards
        });
  
        const transaction = new Transaction().add(claimRewardsIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Claimed rewards for ${payer.publicKey.toBase58()}`);
        return signature;
      } catch (error) {
        logger.error('Error claiming rewards:', error);
        throw new CustomError(ErrorType.RewardClaimFailed, 'Failed to claim rewards');
      }
    }
  
    public async getStakeInfo(staker: PublicKey): Promise<StakeInfo> {
      try {
        const [stakeAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('stake'), staker.toBuffer()],
          this.programId
        );
  
        const accountInfo = await this.connection.getAccountInfo(stakeAccount);
        if (!accountInfo) {
          throw new Error('Stake account not found');
        }
  
        const stakeInfo: StakeInfo = {
          staker: staker,
          amount: BigInt(new DataView(accountInfo.data.buffer).getBigUint64(0, true)),
          stakedAt: new DataView(accountInfo.data.buffer).getUint32(8, true),
          lastClaimTime: new DataView(accountInfo.data.buffer).getUint32(12, true),
        };
  
        logger.info(`Retrieved stake info for ${staker.toBase58()}`);
        return stakeInfo;
      } catch (error) {
        logger.error('Error retrieving stake info:', error);
        throw new CustomError(ErrorType.StakeInfoRetrievalFailed, 'Failed to retrieve stake info');
      }
    }
  
    public async getTotalStaked(): Promise<bigint> {
      try {
        const [totalStakeAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('total_staked')],
          this.programId
        );
  
        const accountInfo = await this.connection.getAccountInfo(totalStakeAccount);
        if (!accountInfo) {
          throw new Error('Total stake account not found');
        }
  
        const totalStaked = BigInt(new DataView(accountInfo.data.buffer).getBigUint64(0, true));
  
        logger.info(`Retrieved total staked amount: ${totalStaked}`);
        return totalStaked;
      } catch (error) {
        logger.error('Error retrieving total staked amount:', error);
        throw new CustomError(ErrorType.TotalStakedRetrievalFailed, 'Failed to retrieve total staked amount');
      }
    }
  
    public async getAPR(): Promise<number> {
      try {
        const [aprAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('apr')],
          this.programId
        );
  
        const accountInfo = await this.connection.getAccountInfo(aprAccount);
        if (!accountInfo) {
          throw new Error('APR account not found');
        }
  
        const apr = new DataView(accountInfo.data.buffer).getFloat64(0, true);
  
        logger.info(`Retrieved current APR: ${apr}%`);
        return apr;
      } catch (error) {
        logger.error('Error retrieving APR:', error);
        throw new CustomError(ErrorType.APRRetrievalFailed, 'Failed to retrieve APR');
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
        logger.info(`Retrieved MiltonStakingProgram version: ${version}`);
        return version;
      } catch (error) {
        logger.error('Error retrieving program version:', error);
        throw new CustomError(ErrorType.VersionRetrievalFailed, 'Failed to retrieve program version');
      }
    }
  
    public updateConnection(newConnection: Connection): void {
      this.connection = newConnection;
      logger.info('Updated connection for MiltonStakingProgram');
    }
  }