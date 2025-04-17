import { ModelParameters } from '../types';
import { parseCSV, processData, predictOptimalArchitecture, DatasetInfo } from '../utils/dataProcessing';
import { createModel, trainModel, ModelTrainingResult, TrainingStatus, TrainingResult } from './modelService';
import * as tf from '@tensorflow/tfjs';

export interface ModelBuildResult {
  success: boolean;
  message: string;
  trainingResult?: TrainingResult;
  architecture?: any;
}

// Initialize TensorFlow.js
const initializeTensorFlow = async () => {
  // Use WebGL backend for performance if available
  await tf.setBackend('webgl');
  console.log('TensorFlow.js initialized with backend:', tf.getBackend());
};

// Controller for model operations
class ModelController {
  private data: any[] = [];
  private columns: string[] = [];
  private processedData: any = null;
  private model: tf.LayersModel | null = null;
  private trainingResult: TrainingResult | null = null;
  private datasetInfo: DatasetInfo | null = null;
  private trainingStatus: TrainingStatus = {
    isTraining: false,
    currentEpoch: 0,
    totalEpochs: 0,
    currentAccuracy: 0,
    currentLoss: 0
  };

  constructor() {
    // Initialize TF.js
    initializeTensorFlow();
  }

  // Process uploaded CSV file
  async processFile(file: File): Promise<{ success: boolean; message: string; dataInfo?: DatasetInfo }> {
    try {
      const fileContent = await file.text();
      // Parse CSV file
      const data = await parseCSV(fileContent);
      
      if (data.length === 0) {
        return {
          success: false,
          message: 'The uploaded CSV file is empty or invalid.'
        };
      }
      
      this.data = data;
      this.columns = Object.keys(data[0]);
      
      // Process data with first column as target (can be changed by user later)
      const targetColumn = this.columns[0];
      const processedData = await processData(data, targetColumn);
      this.processedData = processedData;
      this.datasetInfo = processedData;
      
      return {
        success: true,
        message: `Successfully processed ${data.length} records with ${this.columns.length} columns.`,
        dataInfo: processedData
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        success: false,
        message: `Error processing file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Get recommended model parameters based on data
  getRecommendedParameters(): ModelParameters | null {
    if (!this.datasetInfo) {
      return null;
    }
    
    // Get the parameters from the utility function and ensure it's appropriate for ModelParameters
    const params = predictOptimalArchitecture(this.datasetInfo);
    
    // Return the compatible parameters
    return params;
  }

  // Build and train a model
  async buildModel(parameters: ModelParameters, statusCallback?: (status: TrainingStatus) => void): Promise<ModelBuildResult> {
    if (!this.datasetInfo) {
      return {
        success: false,
        message: 'No data has been processed. Please upload a CSV file first.'
      };
    }

    try {
      // Determine task type and output shape
      const isClassification = this.datasetInfo.isClassification || false;
      const outputUnits = isClassification 
        ? (this.datasetInfo.outputLabels?.length || 1)
        : 1;
      
      // Get input shape from datasetInfo
      const inputShape = [this.datasetInfo.features.length];
      
      // Create model
      this.model = createModel(
        parameters,
        inputShape,
        outputUnits,
        isClassification
      );
      
      // Reset training status
      this.trainingStatus = {
        isTraining: true,
        currentEpoch: 0,
        totalEpochs: parameters.epochs,
        currentAccuracy: 0,
        currentLoss: 0
      };
      
      if (statusCallback) {
        statusCallback(this.trainingStatus);
      }
      
      // Prepare training tensors
      const trainingData = {
        xs: this.datasetInfo.tensors.trainX,
        ys: this.datasetInfo.tensors.trainY,
        xsTest: this.datasetInfo.tensors.testX,
        ysTest: this.datasetInfo.tensors.testY
      };
      
      // Train model
      this.trainingResult = await trainModel(
        this.model,
        trainingData,
        parameters,
        {
          onEpochEnd: (epoch: number, logs: { loss: number; acc?: number }) => {
            this.trainingStatus.currentEpoch = epoch + 1;
            this.trainingStatus.currentLoss = logs.loss;
            
            if (logs.acc !== undefined) {
              this.trainingStatus.currentAccuracy = logs.acc;
            }
            
            if (statusCallback) {
              statusCallback({ ...this.trainingStatus });
            }
          },
          onTrainEnd: () => {
            this.trainingStatus.isTraining = false;
            
            if (statusCallback) {
              statusCallback({ ...this.trainingStatus });
            }
          }
        }
      );
      
      // Get architecture info for visualization
      const architecture = this.model.layers.map(layer => {
        const config = layer.getConfig();
        return {
          name: layer.name,
          units: config.units || 0,
          activation: config.activation || 'linear'
        };
      });
      
      // Safely build the result message
      const evaluationResult = this.trainingResult?.evaluationResult || { accuracy: 0, loss: 0 };
      const resultMessage = isClassification 
        ? `accuracy: ${(evaluationResult.accuracy || 0) * 100}%` 
        : `loss: ${evaluationResult.loss}`;
      
      return {
        success: true,
        message: `Model trained successfully with ${resultMessage}`,
        trainingResult: this.trainingResult,
        architecture
      };
    } catch (error) {
      console.error('Error building model:', error);
      
      this.trainingStatus.isTraining = false;
      if (statusCallback) {
        statusCallback({ ...this.trainingStatus });
      }
      
      return {
        success: false,
        message: `Error building model: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  // Get current model state
  getModelState() {
    return {
      dataInfo: this.datasetInfo,
      hasData: this.data.length > 0,
      isTraining: this.trainingStatus.isTraining,
      hasModel: this.model !== null,
      trainingStatus: this.trainingStatus,
      trainingResult: this.trainingResult
    };
  }
}

// Export singleton instance
export const modelController = new ModelController(); 