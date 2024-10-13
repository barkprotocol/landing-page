use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("MILTNMFLzRXpyBHLRBhUZBmRTzLhZKMZnxXXXXXXXXX");

#[program]
pub mod milton_token {
    use super::*;

    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        decimals: u8,
        transfer_fee_basis_points: u16,
        mint_rate_limit: u64,
        total_supply_limit: u64,
    ) -> Result<()> {
        let mint = &mut ctx.accounts.milton_mint;
        mint.decimals = decimals;
        mint.transfer_fee_basis_points = transfer_fee_basis_points;
        mint.mint_rate_limit = mint_rate_limit;
        mint.total_supply_limit = total_supply_limit;
        mint.current_supply = 0;
        mint.last_mint_timestamp = 0;
        mint.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {
        let mint = &mut ctx.accounts.milton_mint;
        let current_time = Clock::get()?.unix_timestamp as u64;

        require!(
            current_time - mint.last_mint_timestamp >= 1,
            MiltonError::MintRateLimitExceeded
        );

        require!(amount <= mint.mint_rate_limit, MiltonError::MintAmountExceedsLimit);

        require!(
            mint.current_supply.checked_add(amount).unwrap() <= mint.total_supply_limit,
            MiltonError::TotalSupplyLimitExceeded
        );

        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        mint.current_supply = mint.current_supply.checked_add(amount).unwrap();
        mint.last_mint_timestamp = current_time;

        Ok(())
    }

    pub fn transfer(
        ctx: Context<Transfer>,
        amount: u64,
    ) -> Result<()> {
        let mint = &ctx.accounts.milton_mint;
        let fee_amount = (amount as u128 * mint.transfer_fee_basis_points as u128 / 10000) as u64;
        let transfer_amount = amount.checked_sub(fee_amount).unwrap();

        let cpi_accounts = token::Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, transfer_amount)?;

        if fee_amount > 0 {
            let fee_cpi_accounts = token::Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.fee_receiver.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };
            let fee_cpi_ctx = CpiContext::new(cpi_program, fee_cpi_accounts);
            token::transfer(fee_cpi_ctx, fee_amount)?;
        }

        Ok(())
    }

    pub fn burn(ctx: Context<Burn>, amount: u64) -> Result<()> {
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        let mint = &mut ctx.accounts.milton_mint;
        mint.current_supply = mint.current_supply.checked_sub(amount).unwrap();

        Ok(())
    }

    pub fn create_vesting_schedule(
        ctx: Context<CreateVestingSchedule>,
        total_amount: u64,
        start_timestamp: i64,
        end_timestamp: i64,
    ) -> Result<()> {
        let vesting_account = &mut ctx.accounts.vesting_account;
        vesting_account.recipient = ctx.accounts.recipient.key();
        vesting_account.total_amount = total_amount;
        vesting_account.claimed_amount = 0;
        vesting_account.start_timestamp = start_timestamp;
        vesting_account.end_timestamp = end_timestamp;
        vesting_account.mint = ctx.accounts.token_mint.key();
        Ok(())
    }

    pub fn claim_vested_tokens(ctx: Context<ClaimVestedTokens>) -> Result<()> {
        let vesting_account = &mut ctx.accounts.vesting_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time >= vesting_account.start_timestamp,
            MiltonError::VestingNotStarted
        );

        let vesting_duration = vesting_account.end_timestamp - vesting_account.start_timestamp;
        let elapsed_time = current_time - vesting_account.start_timestamp;
        let vested_amount = if elapsed_time >= vesting_duration {
            vesting_account.total_amount
        } else {
            vesting_account.total_amount * elapsed_time as u64 / vesting_duration as u64
        };

        let claimable_amount = vested_amount.checked_sub(vesting_account.claimed_amount).unwrap();

        if claimable_amount > 0 {
            let cpi_accounts = token::MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
                authority: ctx.accounts.milton_mint.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::mint_to(cpi_ctx, claimable_amount)?;

            vesting_account.claimed_amount = vesting_account.claimed_amount.checked_add(claimable_amount).unwrap();
        }

        Ok(())
    }

    pub fn create_token_sale(
        ctx: Context<CreateTokenSale>,
        start_time: i64,
        end_time: i64,
        token_price: u64,
        tokens_for_sale: u64,
    ) -> Result<()> {
        let sale = &mut ctx.accounts.token_sale;
        sale.authority = ctx.accounts.authority.key();
        sale.start_time = start_time;
        sale.end_time = end_time;
        sale.token_price = token_price;
        sale.tokens_for_sale = tokens_for_sale;
        sale.tokens_sold = 0;
        sale.funds_raised = 0;
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let sale = &mut ctx.accounts.token_sale;
        let current_time = Clock::get()?.unix_timestamp;

        require!(current_time >= sale.start_time, MiltonError::SaleNotStarted);
        require!(current_time <= sale.end_time, MiltonError::SaleEnded);
        require!(amount <= sale.tokens_for_sale - sale.tokens_sold, MiltonError::InsufficientTokensForSale);

        let total_cost = amount.checked_mul(sale.token_price).unwrap();

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.sale_vault.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.sale_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.milton_mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        sale.tokens_sold = sale.tokens_sold.checked_add(amount).unwrap();
        sale.funds_raised = sale.funds_raised.checked_add(total_cost).unwrap();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 2 + 8 + 8 + 8 + 8 + 32)]
    pub milton_mint: Account<'info, MiltonMint>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTo<'info> {
    #[account(mut)]
    pub milton_mint: Account<'info, MiltonMint>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    pub milton_mint: Account<'info, MiltonMint>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_receiver: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Burn<'info> {
    #[account(mut)]
    pub milton_mint: Account<'info, MiltonMint>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateVestingSchedule<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8 + 8 + 32)]
    pub vesting_account: Account<'info, VestingSchedule>,
    pub recipient: AccountInfo<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimVestedTokens<'info> {
    #[account(mut)]
    pub vesting_account: Account<'info, VestingSchedule>,
    #[account(mut)]
    pub recipient: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub milton_mint: Account<'info, MiltonMint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateTokenSale<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8)]
    pub token_sale: Account<'info, TokenSale>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub token_sale: Account<'info, TokenSale>,
    #[account(mut)]
    pub milton_mint: Account<'info, MiltonMint>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub sale_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MiltonMint {
    pub decimals: u8,
    pub transfer_fee_basis_points: u16,
    pub mint_rate_limit: u64,
    pub total_supply_limit: u64,
    pub current_supply: u64,
    pub last_mint_timestamp: u64,
    pub authority: Pubkey,
}

#[account]
pub struct VestingSchedule {
    pub recipient: Pubkey,
    pub total_amount: u64,
    pub claimed_amount: u64,
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub mint: Pubkey,
}

#[account]
pub struct TokenSale {
    pub authority: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub token_price: u64,
    pub tokens_for_sale:  u64,
    pub tokens_sold: u64,
    pub funds_raised: u64,
}

#[error_code]
pub enum MiltonError {
    #[msg("Minting rate limit exceeded")]
    MintRateLimitExceeded,
    #[msg("Mint amount exceeds limit")]
    MintAmountExceedsLimit,
    #[msg("Total supply limit exceeded")]
    TotalSupplyLimitExceeded,
    #[msg("Vesting period has not started yet")]
    VestingNotStarted,
    #[msg("Token sale has not started yet")]
    SaleNotStarted,
    #[msg("Token sale has ended")]
    SaleEnded,
    #[msg("Insufficient tokens available for sale")]
    InsufficientTokensForSale,
}