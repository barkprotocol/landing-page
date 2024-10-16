import React from 'react';

interface MintNftButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

const MintNftButton: React.FC<MintNftButtonProps> = ({ onClick, loading, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 
                  ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} 
                  text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        <span>Mint NFT</span>
      )}
    </button>
  );
};

export default MintNftButton;
