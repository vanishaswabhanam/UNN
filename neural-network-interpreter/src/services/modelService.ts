import * as tf from '@tensorflow/tfjs';
import { ModelParameters } from '../types';
import { DatasetInfo } from '../utils/dataProcessing';

export interface TrainingCallback {
  onBatchEnd?: (batch: number, logs: tf.Logs) => void;
  onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
  onTrainBegin?: () => void;
  onTrainEnd?: (logs: tf.Logs) => void;
}

export interface ModelTrainingResult {
  model: tf.LayersModel;
  history: tf.History;
  evaluationResult: {
    accuracy?: number;
    loss: number;
  };
  duration: number;
}

export interface TrainingResult {
  model: tf.LayersModel;
  trainingHistory: tf.History;
  evaluationResult: {
    loss: number;
    accuracy: number;
  };
}

export interface TrainingStatus {
  isTraining: boolean;
  currentEpoch: number;
  totalEpochs: number;
  currentAccuracy: number;
  currentLoss: number;
}

export interface ModelState {
  model: tf.LayersModel | null;
  trainingResult: ModelTrainingResult | null;
  trainingStatus: TrainingStatus;
}

export const createModel = (
  parameters: ModelParameters,
  inputShape: number[],
  outputUnits: number,
  isClassification: boolean
): tf.LayersModel => {
  const { neuronsPerLayer, activationFunction } = parameters;
  // Calculate total layers if not specified: input + hidden + output
  const totalLayers = parameters.layers ?? (parameters.hiddenLayers + 2);
  
  console.log(`Creating model with: 
    - Input shape: [${inputShape}]
    - Output units: ${outputUnits}
    - Is classification: ${isClassification}
    - Total layers: ${totalLayers}
    - Neurons per layer: ${neuronsPerLayer}
  `);
  
  // Create a sequential model
  const model = tf.sequential();
  
  // Add input layer
  model.add(tf.layers.dense({
    units: neuronsPerLayer[0],
    activation: activationFunction as any,
    inputShape: [inputShape[0]],
  }));
  
  // Add hidden layers
  for (let i = 1; i < totalLayers - 1; i++) {
    model.add(tf.layers.dense({
      units: neuronsPerLayer[i],
      activation: activationFunction as any,
    }));
  }
  
  // Add output layer with appropriate activation function
  let outputActivation: string;
  let loss: string;
  
  if (isClassification) {
    if (outputUnits > 1) {
      // Multi-class classification
      outputActivation = 'softmax';
      loss = 'categoricalCrossentropy';
    } else {
      // Binary classification
      outputActivation = 'sigmoid';
      loss = 'binaryCrossentropy';
    }
  } else {
    // Regression
    outputActivation = 'linear';
    loss = 'meanSquaredError';
  }
  
  console.log(`Using output activation: ${outputActivation}, loss: ${loss}`);
  
  model.add(tf.layers.dense({
    units: outputUnits,
    activation: outputActivation as any,
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(parameters.learningRate),
    loss: loss,
    metrics: isClassification ? ['accuracy'] : [],
  });
  
  return model;
};

// Define a training data interface for this specific method
interface TrainingData {
  xs: tf.Tensor2D;
  ys: tf.Tensor2D;
  xsTest?: tf.Tensor2D;
  ysTest?: tf.Tensor2D;
}

export const trainModel = async (
  model: tf.LayersModel,
  trainingData: TrainingData,
  parameters: ModelParameters,
  callbacks?: any
): Promise<TrainingResult> => {
  try {
    console.log("Starting training process...");
    console.log("Model structure:", model.summary());
    console.log("Training data shape:", trainingData?.xs?.shape);

    // Validation - ensure we have proper training data tensors
    if (!trainingData.xs || !trainingData.ys) {
      console.error("Training data missing xs or ys tensors");
      throw new Error("Training data is not properly formatted. Missing required tensors.");
    }

    // Validate tensor shapes
    if (!trainingData.xs.shape || !trainingData.ys.shape) {
      console.error("Invalid tensor shapes:", trainingData.xs.shape, trainingData.ys.shape);
      throw new Error("Invalid tensor shapes in training data");
    }
    
    // Get model input and output shapes
    const modelInputUnits = model.inputs[0].shape[1] as number;
    const modelOutputUnits = model.outputs[0].shape[1] as number;
    const dataInputUnits = trainingData.xs.shape[1];
    const dataOutputUnits = trainingData.ys.shape[1];
    
    console.log(`Model expects input: [*, ${modelInputUnits}], output: [*, ${modelOutputUnits}]`);
    console.log(`Data provides input: [${trainingData.xs.shape}], output: [${trainingData.ys.shape}]`);
    
    // Check if shapes match
    if (modelInputUnits !== dataInputUnits) {
      console.error(`Input shape mismatch: model expects ${modelInputUnits} features but data has ${dataInputUnits}`);
      throw new Error(`Input shape mismatch: model expects ${modelInputUnits} features but data has ${dataInputUnits} features`);
    }
    
    if (modelOutputUnits !== dataOutputUnits) {
      console.error(`Output shape mismatch: model expects ${modelOutputUnits} units but data has ${dataOutputUnits}`);
      
      // Attempt to reshape
      if (modelOutputUnits === 1 && dataOutputUnits > 1) {
        // We need to convert from one-hot to single value
        console.log("Attempting to reshape output data from one-hot to single value");
        const newYs = trainingData.ys.argMax(1).expandDims(1) as tf.Tensor2D;
        trainingData = {
          ...trainingData,
          ys: newYs
        };
        
        // Also reshape test data if available
        if (trainingData.ysTest) {
          const newYsTest = trainingData.ysTest.argMax(1).expandDims(1) as tf.Tensor2D;
          trainingData.ysTest = newYsTest;
        }
        console.log("Reshaped output data to:", trainingData.ys.shape);
      } else if (modelOutputUnits > 1 && dataOutputUnits === 1) {
        // We need to convert from single value to one-hot
        console.log("Attempting to reshape output data from single value to one-hot");
        
        // First get the values as numbers and determine number of classes
        const yValues = Array.from(trainingData.ys.dataSync() as Float32Array).map(v => Math.round(v));
        const numClasses = modelOutputUnits;
        
        // Create one-hot tensors
        const newYs = tf.oneHot(tf.tensor1d(yValues, 'int32'), numClasses) as tf.Tensor2D;
        trainingData = {
          ...trainingData,
          ys: newYs
        };
        
        // Also reshape test data if available
        if (trainingData.ysTest) {
          const yTestValues = Array.from(trainingData.ysTest.dataSync() as Float32Array).map(v => Math.round(v));
          const newYsTest = tf.oneHot(tf.tensor1d(yTestValues, 'int32'), numClasses) as tf.Tensor2D;
          trainingData.ysTest = newYsTest;
        }
        console.log("Reshaped output data to:", trainingData.ys.shape);
      } else {
        throw new Error(`Cannot reshape output from ${dataOutputUnits} to ${modelOutputUnits} units`);
      }
    }
    
    // Additional validation for classification loss functions
    const compilationDetails = model.getConfig().loss;
    const lossFunction = typeof compilationDetails === 'string' ? compilationDetails : 'unknown';
    
    console.log("Model loss function:", lossFunction);
    
    // Categorical crossentropy requires one-hot encoded outputs
    if (lossFunction === 'categoricalCrossentropy' && trainingData.ys.shape[1] === 1) {
      throw new Error(
        "Categorical crossentropy loss requires one-hot encoded targets. " +
        "Your target data has shape [" + trainingData.ys.shape + "] but needs to be one-hot encoded."
      );
    }
    
    // Binary crossentropy requires binary values
    if (lossFunction === 'binaryCrossentropy' && trainingData.ys.shape[1] !== 1) {
      throw new Error(
        "Binary crossentropy loss requires binary targets with shape [samples, 1]. " +
        "Your target data has shape [" + trainingData.ys.shape + "]."
      );
    }
    
    // Prepare training config
    const trainConfig: tf.ModelFitArgs = {
      epochs: parameters.epochs,
      batchSize: parameters.batchSize,
      callbacks: callbacks || {}
    };
    
    // Add validation data if available
    if (trainingData.xsTest && trainingData.ysTest) {
      trainConfig.validationData = [trainingData.xsTest, trainingData.ysTest];
    }
    
    console.log("Training with config:", trainConfig);
    
    // Train the model
    const result = await model.fit(
      trainingData.xs, 
      trainingData.ys,
      trainConfig
    );
    
    console.log("Training completed:", result);
    
    // Evaluate model on test data
    let evaluationResult = { loss: 0, accuracy: 0 };
    
    if (trainingData.xsTest && trainingData.ysTest) {
      console.log("Evaluating model on test data...");
      const evalResult = model.evaluate(trainingData.xsTest, trainingData.ysTest, {
        batchSize: parameters.batchSize
      }) as tf.Scalar[];
      
      evaluationResult = {
        loss: evalResult[0].dataSync()[0],
        accuracy: evalResult.length > 1 ? evalResult[1].dataSync()[0] : 0
      };
      
      console.log("Evaluation results:", evaluationResult);
    }
    
    return {
      model,
      trainingHistory: result,
      evaluationResult
    };
  } catch (error) {
    console.error("Error in trainModel:", error);
    throw error; // Re-throw to be handled by caller
  }
};

// Make a prediction for a single input
export const predict = async (
  model: tf.LayersModel,
  input: number[],
  normalizeInfo: { means: number[]; stds: number[] },
  labelClasses?: string[]
): Promise<any> => {
  // Normalize input using the same parameters as training data
  const normalizedInput = input.map((val, i) => {
    const mean = normalizeInfo.means[i] || 0;
    const std = normalizeInfo.stds[i] || 1;
    return (val - mean) / std;
  });
  
  // Make prediction
  const inputTensor = tf.tensor2d([normalizedInput]);
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const predictionData = await prediction.data();
  
  // Clean up tensors
  inputTensor.dispose();
  prediction.dispose();
  
  if (labelClasses) {
    // For classification, return class probabilities
    const probabilities = Array.from(predictionData);
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    
    return {
      class: labelClasses[maxIndex],
      probability: probabilities[maxIndex],
      probabilities: Object.fromEntries(
        labelClasses.map((label, i) => [label, probabilities[i]])
      ),
    };
  } else {
    // For regression, return the predicted value
    return {
      value: predictionData[0],
    };
  }
};

// Get information about the model architecture for visualization
export const getModelArchitectureInfo = (model: tf.LayersModel): any => {
  const layers = model.layers;
  
  return layers.map(layer => {
    const config = layer.getConfig();
    const outputShape = layer.outputShape;
    const weights = layer.getWeights();
    
    return {
      name: layer.name,
      type: layer.getClassName(),
      units: config.units,
      activation: config.activation,
      inputSpec: layer.inputSpec,
      outputShape,
      parameters: weights.reduce((acc, w) => acc + w.size, 0),
    };
  });
};

// Export model to JSON format
export const exportModel = async (model: tf.LayersModel): Promise<any> => {
  return await model.toJSON();
}; 