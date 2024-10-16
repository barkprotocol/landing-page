import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    NftWithToken,
  } from '@metaplex-foundation/js';
  import { CustomError, ErrorType } from './custom-error';
  import { logger } from '../solana/logger';
  
  export class MiltonNFTProgram {
    private connection: Connection;
    private programId: PublicKey;
    private metaplex: Metaplex;
  
    constructor(connection: Connection, programId: PublicKey) {
      this.connection = connection;
      this.programId = programId;
      this.metaplex = Metaplex.make(connection)
        .use(keypairIdentity(Keypair.generate()))
        .use(bundlrStorage());
  
      logger.info(`MiltonNFTProgram initialized with program ID: ${programId.toBase58()}`);
    }
  
    public async mintNFT(
      payer: Keypair,
      name: string,
      symbol: string,
      description: string,
      imageBuffer: Buffer
    ): Promise<NftWithToken> {
      try {
        const imageFile = toMetaplexFile(imageBuffer, 'image.png');
        const { uri } = await this.metaplex.nfts().uploadMetadata({
          name,
          symbol,
          description,
          image: imageFile,
        });
  
        const { nft } = await this.metaplex.nfts().create({
          uri,
          name,
          sellerFeeBasisPoints: 500, // 5% royalty
        });
  
        logger.info(`Minted NFT with address: ${nft.address.toBase58()}`);
        return nft;
      } catch (error) {
        logger.error('Error minting NFT:', error);
        throw new CustomError(ErrorType.NFTMintFailed, 'Failed to mint NFT');
      }
    }
  
    public async transferNFT(
      payer: Keypair,
      nftMint: PublicKey,
      toAddress: PublicKey
    ): Promise<string> {
      try {
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: nftMint });
        const { response } = await this.metaplex.nfts().transfer({
          nftOrSft: nft,
          fromOwner: payer,
          toOwner: toAddress,
        });
  
        logger.info(`Transferred NFT ${nftMint.toBase58()} to ${toAddress.toBase58()}`);
        return response.signature;
      } catch (error) {
        logger.error('Error transferring NFT:', error);
        throw new CustomError(ErrorType.NFTTransferFailed, 'Failed to transfer NFT');
      }
    }
  
    public async getNFTMetadata(mintAddress: PublicKey): Promise<any> {
      try {
        const nft = await this.metaplex.nfts().findByMint({ mintAddress });
        logger.info(`Retrieved metadata for NFT: ${mintAddress.toBase58()}`);
        return nft.json;
      } catch (error) {
        logger.error('Error retrieving NFT metadata:', error);
        throw new CustomError(ErrorType.NFTMetadataRetrievalFailed, 'Failed to retrieve NFT metadata');
      }
    }
  
    public async burnNFT(payer: Keypair, nftMint: PublicKey): Promise<string> {
      try {
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: nftMint });
        const { response } = await this.metaplex.nfts().delete({
          nftOrSft: nft,
        });
  
        logger.info(`Burned NFT: ${nftMint.toBase58()}`);
        return response.signature;
      } catch (error) {
        logger.error('Error burning NFT:', error);
        throw new CustomError(ErrorType.NFTBurnFailed, 'Failed to burn NFT');
      }
    }
  
    public async updateNFTMetadata(
      payer: Keypair,
      nftMint: PublicKey,
      newMetadata: {
        name?: string;
        symbol?: string;
        description?: string;
        image?: Buffer;
      }
    ): Promise<string> {
      try {
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: nftMint });
        
        let imageUri = nft.uri;
        if (newMetadata.image) {
          const imageFile = toMetaplexFile(newMetadata.image, 'image.png');
          const uploadResult = await this.metaplex.nfts().uploadMetadata({
            ...nft.json,
            image: imageFile,
          });
          imageUri = uploadResult.uri;
        }
  
        const { response } = await this.metaplex.nfts().update({
          nftOrSft: nft,
          name: newMetadata.name || nft.name,
          symbol: newMetadata.symbol || nft.symbol,
          uri: imageUri,
        });
  
        logger.info(`Updated metadata for NFT: ${nftMint.toBase58()}`);
        return response.signature;
      } catch (error) {
        logger.error('Error updating NFT metadata:', error);
        throw new CustomError(ErrorType.NFTMetadataUpdateFailed, 'Failed to update NFT metadata');
      }
    }
  
    public async getNFTsByOwner(ownerAddress: PublicKey): Promise<NftWithToken[]> {
      try {
        const nfts = await this.metaplex.nfts().findAllByOwner({ owner: ownerAddress });
        logger.info(`Retrieved ${nfts.length} NFTs for owner: ${ownerAddress.toBase58()}`);
        return nfts;
      } catch (error) {
        logger.error('Error retrieving NFTs by owner:', error);
        throw new CustomError(ErrorType.NFTRetrievalFailed, 'Failed to retrieve NFTs by owner');
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
        logger.info(`Retrieved MiltonNFTProgram version: ${version}`);
        return version;
      } catch (error) {
        logger.error('Error retrieving program version:', error);
        throw new CustomError(ErrorType.VersionRetrievalFailed, 'Failed to retrieve program version');
      }
    }
  
    public updateConnection(newConnection: Connection): void {
      this.connection = newConnection;
      this.metaplex = Metaplex.make(newConnection)
        .use(keypairIdentity(Keypair.generate()))
        .use(bundlrStorage());
      logger.info('Updated connection for MiltonNFTProgram');
    }
  }