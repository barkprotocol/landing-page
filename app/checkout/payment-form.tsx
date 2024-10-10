import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { validateTransfer, ValidateTransferFields, ValidateTransferError } from './validate-transfer';
import type { TransactionSignature } from '@solana/web3.js';

const PaymentForm: React.FC = () => {
    const [recipient, setRecipient] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [splToken, setSplToken] = useState<string>('');
    const [memo, setMemo] = useState<string>('');
    const [transactionSignature, setTransactionSignature] = useState<TransactionSignature | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '', 'confirmed');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setTransactionSignature(null);

        try {
            // Here you would initiate the payment and get the transaction signature
            const signature = await initiatePayment(recipient, amount, splToken, memo);
            setTransactionSignature(signature);

            // Validate the transfer using the signature
            const fields: ValidateTransferFields = {
                recipient,
                amount,
                splToken,
                memo,
            };

            await validateTransfer(connection, signature, fields);
            alert('Payment successfully validated!');
        } catch (err) {
            if (err instanceof ValidateTransferError) {
                setError(err.message);
            } else {
                setError('An error occurred while processing the payment.');
            }
        } finally {
            setLoading(false);
        }
    };

    const initiatePayment = async (recipient: string, amount: number, splToken?: string, memo?: string): Promise<TransactionSignature> => {
        // Logic to initiate the payment transaction goes here
        // This is just a placeholder for the actual payment logic
        // Make sure to return the transaction signature
        return 'mock-signature' as TransactionSignature; // Replace with actual logic
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h2>Make a Payment</h2>
            <div>
                <label>
                    Recipient Address:
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Amount (in SOL):
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    SPL Token (optional):
                    <input
                        type="text"
                        value={splToken}
                        onChange={(e) => setSplToken(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Memo (optional):
                    <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                    />
                </label>
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Send Payment'}
            </button>
            {error && <p className="error">{error}</p>}
            {transactionSignature && <p>Transaction Signature: {transactionSignature}</p>}
        </form>
    );
};

export default PaymentForm;
