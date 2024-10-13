# Milton Project Programs

This directory contains the Solana programs (smart contracts) for the Milton Token project. These programs are built using the Anchor framework.

## Important Notice

**CAUTION: These programs are test versions and have not been thoroughly tested or audited. They are not suitable for production use.**

## Programs

1. **SPL Token Minter** (`spl-token-minter`)
   - Purpose: A general-purpose SPL token minter program.
   - Features: Initialize mint, mint tokens.

2. **Milton Test Token** (`milton-test-token`)
   - Purpose: A test token implementation for the Milton project.
   - Features: Initialize mint, mint tokens with 9 decimal places.

3. **Token Sales** (`token-sales`)
   - Purpose: Manages token sales for the Milton project.
   - Features: Initialize sale, buy tokens, manage sale parameters.

## Development Status

These programs are currently in development and testing phase. They have not been:

- Thoroughly tested on all possible scenarios
- Audited by security professionals
- Optimized for gas efficiency
- Deployed to mainnet

## Usage Warning

These programs should only be used for development and testing purposes. Do not use them in a production environment or with real funds until they have been properly tested, audited, and approved for production use.

## Next Steps

Before these programs can be considered ready for production:

1. Implement comprehensive unit and integration tests
2. Conduct thorough code reviews
3. Perform security audits
4. Optimize for gas efficiency
5. Test extensively on devnet
6. Obtain necessary approvals and conduct final reviews

## Contributing

We welcome contributions to improve these programs. Please ensure you follow best practices for Solana and Anchor development, and include tests for any new features or bug fixes.

## License

MIT
