use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Blink1111111111111111111111111111111111111111");

#[program]
pub mod blink {
    use super::*;

    pub fn send_blink(
        ctx: Context<SendBlink>,
        amount: u64,
        message: String,
        blink_type: BlinkType,
        tip_percentage: u8,
        is_recurring: bool,
        recurring_frequency: RecurringFrequency,
    ) -> Result<()> {
        let sender = &ctx.accounts.sender;
        let recipient = &ctx.accounts.recipient;

        // Calculate tip
        let tip_amount = (amount as u128 * tip_percentage as u128 / 100) as u64;
        let total_amount = amount.checked_add(tip_amount).ok_or(ErrorCode::AmountOverflow)?;

        match blink_type {
            BlinkType::SOL => {
                // Transfer SOL
                let cpi_context = CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: sender.to_account_info(),
                        to: recipient.to_account_info(),
                    },
                );
                anchor_lang::system_program::transfer(cpi_context, total_amount)?;
            }
            BlinkType::MILTON => {
                // Transfer MILTON tokens
                let cpi_context = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.sender_token_account.to_account_info(),
                        to: ctx.accounts.recipient_token_account.to_account_info(),
                        authority: sender.to_account_info(),
                    },
                );
                token::transfer(cpi_context, total_amount)?;
            }
            BlinkType::NFT => {
                // Transfer NFT (simplified, actual implementation would involve Metaplex)
                let cpi_context = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.sender_token_account.to_account_info(),
                        to: ctx.accounts.recipient_token_account.to_account_info(),
                        authority: sender.to_account_info(),
                    },
                );
                token::transfer(cpi_context, 1)?; // NFTs typically have an amount of 1
            }
        }

        // Log the Blink details
        msg!("Blink sent: {} to {}", total_amount, recipient.key());
        msg!("Message: {}", message);
        msg!("Is recurring: {}", is_recurring);
        if is_recurring {
            msg!("Recurring frequency: {:?}", recurring_frequency);
        }

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BlinkType {
    SOL,
    MILTON,
    NFT,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RecurringFrequency {
    Daily,
    Weekly,
    Monthly,
}

#[derive(Accounts)]
pub struct SendBlink<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    #[account(mut)]
    pub sender_token_account: Option<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub recipient_token_account: Option<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Option<Program<'info, Token>>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount overflow when calculating tip")]
    AmountOverflow,
}