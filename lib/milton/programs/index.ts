import { Connection, PublicKey } from '@solana/web3.js';
import { CustomError, ErrorType } from './error-handling';
import { MiltonBlinkProgram } from './milton-blink-program';
import { MiltonStakingProgram } from './milton-staking-program';
import { MiltonNFTProgram } from './milton-nft-program';
import { MiltonGovernanceProgram } from './milton-governance-program';
import { MiltonSwapProgram } from './milton-swap-program';

// Program IDs
export const MILTON_BLINK_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_BLINK_PROGRAM_ID!);
export const MILTON_STAKING_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_STAKING_PROGRAM_ID!);
export const MILTON_NFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_NFT_PROGRAM_ID!);
export const MILTON_GOVERNANCE_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_GOVERNANCE_PROGRAM_ID!);
export const MILTON_SWAP_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_SWAP_PROGRAM_ID!);

export class MiltonPrograms {
  private connection: Connection;

  public blinkProgram: MiltonBlinkProgram;
  public stakingProgram: MiltonStakingProgram;
  public nftProgram: MiltonNFTProgram;
  public governanceProgram: MiltonGovernanceProgram;
  public swapProgram: MiltonSwapProgram;

  constructor(connection: Connection) {
    this.connection = connection;

    this.blinkProgram = new MiltonBlinkProgram(connection, MILTON_BLINK_PROGRAM_ID);
    this.stakingProgram = new MiltonStakingProgram(connection, MILTON_STAKING_PROGRAM_ID);
    this.nftProgram = new MiltonNFTProgram(connection, MILTON_NFT_PROGRAM_ID);
    this.governanceProgram = new MiltonGovernanceProgram(connection, MILTON_GOVERNANCE_PROGRAM_ID);
    this.swapProgram = new MiltonSwapProgram(connection, MILTON_SWAP_PROGRAM_ID);
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
}

// Re-export individual program classes
export { MiltonBlinkProgram } from './milton-blink-program';
export { MiltonStakingProgram } from './milton-staking-program';
export { MiltonNFTProgram } from './milton-nft-program';
export { MiltonGovernanceProgram } from './milton-governance-program';
export { MiltonSwapProgram } from './milton-swap-program';
export { CustomError, ErrorType };