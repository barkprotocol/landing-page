import express from 'express';
import { body, validationResult } from 'express-validator';
import { createProposal, voteOnProposal } from '@/components/ui/milton/governance'; 
import { logError } from '../../../errors/error-logger'; 

const router = express.Router();

// Create Proposal Endpoint
router.post(
  '/proposals',
  [
    body('title').isString().withMessage('Title is required'),
    body('description').isString().withMessage('Description is required'),
    body('proposer').isString().withMessage('Proposer address is required'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, proposer } = req.body;

    try {
      // Call the governance service to create a proposal
      const result = await createProposal(title, description, proposer);
      return res.status(201).json(result);
    } catch (error) {
      // Log the error
      logError(error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
);

// Vote on Proposal Endpoint
router.post(
  '/proposals/:id/vote',
  [
    body('voter').isString().withMessage('Voter address is required'),
    body('voteType').isIn(['yes', 'no']).withMessage('Vote type must be yes or no'),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { voter, voteType } = req.body;

    try {
      // Call the governance service to vote on a proposal
      const result = await voteOnProposal(id, voter, voteType);
      return res.status(200).json(result);
    } catch (error) {
      // Log the error
      logError(error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
);

export default router;
