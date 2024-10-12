import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code } from 'lucide-react'

const APISection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Blinkboard API</CardTitle>
        <CardDescription>Integrate Blinkboard into your applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Our API allows developers to integrate Blinkboard's powerful features into their own applications. Here's what you can do:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Create and manage Blinks programmatically</li>
          <li>Retrieve transaction data and analytics</li>
          <li>Integrate Blinkboard's payment system into your app</li>
          <li>Customize the Blinkboard experience for your users</li>
        </ul>
        <Button className="w-full">
          Explore API Docs <Code className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default APISection