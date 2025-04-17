import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, typography, shadows, borderRadius } from './theme';

const UploadContainer = styled.div`
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

const SimpleUploadArea = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: ${colors.lightBlue};
  color: ${colors.textDark};
  border: none;
  border-radius: ${borderRadius.full};
  padding: 10px 20px;
  cursor: pointer;
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.medium};
  font-size: ${typography.fontSizes.body};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${colors.lightGray};
  }
`;

const ProcessButton = styled.button`
  background-color: ${colors.mediumBlue};
  color: white;
  border: none;
  border-radius: ${borderRadius.full};
  padding: 12px 20px;
  cursor: pointer;
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.bold};
  font-size: ${typography.fontSizes.body};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${colors.darkBlue};
  }
  
  &:disabled {
    background-color: ${colors.mediumGray};
    cursor: not-allowed;
  }
`;

const FileName = styled.div`
  margin-left: 8px;
  font-size: ${typography.fontSizes.body};
  color: ${colors.textMedium};
`;

const SuccessIndicator = styled.div`
  background-color: ${colors.highlight};
  border-radius: ${borderRadius.full};
  padding: 8px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-family: ${typography.fontFamily};
`;

const SuccessIcon = styled.span`
  font-size: 16px;
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
          <span>Data processed successfully!</span>
        </SuccessIndicator>
      )}
      
      <SimpleUploadArea>
        <FileInput 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept=".csv"
        />
        <UploadButton onClick={handleUploadClick}>
          Select File
        </UploadButton>
        {selectedFile && <FileName>{selectedFile.name}</FileName>}
      </SimpleUploadArea>
      
      {selectedFile && !uploaded && (
        <ProcessButton 
          onClick={handleSubmit}
        >
          Process Data
        </ProcessButton>
      )}
    </UploadContainer>
  );
};

export default DataUploadPanel; 