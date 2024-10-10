# MILTON WEB UI / WEB3 DAPP

## Milton Token Management API Documentation

This OpenAPI specification defines an API for interacting with Milton tokens on the Solana blockchain. It includes the following features:

- **Authentication**: Supports `BearerAuth` (token-based authentication) and `ApiKeyAuth` (API key-based authorization).
- **Schemas**: Defines schemas for token information, transactions, transfers, swaps, referrals, and error handling.
- **Endpoints**:
  - **Milton Token Information (`/milton`)**: `GET` for fetching token details and `POST` for creating purchase transactions.
  - **Transfer Milton Tokens (`/milton/transfer`)**: `POST` endpoint to transfer tokens between Solana addresses.
  - **Swap Tokens (`/milton/swap`)**: `POST` endpoint to swap between SOL, USDC, and Milton tokens.
  - **Referral Management (`/milton/referral`)**: `POST` for creating referrals, `GET` to retrieve user referrals, and `PUT` for admins to complete referrals.

### Schemas:

- **Error**: Describes error responses.
- **TokenInfo**: Contains Milton token supply, decimals, price, and treasury balance.
- **TransactionRequest**: For creating a purchase transaction, with fields like `buyerPublicKey`, `miltonAmount`, and `paymentCurrency`.
- **TransferRequest**: Details for transferring tokens, including `fromPubkey`, `toPubkey`, and `amount`.
- **SwapRequest**: Describes swapping between different token types.

The Milton API offers functionality for token purchases, transfers, swaps, and referrals on the Solana blockchain, providing a flexible interface for Milton token transactions.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Milton Token Information](#milton-token-information)
  - [Create Token Transaction](#create-token-transaction)
  - [Transfer Milton Tokens](#transfer-milton-tokens)
  - [Token Swap](#token-swap)
  - [Referral Management](#referral-management)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

To interact with the Milton API, you need the following:

- **Node.js** (version 14.x or higher recommended)
- **npm** or **yarn**
- A Solana wallet (e.g., Phantom or Solflare)
- A valid JWT or API Key for authenticated requests

### Installation

Clone the repository:

```bash
git clone https://github.com/milton/milton-api.git
cd milton-api
```

Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the API

Start the API server locally:

```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3000/v1`.

### Deploying to Production

The API can be deployed to platforms like Vercel, Heroku, or any Node.js-supported server. Ensure all necessary environment variables are set before deployment (see [Environment Variables](#environment-variables)).

## Authentication

The Milton API uses two types of authentication:

1. **JWT Authentication**: Send a Bearer token in the `Authorization` header for endpoints requiring user authentication.

   ```http
   Authorization: Bearer <your-jwt-token>
   ```

2. **API Key Authentication**: For certain admin or referral operations, provide an API Key in the `X-API-Key` header.

   ```http
   X-API-Key: <your-api-key>
   ```

## API Endpoints

### Milton Token Information

**GET** `/milton`

Retrieve the total supply, price, and treasury balance of Milton and USDC tokens.

#### Response Example:

```json
{
  "milton": {
    "supply": 1000000,
    "decimals": 6,
    "price": 1.5,
    "treasuryBalance": 50000
  },
  "usdc": {
    "supply": 10000000,
    "decimals": 6,
    "price": 1.0,
    "treasuryBalance": 100000
  }
}
```

### Create Token Transaction

**POST** `/milton`

Create a new transaction to purchase Milton tokens using SOL or USDC.

#### Request Example:

```json
{
  "buyerPublicKey": "FxyV...45Hg",
  "miltonAmount": 10,
  "paymentCurrency": "SOL",
  "paymentAmount": 1.2,
  "slippageTolerance": 0.5
}
```

#### Response Example:

```json
{
  "transaction": "abcdef123456789",
  "transactionId": "tx123456",
  "feeEstimate": 0.01,
  "expiresAt": "2024-10-10T12:00:00Z"
}
```

### Transfer Milton Tokens

**POST** `/milton/transfer`

Transfer Milton tokens between Solana addresses.

#### Request Example:

```json
{
  "fromPubkey": "FxyV...45Hg",
  "toPubkey": "AbcD...56Fg",
  "amount": 50,
  "memo": "Payment for services"
}
```

#### Response Example:

```json
{
  "transactionId": "transfer123456",
  "status": "pending",
  "feeEstimate": 0.0005,
  "expiresAt": "2024-10-10T13:00:00Z"
}
```

### Token Swap

**POST** `/milton/swap`

Swap between SOL, USDC, and Milton tokens.

#### Request Example:

```json
{
  "fromCurrency": "USDC",
  "toCurrency": "MILTON",
  "amount": 5
}
```

#### Response Example:

```json
{
  "transaction": "bcdef987654321",
  "transactionId": "swap123456",
  "fromAmount": 5,
  "toAmount": 10,
  "rate": 2,
  "feeEstimate": 0.02,
  "expiresAt": "2024-10-11T12:00:00Z"
}
```

### Referral Management

- **POST** `/milton/referral`: Create a new referral.
- **GET** `/milton/referral`: Retrieve referrals made by a user (supports pagination).
- **PUT** `/milton/referral`: Complete a referral (admin-only access).

#### Request Example (Create Referral):

```json
{
  "referredEmail": "friend@example.com"
}
```

#### Response Example:

```json
{
  "success": true,
  "referral": {
    "id": 123,
    "referrerId": 456,
    "referredId": null,
    "status": "pending",
    "createdAt": "2024-10-10T14:00:00Z"
  }
}
```

## Error Handling

The Milton API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (missing or invalid authentication)
- `403`: Forbidden (insufficient permissions)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal server error

### Error Response Example:

```json
{
  "error": "Invalid payment currency",
  "details": {
    "paymentCurrency": "Unsupported currency"
  }
}
```

## Environment Variables

Configure the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<Your Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Your Supabase Anon Key>
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_MINT_API_URL=https://api.milton.io/mint
TOKEN_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXkQd5J8X8wnF8MPzYx
NFT_PROGRAM_ID=gEb7nD9yLkau1P4uyMdke9byJNrat61suH4vYiPUuiR
DEFAULT_WALLET_ADDRESS=<Your default wallet address>
AUTH_SECRET=<Your JWT Secret Key>
```

## Contributing

We welcome contributions from the community!

1. **Fork the repository**.

2. **Create a new branch**:

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes** and commit:

   ```bash
   git commit -am 'Add new feature'
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/my-feature
   ```

5. **Create a pull request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
