# Neural Architecture Interpreter

A minimalistic web application for visualizing neural networks and automatically configuring machine learning models based on input data and task selection.

## Features

- Interactive 3D visualization of neural network architectures
- Data upload functionality for CSV files
- Task selection for different machine learning objectives
- Customizable model parameters
- Real-time visual feedback as you adjust model configuration

## Technologies Used

- React with TypeScript
- Three.js for 3D visualization via React Three Fiber
- Styled Components for styling

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

- `src/components/ui`: UI components like data upload, task selection, etc.
- `src/components/visualization`: 3D visualization components
- `src/types`: TypeScript type definitions
- `src/hooks`: Custom React hooks

## Future Development

This project is a starting point for a more comprehensive neural network visualization and automation tool. Future plans include:

1. Backend integration for actual model training
2. More sophisticated automatic hyperparameter selection
3. Enhanced 3D visualization with data flow animation
4. Test case injection to visualize data processing
5. Expanded model architecture support (CNNs, RNNs, etc.)

## Hackathon Project

This project was created as part of a hackathon to demonstrate the concept of making neural networks more interpretable and accessible through visualization.
