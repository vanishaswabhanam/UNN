import Papa from 'papaparse';
import * as tf from '@tensorflow/tfjs';

export interface DatasetInfo {
  features: string[];
  numFeatures: number;
  numSamples: number;
  hasCategoricalFeatures: boolean;
  hasNumericFeatures: boolean;
  suggestedTask: 'classification' | 'regression';
}

export interface ProcessedData {
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
  xsTest: tf.Tensor2D;
  ysTest: tf.Tensor2D;
  featureNames: string[];
  labelName: string;
  labelClasses?: string[];
  normalizeInfo?: {
    means: number[];
    stds: number[];
  };
  info: DatasetInfo;
}

/**
 * Parse a CSV file into a 2D array
 */
export const parseCSV = async (file: File): Promise<{ data: any[], columns: string[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve({
            data: results.data,
            columns: results.meta.fields || []
          });
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Analyze data to determine suitable task types and model architectures
 */
export const analyzeData = (data: any[], columns: string[]): DatasetInfo => {
  // Basic info
  const numSamples = data.length;
  const features = columns.slice(0, -1); // Assume last column is label
  const numFeatures = features.length;
  
  // Check data types
  let hasCategoricalFeatures = false;
  let hasNumericFeatures = false;
  
  features.forEach(feature => {
    const values = data.map(row => row[feature]);
    const uniqueValues = new Set(values);
    
    // If few unique values relative to dataset size, likely categorical
    if (uniqueValues.size <= Math.min(10, numSamples * 0.1)) {
      hasCategoricalFeatures = true;
    } else {
      // Check if values are numbers
      const allNumbers = values.every(val => typeof val === 'number');
      if (allNumbers) {
        hasNumericFeatures = true;
      } else {
        hasCategoricalFeatures = true;
      }
    }
  });
  
  // Analyze target variable (last column assumed to be the label)
  const labelColumn = columns[columns.length - 1];
  const labelValues = data.map(row => row[labelColumn]);
  const uniqueLabelValues = new Set(labelValues);
  
  // If few unique label values, likely classification, otherwise regression
  const suggestedTask = uniqueLabelValues.size <= 10 ? 'classification' : 'regression';
  
  return {
    features,
    numFeatures,
    numSamples,
    hasCategoricalFeatures,
    hasNumericFeatures,
    suggestedTask
  };
};

/**
 * Process data for machine learning
 */
export const processData = (data: any[], columns: string[], targetColumn?: string, testSplit = 0.2): ProcessedData => {
  // Default to last column as target if not specified
  const labelName = targetColumn || columns[columns.length - 1];
  const featureNames = columns.filter(col => col !== labelName);
  
  // Extract features and labels
  const xs: number[][] = [];
  const ys: number[][] = [];
  
  // Check if classification or regression
  const labelValues = data.map(row => row[labelName]);
  const uniqueLabels = Array.from(new Set(labelValues));
  const isClassification = uniqueLabels.length <= 10;
  
  // Encode labels
  const labelMap = isClassification 
    ? Object.fromEntries(uniqueLabels.map((label, i) => [label, i]))
    : null;
  
  // Process each row
  data.forEach(row => {
    const features = featureNames.map(name => {
      const value = row[name];
      return typeof value === 'number' ? value : 0; // Simple handling, can be expanded
    });
    
    xs.push(features);
    
    if (isClassification) {
      // One-hot encode for classification
      const oneHot = new Array(uniqueLabels.length).fill(0);
      const labelIndex = labelMap?.[row[labelName]] || 0;
      oneHot[labelIndex] = 1;
      ys.push(oneHot);
    } else {
      // Single value for regression
      ys.push([Number(row[labelName])]);
    }
  });
  
  // Normalize features
  const means: number[] = [];
  const stds: number[] = [];
  
  for (let i = 0; i < featureNames.length; i++) {
    const values = xs.map(row => row[i]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const std = Math.sqrt(variance) || 1; // Avoid division by zero
    
    means.push(mean);
    stds.push(std);
    
    // Apply normalization
    for (let j = 0; j < xs.length; j++) {
      xs[j][i] = (xs[j][i] - mean) / std;
    }
  }
  
  // Split into train and test sets
  const splitIndex = Math.floor(xs.length * (1 - testSplit));
  const xsTrain = xs.slice(0, splitIndex);
  const ysTrain = ys.slice(0, splitIndex);
  const xsTest = xs.slice(splitIndex);
  const ysTest = ys.slice(splitIndex);
  
  // Convert to tensors
  const xsTensor = tf.tensor2d(xsTrain);
  const ysTensor = tf.tensor2d(ysTrain);
  const xsTestTensor = tf.tensor2d(xsTest);
  const ysTestTensor = tf.tensor2d(ysTest);
  
  return {
    xs: xsTensor,
    ys: ysTensor,
    xsTest: xsTestTensor,
    ysTest: ysTestTensor,
    featureNames,
    labelName,
    labelClasses: isClassification ? uniqueLabels.map(l => String(l)) : undefined,
    normalizeInfo: {
      means,
      stds
    },
    info: analyzeData(data, columns)
  };
};

export const predictOptimalArchitecture = (dataInfo: DatasetInfo) => {
  // Simple heuristic-based architecture recommendation
  const { numFeatures, numSamples, hasCategoricalFeatures, suggestedTask } = dataInfo;
  
  // Base architecture scaled by data size and complexity
  let hiddenLayerSizes: number[] = [];
  let learningRate = 0.01;
  let activation = 'relu';
  
  // Determine number of layers and neurons based on dataset size
  if (numSamples < 100) {
    // Small dataset - simpler model to avoid overfitting
    hiddenLayerSizes = [Math.max(numFeatures, 5)];
    learningRate = 0.1; // Higher learning rate for faster convergence
  } else if (numSamples < 1000) {
    // Medium dataset
    hiddenLayerSizes = [
      Math.max(Math.round(numFeatures * 1.5), 10),
      Math.max(Math.round(numFeatures), 5)
    ];
  } else {
    // Large dataset - more complex model
    hiddenLayerSizes = [
      Math.max(Math.round(numFeatures * 2), 20),
      Math.max(Math.round(numFeatures * 1.5), 15),
      Math.max(Math.round(numFeatures), 10)
    ];
    learningRate = 0.001; // Lower learning rate for more stable convergence
  }
  
  // Adjust for categorical features
  if (hasCategoricalFeatures) {
    // Increase model capacity for categorical data
    hiddenLayerSizes = hiddenLayerSizes.map(size => Math.round(size * 1.2));
  }
  
  // Adjust for task type
  if (suggestedTask === 'classification') {
    activation = 'relu';
  } else {
    // For regression tasks
    activation = 'tanh';
  }
  
  // Determine batch size based on dataset size
  let batchSize = 32;
  if (numSamples < 100) {
    batchSize = 16;
  } else if (numSamples > 10000) {
    batchSize = 64;
  }
  
  // Recommend epochs based on dataset size
  let epochs = 50;
  if (numSamples < 100) {
    epochs = 100; // More epochs for small datasets
  } else if (numSamples > 10000) {
    epochs = 20; // Fewer epochs for large datasets
  }
  
  return {
    layers: hiddenLayerSizes.length + 2, // Input and output layers + hidden layers
    neuronsPerLayer: [numFeatures, ...hiddenLayerSizes, suggestedTask === 'classification' ? 2 : 1],
    activationFunction: activation,
    learningRate,
    batchSize,
    epochs
  };
}; 