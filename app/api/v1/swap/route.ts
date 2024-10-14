import express from 'express';
import { body, validationResult } from 'express-validator';
import { swapTokens } from '../../../swap/swap-tokens';
import { logError } from '../../../errors/error-logger';

const router = express.Router();

// Swap Tokens Endpoint
router.post(
  '/swap',
  [
    body('fromToken').isString().withMessage('From Token is required'),
    body('toToken').isString().withMessage('To Token is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromToken, toToken, amount } = req.body;

    try {
      // Call the swap service logic
      const result = await swapTokens(fromToken, toToken, amount);
      return res.status(200).json(result);
    } catch (error) {
      // Log the error
      logError(error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
);

export default router;
