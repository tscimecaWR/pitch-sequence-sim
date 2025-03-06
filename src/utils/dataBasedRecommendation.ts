
import { HistoricalPitchData, CurrentPitchSituation, DataDrivenRecommendationResult } from '../types/historicalData';
import { getDataDrivenRecommendation } from './historicalDataAnalysis';
import { mergeRecommendationScores } from './recommendationMerger';
import { importHistoricalData } from './historicalDataImport';

// Export all functionality from the original file through a barrel pattern
export { 
  getDataDrivenRecommendation,
  mergeRecommendationScores,
  importHistoricalData
};

// Re-export types 
export type { 
  HistoricalPitchData,
  CurrentPitchSituation,
  DataDrivenRecommendationResult
};
