import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const CONTRACT_ADDRESS = "YourContractAddressHere"
const SOLSCAN_URL = `https://solscan.io/token/${CONTRACT_ADDRESS}`

export function AboutMilton() {
  return (
    <Card className="mt-8 w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>About Milton Tokens</CardTitle>
        <CardDescription>Key details and benefits of MILTON tokens.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Milton tokens are designed to facilitate transactions within our ecosystem. 
          They offer unique benefits such as access to exclusive events, discounts on services, and rewards for community engagement.
        </p>
        <p className="text-muted-foreground mb-4">
          Always ensure you are purchasing from official channels to avoid scams and fraud. 
          Stay informed about token updates and community announcements through our official channels.
        </p>
        <p className="text-sm font-medium">
          Contract Address: <a href={SOLSCAN_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{CONTRACT_ADDRESS}</a>
        </p>
      </CardContent>
    </Card>
  )
}