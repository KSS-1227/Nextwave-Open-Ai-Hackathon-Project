import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to your error reporting service
    this.logError(error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Check if this is the JSON parse error we're tracking
    if (error.message?.includes('[object Object]') || 
        error.message?.includes('not valid JSON')) {
      console.warn('Detected JSON parsing error - likely from browser extension:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      
      // Clear potentially corrupted storage
      try {
        localStorage.removeItem('__storage_test__');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => {
  const isJSONError = error?.message?.includes('[object Object]') || 
                     error?.message?.includes('not valid JSON');

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {isJSONError 
              ? "This appears to be a browser extension conflict. Try disabling extensions or using incognito mode."
              : "An unexpected error occurred. Please try again."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            {isJSONError && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Refresh Page
              </Button>
            )}
          </div>
          
          {isJSONError && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Quick fixes:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Disable browser extensions temporarily</li>
                <li>Try incognito/private browsing mode</li>
                <li>Clear browser cache and cookies</li>
                <li>Check for conflicting analytics scripts</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Error handled:', error, errorInfo);
    
    // Handle JSON parsing errors specifically
    if (error.message?.includes('[object Object]') || 
        error.message?.includes('not valid JSON')) {
      console.warn('JSON parsing error detected - likely browser extension issue');
      
      // Try to clear potentially corrupted data
      try {
        // Clear any corrupted storage keys
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value === '[object Object]') {
              localStorage.removeItem(key);
              console.log(`Removed corrupted storage key: ${key}`);
            }
          } catch (e) {
            // Key might be corrupted, remove it
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Failed to clean storage:', e);
      }
    }
  }, []);

  return { handleError };
};

export default ErrorBoundary;