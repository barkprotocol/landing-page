import React from 'react';

interface PaymentInfoCardProps {
  transactionURI: string;
}

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({ transactionURI }) => {
  return (
    <div className="mt-4">
      {transactionURI ? (
        <div className="border border-gray-300 p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg">Payment URI:</h3>
          <p className="text-gray-700 break-all">{transactionURI}</p>
          <a
            href={transactionURI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline mt-2 inline-block"
          >
            View Payment
          </a>
        </div>
      ) : (
        <div className="text-gray-500">No payment URI generated yet.</div>
      )}
    </div>
  );
};
