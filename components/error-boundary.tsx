import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // You can log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-6 h-6 mr-2" />
              An Error Occurred
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're sorry, but something went wrong. Our team has been notified and we're working to fix the issue.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary