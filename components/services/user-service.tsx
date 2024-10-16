import React, { useState, useEffect } from 'react';
import { User } from '@/types/user'; // Adjust the import based on your structure
import { getUser, updateUser } from '@/lib/api'; // Assuming these functions are defined to handle API requests

interface UserServiceProps {
  userId: string;
}

const UserService: React.FC<UserServiceProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fetchedUser = await getUser(userId);
        setUser(fetchedUser);
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await updateUser(user.id, updatedData);
      setUser(updatedUser);
    } catch (err) {
      setError('Failed to update user data');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-service">
      <h1>User Details</h1>
      <p>Email: {user.email}</p>
      <p>Name: {user.name}</p>
      <button onClick={() => handleUpdateUser({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
};

export default UserService;
