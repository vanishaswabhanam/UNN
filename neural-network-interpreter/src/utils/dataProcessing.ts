import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';
import { ModelParameters, TaskType, ActivationType, OptimizerType } from '../types';

export interface DatasetInfo {
  features: string[];
  target: string;
  numericFeatures: number[][];
  outputValues: number[][];
  isClassification?: boolean;
  outputLabels?: string[];
  tensors: {
    trainX: tf.Tensor2D;
    trainY: tf.Tensor2D;
    testX: tf.Tensor2D;
    testY: tf.Tensor2D;
    means: number[];
    stds: number[];
  };
  originalData: any[];
}

/**
 * Parse CSV content into an array of objects
 */
export const parseCSV = (content: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<any>(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      }
    });
  });
};

/**
 * Process data for training
 */
export const processData = (
  data: any[],
  targetColumn: string,
  testSize: number = 0.2
): DatasetInfo => {
  // Extract feature column names, excluding target column
  const features = Object.keys(data[0]).filter(col => col !== targetColumn);
  
  console.log('Features:', features);
  console.log('Target column:', targetColumn);
  
  // Extract features and target values
  const rawFeatures: any[][] = [];
  const rawOutputs: any[] = [];
  
  data.forEach(row => {
    const featureValues = features.map(feature => row[feature]);
    rawFeatures.push(featureValues);
    rawOutputs.push(row[targetColumn]);
  });
  
  // Determine if it's a classification problem
  const uniqueOutputValues = Array.from(new Set(rawOutputs));
  console.log('Unique output values:', uniqueOutputValues);
  
  const isClassification = typeof rawOutputs[0] === 'string' || uniqueOutputValues.length < 10;
  console.log('Is classification task:', isClassification);
  
  // Convert all features to numeric values
  const numericFeatures: number[][] = [];
  
  rawFeatures.forEach(row => {
    const numericRow = row.map((value: any) => {
      if (typeof value === 'string') {
        // Simple categorical encoding - replace with one-hot encoding for better results
        return Number(value) || 0;
      }
      return Number(value) || 0;
    });
    numericFeatures.push(numericRow);
  });
  
  // Normalize features
  const { normalizedData: featuresNormalized, means, stds } = normalizeData(
    tf.tensor2d(numericFeatures)
  );
  
  // Process outputs
  let outputValues: number[][] = [];
  let outputLabels: string[] | undefined;
  
  if (isClassification) {
    // One-hot encode for classification
    if (typeof rawOutputs[0] === 'string') {
      // Create a mapping of labels to indices
      outputLabels = Array.from(new Set(rawOutputs)) as string[];
      
      rawOutputs.forEach(value => {
        const oneHot = new Array(outputLabels!.length).fill(0);
        const index = outputLabels!.indexOf(value as string);
        oneHot[index] = 1;
        outputValues.push(oneHot);
      });
    } else {
      // Binary classification
      rawOutputs.forEach(value => {
        outputValues.push([Number(value)]);
      });
    }
  } else {
    // Regression - normalize outputs
    const outputsArray = rawOutputs.map(value => [Number(value)]);
    const tensorOutputs = tf.tensor2d(outputsArray);
    
    // Simple normalization for outputs
    const outputTensor = tensorOutputs.sub(tensorOutputs.min())
      .div(tensorOutputs.max().sub(tensorOutputs.min()).add(tf.scalar(1e-8)));
    
    outputValues = outputTensor.arraySync() as number[][];
    
    // Clean up tensors
    tensorOutputs.dispose();
    outputTensor.dispose();
  }
  
  const featuresResult = featuresNormalized.arraySync() as number[][];
  const outputsResult = outputValues;
  
  console.log('Features shape:', [featuresResult.length, featuresResult[0].length]);
  console.log('Outputs shape:', [outputsResult.length, outputsResult[0].length]);
  
  // Create TF tensors
  const featuresTensor = tf.tensor2d(featuresResult);
  const outputsTensor = tf.tensor2d(outputsResult);
  
  // Split the data
  const { trainX, trainY, testX, testY } = splitData(featuresTensor, outputsTensor, testSize);
  
  console.log('Training set size:', trainX.shape[0]);
  console.log('Test set size:', testX.shape[0]);
  
  // Clean up tensors
  featuresTensor.dispose();
  outputsTensor.dispose();
  featuresNormalized.dispose();
  
  return {
    features,
    target: targetColumn,
    numericFeatures,
    outputValues,
    isClassification,
    outputLabels,
    tensors: {
      trainX,
      trainY,
      testX,
      testY,
      means,
      stds
    },
    originalData: data
  };
};

/**
 * Normalize the data using z-score normalization
 */
export const normalizeData = (
  tensor: tf.Tensor2D
): { normalizedData: tf.Tensor2D; means: number[]; stds: number[] } => {
  const means = tensor.mean(0).arraySync() as number[];
  // Use standard deviation calculation
  const stds: number[] = [];
  
  // Calculate standard deviation manually since tensor.std() is not available
  const batchSize = tensor.shape[0];
  const featureSize = tensor.shape[1];
  
  // Calculate standard deviation for each feature
  for (let i = 0; i < featureSize; i++) {
    const feature = tensor.slice([0, i], [batchSize, 1]);
    const featureMean = means[i];
    
    // Calculate squared diff from mean
    const squaredDiffs = feature.sub(tf.scalar(featureMean)).square();
    const variance = squaredDiffs.mean().arraySync() as number;
    stds.push(Math.sqrt(variance));
    
    // Clean up tensors
    feature.dispose();
    squaredDiffs.dispose();
  }
  
  // Replace zero stds with 1 to avoid division by zero
  const nonZeroStds = stds.map(std => std === 0 ? 1 : std);
  
  // Create tensors for mean and std
  const meansTensor = tf.tensor1d(means);
  const stdsTensor = tf.tensor1d(nonZeroStds);
  
  // Normalize: (x - mean) / std
  const normalizedData = tensor.sub(meansTensor).div(stdsTensor) as tf.Tensor2D;
  
  // Clean up temporary tensors
  meansTensor.dispose();
  stdsTensor.dispose();
  
  return { normalizedData, means, stds };
};

/**
 * Split data into training and testing sets
 */
export const splitData = (
  features: tf.Tensor2D,
  outputs: tf.Tensor2D,
  testFraction: number = 0.2
): {
  trainX: tf.Tensor2D;
  trainY: tf.Tensor2D;
  testX: tf.Tensor2D;
  testY: tf.Tensor2D;
} => {
  const numExamples = features.shape[0];
  const numTestExamples = Math.round(numExamples * testFraction);
  const numTrainExamples = numExamples - numTestExamples;
  
  // Create indices and shuffle them
  const indices = Array.from(Array(numExamples).keys());
  tf.util.shuffle(indices);
  
  // Split indices for train and test
  const trainIndices = indices.slice(0, numTrainExamples);
  const testIndices = indices.slice(numTrainExamples);
  
  // Gather examples by indices
  return {
    trainX: tf.gather(features, trainIndices) as tf.Tensor2D,
    trainY: tf.gather(outputs, trainIndices) as tf.Tensor2D,
    testX: tf.gather(features, testIndices) as tf.Tensor2D,
    testY: tf.gather(outputs, testIndices) as tf.Tensor2D
  };
};

/**
 * Recommend optimal architecture based on the dataset
 */
export const predictOptimalArchitecture = (datasetInfo: DatasetInfo): ModelParameters => {
  const numFeatures = datasetInfo.features.length;
  const numExamples = datasetInfo.numericFeatures.length;
  const isClassification = datasetInfo.isClassification ?? false;
  
  // Heuristics for layer size
  const hiddenLayerCount = Math.min(3, Math.max(1, Math.floor(Math.log2(numFeatures))));
  
  // First layer usually larger than the input, subsequent layers decrease in size
  const neuronsPerLayer = [];
  const firstLayerSize = Math.min(128, Math.max(numFeatures * 2, 10));
  neuronsPerLayer.push(firstLayerSize);
  
  for (let i = 1; i < hiddenLayerCount; i++) {
    neuronsPerLayer.push(Math.max(10, Math.floor(neuronsPerLayer[i - 1] / 1.5)));
  }
  
  // Add output layer size
  neuronsPerLayer.push(isClassification ? 
    (datasetInfo.outputLabels && datasetInfo.outputLabels.length > 2 ? datasetInfo.outputLabels.length : 1) : 
    1);
  
  // Calculate total layers (input + hidden + output)
  const layers = hiddenLayerCount + 2;
  
  // Training parameters
  const batchSize = Math.min(32, Math.max(8, Math.floor(numExamples / 10)));
  const epochs = Math.min(200, Math.max(50, Math.floor(10000 / numExamples)));
  
  return {
    layers,
    hiddenLayers: hiddenLayerCount,
    neuronsPerLayer,
    activationFunction: 'relu' as ActivationType,
    outputActivation: isClassification ? 'sigmoid' as ActivationType : 'linear' as ActivationType,
    learningRate: 0.001,
    epochs,
    batchSize,
    optimizer: 'adam' as OptimizerType,
    taskType: isClassification ? 'classification' : 'regression'
  };
}; 