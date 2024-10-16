import { Connection, PublicKey } from '@solana/web3.js';
import { MiltonBlinkProgram } from './milton-blink-program';
import { MiltonStakingProgram } from './milton-staking-program';
import { MiltonNFTProgram } from './milton-nft-program';
import { MiltonGovernanceProgram } from './milton-governance-program';
import { MiltonSwapProgram } from './milton-swap-program';
import { CustomError, ErrorType } from './custom-error';
import { logger } from '../solana/logger';

// Program IDs initialized from environment variables
export const MILTON_BLINK_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_BLINK_PROGRAM_ID!);
export const MILTON_STAKING_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_STAKING_PROGRAM_ID!);
export const MILTON_NFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_NFT_PROGRAM_ID!);
export const MILTON_GOVERNANCE_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_GOVERNANCE_PROGRAM_ID!);
export const MILTON_SWAP_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_SWAP_PROGRAM_ID!);

export class Milton {
  private connection: Connection;

  // Instances of program classes
  public blinkProgram: MiltonBlinkProgram;
  public stakingProgram: MiltonStakingProgram;
  public nftProgram: MiltonNFTProgram;
  public governanceProgram: MiltonGovernanceProgram;
  public swapProgram: MiltonSwapProgram;

  constructor(connection: Connection) {
    this.connection = connection;

    try {
      // Initialize program instances
      this.blinkProgram = new MiltonBlinkProgram(connection, MILTON_BLINK_PROGRAM_ID);
      this.stakingProgram = new MiltonStakingProgram(connection, MILTON_STAKING_PROGRAM_ID);
      this.nftProgram = new MiltonNFTProgram(connection, MILTON_NFT_PROGRAM_ID);
      this.governanceProgram = new MiltonGovernanceProgram(connection, MILTON_GOVERNANCE_PROGRAM_ID);
      this.swapProgram = new MiltonSwapProgram(connection, MILTON_SWAP_PROGRAM_ID);

      logger.info('Milton programs initialized successfully');
    } catch (error) {
      logger.error('Error initializing Milton programs:', error);
      throw new CustomError(ErrorType.ProgramInitializationFailed, 'Failed to initialize Milton programs');
    }
  }

  // Utility method to get all program IDs
  public static getProgramIds() {
    return {
      blinkProgramId: MILTON_BLINK_PROGRAM_ID,
      stakingProgramId: MILTON_STAKING_PROGRAM_ID,
      nftProgramId: MILTON_NFT_PROGRAM_ID,
      governanceProgramId: MILTON_GOVERNANCE_PROGRAM_ID,
      swapProgramId: MILTON_SWAP_PROGRAM_ID,
    };
  }

  // Method to check if all program accounts are initialized
  public async checkProgramAccounts(): Promise<boolean> {
    try {
      const programIds = Milton.getProgramIds();
      for (const [name, programId] of Object.entries(programIds)) {
        const accountInfo = await this.connection.getAccountInfo(programId);
        if (!accountInfo) {
          logger.warn(`Program account not found for ${name}: ${programId.toBase58()}`);
          return false; // Early exit if any account is not found
        }
      }
      logger.info('All Milton program accounts are initialized');
      return true;
    } catch (error) {
      logger.error('Error checking program accounts:', error);
      throw new CustomError(ErrorType.AccountCheckFailed, 'Failed to check Milton program accounts');
    }
  }

  // Method to get the version of all Milton programs
  public async getProgramVersions(): Promise<Record<string, string>> {
    try {
      const versions: Record<string, string> = {
        blink: await this.blinkProgram.getVersion(),
        staking: await this.stakingProgram.getVersion(),
        nft: await this.nftProgram.getVersion(),
        governance: await this.governanceProgram.getVersion(),
        swap: await this.swapProgram.getVersion(),
      };
      logger.info('Retrieved versions for all Milton programs');
      return versions;
    } catch (error) {
      logger.error('Error getting program versions:', error);
      throw new CustomError(ErrorType.VersionCheckFailed, 'Failed to get Milton program versions');
    }
  }

  // Method to update the connection for all programs
  public updateConnection(newConnection: Connection): void {
    this.connection = newConnection;
    this.blinkProgram.updateConnection(newConnection);
    this.stakingProgram.updateConnection(newConnection);
    this.nftProgram.updateConnection(newConnection);
    this.governanceProgram.updateConnection(newConnection);
    this.swapProgram.updateConnection(newConnection);
    logger.info('Updated connection for all Milton programs');
  }
}

// Re-export individual program classes for convenience
export { MiltonBlinkProgram } from './milton-blink-program';
export { MiltonStakingProgram } from './milton-staking-program';
export { MiltonNFTProgram } from './milton-nft-program';
export { MiltonGovernanceProgram } from './milton-governance-program';
export { MiltonSwapProgram } from './milton-swap-program';
