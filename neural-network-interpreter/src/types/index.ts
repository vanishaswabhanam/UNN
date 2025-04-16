export type TaskType = 'classification' | 'regression';

export interface ModelParameters {
  layers: number;
  neuronsPerLayer: number[];
  activationFunction: string;
  learningRate: number;
  batchSize: number;
  epochs: number;
}

export interface NeuralNetworkState {
  taskType: TaskType | null;
  modelParameters: ModelParameters;
  dataUploaded: boolean;
  isTraining: boolean;
  isModelBuilt: boolean;
} 