import { ApiLogEntry, apiLogStore } from './apiGateway';

// Mock responses for various AI API calls
const mockResponses: Record<string, any> = {
  'check-ai-router': {
    success: true,
    content: "This is a mock response from the AI router. Using mock data instead of calling the actual API.",
    usage: {
      inputTokens: 25,
      outputTokens: 15,
      model: "gpt-4o-mini-mock",
      api: "openai-mock"
    }
  },
  'generateProjectSuggestion': {
    success: true,
    content: `# Project Suggestion

## Project Name
MockSaaS Analytics Platform

## Description
A comprehensive analytics solution for SaaS businesses to track key metrics, visualize data, and gain actionable insights for growth.

## Goals
1. Provide real-time dashboards for SaaS metrics
2. Enable custom reporting and visualization
3. Offer predictive analytics for growth forecasting
4. Simplify complex data analysis for non-technical users

## Key Features
- Interactive dashboards with drag-and-drop interface
- Integration with popular SaaS tools (Stripe, HubSpot, etc.)
- Custom report builder
- Automated insights and recommendations
- User behavior tracking and analysis
- Cohort analysis tools
- Export functionality in multiple formats

## Additional Considerations
- Will require significant data processing capabilities
- Should prioritize data security and privacy compliance
- Consider tiered pricing based on data volume and feature access
- Mobile-responsive design is essential for on-the-go analytics`,
    usage: {
      inputTokens: 150,
      outputTokens: 250,
      model: "gpt-4o-mock",
      api: "openai-mock"
    }
  },
  'generateMarketingCopy': {
    success: true,
    content: `## Landing Page Copy

# Transform Your Business with AI-Powered Analytics

Unlock the full potential of your data with our powerful yet intuitive analytics platform. Get actionable insights in minutes, not days.

## Why Choose Us?

- **Real-time dashboards** that update as your business grows
- **AI-powered recommendations** to highlight opportunities you might miss
- **Seamless integration** with your existing tech stack
- **No coding required** - designed for business users

Start your free trial today and see the difference data-driven decisions can make.`,
    usage: {
      inputTokens: 100,
      outputTokens: 150,
      model: "claude-3-sonnet-20240229-mock",
      api: "claude-mock"
    }
  }
};

/**
 * Get a mock response for a specific API action
 * @param action The API action
 * @param payload The request payload
 * @returns The mock response
 */
export function getMockResponse(action: string, payload: any = {}): any {
  // Generate a unique ID for this mock API call
  const logId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();
  
  // Create a log entry
  const logEntry: ApiLogEntry = {
    id: logId,
    timestamp: new Date(),
    action,
    requestPayload: payload,
    isMock: true
  };
  
  // Add a small delay to simulate an API call (between 300ms and 1200ms)
  const delay = Math.floor(Math.random() * 900) + 300;
  
  // Get the mock response or generate a default one
  const mockResponse = mockResponses[action] || {
    success: true,
    content: `This is a mock response for the "${action}" API call. No specific mock data is available for this action.`,
    usage: {
      inputTokens: 20,
      outputTokens: 30,
      model: "mock-model",
      api: "mock-api"
    }
  };
  
  // Return a promise that resolves after the delay
  return new Promise(resolve => {
    setTimeout(() => {
      // Add the response to the log
      if (apiLogStore.isLoggingEnabled()) {
        const model = mockResponse?.usage?.model;
        const api = mockResponse?.usage?.api;
        const inputTokens = mockResponse?.usage?.inputTokens;
        const outputTokens = mockResponse?.usage?.outputTokens;
        
        apiLogStore.addLog({
          ...logEntry,
          response: mockResponse,
          duration: Date.now() - startTime,
          model,
          api,
          tokens: {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens && outputTokens ? inputTokens + outputTokens : undefined
          }
        });
      }
      
      resolve(mockResponse);
    }, delay);
  });
}

// Flag to control whether to use mock data
let useMockData = false;

/**
 * Enable or disable the use of mock data
 */
export function setUseMockData(enable: boolean): void {
  useMockData = enable;
  // Save the setting in localStorage
  try {
    localStorage.setItem('useMockAiData', JSON.stringify(enable));
  } catch (e) {
    console.error('Error saving mock data setting:', e);
  }
}

/**
 * Check if mock data is enabled
 */
export function isUsingMockData(): boolean {
  return useMockData;
}

// Initialize from localStorage if available
try {
  const savedSetting = localStorage.getItem('useMockAiData');
  if (savedSetting) {
    useMockData = JSON.parse(savedSetting);
  }
} catch (e) {
  console.error('Error loading mock data setting:', e);
}