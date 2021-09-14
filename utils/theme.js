const blues = {
  900: 'hsl(212, 88%, 23%)',
  800: 'hsl(212, 88%, 25%)',
  700: 'hsl(212, 88%, 28%)',
  600: 'hsl(212, 74%, 30%)',
  500: 'hsl(212, 74%, 35%)',
  400: 'hsl(212, 74%,50%)',
  300: 'hsl(213, 88%, 60%)',
  200: 'hsl(216, 88%, 75%)',
  100: 'hsl(220, 88%, 88%)',
}

const greys = {
  900: 'hsl(0, 0%, 28%)',
  800: 'hsl(0, 0%, 36%)',
  700: 'hsl(0, 0%, 43%)',
  600: 'hsl(0, 0%, 49%)',
  500: 'hsl(0, 0%, 58%)',
  400: 'hsl(0, 0%, 64%)',
  300: 'hsl(0, 0%, 76%)',
  200: 'hsl(0, 0%, 80%)',
  100: 'hsl(0, 0%, 98%)',
}

const oranges = {
  900: 'hsl(16, 100%, 45%)',
  800: 'hsl(16, 92%, 47%)',
  700: 'hsl(16, 90%, 50%)',
  600: 'hsl(16, 90%, 52%)',
  500: 'hsl(16, 88%, 55%)',
  400: 'hsl(24, 90%, 55%)',
  300: 'hsl(28, 92%, 65%)',
  200: 'hsl(32, 95%, 75%)',
  100: 'hsl(36, 100%, 88%)',
}

const colors = {
  primary: blues[300],
  // text: greys[900],
  text: '#111111',
  blue: blues[400],
  orange: oranges[500],
  white: '#ffffff',
  lightGrey: greys[300],
  grey: greys[300],
  greys,
  oranges,
  blues,
  backgroundGrey: `rgb(247, 238, 234)`,
  blueBlackText: 'rgb(10, 37, 64)',
}

export default {
  // breakpoints: ['40em', '52em', '64em', '90em'],
  breakpoints: ['481px', '769px', '1441px'],
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768],
  colors,
  fonts: {
    body: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    // heading: 'Georgia, serif',
    heading: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 84, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  letterSpacings: {
    body: 'normal',
    caps: '0.2em',
  },
  styles: {
    root: {
      // uses the theme values provided above
      fontFamily: 'body',
      fontWeight: 'body',
    },
  },
  buttons: {
    primary: {
      backgroundColor: 'blue',
    },
  },
  layout: {
    container: {
      maxWidth: 1004,
      boxSizing: 'border-box',
    },
  },
}
