import { useEffect, useState } from 'react';

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
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userId, setUserId] = useState<string>('user1'); // Default user ID for demo
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch token info on component mount
  useEffect(() => {
    const fetchTokenInfo = async () => {
      const response = await fetch('/api/v1/demo?action=tokenInfo');
      const data = await response.json();
      setTokenInfo(data);
    };

    fetchTokenInfo();
  }, []);

  // Fetch user balance
  const fetchUserBalance = async () => {
    const response = await fetch(`/api/v1/demo?action=userBalance&userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      setUserBalance(data);
    } else {
      setError('User not found');
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    const response = await fetch('/api/v1/demo?action=leaderboard');
    const data = await response.json();
    setLeaderboard(data);
  };

  useEffect(() => {
    fetchUserBalance();
    fetchLeaderboard();
  }, [userId]);

  // Handle staking
  const handleStake = async () => {
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
      fetchUserBalance(); // Refresh balance
    } else {
      setError('Staking failed. Check your balance.');
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
