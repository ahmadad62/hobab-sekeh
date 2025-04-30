# Hobab Sekeh (حباب سکه)

A Next.js application for converting between gold and coins with modern UI features and real-time calculations.

## Project Overview

Hobab Sekeh is a web application that helps users calculate conversions between gold and coins (specifically Iranian gold coins). The application provides a sleek, responsive interface with support for both light and dark modes.

## Development History

The application underwent several major developments and improvements:

### 1. Architecture and Framework Setup
- Fixed metadata export issues in Next.js by properly separating client and server components
- Implemented proper component architecture following Next.js best practices
- Resolved issues with styled-jsx in Server Components

### 2. UI/UX Evolution
- Initially built with Material-UI (MUI)
- Successfully migrated from MUI to Tailwind CSS for more efficient styling
- Added modern UI elements:
  - Responsive header and footer
  - Gradient backgrounds
  - Improved container sizing
  - Enhanced dark mode support

### 3. Font Implementation
- Initially attempted local font file implementation
- Optimized by switching to CDN delivery for Vazir font
- Improved font handling by moving declarations to a separate CSS file

### 4. Features
- Real-time conversion calculations between gold and coins
- Support for both coin-to-gold and gold-to-coin conversions
- Purchase history tracking with local storage
- Responsive design for all screen sizes
- Dark mode support
- Premium (حباب) calculation for coins

## Technical Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Hooks
- **Storage**: Local Storage for purchase history
- **UI**: Custom components with responsive design

## Key Components

- `ConversionCalculator`: Main component handling all conversion logic and UI
- Modern form inputs with proper validation and formatting
- Responsive tables for purchase history
- Gradient-enhanced UI elements
- RTL (Right-to-Left) support for Persian language

The application maintains its core functionality of gold and coin conversion calculations while providing a modern, user-friendly interface and improved performance through optimized styling and component architecture.

## Features

- Convert between gold and coins
- Real-time price calculations
- Support for 17 and 18 karat gold standards
- Beautiful and responsive UI with dark mode support
- Persian language interface

## Technologies

- React
- TypeScript
- Material-UI
- Next.js

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
