import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, typography, shadows, borderRadius } from './theme';

const UploadContainer = styled.div`
  background-color: ${colors.ghostWhite};
  border-radius: ${borderRadius.lg};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${shadows.md};
`;

const UploadArea = styled.div`
  border: 2px dashed ${colors.lightGray};
  border-radius: ${borderRadius.md};
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: white;
  
  &:hover {
    border-color: ${colors.primary};
    background-color: rgba(75, 75, 245, 0.05);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.md};
  padding: 12px 20px;
  cursor: pointer;
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.medium};
  font-size: ${typography.fontSizes.body};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${colors.secondary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: ${colors.mediumGray};
    cursor: not-allowed;
    transform: none;
  }
`;

const FileName = styled.div`
  margin-top: 12px;
  font-size: ${typography.fontSizes.small};
  color: ${colors.mediumGray};
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

const SuccessIndicator = styled.div`
  background-color: ${colors.vanilla};
  border-radius: ${borderRadius.md};
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-family: ${typography.fontFamily};
`;

const SuccessIcon = styled.span`
  font-size: 20px;
  margin-right: 12px;
`;

interface DataUploadPanelProps {
  onFileUpload: (file: File) => void;
}

const DataUploadPanel: React.FC<DataUploadPanelProps> = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploaded(false);
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setUploaded(true);
    }
  };
  
  return (
    <UploadContainer>
      <Title>Upload Your Dataset</Title>
      <Description>Upload a CSV file containing your training data</Description>
      
      {uploaded && (
        <SuccessIndicator>
          <SuccessIcon>✓</SuccessIcon>
          <span>Data uploaded successfully! Your file is ready for processing.</span>
        </SuccessIndicator>
      )}
      
      <UploadArea onClick={handleUploadClick}>
        <FileInput 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept=".csv"
        />
        <div>Drag and drop a CSV file here, or click to select</div>
        {selectedFile && <FileName>Selected: {selectedFile.name}</FileName>}
      </UploadArea>
      
      <Button 
        onClick={handleSubmit} 
        disabled={!selectedFile || uploaded}
      >
        {uploaded ? 'Processed' : 'Process Data'}
      </Button>
    </UploadContainer>
  );
};

export default DataUploadPanel; 