import React from 'react';
import styled from 'styled-components';
import { TaskType } from '../../types';
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

const TaskButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const TaskButton = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 24px 16px;
  background-color: ${props => props.selected ? colors.vanilla : 'white'};
  border: 2px solid ${props => props.selected ? colors.primary : colors.lightGray};
  border-radius: ${borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily};
  
  &:hover {
    transform: ${props => props.selected ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.selected ? 'none' : shadows.md};
  }
`;

const TaskIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const TaskTitle = styled.h4`
  font-size: ${typography.fontSizes.body};
  font-weight: ${typography.fontWeights.medium};
  margin: 0 0 4px 0;
  color: ${colors.eerieBlack};
`;

const TaskDescription = styled.p`
  font-size: ${typography.fontSizes.small};
  margin: 0;
  color: ${colors.mediumGray};
  text-align: center;
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
      description: 'Categorize data into distinct classes',
      icon: '🏷️'
    },
    {
      type: 'regression' as TaskType,
      title: 'Regression',
      description: 'Predict continuous numerical values',
      icon: '📈'
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
            <TaskIcon>{task.icon}</TaskIcon>
            <TaskTitle>{task.title}</TaskTitle>
            <TaskDescription>{task.description}</TaskDescription>
          </TaskButton>
        ))}
      </TaskButtonGroup>
    </Container>
  );
};

export default TaskSelection; 