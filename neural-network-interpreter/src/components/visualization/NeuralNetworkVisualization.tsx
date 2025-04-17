import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { ModelParameters } from '../../types/index';
import { colors } from '../ui/theme';

type NeuronProps = {
  position: [number, number, number];
  color: string;
  isActive?: boolean;
};

const Neuron: React.FC<NeuronProps> = ({ position, color, isActive = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={isActive ? color : 'black'} 
        emissiveIntensity={isActive ? 0.5 : 0} 
        roughness={0.5}
      />
    </mesh>
  );
};

type ConnectionProps = {
  start: [number, number, number];
  end: [number, number, number];
  thickness?: number;
  color?: string;
};

const Connection: React.FC<ConnectionProps> = ({ 
  start, 
  end, 
  thickness = 0.05, 
  color = "#cccccc" 
}) => {
  // Calculate the midpoint between start and end
  const mid = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ] as [number, number, number];

  // Calculate the length of the connection
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  );

  // Calculate the rotation to align with the connection direction
  const direction = {
    x: end[0] - start[0],
    y: end[1] - start[1],
    z: end[2] - start[2]
  };
  
  // Rotate to align with the direction
  const phi = Math.atan2(direction.z, direction.x);
  const theta = Math.acos(direction.y / length);

  return (
    <mesh position={mid} rotation={[0, phi, theta]}>
      <cylinderGeometry args={[thickness, thickness, length, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

interface NeuralNetworkVisualizationProps {
  modelParameters?: ModelParameters;
}

const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({ 
  modelParameters 
}) => {
  // Default parameters if none provided
  const params = modelParameters || {
    layers: 3,
    neuronsPerLayer: [5, 4, 3],
    activationFunction: 'relu',
    learningRate: 0.01,
    batchSize: 32,
    epochs: 10
  };

  // Generate neurons and connections based on model parameters
  const renderNetwork = () => {
    const neurons: React.ReactElement[] = [];
    const connections: React.ReactElement[] = [];
    
    // Place input layer 
    const inputLayerX = -5;
    // Make sure layers is defined before using it
    const totalLayers = params.layers || 3;
    const layerSpacing = 10 / (totalLayers - 1);
    
    // Add neurons for each layer
    for (let layer = 0; layer < totalLayers; layer++) {
      const neuronsInLayer = params.neuronsPerLayer[layer] || 4;
      const x = inputLayerX + layer * layerSpacing;
      
      // Space neurons vertically
      const neuronSpacing = 4 / (neuronsInLayer - 1);
      
      for (let i = 0; i < neuronsInLayer; i++) {
        const y = (i - (neuronsInLayer - 1) / 2) * neuronSpacing;
        
        // Different colors for different layers
        let color;
        if (layer === 0) color = colors.mediumBlue; // Input layer (blue)
        else if (layer === totalLayers - 1) color = colors.highlight; // Output layer (teal)
        else color = colors.lightBlue; // Hidden layer (light blue)
        
        neurons.push(
          <Neuron 
            key={`neuron-${layer}-${i}`} 
            position={[x, y, 0]} 
            color={color} 
            isActive={Math.random() > 0.5} // Random activation for demo
          />
        );
        
        // Create connections to the previous layer
        if (layer > 0) {
          const prevLayerNeurons = params.neuronsPerLayer[layer - 1] || 4;
          const prevX = inputLayerX + (layer - 1) * layerSpacing;
          const prevNeuronSpacing = 4 / (prevLayerNeurons - 1);
          
          for (let j = 0; j < prevLayerNeurons; j++) {
            const prevY = (j - (prevLayerNeurons - 1) / 2) * prevNeuronSpacing;
            
            connections.push(
              <Connection 
                key={`connection-${layer-1}-${j}-${layer}-${i}`}
                start={[prevX, prevY, 0]}
                end={[x, y, 0]}
                thickness={0.03}
                color={colors.lightGray}
              />
            );
          }
        }
      }
    }
    
    return (
      <>
        {connections}
        {neurons}
      </>
    );
  };

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {renderNetwork()}
      <OrbitControls enableZoom={true} enablePan={true} />
    </Canvas>
  );
};

export default NeuralNetworkVisualization; 