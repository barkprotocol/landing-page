import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import { CustomError, ErrorType } from './custom-error';
  import { logger } from '@/lib/solana/logger';
  
  export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: PublicKey;
    startTime: number;
    endTime: number;
    forVotes: number;
    againstVotes: number;
    status: 'Active' | 'Executed' | 'Defeated' | 'Canceled';
    instructions: TransactionInstruction[];
  }
  
  export class MiltonGovernanceProgram {
    private connection: Connection;
    private programId: PublicKey;
  
    constructor(connection: Connection, programId: PublicKey) {
      this.connection = connection;
      this.programId = programId;
      logger.info(`MiltonGovernanceProgram initialized with program ID: ${programId.toBase58()}`);
    }
  
    public async createProposal(
      payer: Keypair,
      title: string,
      description: string,
      instructions: TransactionInstruction[],
      votingPeriod: number
    ): Promise<string> {
      try {
        const proposalId = Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);
        const endTime = now + votingPeriod;
  
        const createProposalIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: proposalId, isSigner: false, isWritable: true },
          ],
          programId: this.programId,
          data: Buffer.from([
            0, // Instruction index for create proposal
            ...Buffer.from(title),
            ...Buffer.from(description),
            ...new Uint8Array(new BigUint64Array([BigInt(endTime)]).buffer),
            ...new Uint8Array(new Uint32Array([instructions.length]).buffer),
          ]),
        });
  
        const transaction = new Transaction().add(createProposalIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Created proposal with ID: ${proposalId.toBase58()}`);
        return signature;
      } catch (error) {
        logger.error('Error creating proposal:', error);
        throw new CustomError(ErrorType.ProposalCreationFailed, 'Failed to create proposal');
      }
    }
  
    public async castVote(
      payer: Keypair,
      proposalId: PublicKey,
      inFavor: boolean
    ): Promise<string> {
      try {
        const castVoteIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: false },
            { pubkey: proposalId, isSigner: false, isWritable: true },
          ],
          programId: this.programId,
          data: Buffer.from([
            1, // Instruction index for cast vote
            inFavor ? 1 : 0,
          ]),
        });
  
        const transaction = new Transaction().add(castVoteIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Cast vote for proposal ${proposalId.toBase58()}: ${inFavor ? 'In favor' : 'Against'}`);
        return signature;
      } catch (error) {
        logger.error('Error casting vote:', error);
        throw new CustomError(ErrorType.VoteCastFailed, 'Failed to cast vote');
      }
    }
  
    public async executeProposal(payer: Keypair, proposalId: PublicKey): Promise<string> {
      try {
        const executeProposalIx = new TransactionInstruction({
          keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: false },
            { pubkey: proposalId, isSigner: false, isWritable: true },
          ],
          programId: this.programId,
          data: Buffer.from([2]), // Instruction index for execute proposal
        });
  
        const transaction = new Transaction().add(executeProposalIx);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [payer]);
  
        logger.info(`Executed proposal: ${proposalId.toBase58()}`);
        return signature;
      } catch (error) {
        logger.error('Error executing proposal:', error);
        throw new CustomError(ErrorType.ProposalExecutionFailed, 'Failed to execute proposal');
      }
    }
  
    public async getProposal(proposalId: PublicKey): Promise<Proposal> {
      try {
        const accountInfo = await this.connection.getAccountInfo(proposalId);
        if (!accountInfo) {
          throw new Error('Proposal not found');
        }
  
        // Parse the account data to extract proposal information
        const proposal: Proposal = {
          id: proposalId.toBase58(),
          title: accountInfo.data.slice(0, 32).toString().replace(/\0/g, ''),
          description: accountInfo.data.slice(32, 160).toString().replace(/\0/g, ''),
          proposer: new PublicKey(accountInfo.data.slice(160, 192)),
          startTime: new DataView(accountInfo.data.buffer).getUint32(192),
          endTime: new DataView(accountInfo.data.buffer).getUint32(196),
          forVotes: new DataView(accountInfo.data.buffer).getUint32(200),
          againstVotes: new DataView(accountInfo.data.buffer).getUint32(204),
          status: ['Active', 'Executed', 'Defeated', 'Canceled'][accountInfo.data[208]] as Proposal['status'],
          instructions: [], // Parsing instructions is omitted for brevity
        };
  
        logger.info(`Retrieved proposal: ${proposalId.toBase58()}`);
        return proposal;
      } catch (error) {
        logger.error('Error retrieving proposal:', error);
        throw new CustomError(ErrorType.ProposalRetrievalFailed, 'Failed to retrieve proposal');
      }
    }
  
    public async getActiveProposals(): Promise<Proposal[]> {
      try {
        const accounts = await this.connection.getProgramAccounts(this.programId, {
          filters: [
            {
              memcmp: {
                offset: 208, // Offset for the status field
                bytes: '0', // '0' represents the 'Active' status
              },
            },
          ],
        });
  
        const proposals: Proposal[] = accounts.map((account) => ({
          id: account.pubkey.toBase58(),
          title: account.account.data.slice(0, 32).toString().replace(/\0/g, ''),
          description: account.account.data.slice(32, 160).toString().replace(/\0/g, ''),
          proposer: new PublicKey(account.account.data.slice(160, 192)),
          startTime: new DataView(account.account.data.buffer).getUint32(192),
          endTime: new DataView(account.account.data.buffer).getUint32(196),
          forVotes: new DataView(account.account.data.buffer).getUint32(200),
          againstVotes: new DataView(account.account.data.buffer).getUint32(204),
          status: 'Active',
          instructions: [], // Parsing instructions is omitted for brevity
        }));
  
        logger.info(`Retrieved ${proposals.length} active proposals`);
        return proposals;
      } catch (error) {
        logger.error('Error retrieving active proposals:', error);
        throw new CustomError(ErrorType.ProposalRetrievalFailed, 'Failed to retrieve active proposals');
      }
    }
  
    public async getVoterInfo(voter: PublicKey, proposalId: PublicKey): Promise<{ hasVoted: boolean; inFavor?: boolean }> {
      try {
        const voterInfoAddress = await PublicKey.findProgramAddress(
          [Buffer.from('voter_info'), voter.toBuffer(), proposalId.toBuffer()],
          this.programId
        );
  
        const accountInfo = await this.connection.getAccountInfo(voterInfoAddress[0]);
        if (!accountInfo) {
          return { hasVoted: false };
        }
  
        const hasVoted = accountInfo.data[0] === 1;
        const inFavor = accountInfo.data[1] === 1;
  
        logger.info(`Retrieved voter info for ${voter.toBase58()} on proposal ${proposalId.toBase58()}`);
        return { hasVoted, inFavor };
      } catch (error) {
        logger.error('Error retrieving voter info:', error);
        throw new CustomError(ErrorType.VoterInfoRetrievalFailed, 'Failed to retrieve voter info');
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
        logger.info(`Retrieved MiltonGovernanceProgram version: ${version}`);
        return version;
      } catch (error) {
        logger.error('Error retrieving program version:', error);
        throw new CustomError(ErrorType.VersionRetrievalFailed, 'Failed to retrieve program version');
      }
    }
  
    public updateConnection(newConnection: Connection): void {
      this.connection = newConnection;
      logger.info('Updated connection for MiltonGovernanceProgram');
    }
  }