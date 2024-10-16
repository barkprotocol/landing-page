import { Card, CardContent } from "@/components/ui/card"
import { Twitter, Facebook, Instagram } from 'lucide-react'

interface SocialMediaProps {
  socialMedia: Array<{
    platform: string
    username: string
    followers: number
    posts: number
  }>
  isDarkMode: boolean
}

export function SocialMedia({ socialMedia, isDarkMode }: SocialMediaProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-6 h-6" />
      case 'facebook':
        return <Facebook className="w-6 h-6" />
      case 'instagram':
        return <Instagram className="w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {socialMedia.map((account) => (
        <Card key={account.platform} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <CardContent className="flex items-center p-4">
            {getPlatformIcon(account.platform)}
            <div className="ml-4">
              <h3 className="font-semibold">{account.platform}</h3>
              <p className="text-sm text-gray-500">@{account.username}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-semibold">{account.followers.toLocaleString()} followers</p>
              <p className="text-sm text-gray-500">{account.posts.toLocaleString()} posts</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}