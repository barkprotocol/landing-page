import React from 'react'
import Image from 'next/image'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Brand Guide | Milton Platform',
  description: 'Brand guidelines and assets for the Milton Platform',
}

export default function BrandGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Milton Brand Guide</h1>
      
      <Tabs defaultValue="colors" className="space-y-8">
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Primary, secondary, and accent colors used across the Milton Platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Primary" color="bg-primary" textColor="text-primary-foreground" />
                <ColorSwatch name="Secondary" color="bg-secondary" textColor="text-secondary-foreground" />
                <ColorSwatch name="Accent" color="bg-accent" textColor="text-accent-foreground" />
                <ColorSwatch name="Background" color="bg-background" textColor="text-foreground" />
                <ColorSwatch name="Foreground" color="bg-foreground" textColor="text-background" />
                <ColorSwatch name="Muted" color="bg-muted" textColor="text-muted-foreground" />
                <ColorSwatch name="Card" color="bg-card" textColor="text-card-foreground" />
                <ColorSwatch name="Destructive" color="bg-destructive" textColor="text-destructive-foreground" />
                <ColorSwatch name="Light Gold" color="bg-[#FFECB1]" textColor="text-gray-900" />
                <ColorSwatch name="Peach" color="bg-[#FFDAA4]" textColor="text-gray-900" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Font styles used in the Milton Platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Headings</h2>
                  <h1 className="text-4xl font-bold">Heading 1</h1>
                  <h2 className="text-3xl font-bold">Heading 2</h2>
                  <h3 className="text-2xl font-bold">Heading 3</h3>
                  <h4 className="text-xl font-bold">Heading 4</h4>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Body Text</h2>
                  <p className="text-base">This is the standard body text used across the Milton Platform. It should be clear and readable on all devices.</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Button Text</h2>
                  <Button>Primary Button</Button>
                  <Button variant="secondary" className="ml-2">Secondary Button</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo Usage</CardTitle>
              <CardDescription>Guidelines for using the Milton Platform logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Primary Logo (Horizontal)</h2>
                  <div className="bg-white p-8 rounded-lg shadow-md inline-block">
                    <div className="flex items-center space-x-4">
                      <Image
                        src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                        alt="Milton Icon"
                        width={50}
                        height={50}
                      />
                      <span className="text-4xl font-bold text-gray-900">Milton</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Vertical Logo</h2>
                  <div className="bg-white p-8 rounded-lg shadow-md inline-block">
                    <div className="flex flex-col items-center space-y-4">
                      <Image
                        src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                        alt="Milton Icon"
                        width={100}
                        height={100}
                      />
                      <span className="text-4xl font-bold text-gray-900">Milton</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Icon</h2>
                  <div className="bg-white p-8 rounded-lg shadow-md inline-block">
                    <Image
                      src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                      alt="Milton Icon"
                      width={100}
                      height={100}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Logo Font</h2>
                  <p className="mb-2">The Milton logo uses a custom typeface based on the following font:</p>
                  <p className="font-bold">Font Name: Montserrat</p>
                  <p>Weight: Bold (700)</p>
                  <p className="mt-2">Note: The logo text has been customized and should not be recreated using the standard font. Always use the provided logo files.</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Logo Guidelines</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Maintain clear space around the logo and icon</li>
                    <li>Do not stretch, distort, or alter the logo or icon in any way</li>
                    <li>Use the provided color variations</li>
                    <li>Ensure the logo and icon are legible at all sizes</li>
                    <li>Use the horizontal logo for wide spaces and the vertical logo for narrow spaces</li>
                    <li>The icon can be used separately when the full logo doesn't fit or for small representations (e.g., favicons, app icons)</li>
                    <li>Do not attempt to recreate the logo text using the standard font; always use the provided logo files</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ColorSwatchProps {
  name: string
  color: string
  textColor: string
}

function ColorSwatch({ name, color, textColor }: ColorSwatchProps) {
  return (
    <div className={`${color} ${textColor} p-4 rounded-md flex flex-col justify-between h-24`}>
      <span className="font-bold">{name}</span>
      <span className="text-sm">{color.replace('bg-', '').replace('[', '').replace(']', '')}</span>
    </div>
  )
}