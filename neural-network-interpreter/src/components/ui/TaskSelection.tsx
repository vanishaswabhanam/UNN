import React from 'react';
import styled from 'styled-components';
import { TaskType } from '../../types';
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

const TaskButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const TaskButton = styled.button<{ selected: boolean }>`
  padding: 12px 24px;
  background-color: ${props => props.selected ? colors.mediumBlue : colors.lightBlue};
  color: ${props => props.selected ? 'white' : colors.textDark};
  border: none;
  border-radius: ${borderRadius.full};
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSizes.body};
  font-weight: ${props => props.selected ? typography.fontWeights.bold : typography.fontWeights.medium};
  
  &:hover {
    background-color: ${props => props.selected ? colors.mediumBlue : colors.lightGray};
  }
`;

interface TaskSelectionProps {
  selectedTask: TaskType | null;
  onTaskSelect: (taskType: TaskType) => void;
}

const TaskSelection: React.FC<TaskSelectionProps> = ({ selectedTask, onTaskSelect }) => {
  const tasks = [
    {
      type: 'classification' as TaskType,
      title: 'Classification',
    },
    {
      type: 'regression' as TaskType,
      title: 'Regression',
    }
  ];
  
  return (
    <Container>
      <Title>Select Learning Task</Title>
      <Description>Choose the type of supervised learning task to perform</Description>
      
      <TaskButtonGroup>
        {tasks.map(task => (
          <TaskButton 
            key={task.type}
            selected={selectedTask === task.type}
            onClick={() => onTaskSelect(task.type)}
          >
            {task.title}
          </TaskButton>
        ))}
      </TaskButtonGroup>
    </Container>
  );
};

export default TaskSelection; 