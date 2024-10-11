import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'failed';
  message?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, message }) => {
  const renderStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="animate-spin h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Transaction is processing...';
      case 'success':
        return 'Transaction completed successfully!';
      case 'failed':
        return 'Transaction failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      {renderStatusIcon()}
      <div>
        <p className="font-semibold">{getStatusMessage()}</p>
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
};
