import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// For debugging purposes
console.log("React app initializing...");
console.log("DOM ready, mounting app...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found - check HTML for id='root'");
  } else {
    console.log("Root element found, mounting React app");
    createRoot(rootElement).render(<App />);
    console.log("React app mounted");
  }
} catch (error) {
  console.error("Error mounting React app:", error);
  // Add fallback rendering in case of errors
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h1>App Loading Error</h1>
        <p>There was an error loading the application. Please check the browser console for details.</p>
      </div>
    `;
  }
}