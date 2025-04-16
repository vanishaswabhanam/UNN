// Color palette based on design inspiration
export const colors = {
  // Main palette
  aliceBlue: '#D8DFEF', // Light blue background
  honeydew: '#CFD5CA',  // Light green accent
  vanilla: '#F7F0A3',   // Yellow highlight 
  eerieBlack: '#202021', // Dark background/text
  ghostWhite: '#F8F9FA', // Light background
  
  // Additional UI colors
  primary: '#4B4BF5',    // Primary button/accent color (blue)
  secondary: '#202C8F',  // Secondary button color (dark blue)
  lightBlue: '#B7CFFF',  // Light blue accent
  mediumGray: '#6C757D', // Text and subtle UI elements
  lightGray: '#DEE2E6',  // Borders and dividers
  
  // Status colors
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8'
};

// Typography
export const typography = {
  fontFamily: "'Urbanist', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSizes: {
    small: '0.875rem',
    body: '1rem',
    subheading: '1.5rem',
    heading: '2.25rem',
    title: '3rem'
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
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
};

// Border radius
export const borderRadius = {
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
  xl: '1.5rem',
  full: '9999px'
};

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius
}; 