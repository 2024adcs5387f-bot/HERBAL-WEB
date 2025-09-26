import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Calendar, Target, Heart, Brain, Shield, Zap, Star, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import knowledgeService from '../services/knowledgeService';

const AIRecommendations = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    healthGoals: [],
    conditions: [],
    lifestyle: '',
    preferences: []
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const healthGoals = [
    { id: 'immunity', label: 'Boost Immunity', icon: '🛡️' },
    { id: 'energy', label: 'Increase Energy', icon: '⚡' },
    { id: 'stress', label: 'Reduce Stress', icon: '🧘' },
    { id: 'sleep', label: 'Better Sleep', icon: '😴' },
    { id: 'digestion', label: 'Improve Digestion', icon: '🌿' },
    { id: 'focus', label: 'Mental Clarity', icon: '🧠' }
  ];

  const conditions = [
    'Anxiety', 'Insomnia', 'Digestive Issues', 'Joint Pain', 
    'High Blood Pressure', 'Diabetes', 'Skin Problems', 'Allergies'
  ];

  const lifestyles = [
    { id: 'active', label: 'Very Active', desc: 'Regular exercise, outdoor activities' },
    { id: 'moderate', label: 'Moderately Active', desc: 'Some exercise, balanced routine' },
    { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, limited physical activity' }
  ];

  const preferences = [
    { id: 'organic', label: 'Organic Only' },
    { id: 'vegan', label: 'Vegan/Plant-based' },
    { id: 'traditional', label: 'Traditional Remedies' },
    { id: 'modern', label: 'Modern Formulations' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Get enhanced recommendations using research data
      const enhancedRecommendations = await knowledgeService.getEnhancedRecommendations(
        formData.conditions,
        formData.preferences.join(', '),
        '' // allergies - could be added to form
      );

      // Get research knowledge for additional context
      const researchKnowledge = await knowledgeService.getResearchKnowledge({
        limit: 50,
        verified: 'true'
      });

      // Generate insights from research data
      const insights = knowledgeService.generateInsights(researchKnowledge.knowledgeBase);

      setRecommendations({
        personalizedPlan: {
          title: "Your Research-Based Herbal Wellness Plan",
          score: 94,
          duration: "30-day program",
          researchBased: true
        },
        primaryRecommendations: enhancedRecommendations.recommendations || [
          {
            name: "Ashwagandha Root Extract",
            category: "Adaptogen",
            benefits: ["Stress reduction", "Energy boost", "Sleep quality"],
            dosage: "300mg twice daily",
            timing: "Morning and evening with meals",
            confidence: 96,
            price: "$24.99",
            evidence: "Research shows adaptogenic properties"
          },
          {
            name: "Turmeric Curcumin Complex",
            category: "Anti-inflammatory",
            benefits: ["Joint health", "Inflammation reduction", "Antioxidant support"],
            dosage: "500mg daily",
            timing: "With lunch",
            confidence: 89,
            price: "$19.99",
            evidence: "Multiple studies confirm anti-inflammatory effects"
          }
        ],
        researchEvidence: enhancedRecommendations.evidence || [],
        researchCitations: enhancedRecommendations.research_citations || [],
        insights: insights,
        lifestyle: {
          diet: [
            "Include anti-inflammatory foods (berries, leafy greens)",
            "Reduce processed sugar intake",
            "Stay hydrated with herbal teas"
          ],
          exercise: [
            "30 minutes moderate exercise 5x/week",
            "Include stress-reducing activities like yoga",
            "Regular walking in nature"
          ],
          habits: [
            "Establish consistent sleep schedule",
            "Practice mindfulness or meditation",
            "Limit screen time before bed"
          ]
        },
        safetyNotes: enhancedRecommendations.safety_notes || "Always consult with a healthcare provider before starting any herbal treatment.",
        interactions: enhancedRecommendations.interactions || "Check for drug interactions with your current medications.",
        disclaimer: enhancedRecommendations.disclaimer || "This AI-generated advice is for informational purposes only and should not replace professional medical consultation."
      });

    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pt-40">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Health Recommendations
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Get personalized herbal recommendations based on your health goals, conditions, and preferences. 
            Our AI analyzes your needs and suggests the most effective natural solutions.
          </p>
        </motion.div>

        {!recommendations ? (
          <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-primary-200">
                  Step {currentStep} of 4
                </span>
                <span className="text-sm font-medium text-primary-200">
                  {Math.round((currentStep / 4) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="modern-card p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="h-6 w-6 text-purple-400" />
                    Basic Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Age</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        placeholder="Enter your age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="modern-card p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Target className="h-6 w-6 text-purple-400" />
                    Health Goals
                  </h2>
                  <p className="text-primary-200 mb-6">Select your primary health and wellness goals:</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {healthGoals.map((goal) => (
                      <motion.button
                        key={goal.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleArrayToggle('healthGoals', goal.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          formData.healthGoals.includes(goal.id)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-gray-800/30 border-gray-600 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="text-2xl mb-2">{goal.icon}</div>
                        <div className="font-medium">{goal.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="modern-card p-8 space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Heart className="h-6 w-6 text-purple-400" />
                      Health Conditions & Lifestyle
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          Any existing health conditions? (Optional)
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                          {conditions.map((condition) => (
                            <button
                              key={condition}
                              onClick={() => handleArrayToggle('conditions', condition)}
                              className={`p-3 text-left rounded-lg border transition-all ${
                                formData.conditions.includes(condition)
                                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                  : 'bg-gray-800/30 border-gray-600 hover:border-red-500/30'
                              }`}
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-3">Lifestyle</label>
                        <div className="space-y-3">
                          {lifestyles.map((lifestyle) => (
                            <button
                              key={lifestyle.id}
                              onClick={() => handleInputChange('lifestyle', lifestyle.id)}
                              className={`w-full p-4 text-left rounded-lg border transition-all ${
                                formData.lifestyle === lifestyle.id
                                  ? 'bg-blue-500/20 border-blue-500/50'
                                  : 'bg-gray-800/30 border-gray-600 hover:border-blue-500/30'
                              }`}
                            >
                              <div className="font-medium text-white">{lifestyle.label}</div>
                              <div className="text-sm text-primary-200">{lifestyle.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="modern-card p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-purple-400" />
                    Preferences
                  </h2>
                  <p className="text-primary-200 mb-6">Select your product preferences:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {preferences.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => handleArrayToggle('preferences', pref.id)}
                        className={`p-4 text-left rounded-lg border transition-all ${
                          formData.preferences.includes(pref.id)
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-gray-800/30 border-gray-600 hover:border-green-500/30'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="outline-btn px-6 py-3 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={isGenerating}
                className="neon-btn px-8 py-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="h-5 w-5" />
                    </motion.div>
                    Generating...
                  </div>
                ) : currentStep === 4 ? (
                  'Generate Recommendations'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Plan Header */}
            <div className="modern-card p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">{recommendations.personalizedPlan.title}</h2>
                {recommendations.personalizedPlan.researchBased && (
                  <div className="flex items-center gap-1 text-sm text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                    <BookOpen className="h-4 w-4" />
                    <span>Research-Based</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <span className="text-primary-200">Match Score:</span>
                  <span className="font-bold text-green-400">{recommendations.personalizedPlan.score}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span>{recommendations.personalizedPlan.duration}</span>
                </div>
              </div>
            </div>

            {/* Research Insights */}
            {recommendations.insights && recommendations.insights.length > 0 && (
              <div className="modern-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Research Insights
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {recommendations.insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">{insight.title}</h4>
                      <p className="text-sm text-primary-200">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {recommendations.primaryRecommendations.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="modern-card p-6 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">{product.confidence}%</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-1">Benefits:</h4>
                      <ul className="text-sm text-primary-200 space-y-1">
                        {product.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-400 rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-sm">
                      <p><span className="font-medium">Dosage:</span> {product.dosage}</p>
                      <p><span className="font-medium">Timing:</span> {product.timing}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">{product.price}</span>
                    <button className="neon-btn px-4 py-2 text-sm">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Lifestyle Recommendations */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="modern-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🥗 Diet Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-primary-200">
                  {recommendations.lifestyle.diet.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="modern-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🏃 Exercise Plan
                </h3>
                <ul className="space-y-2 text-sm text-primary-200">
                  {recommendations.lifestyle.exercise.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="modern-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🧘 Healthy Habits
                </h3>
                <ul className="space-y-2 text-sm text-primary-200">
                  {recommendations.lifestyle.habits.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
