/**
 * Middleware to validate diagnosis input
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validateDiagnosisInput = (req, res, next) => {
  const { symptoms } = req.body;
  
  // Check if symptoms exist and is an array
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Symptoms must be provided as an array of strings'
    });
  }
  
  // Check if symptoms array is empty
  if (symptoms.length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'At least one symptom is required'
    });
  }
  
  // Check if all symptoms are strings
  if (!symptoms.every(symptom => typeof symptom === 'string')) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'All symptoms must be strings'
    });
  }
  
  // Trim whitespace from symptoms
  req.body.symptoms = symptoms.map(symptom => symptom.trim())
    .filter(symptom => symptom.length > 0);
  
  next();
};
