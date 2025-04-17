import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ModelParameters } from '../../types/index';
import { colors, typography, shadows, borderRadius } from './theme';

const Container = styled.div`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${shadows.md};
`;

const Title = styled.h3`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.heading};
  font-weight: ${typography.fontWeights.bold};
  color: ${colors.darkBlue};
  margin-top: 0;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.body};
  color: ${colors.textMedium};
  margin-bottom: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textDark};
  font-family: ${typography.fontFamily};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const OptionButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.selected ? colors.mediumBlue : colors.lightBlue};
  color: ${props => props.selected ? 'white' : colors.textDark};
  border: none;
  border-radius: ${borderRadius.full};
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.small};
  font-weight: ${props => props.selected ? typography.fontWeights.bold : typography.fontWeights.medium};
  
  &:hover {
    background-color: ${props => props.selected ? colors.mediumBlue : colors.lightGray};
  }
`;

const BuildButton = styled.button`
  background-color: ${colors.mediumBlue};
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
  margin-top: 32px;
  
  &:hover {
    background-color: ${colors.darkBlue};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const activationOptions = [
  { value: 'relu', label: 'ReLU' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'tanh', label: 'Tanh' }
];

const batchSizeOptions = [
  { value: 16, label: '16' },
  { value: 32, label: '32' },
  { value: 64, label: '64' },
  { value: 128, label: '128' }
];

const layerOptions = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' }
];

interface ModelConfigurationProps {
  initialParameters: ModelParameters;
  onParametersChange: (parameters: ModelParameters) => void;
  onBuildModel: () => void;
}

const ModelConfiguration: React.FC<ModelConfigurationProps> = ({
  initialParameters,
  onParametersChange,
  onBuildModel
}) => {
  const [parameters, setParameters] = useState<ModelParameters>(initialParameters);
  
  useEffect(() => {
    onParametersChange(parameters);
  }, [parameters, onParametersChange]);
  
  const handleLayerCountChange = (layerCount: number) => {
    if (layerCount >= 2 && layerCount <= 5) {
      // Adjust neurons per layer array when number of layers changes
      let newNeuronsPerLayer = [...parameters.neuronsPerLayer];
      
      // Get current layers or default to 3 if undefined
      const currentLayers = parameters.layers ?? 3;
      
      if (layerCount > currentLayers) {
        // Add new layers with default 4 neurons
        const additionalLayers = layerCount - currentLayers;
        newNeuronsPerLayer = [
          ...newNeuronsPerLayer,
          ...new Array(additionalLayers).fill(4)
        ];
      } else if (layerCount < currentLayers) {
        // Remove excess layers
        newNeuronsPerLayer = newNeuronsPerLayer.slice(0, layerCount);
      }
      
      setParameters({
        ...parameters,
        layers: layerCount,
        neuronsPerLayer: newNeuronsPerLayer
      });
    }
  };
  
  const handleOptionChange = (field: keyof ModelParameters, value: any) => {
    setParameters({
      ...parameters,
      [field]: value
    });
  };
  
  return (
    <Container>
      <Title>Configure Neural Network</Title>
      <Description>Customize your model architecture and training parameters</Description>
      
      <FormGrid>
        <FormGroup>
          <Label>Number of Layers</Label>
          <OptionGroup>
            {layerOptions.map(option => (
              <OptionButton
                key={option.value}
                selected={(parameters.layers ?? 3) === option.value}
                onClick={() => handleLayerCountChange(option.value)}
              >
                {option.label} Layers
              </OptionButton>
            ))}
          </OptionGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Activation Function</Label>
          <OptionGroup>
            {activationOptions.map(option => (
              <OptionButton
                key={option.value}
                selected={parameters.activationFunction === option.value}
                onClick={() => handleOptionChange('activationFunction', option.value)}
              >
                {option.label}
              </OptionButton>
            ))}
          </OptionGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Batch Size</Label>
          <OptionGroup>
            {batchSizeOptions.map(option => (
              <OptionButton
                key={option.value}
                selected={parameters.batchSize === option.value}
                onClick={() => handleOptionChange('batchSize', option.value)}
              >
                {option.label}
              </OptionButton>
            ))}
          </OptionGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Learning Rate</Label>
          <OptionGroup>
            <OptionButton
              selected={parameters.learningRate === 0.001}
              onClick={() => handleOptionChange('learningRate', 0.001)}
            >
              0.001
            </OptionButton>
            <OptionButton
              selected={parameters.learningRate === 0.01}
              onClick={() => handleOptionChange('learningRate', 0.01)}
            >
              0.01
            </OptionButton>
            <OptionButton
              selected={parameters.learningRate === 0.1}
              onClick={() => handleOptionChange('learningRate', 0.1)}
            >
              0.1
            </OptionButton>
          </OptionGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Epochs</Label>
          <OptionGroup>
            <OptionButton
              selected={parameters.epochs === 10}
              onClick={() => handleOptionChange('epochs', 10)}
            >
              10
            </OptionButton>
            <OptionButton
              selected={parameters.epochs === 20}
              onClick={() => handleOptionChange('epochs', 20)}
            >
              20
            </OptionButton>
            <OptionButton
              selected={parameters.epochs === 50}
              onClick={() => handleOptionChange('epochs', 50)}
            >
              50
            </OptionButton>
            <OptionButton
              selected={parameters.epochs === 100}
              onClick={() => handleOptionChange('epochs', 100)}
            >
              100
            </OptionButton>
          </OptionGroup>
        </FormGroup>
      </FormGrid>
      
      <BuildButton onClick={onBuildModel}>
        Build Neural Network
      </BuildButton>
    </Container>
  );
};

export default ModelConfiguration; 