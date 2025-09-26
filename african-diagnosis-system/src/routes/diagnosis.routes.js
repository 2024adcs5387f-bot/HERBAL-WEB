import { Router } from 'express';
import { diagnose } from '../controllers/diagnosis.controller.js';
import { validateDiagnosisInput } from '../middleware/validation.js';

const router = Router();

/**
 * @route   POST /api/diagnose
 * @desc    Get disease diagnosis based on symptoms
 * @access  Public
 * @body    {string[]} symptoms - Array of symptom strings
 */
router.post('/', validateDiagnosisInput, diagnose);

export default router;
