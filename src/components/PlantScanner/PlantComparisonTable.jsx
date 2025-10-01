import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Leaf, Activity } from 'lucide-react';

const PlantComparisonTable = ({ comparisonData, identifiedPlant }) => {
  if (!comparisonData || !comparisonData.top_matches) {
    return null;
  }

  const getConfidenceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBg = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (percentage >= 75) return 'bg-blue-100 dark:bg-blue-900/20';
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (percentage >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence === 'Very High' || confidence === 'High') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (confidence === 'Moderate') {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 mt-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Plant Similarity Analysis
          </h3>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Comparing with {comparisonData.comparisons?.length || 0} database plants
          </p>
        </div>
      </div>

      {/* Best Match Highlight */}
      {comparisonData.best_match && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`${getConfidenceBg(comparisonData.best_match.similarity_percentage)} border-2 border-primary-300 dark:border-primary-700 rounded-xl p-6 mb-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Best Match: {comparisonData.best_match.common_name}
                </h4>
                <p className="text-base text-neutral-600 dark:text-neutral-400 italic">
                  {comparisonData.best_match.scientific_name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getConfidenceColor(comparisonData.best_match.similarity_percentage)}`}>
                {comparisonData.best_match.similarity_percentage}%
              </div>
              <div className="flex items-center gap-2 justify-end mt-1">
                {getConfidenceIcon(comparisonData.best_match.confidence)}
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {comparisonData.best_match.confidence} Confidence
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Matched Features</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {comparisonData.best_match.matched_features}/{comparisonData.best_match.total_features}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Family</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {comparisonData.best_match.botanical_family}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Rank
              </th>
              <th className="text-left py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Plant Name
              </th>
              <th className="text-left py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Scientific Name
              </th>
              <th className="text-center py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Similarity
              </th>
              <th className="text-center py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Features Match
              </th>
              <th className="text-center py-4 px-4 text-base font-semibold text-neutral-900 dark:text-white">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.top_matches.map((match, index) => (
              <motion.tr
                key={match.plant_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-neutral-400'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {match.common_name}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-base text-neutral-600 dark:text-neutral-400 italic">
                    {match.scientific_name}
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-full ${getConfidenceBg(match.similarity_percentage)}`}>
                    <span className={`text-xl font-bold ${getConfidenceColor(match.similarity_percentage)}`}>
                      {match.similarity_percentage}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">
                    {match.matched_features}/{match.total_features}
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getConfidenceIcon(match.confidence)}
                    <span className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                      {match.confidence}
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Comparison Legend */}
      <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Features Analyzed
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {comparisonData.input_features && Object.entries(comparisonData.input_features).map(([key, value]) => (
            value && value !== 'unknown' && (
              <div key={key} className="bg-white dark:bg-neutral-800 rounded-lg p-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                  {key.replace('_', ' ')}
                </p>
                <p className="text-base font-medium text-neutral-900 dark:text-white capitalize">
                  {value.replace('_', ' ')}
                </p>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Similarity Scale Legend */}
      <div className="mt-4 p-4 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 dark:from-red-900/20 dark:via-yellow-900/20 dark:to-green-900/20 rounded-xl">
        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
          Similarity Scale
        </h4>
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
              0%
            </div>
            <p className="text-neutral-700 dark:text-neutral-300">Very Low</p>
          </div>
          <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mx-4"></div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
              100%
            </div>
            <p className="text-neutral-700 dark:text-neutral-300">Perfect Match</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlantComparisonTable;
