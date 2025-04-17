// Color palette based on design inspiration
export const colors = {
  // Main palette
  lightBlue: '#e9f0f9', // Light blue background
  mediumBlue: '#4B80C5', // Medium blue for buttons and accents
  darkBlue: '#2E5C9F',  // Darker blue for hover states and headers
  highlight: '#C5E8E5', // Light teal/mint highlight (replacing yellow)
  textDark: '#333333',  // Dark text color
  textMedium: '#545E63', // Medium text color
  
  // Additional UI colors
  white: '#FFFFFF',
  lightGray: '#E5E9EF',
  mediumGray: '#A0A8B0',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3'
};

// Typography
export const typography = {
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSizes: {
    small: '0.875rem',
    body: '1rem',
    subheading: '1.25rem',
    heading: '1.5rem',
    title: '2.25rem'
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.2
  }
};

// Spacing
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem', 
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
};

// Shadows
export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.1)',
  md: '0 2px 4px rgba(0,0,0,0.1)',
  lg: '0 4px 8px rgba(0,0,0,0.1)'
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px'
};

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius
}; 