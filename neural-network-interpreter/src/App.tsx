import React, { useState } from 'react';
import styled from 'styled-components';
import { TaskType, ModelParameters, NeuralNetworkState } from './types';
import DataUploadPanel from './components/ui/DataUploadPanel';
import TaskSelection from './components/ui/TaskSelection';
import ModelConfiguration from './components/ui/ModelConfiguration';
import NeuralNetworkVisualization from './components/visualization/NeuralNetworkVisualization';
import { colors, typography, shadows, borderRadius } from './components/ui/theme';

// Import Urbanist font 
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    color: ${colors.eerieBlack};
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
  color: ${colors.eerieBlack};
  margin-bottom: 12px;
  font-size: ${typography.fontSizes.title};
  font-weight: ${typography.fontWeights.bold};
`;

const Subtitle = styled.p`
  color: ${colors.mediumGray};
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
  background-color: ${colors.ghostWhite};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  box-shadow: ${shadows.md};
  height: 500px;
  position: sticky;
  top: 24px;
`;

const VisualizationHeader = styled.div`
  background-color: ${colors.eerieBlack};
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
  background-color: ${props => props.active ? colors.vanilla : colors.lightGray};
  color: ${props => props.active ? colors.eerieBlack : colors.mediumGray};
  padding: 4px 12px;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSizes.small};
  font-weight: ${typography.fontWeights.medium};
`;

const App: React.FC = () => {
  const initialModelParameters: ModelParameters = {
    layers: 3,
    neuronsPerLayer: [5, 4, 3],
    activationFunction: 'relu',
    learningRate: 0.01,
    batchSize: 32,
    epochs: 10
  };

  const [networkState, setNetworkState] = useState<NeuralNetworkState>({
    taskType: null,
    modelParameters: initialModelParameters,
    dataUploaded: false,
    isTraining: false,
    isModelBuilt: false
  });

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    setNetworkState({
      ...networkState,
      dataUploaded: true
    });
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
    // In a real app, this would trigger model building in the backend
    console.log('Building model with parameters:', networkState.modelParameters);
    setNetworkState({
      ...networkState,
      isModelBuilt: true
    });
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
              <ModelConfiguration 
                initialParameters={networkState.modelParameters}
                onParametersChange={handleParametersChange}
                onBuildModel={handleBuildModel}
              />
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
      </AppContainer>
    </GlobalStyle>
  );
};

export default App;
