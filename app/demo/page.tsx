"use client";

import { useEffect, useState } from 'react';

// Define the types for token info, user balance, and leaderboard entry
type TokenInfo = {
  supply: number;
  decimals: number;
  price: number;
  treasuryBalance: number;
};

type UserBalance = {
  balance: number;
  staked: number;
};

type LeaderboardEntry = {
  userId: string;
  totalBalance: number;
};

const DemoPage = () => {
  // State management for token info, user balance, leaderboard, and errors
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userId, setUserId] = useState<string>('user1'); // Default user ID for demo
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch token info on component mount
  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await fetch('/api/v1/demo?action=tokenInfo');
        if (!response.ok) throw new Error('Failed to fetch token info');
        const data = await response.json();
        setTokenInfo(data);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchTokenInfo();
  }, []);

  // Fetch user balance based on userId
  const fetchUserBalance = async () => {
    try {
      const response = await fetch(`/api/v1/demo?action=userBalance&userId=${userId}`);
      if (!response.ok) throw new Error('User not found');
      const data = await response.json();
      setUserBalance(data);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/v1/demo?action=leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Use useEffect to fetch user balance and leaderboard when userId changes
  useEffect(() => {
    fetchUserBalance();
    fetchLeaderboard();
  }, [userId]);

  // Handle staking action
  const handleStake = async () => {
    try {
      const response = await fetch('/api/v1/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stake',
          userId,
          amount: stakeAmount,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Staking successful!');
        fetchUserBalance(); // Refresh balance after successful staking
      } else {
        setError('Staking failed. Check your balance.');
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Demo Page</h1>

      {tokenInfo && (
        <div className="mt-4">
          <h2 className="text-xl">Token Information</h2>
          <p>Supply: {tokenInfo.supply}</p>
          <p>Decimals: {tokenInfo.decimals}</p>
          <p>Price: ${tokenInfo.price}</p>
          <p>Treasury Balance: {tokenInfo.treasuryBalance}</p>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl">User Balance</h2>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={fetchUserBalance} className="bg-blue-500 text-white p-2">Fetch Balance</button>
        {userBalance && (
          <div>
            <p>Balance: {userBalance.balance}</p>
            <p>Staked: {userBalance.staked}</p>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="mt-4">
        <h2 className="text-xl">Stake Tokens</h2>
        <input
          type="number"
          placeholder="Amount to Stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          className="border p-2 mr-2"
        />
        <button onClick={handleStake} className="bg-green-500 text-white p-2">Stake</button>
      </div>

      <div className="mt-4">
        <h2 className="text-xl">Leaderboard</h2>
        <ul>
          {leaderboard.map((entry) => (
            <li key={entry.userId}>
              {entry.userId}: ${entry.totalBalance.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DemoPage;
