
import { HistoricalPitchData } from '../types/historicalData';

// Helper function to upload/import historical pitch data
export const importHistoricalData = (jsonData: string): HistoricalPitchData[] => {
  try {
    const parsedData = JSON.parse(jsonData);
    // Validate the data format
    if (!Array.isArray(parsedData)) {
      throw new Error('Data must be an array of pitch records');
    }
    
    // Basic validation of each record
    const validatedData = parsedData.filter(record => {
      return (
        record.type && 
        record.location && 
        record.count && 
        record.batterHandedness && 
        record.pitcherHandedness && 
        record.result
      );
    });
    
    return validatedData;
  } catch (error) {
    console.error('Error parsing historical data:', error);
    return [];
  }
};
