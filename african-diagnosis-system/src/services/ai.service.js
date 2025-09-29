import OpenAI from 'openai';

export class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.enabled = typeof this.apiKey === 'string' && this.apiKey.trim().length > 0;
    this.openai = null;

    if (this.enabled) {
      this.openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: this.apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'African Diagnosis System',
        },
      });
    } else {
      // Fail gracefully to mock predictions when no key
      console.warn('[AIService] OPENROUTER_API_KEY not set. Using mock predictions.');
    }
  }

  /**
   * Get disease predictions based on symptoms
   * @param {string[]} symptoms - Array of symptoms
   * @returns {Promise<Array>} - Array of predicted diseases with confidence scores
   */
  async predictDisease(symptoms) {
    try {
      if (!this.enabled || !this.openai) {
        return this.getMockPredictions(symptoms);
      }
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
        ]
      });

      // Extract the JSON response
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      // Parse the JSON response
      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        // Try to extract JSON array/object from text
        const match = content.match(/(\[.*\]|\{.*\})/s);
        if (!match) throw e;
        result = JSON.parse(match[1]);
      }
      
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
