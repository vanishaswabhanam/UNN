import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ModelParameters } from '../../types';
import { colors, typography, shadows, borderRadius } from './theme';

const Container = styled.div`
  background-color: ${colors.ghostWhite};
  border-radius: ${borderRadius.lg};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${shadows.md};
`;

const Title = styled.h3`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.subheading};
  font-weight: ${typography.fontWeights.bold};
  color: ${colors.eerieBlack};
  margin-top: 0;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.body};
  color: ${colors.mediumGray};
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
  color: ${colors.eerieBlack};
  font-family: ${typography.fontFamily};
`;

const ParameterDescription = styled.div`
  font-size: ${typography.fontSizes.small};
  color: ${colors.mediumGray};
  margin-bottom: 8px;
  font-family: ${typography.fontFamily};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.lightGray};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.body};
  font-family: ${typography.fontFamily};
  
  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(75, 75, 245, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.lightGray};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.body};
  background-color: white;
  font-family: ${typography.fontFamily};
  
  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(75, 75, 245, 0.25);
  }
`;

const BuildButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.md};
  padding: 14px 24px;
  cursor: pointer;
  font-weight: ${typography.fontWeights.medium};
  font-size: ${typography.fontSizes.body};
  transition: all 0.2s;
  font-family: ${typography.fontFamily};
  display: block;
  width: 100%;
  margin-top: 32px;
  
  &:hover {
    background-color: ${colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const NetworkPreview = styled.div`
  background-color: rgba(216, 223, 239, 0.3);
  border-radius: ${borderRadius.md};
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid ${colors.aliceBlue};
`;

const LayerGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Layer = styled.div<{ isActive?: boolean }>`
  background-color: ${props => props.isActive ? colors.vanilla : 'white'};
  border: 1px solid ${props => props.isActive ? colors.primary : colors.lightGray};
  border-radius: ${borderRadius.md};
  padding: 12px;
  text-align: center;
  width: 100px;
  font-family: ${typography.fontFamily};
  box-shadow: ${shadows.sm};
`;

const Arrow = styled.div`
  color: ${colors.mediumGray};
  font-size: 20px;
`;

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
  
  const handleLayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const layerCount = parseInt(e.target.value);
    if (layerCount >= 2 && layerCount <= 5) {
      // Adjust neurons per layer array when number of layers changes
      let newNeuronsPerLayer = [...parameters.neuronsPerLayer];
      
      if (layerCount > parameters.layers) {
        // Add new layers with default 4 neurons
        const additionalLayers = layerCount - parameters.layers;
        newNeuronsPerLayer = [
          ...newNeuronsPerLayer,
          ...new Array(additionalLayers).fill(4)
        ];
      } else if (layerCount < parameters.layers) {
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
  
  const handleActivationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParameters({
      ...parameters,
      activationFunction: e.target.value
    });
  };
  
  const handleLearningRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      learningRate: parseFloat(e.target.value)
    });
  };
  
  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      batchSize: parseInt(e.target.value)
    });
  };
  
  const handleEpochsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({
      ...parameters,
      epochs: parseInt(e.target.value)
    });
  };
  
  const renderLayerPreview = () => {
    return (
      <LayerGrid>
        {parameters.neuronsPerLayer.map((neurons, index) => (
          <React.Fragment key={index}>
            <Layer isActive={index === parameters.neuronsPerLayer.length - 1}>
              {index === 0 ? 'Input' : index === parameters.neuronsPerLayer.length - 1 ? 'Output' : 'Hidden'}
              <div>{neurons} neurons</div>
            </Layer>
            {index < parameters.neuronsPerLayer.length - 1 && <Arrow>→</Arrow>}
          </React.Fragment>
        ))}
      </LayerGrid>
    );
  };
  
  return (
    <Container>
      <Title>Configure Neural Network</Title>
      <Description>Customize your model architecture and training parameters</Description>
      
      <NetworkPreview>
        {renderLayerPreview()}
      </NetworkPreview>
      
      <FormGrid>
        <FormGroup>
          <Label htmlFor="layers">Number of Layers</Label>
          <ParameterDescription>How many layers in your network (2-5)</ParameterDescription>
          <Input
            id="layers"
            type="range"
            min="2"
            max="5"
            step="1"
            value={parameters.layers}
            onChange={handleLayerCountChange}
          />
          <div style={{ textAlign: 'center', marginTop: '8px' }}>{parameters.layers} layers</div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="activation">Activation Function</Label>
          <ParameterDescription>Non-linearity applied to neuron outputs</ParameterDescription>
          <Select
            id="activation"
            value={parameters.activationFunction}
            onChange={handleActivationChange}
          >
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="tanh">Tanh</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="learning-rate">Learning Rate</Label>
          <ParameterDescription>Step size for gradient descent</ParameterDescription>
          <Input
            id="learning-rate"
            type="number"
            value={parameters.learningRate}
            onChange={handleLearningRateChange}
            step="0.001"
            min="0.001"
            max="1"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="batch-size">Batch Size</Label>
          <ParameterDescription>Samples processed before updating weights</ParameterDescription>
          <Select
            id="batch-size"
            value={parameters.batchSize}
            onChange={e => setParameters({...parameters, batchSize: parseInt(e.target.value)})}
          >
            <option value="16">16</option>
            <option value="32">32</option>
            <option value="64">64</option>
            <option value="128">128</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="epochs">Epochs</Label>
          <ParameterDescription>Complete passes through the dataset</ParameterDescription>
          <Input
            id="epochs"
            type="range"
            min="1"
            max="100"
            step="1"
            value={parameters.epochs}
            onChange={handleEpochsChange}
          />
          <div style={{ textAlign: 'center', marginTop: '8px' }}>{parameters.epochs} epochs</div>
        </FormGroup>
      </FormGrid>
      
      <BuildButton onClick={onBuildModel}>
        Build Neural Network
      </BuildButton>
    </Container>
  );
};

export default ModelConfiguration; 