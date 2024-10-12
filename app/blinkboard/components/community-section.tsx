import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from 'lucide-react'

const CommunitySection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Join Our Community</CardTitle>
        <CardDescription>Help us build a better Blinkboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Blinkboard is currently in its MVP (Minimum Viable Product) stage, and we're excited to grow with our community. Here's how you can get involved:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Contribute to our open-source codebase</li>
          <li>Suggest new features and use cases</li>
          <li>Participate in community discussions</li>
          <li>Help test new features before they're released</li>
        </ul>
        <Button className="w-full">
          Join Our Community <Users className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default CommunitySection