import { useToast } from '@/hooks/use-toast';

export type ErrorDetails = {
  code?: string;
  message: string;
  context?: Record<string, any>;
  originalError?: any;
};

/**
 * Error Service for consistent error handling throughout the application
 */
export const errorService = {
  /**
   * Log an error to the console with structured format
   */
  logError(
    component: string, 
    operation: string, 
    errorDetails: ErrorDetails
  ): void {
    const timestamp = new Date().toISOString();
    
    console.error(
      `Error [${timestamp}] [${component}] [${operation}]:`, 
      {
        message: errorDetails.message,
        code: errorDetails.code || 'UNKNOWN',
        context: errorDetails.context || {},
        originalError: errorDetails.originalError
      }
    );
    
    // You could add additional error tracking here (e.g., Sentry)
  },
  
  /**
   * Handle a database error from Supabase
   */
  handleDatabaseError(
    component: string, 
    operation: string, 
    error: any, 
    context?: Record<string, any>
  ): ErrorDetails {
    // Map database error codes to user-friendly messages
    let userMessage = 'An unexpected database error occurred';
    let errorCode = 'DB_ERROR';
    
    // Supabase error handling
    if (error?.code) {
      switch (error.code) {
        case '42P01': // Table doesn't exist
          userMessage = 'The requested data table does not exist';
          errorCode = 'DB_TABLE_NOT_FOUND';
          break;
        case '23505': // Unique violation
          userMessage = 'A record with the same unique identifier already exists';
          errorCode = 'DB_DUPLICATE_ENTRY';
          break;
        case '23503': // Foreign key violation
          userMessage = 'Unable to perform this action due to a reference constraint';
          errorCode = 'DB_REFERENCE_ERROR';
          break;
        case '42P02': // Column doesn't exist
          userMessage = 'The requested data field does not exist';
          errorCode = 'DB_COLUMN_NOT_FOUND';
          break;
        case '42883': // Function doesn't exist
          userMessage = 'The requested operation is not supported';
          errorCode = 'DB_FUNCTION_NOT_FOUND';
          break;
        case '22P02': // Invalid text representation
          userMessage = 'The data format is incorrect';
          errorCode = 'DB_INVALID_FORMAT';
          break;
        case '28P01': // Invalid password
          userMessage = 'Authentication failed';
          errorCode = 'DB_AUTH_ERROR';
          break;
        default:
          if (error.code.startsWith('22')) {
            userMessage = 'Invalid data format';
            errorCode = 'DB_DATA_ERROR';
          } else if (error.code.startsWith('23')) {
            userMessage = 'Data integrity constraint violation';
            errorCode = 'DB_CONSTRAINT_ERROR';
          } else if (error.code.startsWith('42')) {
            userMessage = 'Invalid database object';
            errorCode = 'DB_OBJECT_ERROR';
          }
      }
    }
    
    // Clean error message for display (remove technical details)
    let displayMessage = error?.message || userMessage;
    // Remove DB-specific details that might be confusing to users
    displayMessage = displayMessage.replace(/(\b[a-zA-Z_0-9]+\.)+[a-zA-Z_0-9]+:/g, '');
    displayMessage = displayMessage.replace(/violates.+constraint/g, 'violates a constraint');
    
    const errorDetails: ErrorDetails = {
      code: errorCode,
      message: userMessage,
      context: {
        ...context,
        originalMessage: error?.message,
        originalCode: error?.code,
        details: error?.details
      },
      originalError: error
    };
    
    this.logError(component, operation, errorDetails);
    
    return errorDetails;
  },
  
  /**
   * Handle API-related errors
   */
  handleApiError(
    component: string, 
    operation: string, 
    error: any, 
    context?: Record<string, any>
  ): ErrorDetails {
    let userMessage = 'An error occurred while fetching data';
    let errorCode = 'API_ERROR';
    
    // Handle different types of API errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMessage = 'Unable to connect to the server';
      errorCode = 'API_NETWORK_ERROR';
    } else if (error?.status) {
      // HTTP status code based messages
      switch (error.status) {
        case 400:
          userMessage = 'The request was invalid';
          errorCode = 'API_BAD_REQUEST';
          break;
        case 401:
          userMessage = 'You need to be logged in to perform this action';
          errorCode = 'API_UNAUTHORIZED';
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action';
          errorCode = 'API_FORBIDDEN';
          break;
        case 404:
          userMessage = 'The requested resource was not found';
          errorCode = 'API_NOT_FOUND';
          break;
        case 429:
          userMessage = 'Too many requests, please try again later';
          errorCode = 'API_RATE_LIMIT';
          break;
        case 500:
          userMessage = 'Server error, please try again later';
          errorCode = 'API_SERVER_ERROR';
          break;
        default:
          if (error.status >= 400 && error.status < 500) {
            userMessage = 'There was a problem with your request';
            errorCode = 'API_CLIENT_ERROR';
          } else if (error.status >= 500) {
            userMessage = 'Server error, please try again later';
            errorCode = 'API_SERVER_ERROR';
          }
      }
    }
    
    const errorDetails: ErrorDetails = {
      code: errorCode,
      message: userMessage,
      context: {
        ...context,
        originalMessage: error?.message,
        status: error?.status
      },
      originalError: error
    };
    
    this.logError(component, operation, errorDetails);
    
    return errorDetails;
  },
  
  /**
   * Format an error for display to the user
   */
  getDisplayError(error: ErrorDetails): string {
    // For user display, we want a clean, non-technical message
    return error.message;
  }
};

/**
 * React hook for using the error service with toast notifications
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  const handleError = (
    component: string, 
    operation: string, 
    error: any, 
    context?: Record<string, any>,
    showToast: boolean = true
  ) => {
    let errorDetails: ErrorDetails;
    
    // Determine error type and handle accordingly
    if (error?.code?.startsWith('2') || error?.code?.startsWith('4')) {
      // Likely a database error
      errorDetails = errorService.handleDatabaseError(component, operation, error, context);
    } else if (error?.status || (error instanceof TypeError && error.message.includes('fetch'))) {
      // Likely an API error
      errorDetails = errorService.handleApiError(component, operation, error, context);
    } else {
      // Generic error
      errorDetails = {
        code: 'UNKNOWN_ERROR',
        message: error?.message || 'An unexpected error occurred',
        context,
        originalError: error
      };
      errorService.logError(component, operation, errorDetails);
    }
    
    // Show toast notification if requested
    if (showToast) {
      toast({
        title: 'Error',
        description: errorService.getDisplayError(errorDetails),
        variant: 'destructive',
      });
    }
    
    return errorDetails;
  };
  
  return { handleError };
};