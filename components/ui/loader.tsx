import React from 'react';

interface LoaderProps {
  message?: string; // Optional message to display
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="loader"></div>
      <span className="text-gray-500">{message}</span>
      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3b82f6; /* Customize the color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Loader;
