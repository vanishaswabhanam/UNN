export type TaskType = 'classification' | 'regression';
export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
export type OptimizerType = 'adam' | 'sgd' | 'rmsprop' | 'adagrad';

export interface ModelParameters {
  // Layer configuration
  layers?: number; // Total number of layers (input + hidden + output)
  hiddenLayers: number; // Number of hidden layers
  neuronsPerLayer: number[];
  activationFunction: ActivationType;
  outputActivation: ActivationType;
  
  // Training parameters
  learningRate: number;
  epochs: number;
  batchSize: number;
  optimizer: OptimizerType;
  
  // Task specific parameters
  taskType?: TaskType;
}

export interface ModelMetrics {
  accuracy?: number;
  loss: number;
  precision?: number;
  recall?: number;
}

export interface ModelPrediction {
  value: number | number[];
  confidence?: number;
  label?: string;
}

export interface NeuralNetworkState {
  taskType: TaskType | null;
  modelParameters: ModelParameters;
  dataUploaded: boolean;
  isTraining: boolean;
  isModelBuilt: boolean;
} 