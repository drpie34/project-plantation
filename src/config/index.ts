/**
 * Application Configuration
 * 
 * This file centralizes all configuration constants used throughout the application.
 * Instead of hardcoding values in components, import constants from this file.
 */

// API Configuration
export const API_CONFIG = {
  // The base URL for API calls
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://vrplqxtwporuulgazizx.supabase.co',
  
  // Edge function names
  EDGE_FUNCTIONS: {
    API_GATEWAY: 'api-gateway',
    TRACK_ACTIVITY: 'track-activity',
  },
  
  // Default timeout for API calls in milliseconds
  DEFAULT_TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    BACKOFF_FACTOR: 2,
  }
};

// Authentication Configuration
export const AUTH_CONFIG = {
  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REMEMBER_ME: 'remember_me',
  },
  
  // Session duration in milliseconds
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Minimum password requirements
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  }
};

// Feature Configuration
export const FEATURE_CONFIG = {
  // Enable or disable features
  ENABLE_EXTENDED_THINKING: true,
  ENABLE_WEB_SEARCH: true,
  ENABLE_DOCUMENT_ANALYSIS: true,
  ENABLE_API_LOGGING: process.env.NODE_ENV === 'development',
  
  // Feature limits by subscription tier
  TIER_LIMITS: {
    FREE: {
      PROJECTS: 3,
      IDEAS_PER_PROJECT: 10,
      DOCUMENTS_PER_PROJECT: 5,
      MONTHLY_CREDITS: 100,
    },
    BASIC: {
      PROJECTS: 10,
      IDEAS_PER_PROJECT: 50,
      DOCUMENTS_PER_PROJECT: 20,
      MONTHLY_CREDITS: 500,
    },
    PREMIUM: {
      PROJECTS: -1, // Unlimited
      IDEAS_PER_PROJECT: -1, // Unlimited
      DOCUMENTS_PER_PROJECT: -1, // Unlimited
      MONTHLY_CREDITS: 2000,
    },
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Default pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
  
  // Animation durations in milliseconds
  ANIMATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
  },
  
  // Toast notification durations
  TOAST_DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
  },
  
  // Default tab persistence key prefix
  TAB_PERSISTENCE_PREFIX: 'tab_persistence_',
};

// AI Model Configuration
export const AI_CONFIG = {
  // Available models
  MODELS: {
    GPT_3_5: {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks',
      icon: '⚡',
      maxTokens: 4096,
    },
    GPT_4: {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most powerful model for complex tasks',
      icon: '🧠',
      maxTokens: 8192,
    },
    CLAUDE_2: {
      id: 'claude-2',
      name: 'Claude 2',
      description: 'Excellent for creative and nuanced content',
      icon: '✨',
      maxTokens: 100000,
    },
  },
  
  // Default model to use
  DEFAULT_MODEL: 'gpt-4',
  
  // Temperature settings
  TEMPERATURE: {
    CREATIVE: 0.9,
    BALANCED: 0.7,
    FOCUSED: 0.3,
  }
};

// Credits Configuration
export const CREDITS_CONFIG = {
  // Cost in credits per 1000 tokens
  COST_PER_1K_TOKENS: {
    'gpt-3.5-turbo': {
      input: 0.5,
      output: 1.5,
    },
    'gpt-4': {
      input: 3,
      output: 6,
    },
    'claude-2': {
      input: 2.5,
      output: 5,
    },
  },
  
  // Minimum required credits for operations
  MINIMUM_CREDITS: {
    GENERATE_IDEAS: 5,
    DOCUMENT_ANALYSIS: 10,
    MARKET_RESEARCH: 15,
    PROJECT_PLANNING: 20,
  },
  
  // Free tier credit reset period in days
  FREE_TIER_RESET_DAYS: 30,
};

// Document Configuration
export const DOCUMENT_CONFIG = {
  // Maximum file size in bytes
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Allowed file types
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/csv',
  ],
  
  // Auto-save interval in milliseconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
};