# Milton Monorepo
**MVP**

![Milton Platform Header](.github/assets/landing-page.png)

Welcome to the Milton Platform MVP Monorepo! This repository contains all the components and applications that make up the Milton ecosystem, built on the Solana blockchain to enhance digital interactions and transactions.

## Table of Contents

- [Overview](#overview)
- [Applications](#applications)
  - [Webapp](#webapp)
  - [Landing Page](#landing-page)
  - [Blinkboard](#blinkboard)
  - [Dashboard](#dashboard)
- [Programs](#programs)
- [API Documentation](#api-documentation)
- [Brand Guide](#brand-guide)
- [Screenshots](#screenshots)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Development](#development)
- [To-Do List](#to-do-list)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Milton Platform is a comprehensive Solana blockchain-based ecosystem designed to revolutionize digital interactions and transactions. This monorepo contains all the necessary components to run and develop the Milton Platform, including integrations with Solana blinks and actions to streamline user experience.

## Applications

### Webapp

The main web application for the Milton Platform. It serves as the primary interface for users to interact with Milton's features.

**Tech Stack:**
- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Solana Web3.js

**Key Features:**
- User authentication
- Wallet integration
- Token management
- Transaction processing
- Integration with Solana blinks and actions for seamless user interactions

### Landing Page

The public-facing website that introduces visitors to the Milton Platform and its offerings.

**Tech Stack:**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Key Features:**
- Platform introduction
- Feature highlights
- Call-to-action for sign-ups
- Integration with the main webapp

### Blinkboard

A real-time dashboard for monitoring and visualizing Milton's network activity and performance metrics.

**Tech Stack:**
- React
- TypeScript
- D3.js for data visualization
- WebSocket for real-time updates

**Key Features:**
- Real-time transaction monitoring
- Network health indicators
- User activity metrics
- Interactive charts and graphs
- Insights into Solana blinks and actions to enhance performance tracking

### Dashboard

An administrative interface for managing the Milton Platform and accessing advanced features.

**Tech Stack:**
- Next.js
- React
- Solana Web3.js
- TypeScript
- Tailwind CSS
- Shadcn UI

**Key Features:**
- User management
- Platform analytics
- Configuration settings
- Advanced reporting tools
- Tools for managing Solana actions and blinks

## Programs

Built using the Anchor framework:

- SPL token Minter
- Milton test token & keypair generator
- Token Sales

### Tokens

- **Devnet:** MILTY
- **Mainnet:** MILTON

## API Documentation

The Milton Platform API provides endpoints to interact with various features of the platform. The API follows RESTful principles and supports JSON format for request and response bodies.

### Base URL

```
https://api.miltonprotocol.com/v1
```

### Authentication

All API requests require an authentication token. You can obtain your token by logging into the Milton webapp.

### Endpoints

#### 1. User Authentication

- **POST** `/auth/login`

  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "your_password"
    }
    ```

  - **Response:**
    ```json
    {
      "token": "your_jwt_token",
      "user": {
        "id": "user_id",
        "email": "user@example.com"
      }
    }
    ```

#### 2. Token Management

- **GET** `/tokens`

  - **Response:**
    ```json
    [
      {
        "id": "token_id",
        "name": "Token Name",
        "symbol": "TOKEN",
        "balance": 100
      }
    ]
    ```

#### 3. Transaction Processing

- **POST** `/transactions`

  - **Request Body:**
    ```json
    {
      "token_id": "token_id",
      "amount": 10,
      "recipient": "recipient_address"
    }
    ```

  - **Response:**
    ```json
    {
      "transaction_id": "transaction_id",
      "status": "success"
    }
    ```

For a complete list of endpoints, request/response formats, and detailed documentation, please refer to the [API Documentation](https://api.miltonplatform.com/docs).

## Brand Guide

The brand guide provides comprehensive guidelines for maintaining consistency across all Milton Platform applications and marketing materials.

**Location:** `/brand-guide`

**Key Components:**
- Color palette
- Typography guidelines
- Logo usage rules
- UI component showcase

## Screenshots

Here are some screenshots of the Milton Platform components:

### Webapp
![Webapp Screenshot](https://placeholder.com/path/to/webapp-screenshot.png)

### Landing Page
![Landing Page Screenshot](https://placeholder.com/path/to/landing-page-screenshot.png)

### Blinkboard
![Blinkboard Screenshot](https://placeholder.com/path/to/blinkboard-screenshot.png)

### Dashboard
![Dashboard Screenshot](https://placeholder.com/path/to/dashboard-screenshot.png)

## Demo

Check out our live demo of the Milton Platform:

[![Milton Platform Demo](https://placeholder.com/path/to/demo-thumbnail.png)](https://www.youtube.com/watch?v=demo-video-id)

[Click here to view the full demo video](https://www.youtube.com/watch?v=demo-video-id)

## Getting Started

To get started with the Milton Platform Monorepo:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/milton-protocol/milton-platform.git
   ```

2. **Navigate into the project directory:**
   ```bash
   cd milton-platform
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   Create a `.env.local` file in the root of the project and add your environment variables. Example:
   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   The application should now be running at `http://localhost:3000`.

## Development

For development, ensure you have Node.js and npm installed on your machine. Use the following scripts for various tasks:

- **Start development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Run tests:** `npm test`

## To-Do List

- Create a modular dashboard dapp and implementations.

## Contributing

We welcome contributions to the Milton Platform! To contribute:

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

Please ensure your code adheres to the project’s coding standards and is well-documented.

## License

The MIT License. See the [LICENSE](LICENSE) file for details.