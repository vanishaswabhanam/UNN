import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { TaskType, ModelParameters, NeuralNetworkState } from './types';
import DataUploadPanel from './components/ui/DataUploadPanel';
import TaskSelection from './components/ui/TaskSelection';
import ModelConfiguration from './components/ui/ModelConfiguration';
import NeuralNetworkVisualization from './components/visualization/NeuralNetworkVisualization';
import { colors, typography, shadows, borderRadius } from './components/ui/theme';
import { createModel, trainModel, predict } from './services/modelService';
import { processData } from './utils/dataProcessing';
import { parseCSV } from './utils/dataProcessing';
import * as tf from '@tensorflow/tfjs';

// Import Urbanist font 
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    background-color: ${colors.lightBlue};
    color: ${colors.textDark};
  }
`;

const GlobalStyle = styled.div`
  ${fontImport}
  font-family: ${typography.fontFamily};
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: ${colors.darkBlue};
  margin-bottom: 12px;
  font-size: ${typography.fontSizes.title};
  font-weight: ${typography.fontWeights.bold};
`;

const Subtitle = styled.p`
  color: ${colors.textMedium};
  font-size: ${typography.fontSizes.subheading};
  margin-bottom: 24px;
  line-height: 1.4;
`;

const Flex = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
`;

const RightPanel = styled.div`
  flex: 1;
`;

const VisualizationContainer = styled.div`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  box-shadow: ${shadows.md};
  height: 500px;
  position: sticky;
  top: 24px;
`;

const VisualizationHeader = styled.div`
  background-color: ${colors.mediumBlue};
  padding: 16px 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VisualizationTitle = styled.h3`
  margin: 0;
  font-weight: ${typography.fontWeights.medium};
  font-size: ${typography.fontSizes.body};
`;

const StatusBadge = styled.div<{ active: boolean }>`
  background-color: ${props => props.active ? colors.mediumBlue : colors.lightBlue};
  color: ${props => props.active ? 'white' : colors.textDark};
  padding: 6px 12px;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSizes.small};
  font-weight: ${props => props.active ? typography.fontWeights.bold : typography.fontWeights.medium};
`;

const Footer = styled.footer`
  border-top: 1px solid ${colors.lightGray};
  margin-top: 24px;
  padding-top: 24px;
  text-align: center;
  color: ${colors.textMedium};
  font-size: ${typography.fontSizes.small};
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
`;

const FooterLink = styled.a`
  color: ${colors.mediumBlue};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const SocialLink = styled.a`
  color: ${colors.mediumBlue};
  text-decoration: none;
  font-size: 20px;
`;

const TrainButton = styled.button`
  background-color: ${colors.highlight};
  color: white;
  border: none;
  border-radius: ${borderRadius.full};
  padding: 14px 24px;
  cursor: pointer;
  font-weight: ${typography.fontWeights.bold};
  font-size: ${typography.fontSizes.body};
  transition: all 0.2s;
  font-family: ${typography.fontFamily};
  display: block;
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
  
  &:hover {
    background-color: #1a8b7b;
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const TrainingStatus = styled.div`
  background-color: ${colors.lightBlue};
  color: ${colors.textDark};
  padding: 16px;
  border-radius: ${borderRadius.md};
  margin-top: 16px;
  margin-bottom: 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.small};
  text-align: center;
`;

// Add new styled components for evaluation metrics
const MetricsContainer = styled.div`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg};
  padding: 24px;
  margin-top: 24px;
  box-shadow: ${shadows.md};
`;

const MetricsTitle = styled.h3`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.heading};
  font-weight: ${typography.fontWeights.bold};
  color: ${colors.darkBlue};
  margin-top: 0;
  margin-bottom: 16px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background-color: ${colors.lightBlue};
  padding: 16px;
  border-radius: ${borderRadius.md};
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: ${typography.fontSizes.small};
  color: ${colors.textMedium};
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: ${typography.fontSizes.heading};
  font-weight: ${typography.fontWeights.bold};
  color: ${colors.darkBlue};
`;

const ConfusionMatrix = styled.div`
  margin-top: 24px;
`;

const MatrixTitle = styled.h4`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.body};
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textDark};
  margin-bottom: 16px;
`;

const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const MatrixHeader = styled.th`
  background-color: ${colors.mediumBlue};
  color: white;
  padding: 8px;
  text-align: center;
  font-weight: ${typography.fontWeights.medium};
`;

const MatrixCell = styled.td<{ highlight?: boolean }>`
  padding: 8px;
  text-align: center;
  background-color: ${props => props.highlight ? colors.highlight + '40' : 'transparent'};
  border: 1px solid ${colors.lightGray};
`;

const App: React.FC = () => {
  const initialModelParameters: ModelParameters = {
    layers: 3,
    hiddenLayers: 1,
    neuronsPerLayer: [5, 4, 3],
    activationFunction: 'relu',
    outputActivation: 'linear',
    learningRate: 0.01,
    batchSize: 32,
    epochs: 10,
    optimizer: 'adam'
  };

  const [networkState, setNetworkState] = useState<NeuralNetworkState>({
    taskType: null,
    modelParameters: initialModelParameters,
    dataUploaded: false,
    isTraining: false,
    isModelBuilt: false
  });

  const [trainingData, setTrainingData] = useState<any>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [trainingProgress, setTrainingProgress] = useState({ epoch: 0, loss: 0, accuracy: 0 });

  const [evaluationMetrics, setEvaluationMetrics] = useState<{
    accuracy?: number;
    loss: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    confusionMatrix?: number[][];
    classLabels?: string[];
  } | null>(null);

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name);
    
    try {
      // Read file content
      const text = await file.text();
      console.log("CSV content (first 100 chars):", text.substring(0, 100));
      
      // Parse as CSV first
      const csvData = await parseCSV(text);
      console.log("CSV parsed successfully, found", csvData.length, "rows");
      
      if (csvData.length === 0) {
        throw new Error('CSV file has no data rows');
      }
      
      // Log the first row to see the structure
      console.log("First data row:", csvData[0]);
      
      // For simplicity, assume last column is target
      const columns = Object.keys(csvData[0]);
      console.log("Detected columns:", columns);
      
      if (columns.length < 2) {
        throw new Error(`CSV has only ${columns.length} column(s). Need at least 2 columns (features and target).`);
      }
      
      const targetColumn = columns[columns.length - 1];
      console.log("Using target column:", targetColumn);
      
      // Process data using our utility function
      const processedData = await processData(csvData, targetColumn);
      console.log("Data processed successfully, features shape:", 
        processedData.tensors.trainX.shape, 
        "outputs shape:", processedData.tensors.trainY.shape);
      
      // Store the processed data for training
      setTrainingData(processedData);
      
      setNetworkState({
        ...networkState,
        dataUploaded: true
      });
      
      alert(`Data processed successfully! 
      - ${csvData.length} samples loaded
      - ${columns.length - 1} features detected
      - Target: ${targetColumn}
      
      Please select Classification or Regression task.`);
      
    } catch (error) {
      console.error('Error processing data:', error);
      alert(`Error processing the data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the file format:
      - Should be a valid CSV file with comma separators
      - Need a header row with column names
      - Need at least one feature column and one target column`);
    }
  };

  const handleTaskSelect = (taskType: TaskType) => {
    setNetworkState({
      ...networkState,
      taskType
    });
  };

  const handleParametersChange = (parameters: ModelParameters) => {
    setNetworkState({
      ...networkState,
      modelParameters: parameters
    });
  };

  const handleBuildModel = () => {
    console.log('Building model with parameters:', networkState.modelParameters);
    
    try {
      // Default inputs/outputs if no data is uploaded
      let inputShape = [5];
      let outputUnits = 1;
      
      // If we have training data, use its dimensions
      if (trainingData) {
        inputShape = [trainingData.tensors.trainX.shape[1]];
        outputUnits = networkState.taskType === 'classification' ? 
          trainingData.labelClasses?.length || 1 : 1;
      }
      
      const isClassification = networkState.taskType === 'classification';
      
      // Build the model using TensorFlow.js
      const newModel = createModel(
        networkState.modelParameters,
        inputShape,
        outputUnits,
        isClassification
      );
      
      console.log('Model built successfully:');
      newModel.summary();
      
      // Save the model for training
      setModel(newModel);
      
      // Update state to show model is built
      setNetworkState(prevState => {
        console.log("Setting isModelBuilt to true");
        return {
          ...prevState,
          isModelBuilt: true
        };
      });
      
      // Force a re-render by setting a timeout
      setTimeout(() => {
        console.log("Current networkState after build:", networkState);
      }, 100);
      
      // Display a visual confirmation
      alert('Neural network built successfully! Check the console for details and click "Train Neural Network" button that appears below.');
    } catch (error) {
      console.error('Error building model:', error);
      alert('Error building the model. Check console for details.');
    }
  };
  
  const handleTrainModel = async () => {
    if (!model || !trainingData) {
      alert('Please build a model and upload data first.');
      return;
    }
    
    try {
      setNetworkState({
        ...networkState,
        isTraining: true
      });
      
      // Training callbacks to update UI
      const callbacks = {
        onBatchEnd: (batch: number, logs: any) => {
          console.log(`Batch ${batch}: loss = ${logs.loss}`);
        },
        onEpochEnd: (epoch: number, logs: any) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc || 'N/A'}`);
          setTrainingProgress({
            epoch,
            loss: logs.loss,
            accuracy: logs.acc || 0
          });
        }
      };
      
      // Train the model
      const result = await trainModel(
        model,
        trainingData,
        networkState.modelParameters,
        callbacks
      );
      
      console.log('Training complete:', result);
      
      // For classification tasks, compute confusion matrix and additional metrics
      if (networkState.taskType === 'classification' && trainingData.labelClasses) {
        // Get test data
        const { xs: testData, ys: testLabels } = trainingData;
        
        // Make predictions on test data
        const predictions = model.predict(testData) as tf.Tensor;
        const predictionValues = await predictions.argMax(1).array() as number[];
        const actualValues = await testLabels.argMax(1).array() as number[];
        
        // Compute confusion matrix
        const classCount = trainingData.labelClasses.length;
        const confusionMatrix = Array(classCount).fill(0).map(() => Array(classCount).fill(0));
        
        // Fill confusion matrix
        for (let i = 0; i < predictionValues.length; i++) {
          const actual = actualValues[i];
          const predicted = predictionValues[i];
          confusionMatrix[actual][predicted]++;
        }
        
        // Calculate precision and recall for each class
        const precisions = [];
        const recalls = [];
        
        for (let i = 0; i < classCount; i++) {
          const truePositives = confusionMatrix[i][i];
          const falsePositives = confusionMatrix.reduce((sum, row, idx) => idx !== i ? sum + row[i] : sum, 0);
          const falseNegatives = confusionMatrix[i].reduce((sum, val, idx) => idx !== i ? sum + val : sum, 0);
          
          const precision = truePositives / (truePositives + falsePositives) || 0;
          const recall = truePositives / (truePositives + falseNegatives) || 0;
          
          precisions.push(precision);
          recalls.push(recall);
        }
        
        // Calculate average precision, recall, and F1 score
        const avgPrecision = precisions.reduce((a, b) => a + b, 0) / classCount;
        const avgRecall = recalls.reduce((a, b) => a + b, 0) / classCount;
        const f1Score = 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall) || 0;
        
        setEvaluationMetrics({
          accuracy: result.evaluationResult.accuracy,
          loss: result.evaluationResult.loss,
          precision: avgPrecision,
          recall: avgRecall,
          f1Score,
          confusionMatrix,
          classLabels: trainingData.labelClasses
        });
      } else {
        // For regression, just set accuracy and loss
        setEvaluationMetrics({
          loss: result.evaluationResult.loss,
          accuracy: result.evaluationResult.accuracy
        });
      }
      
      setNetworkState({
        ...networkState,
        isTraining: false
      });
      
      alert(`Training complete! Final loss: ${result.evaluationResult.loss.toFixed(4)}${
        result.evaluationResult.accuracy ? `, Accuracy: ${result.evaluationResult.accuracy.toFixed(4)}` : ''
      }`);
      
    } catch (error) {
      console.error('Error training model:', error);
      setNetworkState({
        ...networkState,
        isTraining: false
      });
      alert('Error training the model. Check console for details.');
    }
  };

  return (
    <GlobalStyle>
      <AppContainer>
        <Header>
          <Title>Neural Architecture Interpreter</Title>
          <Subtitle>
            Visualize and build optimized neural networks with just a few clicks
          </Subtitle>
        </Header>

        <Flex>
          <LeftPanel>
            <DataUploadPanel onFileUpload={handleFileUpload} />
            
            {networkState.dataUploaded && (
              <TaskSelection 
                selectedTask={networkState.taskType} 
                onTaskSelect={handleTaskSelect} 
              />
            )}
            
            {networkState.taskType && (
              <>
                <ModelConfiguration 
                  initialParameters={networkState.modelParameters}
                  onParametersChange={handleParametersChange}
                  onBuildModel={handleBuildModel}
                />
                
                {networkState.isModelBuilt && !networkState.isTraining && (
                  <TrainButton onClick={handleTrainModel}>
                    Train Neural Network
                  </TrainButton>
                )}
                
                {/* Backup train button that will appear if model exists regardless of state */}
                {model && !networkState.isModelBuilt && !networkState.isTraining && (
                  <TrainButton 
                    onClick={() => {
                      console.log("Using backup train button");
                      handleTrainModel();
                    }}
                    style={{backgroundColor: '#ff9800'}}
                  >
                    Train Neural Network (Backup Button)
                  </TrainButton>
                )}
                
                {networkState.isTraining && (
                  <TrainingStatus>
                    Training in progress... Epoch: {trainingProgress.epoch + 1}/{networkState.modelParameters.epochs}, 
                    Loss: {trainingProgress.loss.toFixed(4)}, 
                    {networkState.taskType === 'classification' && ` Accuracy: ${trainingProgress.accuracy.toFixed(4)}`}
                  </TrainingStatus>
                )}
              </>
            )}
            
            {evaluationMetrics && (
              <MetricsContainer>
                <MetricsTitle>Model Evaluation Metrics</MetricsTitle>
                <MetricsGrid>
                  <MetricCard>
                    <MetricLabel>Loss</MetricLabel>
                    <MetricValue>{evaluationMetrics.loss.toFixed(4)}</MetricValue>
                  </MetricCard>
                  
                  {evaluationMetrics.accuracy !== undefined && (
                    <MetricCard>
                      <MetricLabel>Accuracy</MetricLabel>
                      <MetricValue>{(evaluationMetrics.accuracy * 100).toFixed(2)}%</MetricValue>
                    </MetricCard>
                  )}
                  
                  {evaluationMetrics.precision !== undefined && (
                    <MetricCard>
                      <MetricLabel>Precision</MetricLabel>
                      <MetricValue>{(evaluationMetrics.precision * 100).toFixed(2)}%</MetricValue>
                    </MetricCard>
                  )}
                  
                  {evaluationMetrics.recall !== undefined && (
                    <MetricCard>
                      <MetricLabel>Recall</MetricLabel>
                      <MetricValue>{(evaluationMetrics.recall * 100).toFixed(2)}%</MetricValue>
                    </MetricCard>
                  )}
                  
                  {evaluationMetrics.f1Score !== undefined && (
                    <MetricCard>
                      <MetricLabel>F1 Score</MetricLabel>
                      <MetricValue>{(evaluationMetrics.f1Score * 100).toFixed(2)}%</MetricValue>
                    </MetricCard>
                  )}
                </MetricsGrid>
                
                {evaluationMetrics.confusionMatrix && evaluationMetrics.classLabels && (
                  <ConfusionMatrix>
                    <MatrixTitle>Confusion Matrix</MatrixTitle>
                    <MatrixTable>
                      <thead>
                        <tr>
                          <MatrixHeader>Actual ↓ Predicted →</MatrixHeader>
                          {evaluationMetrics.classLabels.map((label, i) => (
                            <MatrixHeader key={i}>{label}</MatrixHeader>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationMetrics.confusionMatrix.map((row, i) => (
                          <tr key={i}>
                            <MatrixHeader>{evaluationMetrics.classLabels![i]}</MatrixHeader>
                            {row.map((cell, j) => (
                              <MatrixCell key={j} highlight={i === j}>
                                {cell}
                              </MatrixCell>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </MatrixTable>
                  </ConfusionMatrix>
                )}
              </MetricsContainer>
            )}
          </LeftPanel>

          <RightPanel>
            <VisualizationContainer>
              <VisualizationHeader>
                <VisualizationTitle>Neural Network Visualization</VisualizationTitle>
                <StatusBadge active={networkState.isModelBuilt}>
                  {networkState.isModelBuilt ? 'Model Built' : 'Design Mode'}
                </StatusBadge>
              </VisualizationHeader>
              <NeuralNetworkVisualization 
                modelParameters={networkState.modelParameters} 
              />
            </VisualizationContainer>
          </RightPanel>
        </Flex>

        <Footer>
          <FooterLinks>
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Documentation</FooterLink>
            <FooterLink href="#">GitHub</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterLinks>
          <div>© 2023 Neural Architecture Interpreter. Created for Hackathon.</div>
          <SocialLinks>
            <SocialLink href="#" aria-label="GitHub">
              <span role="img" aria-label="GitHub">⚙️</span>
            </SocialLink>
            <SocialLink href="#" aria-label="Twitter">
              <span role="img" aria-label="Twitter">🐦</span>
            </SocialLink>
            <SocialLink href="#" aria-label="LinkedIn">
              <span role="img" aria-label="LinkedIn">💼</span>
            </SocialLink>
          </SocialLinks>
        </Footer>
      </AppContainer>
    </GlobalStyle>
  );
};

export default App;
