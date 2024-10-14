"use client";

import React from 'react';

const RouteInfo: React.FC = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Token Swap Information</h2>
      <p className="text-gray-700 mb-4">
        This endpoint allows users to swap tokens on the platform. Please ensure you have the necessary tokens and sufficient balance before proceeding with the swap.
      </p>
      <h3 className="text-xl font-semibold mb-2">Endpoint</h3>
      <p className="text-gray-700 mb-2">
        <strong>POST /api/v1/actions/swap</strong>
      </p>
      <h3 className="text-xl font-semibold mb-2">Request Body</h3>
      <pre className="bg-gray-200 p-2 rounded mb-4">
        {`{
  "fromToken": "TOKEN_SYMBOL",
  "toToken": "TOKEN_SYMBOL",
  "amount": NUMBER
}`}
      </pre>
      <h3 className="text-xl font-semibold mb-2">Required Fields</h3>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li><strong>fromToken:</strong> The symbol of the token you want to swap from (e.g., "SOL").</li>
        <li><strong>toToken:</strong> The symbol of the token you want to swap to (e.g., "USDC").</li>
        <li><strong>amount:</strong> The amount of the fromToken you want to swap (must be a number).</li>
      </ul>
      <h3 className="text-xl font-semibold mb-2">Response</h3>
      <p className="text-gray-700 mb-4">
        On a successful swap, you will receive a response containing the transaction details.
      </p>
      <h3 className="text-xl font-semibold mb-2">Error Handling</h3>
      <p className="text-gray-700 mb-4">
        In case of errors, appropriate error messages will be returned based on the nature of the error.
      </p>
    </div>
  );
};

export default RouteInfo;
