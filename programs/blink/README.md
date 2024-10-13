# Milton Blink: Solana-based Micro-transaction Program

Blink is a Solana program that enables users to send quick, customizable transactions (called "Blinks") with additional metadata. It supports SOL, SPL tokens (like MILTON), and NFTs.

## Features

- Send SOL, SPL tokens, or NFTs
- Attach messages to transactions
- Include optional tips
- Set up recurring transactions

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Rust and Cargo installed (https://www.rust-lang.org/tools/install)
- Solana CLI tools installed (https://docs.solana.com/cli/install-solana-cli-tools)
- Anchor framework installed (https://coral-xyz.github.io/anchor/getting-started/installation.html)

## Building the Program

To build the Blink program, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/milton-protocol/blink-program.git
   cd blink-program
   ```

2. Build the program:
   ```
   anchor build
   ```

## Deploying the Program

To deploy the Blink program to the Solana devnet:

1. Set your Solana CLI config to devnet:
   ```
   solana config set --url devnet
   ```

2. Deploy the program:
   ```
   anchor deploy
   ```

3. Update the program ID in `lib.rs` and `Anchor.toml` with the deployed program ID.

## Usage

To use the Blink program in your Solana dApp:

1. Install the Blink client library (if available) or use the Anchor IDL to generate client-side code.

2. Create a transaction that calls the `send_blink` instruction with the following parameters:
   - `amount`: The amount to send
   - `message`: A message to attach to the Blink
   - `blink_type`: SOL, MILTON (SPL token), or NFT
   - `tip_percentage`: Optional tip percentage
   - `is_recurring`: Whether this is a recurring Blink
   - `recurring_frequency`: If recurring, how often it should repeat (Daily, Weekly, Monthly)

3. Sign and send the transaction using a Solana wallet (e.g., Phantom, Solflare).

## Testing

To run the program tests:

```
anchor test
```

## Contributing

Contributions to the Blink program are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

If you have any questions or feedback, please open an issue in this repository.

Happy Blinking!