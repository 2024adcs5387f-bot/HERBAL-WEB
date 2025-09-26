import { Router } from 'express';
import { getRemedies } from '../controllers/remedy.controller.js';

const router = Router();

/**
 * @route   GET /api/remedies/:disease
 * @desc    Get natural remedies for a specific disease
 * @access  Public
 * @params  {string} disease - The name of the disease
 */
router.get('/:disease', getRemedies);

export default router;
