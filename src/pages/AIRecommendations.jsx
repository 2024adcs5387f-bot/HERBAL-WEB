import React, { useState } from 'react';
import { Sparkles, Leaf, Heart, Brain, Shield, Zap } from 'lucide-react';

const AIRecommendations = () => {
  const [userInput, setUserInput] = useState({
    age: '',
    symptoms: '',
    preferences: '',
    allergies: ''
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setRecommendations({
        herbs: [
          {
            name: 'Turmeric',
            scientificName: 'Curcuma longa',
            benefits: 'Anti-inflammatory, antioxidant properties',
            dosage: '500-1000mg daily',
            icon: <Leaf className="w-6 h-6" />
          },
          {
            name: 'Ginger',
            scientificName: 'Zingiber officinale',
            benefits: 'Digestive support, anti-nausea',
            dosage: '1-3g daily',
            icon: <Heart className="w-6 h-6" />
          },
          {
            name: 'Ashwagandha',
            scientificName: 'Withania somnifera',
            benefits: 'Stress relief, cognitive support',
            dosage: '300-500mg twice daily',
            icon: <Brain className="w-6 h-6" />
          }
        ],
        lifestyle: [
          'Stay hydrated with 8-10 glasses of water daily',
          'Practice mindfulness or meditation for 10-15 minutes',
          'Ensure 7-8 hours of quality sleep',
          'Include regular physical activity'
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Herbal Recommendations
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized herbal remedies based on your health profile
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={userInput.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your age"
                required
              />
            </div>

            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms or Health Concerns
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={userInput.symptoms}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your symptoms or health concerns..."
                required
              />
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                Preferences (Optional)
              </label>
              <input
                type="text"
                id="preferences"
                name="preferences"
                value={userInput.preferences}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., prefer teas over capsules"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                Allergies or Contraindications
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={userInput.allergies}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="List any allergies or medications"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get AI Recommendations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recommendations Display */}
        {recommendations && (
          <div className="space-y-6">
            {/* Herbal Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" />
                Recommended Herbs
              </h2>
              <div className="grid gap-6 md:grid-cols-1">
                {recommendations.herbs.map((herb, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-green-600 mt-1">
                        {herb.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {herb.name}
                        </h3>
                        <p className="text-sm text-gray-500 italic mb-3">
                          {herb.scientificName}
                        </p>
                        <p className="text-gray-700 mb-2">
                          <span className="font-medium">Benefits:</span> {herb.benefits}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Recommended Dosage:</span> {herb.dosage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Lifestyle Recommendations
              </h2>
              <ul className="space-y-3">
                {recommendations.lifestyle.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> These recommendations are AI-generated and for informational purposes only. 
                Always consult with a qualified healthcare professional before starting any new herbal supplement or 
                treatment regimen, especially if you have existing health conditions or are taking medications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
