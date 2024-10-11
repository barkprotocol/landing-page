import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiData {
  id: number
  title: string
  body: string
}

export default function ErrorHandlingExample() {
  const [data, setData] = useState<ApiData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from the server')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (e) {
      if (e instanceof SyntaxError && e.message.includes('Unexpected token')) {
        setError('Received invalid JSON data. The server might be down or returning an error page.')
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Data Fetcher</CardTitle>
        <CardDescription>Demonstrating robust error handling</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center">Loading...</p>}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {data && (
          <div>
            <h2 className="text-xl font-bold mb-2">{data.title}</h2>
            <p>{data.body}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchData} disabled={loading} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardFooter>
    </Card>
  )
}