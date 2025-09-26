import OpenAI from 'openai';

export class AIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'African Diagnosis System',
      },
    });
  }

  /**
   * Get disease predictions based on symptoms
   * @param {string[]} symptoms - Array of symptoms
   * @returns {Promise<Array>} - Array of predicted diseases with confidence scores
   */
  async predictDisease(symptoms) {
    try {
      const symptomText = symptoms.join(', ');
      
      const response = await this.openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical diagnosis assistant. Based on the provided symptoms, 
                    predict the most likely diseases or conditions. For each prediction, 
                    provide a confidence score between 0 and 1. Format your response as a JSON 
                    array of objects with 'disease' and 'confidence' properties.`
          },
          {
            role: 'user',
            content: `Based on these symptoms: ${symptomText}, what are the possible diseases? ` +
                    `Respond with only a JSON array of objects, each with 'disease' and 'confidence' properties.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      // Extract the JSON response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      // Parse the JSON response
      const result = JSON.parse(content);
      
      // If the response is in the expected format, return it
      if (Array.isArray(result)) {
        return result;
      }
      
      // If the response is an object with a predictions key, return that
      if (result.predictions && Array.isArray(result.predictions)) {
        return result.predictions;
      }
      
      // If the response is an object but not in the expected format, try to convert it
      return Object.entries(result).map(([disease, confidence]) => ({
        disease,
        confidence: typeof confidence === 'number' ? confidence : 0.5
      }));
      
    } catch (error) {
      console.error('Error in AI prediction:', error);
      
      // Fallback to mock data if there's an error
      return this.getMockPredictions(symptoms);
    }
  }

  /**
   * Fallback mock prediction function
   * @private
   */
  getMockPredictions(symptoms) {
    // Simple mock response based on common symptoms
    const mockDiseases = [
      { disease: 'Common Cold', confidence: 0.75 },
      { disease: 'Influenza (Flu)', confidence: 0.65 },
      { disease: 'Allergic Rhinitis', confidence: 0.45 }
    ];

    // Adjust mock data based on specific symptoms
    if (symptoms.some(s => s.toLowerCase().includes('fever'))) {
      mockDiseases.unshift({ disease: 'Viral Fever', confidence: 0.85 });
    }
    if (symptoms.some(s => s.toLowerCase().includes('headache'))) {
      mockDiseases.unshift({ disease: 'Tension Headache', confidence: 0.8 });
    }
    if (symptoms.some(s => s.toLowerCase().includes('cough'))) {
      mockDiseases.unshift({ disease: 'Upper Respiratory Infection', confidence: 0.78 });
    }

    return mockDiseases.slice(0, 3); // Return top 3 predictions
  }
}

// Export a singleton instance
export const aiService = new AIService();
