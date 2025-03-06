
# Technical Implementation of the Pitch Recommendation System

## System Architecture Overview

The pitch recommendation system uses a hybrid approach combining rule-based heuristics with data-driven analysis. This document explains the technical implementation details for developers who need to maintain or extend the system.

## Core Components

```
recommendNextPitch() → { type, location, insights }
     ↑
     ├── Rule-based System
     │    ├── applyCountBasedScoring()
     │    ├── applyPatternRecognition()
     │    └── applyHandednessScoring()
     │
     ├── Data-driven System
     │    └── getDataDrivenRecommendation()
     │
     └── Recommendation Merger
          └── mergeRecommendationScores()
               ├── addRandomness()
               └── promoteVariety()
```

## Data Flow and Processing

1. **Entry Point**: `recommendNextPitch()` in `pitchRecommendation.ts`
   - Takes an array of previous pitches and configuration options
   - Returns a recommended pitch type, location, and optional insights

2. **Scoring Matrix Initialization**:
   ```typescript
   // Initialize scoring matrices for pitch types and locations
   const pitchTypeScores: Record<PitchType, number> = {
     'Fastball': 0, 'Curveball': 0, /* other pitch types */
   };
   
   const locationScores: Record<PitchLocation, number> = {
     'High Inside': 0, 'High Middle': 0, /* other locations */
   };
   ```

3. **Rule-Based Processing Pipeline**:
   - Each scoring module adds or subtracts values from these matrices
   - Higher scores indicate better pitches for the current situation

## Technical Implementation Details

### 1. Rule-Based System (`scoringUtils/`)

#### Count-Based Scoring
- File: `scoringUtils/countBasedScoring.ts`
- Analyzes the ball-strike count to adjust recommendations
- Implementation uses a declarative scoring system with conditional logic:
  ```typescript
  // Example for pitcher's counts (0-2, 1-2)
  if (strikes === 2 && balls < 2) {
    pitchTypeScores['Curveball'] += 3;
    pitchTypeScores['Slider'] += 3;
    // More score adjustments...
  }
  ```

#### Pattern Recognition
- File: `scoringUtils/patternRecognition.ts`
- Prevents predictable patterns by analyzing recent pitch history
- Uses array manipulation to detect repeated pitch types or locations:
  ```typescript
  const recentTypes = recentPitches.map(p => p.type);
  if (lastType === secondLastType) {
    pitchTypeScores[lastType] -= 3; // Penalize repetition
  }
  ```

#### Handedness-Based Scoring
- File: `scoringUtils/handednessScoring.ts`
- Adjusts scores based on pitcher/batter handedness matchup
- Uses boolean logic to determine same-side vs. opposite-side matchups:
  ```typescript
  const sameSide = batterHandedness === pitcherHandedness;
  if (sameSide) {
    pitchTypeScores['Slider'] += 3; // Breaking balls away from batter
    // More adjustments...
  }
  ```

### 2. Data-Driven System (`historicalDataAnalysis.ts`)

- Processes historical pitch data to find patterns in similar situations
- Uses filtering to identify relevant historical scenarios:
  ```typescript
  const relevantData = historicalData.filter(pitch => {
    const countMatch = pitch.count.balls === count.balls && 
                      pitch.count.strikes === count.strikes;
    const handednessMatch = pitch.batterHandedness === batterHandedness && 
                           pitch.pitcherHandedness === pitcherHandedness;
    return countMatch && handednessMatch;
  });
  ```

- Calculates success rates for each pitch type and location:
  ```typescript
  Object.entries(typeCounts).forEach(([type, data]) => {
    if (data.total >= 3) {
      const successRate = data.success / data.total;
      typeScores[type as PitchType] = Math.round(successRate * 10);
    }
  });
  ```

### 3. Recommendation Merger (`recommendationMerger.ts`)

- Combines rule-based and data-driven scores with configurable weights
- Implementation uses weighted averaging:
  ```typescript
  const mergedTypeScores: Record<PitchType, number> = {};
  for (const type in ruleBasedScores.typeScores) {
    const ruleScore = ruleBasedScores.typeScores[type] || 0;
    const dataScore = dataBasedScores.typeScores[type] || 0;
    mergedTypeScores[type] = (ruleScore * ruleWeight) + (dataScore * dataWeight);
  }
  ```

### 4. Randomization System (`randomizationUtils.ts`)

- Adds controlled randomness to prevent algorithmic loops
- Promotes variety in pitch selection based on recent history
- Implements two core functions:

#### `addRandomness()`
```typescript
export function addRandomness(
  scores: Record<string, number>,
  randomnessLevel: number = 0.15
): Record<string, number> {
  const result = { ...scores };
  
  Object.keys(result).forEach(key => {
    const randomFactor = (Math.random() * 2 - 1) * randomnessLevel;
    const maxPerturbation = Math.abs(result[key] * randomnessLevel);
    result[key] += maxPerturbation * randomFactor;
  });
  
  return result;
}
```

#### `promoteVariety()`
```typescript
export function promoteVariety(
  scores: Record<string, number>,
  recentChoices: string[],
  varietyBoost: number = 1.5
): Record<string, number> {
  const result = { ...scores };
  
  if (recentChoices.length === 0) return result;
  
  // Count occurrences in recent history
  const occurrenceCounts: Record<string, number> = {};
  Object.keys(result).forEach(key => {
    occurrenceCounts[key] = recentChoices.filter(choice => choice === key).length;
  });
  
  // Find least used options
  const minOccurrences = Math.min(...Object.values(occurrenceCounts));
  
  // Boost scores for less frequently used options
  Object.keys(result).forEach(key => {
    const occurrenceRatio = (occurrenceCounts[key] - minOccurrences) / recentChoices.length;
    result[key] += (1 - occurrenceRatio) * varietyBoost;
  });
  
  return result;
}
```

## Domain-Specific Rules and Constraints

### Direct Override Rules
The system implements hard constraints to prevent certain pitch combinations:

```typescript
// Example: Avoid sliders and changeups in the top half of the zone
const topHalfLocations: PitchLocation[] = [
  'High Inside', 'High Middle', 'High Outside',
  'Way High Inside', 'Way High', 'Way High Outside'
];

const pitchTypesToAvoidHigh: PitchType[] = ['Slider', 'Changeup'];

// Apply direct penalties
for (const pitchType of pitchTypesToAvoidHigh) {
  for (const location of topHalfLocations) {
    locationScores[location] -= 10;
  }
}
```

### Final Validation
Even after all scoring, the system performs a final validation to ensure rule compliance:

```typescript
// If we still ended up with slider/changeup in top half, force a recalculation
if (pitchTypesToAvoidHigh.includes(bestPitchType) && topHalfLocations.includes(bestLocation)) {
  // Find the best location that's not in the top half
  const validLocations = Object.entries(mergedScores.locationScores)
    .filter(([loc, _]) => !topHalfLocations.includes(loc as PitchLocation))
    .sort((a, b) => b[1] - a[1]);
  
  if (validLocations.length > 0) {
    // Use the best scoring non-top-half location instead
    const bestAlternativeLocation = validLocations[0][0] as PitchLocation;
    return {
      type: bestPitchType,
      location: bestAlternativeLocation,
      // Additional properties...
    };
  }
}
```

## Configuration and Extensibility

### Configuration Options
The recommendation system accepts configuration parameters that control its behavior:

```typescript
export const recommendNextPitch = (
  pitches: Pitch[], 
  options: { 
    dataWeight?: number;     // Weight for data-driven recommendations (0-1)
    includeInsights?: boolean; // Include detailed insights in response
    randomness?: number;      // Level of randomness to apply (0-1)
  } = {}
): { 
  type: PitchType; 
  location: PitchLocation; 
  insights?: string[];
  pitcherNames?: string[];
} => {
  const { 
    dataWeight = 0.8,        // Strong default bias toward data
    includeInsights = true,
    randomness = 0.15        // Default randomness level
  } = options;
  // Implementation...
}
```

### Extending the System

To add new scoring rules:
1. Create a new module in the `scoringUtils/` directory
2. Implement a function that takes and modifies the scoring matrices
3. Add the function call to the main processing pipeline in `pitchRecommendation.ts`

Example for a new scoring module:
```typescript
// hypotheticalPitcherFatigueScoring.ts
export function applyPitcherFatigueScoring(
  pitchTypeScores: Record<PitchType, number>,
  locationScores: Record<PitchLocation, number>,
  pitchCount: number
) {
  if (pitchCount > 80) {
    // Pitcher fatigue adjustments
    pitchTypeScores['Fastball'] -= Math.floor(pitchCount / 20);
    pitchTypeScores['Changeup'] += 2;
    // More adjustments...
  }
}
```

## Performance Considerations

The system is designed to be lightweight and suitable for real-time use:

1. **Time Complexity**: O(n) where n is the number of previous pitches
2. **Space Complexity**: O(1) as we use fixed-size scoring matrices
3. **Default Randomness**: A 0.15 randomness factor (15%) prevents deterministic loops
4. **Computation Delay**: A 500ms artificial delay improves UX with a "calculating" animation

## Type System

The system uses TypeScript to enforce type safety across all components:

```typescript
// Core recommendation result type
export interface DataDrivenRecommendationResult {
  typeScores: Record<PitchType, number>;
  locationScores: Record<PitchLocation, number>;
  insights: string[];
  pitcherNames?: string[];
}

// Current situation type
export interface CurrentPitchSituation {
  count: { balls: number; strikes: number };
  batterHandedness: BatterHandedness;
  pitcherHandedness: PitcherHandedness;
  previousPitches?: any[];
}
```

## Common Debugging Patterns

When troubleshooting the recommendation system:

1. **Score Inspection**: Log intermediate scores after each processing step
   ```typescript
   console.log('After count-based scoring:', JSON.stringify(pitchTypeScores));
   ```

2. **Recommendation Tracing**: Add trace IDs to track recommendation sources
   ```typescript
   insights.push(`[TRACE-${traceId}] Selected ${bestPitchType} based on rule X`);
   ```

3. **Weight Analysis**: Adjust weights to see how they influence final recommendations
   ```typescript
   // Test with 100% rule-based recommendations
   const result = recommendNextPitch(pitches, { dataWeight: 0 });
   ```

By understanding these technical details, you should be able to maintain, debug, and extend the pitch recommendation system effectively.
