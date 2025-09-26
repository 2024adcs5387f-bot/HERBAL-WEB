import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Activity, AlertCircle, CheckCircle, Brain, Zap, Target, Stethoscope } from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
    'Stomach pain', 'Joint pain', 'Muscle aches', 'Insomnia',
    'Anxiety', 'Skin rash', 'Digestive issues', 'Back pain'
  ];

  const bodyParts = [
    'Head', 'Chest', 'Abdomen', 'Arms', 'Legs', 'Back', 'Skin', 'General'
  ];

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
    setSearchTerm('');
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptoms = () => {
    if (symptoms.length === 0) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        primaryConditions: [
          {
            name: "Common Cold",
            probability: 78,
            description: "Viral infection affecting the upper respiratory tract",
            herbalRemedies: [
              "Echinacea - Immune system support",
              "Ginger - Anti-inflammatory and warming",
              "Elderberry - Antiviral properties",
              "Honey & Lemon - Soothing throat irritation"
            ]
          },
          {
            name: "Stress & Fatigue",
            probability: 65,
            description: "Physical and mental exhaustion from daily stressors",
            herbalRemedies: [
              "Ashwagandha - Adaptogenic stress relief",
              "Chamomile - Calming and relaxing",
              "Ginseng - Energy and vitality boost",
              "Lavender - Anxiety reduction"
            ]
          }
        ],
        recommendations: [
          "Stay hydrated and get adequate rest",
          "Consider herbal teas for symptom relief",
          "Monitor symptoms for 24-48 hours",
          "Consult healthcare provider if symptoms worsen"
        ],
        urgency: "low",
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice."
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !symptoms.includes(symptom)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Symptom Checker
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Describe your symptoms and get AI-powered health insights with personalized herbal recommendations. 
            Our system analyzes your symptoms and suggests natural remedies from our extensive database.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Symptom Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Search & Add Symptoms */}
            <div className="modern-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Search className="h-6 w-6 text-blue-400" />
                Add Your Symptoms
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search symptoms..."
                    className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-white"
                  />
                  <Search className="absolute right-4 top-4 h-5 w-5 text-primary-200" />
                </div>

                {/* Body Part Filter */}
                <div className="flex flex-wrap gap-2">
                  {bodyParts.map((part) => (
                    <button
                      key={part}
                      onClick={() => setSelectedBodyPart(selectedBodyPart === part ? '' : part)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedBodyPart === part
                          ? 'bg-blue-500/20 text-primary-200 border border-blue-500/30'
                          : 'bg-gray-700/50 text-white hover:bg-gray-600/50'
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>

                {/* Symptom Suggestions */}
                {(searchTerm || selectedBodyPart) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredSymptoms.slice(0, 9).map((symptom) => (
                      <motion.button
                        key={symptom}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addSymptom(symptom)}
                        className="flex items-center gap-2 p-3 bg-gray-800/30 hover:bg-blue-500/10 border border-gray-600 hover:border-blue-500/30 rounded-lg transition-all text-left text-white"
                      >
                        <Plus className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-white">{symptom}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div className="modern-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Selected Symptoms ({symptoms.length})
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {symptoms.map((symptom) => (
                    <motion.div
                      key={symptom}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-full"
                    >
                      <span className="text-sm font-medium text-white">{symptom}</span>
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                
                <button
                  onClick={analyzeSymptoms}
                  disabled={isAnalyzing || symptoms.length === 0}
                  className="neon-btn px-8 py-3 disabled:opacity-50 w-full md:w-auto"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="h-5 w-5" />
                      </motion.div>
                      Analyzing Symptoms...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Analyze Symptoms
                    </div>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* Primary Conditions */}
                  <div className="modern-card p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      Possible Conditions
                    </h3>
                    <div className="space-y-4">
                      {analysis.primaryConditions.map((condition, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{condition.name}</h4>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${condition.probability}%` }}
                                  transition={{ delay: 0.5, duration: 1 }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                />
                              </div>
                              <span className="text-sm font-medium text-primary-200">{condition.probability}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-white mb-3">{condition.description}</p>
                          
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-primary-200">Herbal Remedies:</h5>
                            {condition.herbalRemedies.map((remedy, i) => (
                              <div key={i} className="text-xs text-white flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{remedy}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="modern-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-sm text-white"
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{rec}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="modern-card p-4 border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-primary-200 mb-1">Important Notice</h4>
                        <p className="text-xs text-white">{analysis.disclaimer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="modern-card p-8 text-center"
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-full w-fit mx-auto">
                      <Activity className="h-12 w-12 text-primary-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Add symptoms to get started
                    </h3>
                    <p className="text-sm text-primary-200">
                      Select your symptoms and our AI will provide 
                      personalized health insights and herbal recommendations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
