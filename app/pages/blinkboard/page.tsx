'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Info, Zap, Repeat, CreditCard, Users, Code, Printer, ArrowRight, Play, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { VideoPresentation } from "@/components/ui/video-presentation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "@/components/ui/use-toast";

const iconColor = "#D4AF37"; // Darker tan color

const BlinkboardDemo = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const address = PublicKey.unique().toBase58();
      console.log(`Generated demo token with address: ${address}`);
      toast({
        title: "Demo Token Generated",
        description: `Token address: ${address}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate demo token.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800">
      <h3 className="text-2xl font-bold mb-4">Blinkboard Demo</h3>
      <p className="mb-4">Experience the power of Blinkboard with our interactive demo.</p>
      <Button variant="secondary" onClick={handleLaunchDemo} disabled={isLoading}>
        {isLoading ? "Generating..." : "Launch Demo"}
      </Button>
    </div>
  );
};

const NFTOverview = ({ nfts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {nfts.map((nft, index) => (
      <Card key={index} className="overflow-hidden bg-white text-gray-800">
        <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h4 className="font-bold">{nft.name}</h4>
          <p className="text-sm text-gray-600">{nft.description}</p>
          <p className="text-sm font-semibold mt-2">Price: {nft.price} SOL</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

const BlinkTypes = () => {
  const types = ['Standard', 'Flash', 'Scheduled', 'Recurring', 'Conditional', 'Secure'];
  const descriptions = {
    'Standard': 'Basic Blink for simple transactions.',
    'Flash': 'Ultra-fast Blinks for time-sensitive operations.',
    'Scheduled': 'Set future dates for automatic Blink execution.',
    'Recurring': 'Automate repeated Blinks at set intervals.',
    'Conditional': 'Blinks that execute based on predefined conditions.',
    'Secure': 'Enhanced security features for high-value Blinks.',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type) => (
        <Card key={type} className="bg-white text-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              {type === 'Secure' && <Lock className="mr-2 h-4 w-4" style={{ color: iconColor }} />}
              {type} Blink
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{descriptions[type]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    toast({
      title: `${plan} Plan Selected`,
      description: `You've chosen the ${plan} plan. Click 'Confirm' to proceed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Basic', 'Pro', 'Enterprise'].map((plan) => (
          <Card key={plan} className={`bg-white text-gray-800 ${plan === selectedPlan ? 'border-blue-500 border-2' : ''}`}>
            <CardHeader>
              <CardTitle>{plan} Plan</CardTitle>
              <CardDescription className="text-gray-600">Perfect for {plan === 'Basic' ? 'beginners' : plan === 'Pro' ? 'power users' : 'large organizations'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">${plan === 'Basic' ? '9.99' : plan === 'Pro' ? '29.99' : '99.99'}/mo</p>
              <ul className="list-disc list-inside">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSelectPlan(plan)}>Choose {plan}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedPlan && (
        <div className="text-center">
          <Button size="lg" onClick={() => toast({ title: "Subscription Confirmed", description: `You are now subscribed to the ${selectedPlan} plan.` })}>
            Confirm {selectedPlan} Plan
          </Button>
        </div>
      )}
    </div>
  );
};

const CommunitySection = () => {
  const [discordMembers, setDiscordMembers] = useState(0);
  const [twitterFollowers, setTwitterFollowers] = useState(0);

  useEffect(() => {
    // Simulating API calls to fetch community stats
    setDiscordMembers(Math.floor(Math.random() * 10000) + 5000);
    setTwitterFollowers(Math.floor(Math.random() * 50000) + 10000);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Join Our Thriving Community</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white text-gray-800">
          <CardHeader>
            <CardTitle>Discord</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Join our Discord server for real-time discussions and support.</p>
            <p className="font-bold mt-2">{discordMembers.toLocaleString()} members</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Join Discord</Button>
          </CardFooter>
        </Card>
        <Card className="bg-white text-gray-800">
          <CardHeader>
            <CardTitle>Twitter</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Follow us on Twitter for the latest updates and announcements.</p>
            <p className="font-bold mt-2">{twitterFollowers.toLocaleString()} followers</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Follow @Blinkboard</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const APISection = () => {
  const [showFullDocs, setShowFullDocs] = useState(false);

  const toggleDocs = () => setShowFullDocs(!showFullDocs);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Powerful API Integration</h3>
      <Card className="bg-white text-gray-800">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Integrate Blinkboard into your applications with our comprehensive API.</p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-gray-800">
            <code>
              {`
GET /api/v1/blinks
Authorization: Bearer YOUR_API_KEY

{
  "blinks": [
    {
      "id": "blink_123",
      "type": "standard",
      "amount": 1000000,
      "recipient": "9x1234...5678"
    },
    ...
  ]
}
              `}
            </code>
          </pre>
          {showFullDocs && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Additional Endpoints</h4>
              <ul className="list-disc list-inside">
                <li>POST /api/v1/blinks - Create a new Blink</li>
                <li>GET /api/v1/blinks/{'{id}'} - Retrieve a specific Blink</li>
                <li>PUT /api/v1/blinks/{'{id}'} - Update a Blink</li>
                <li>DELETE /api/v1/blinks/{'{id}'} - Cancel a Blink</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={toggleDocs}>
            {showFullDocs ? "Hide Full Documentation" : "View Full Documentation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const MintFeature = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async (event) => {
    event.preventDefault();
    if (!wallet.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint a Blink.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const amount = parseFloat(event.target.amount.value);
    const recipient = event.target.recipient.value;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const address = PublicKey.unique().toBase58();
      console.log(`Minted Blink token: address ${address}, amount ${amount}, recipient ${recipient}`);
      toast({
        title: "Blink minted successfully!",
        description: `Token address: ${address}`,
      });
    } catch (error) {
      toast({
        title: "Error minting Blink",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Mint Your Own Blinks</h3>
      <Card className="bg-white text-gray-800">
        <CardHeader>
          <CardTitle>Create a New Blink</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <Label htmlFor="blinkType">Blink Type</Label>
              <select id="blinkType" className="w-full p-2 border rounded bg-white text-gray-800">
                <option>Standard</option>
                <option>Flash</option>
                <option>Scheduled</option>
                <option>Recurring</option>
                <option>Conditional</option>
                <option>Secure</option>
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="0" className="bg-white text-gray-800" />
            </div>
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input id="recipient" placeholder="Solana address" className="bg-white text-gray-800" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Minting..." : "Mint Blink"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Blinkboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showVideo, setShowVideo] = useState(false);
  const [nftData, setNftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "demo", label: "Demo", icon: Zap },
    { id: "blink-types", label: "Blink Types", icon: Repeat },
    { id: "nfts", label: "NFTs", icon: ImageIcon },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "community", label: "Community", icon: Users },
    { id: "api", label: "API", icon: Code },
    { id: "mint", label: "Mint", icon: Printer },
  ];

  const interfaceImages = [
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+1",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+2",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+3",
  ];

  const fetchNftData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await new Promise(resolve => 
        setTimeout(resolve, 1000)
      );
      const mockNftData = [
        { id: '1', name: 'Cool NFT #1', price: 1.5, image: '/placeholder.svg?height=300&width=300', description: 'A really cool NFT' },
        { id: '2', name: 'Awesome NFT #2', price: 2.0, image: '/placeholder.svg?height=300&width=300', description: 'An awesome NFT' },
        { id: '3', name: 'Rare NFT #3', price: 5.0, image: '/placeholder.svg?height=300&width=300', description: 'A rare and valuable NFT' },
        { id: '4', name: 'Unique NFT #4', price: 3.5, image: '/placeholder.svg?height=300&width=300', description: 'A one-of-a-kind NFT' },
      ];
      setNftData(mockNftData);
    } catch (err) {
      setError('Error fetching NFT data. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch NFT data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'nfts') {
      fetchNftData();
    }
  }, [activeTab, fetchNftData]);

  const handlePlayVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    toast({
      title: "Welcome to Blinkboard!",
      description: "Let's get you set up with your first Blink.",
    });
  }, []);

  return (
    <section className="relative py-24 bg-gray-100">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">Experience Blinkboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your Solana interactions with lightning-fast transactions and an intuitive interface. 
            Join us in shaping the future of blockchain engagement!
          </p>
        </motion.div>

        <Card className="bg-white rounded-lg shadow-2xl text-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome to Blinkboard</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Simplify your blockchain journey on the Solana network with our innovative Blink system. 
              Whether you're a blockchain expert or just getting started, Blinkboard provides the tools 
              you need to thrive in the decentralized future.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 bg-gray-100">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2 data-[state=active]:bg-white">
                    <tab.icon className="w-4 h-4" style={{ color: iconColor }} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                      <div className="mb-6">
                        {showVideo ? (
                          <VideoPresentation
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                            title="Blinkboard Overview"
                          />
                        ) : (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=400&width=800&text=Blinkboard+Video+Thumbnail"
                              alt="Blinkboard Video Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                              onClick={handlePlayVideo}
                            >
                              <Play className="mr-2 h-4 w-4" style={{ color: iconColor }} />
                              Watch How it Works
                            </Button>
                          </div>
                        )}
                      </div>
                      <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                        <CarouselContent>
                          {interfaceImages.map((src, index) => (
                            <CarouselItem key={index}>
                              <img
                                src={src}
                                alt={`Blinkboard Interface ${index + 1}`}
                                className="w-full rounded-lg shadow-lg"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious><ChevronLeft style={{ color: iconColor }} /></CarouselPrevious>
                        <CarouselNext><ChevronRight style={{ color: iconColor }} /></CarouselNext>
                      </Carousel>
                    </div>
                  </TabsContent>
                  <TabsContent value="demo" className="mt-6">
                    <BlinkboardDemo />
                  </TabsContent>
                  <TabsContent value="blink-types" className="mt-6">
                    <BlinkTypes />
                  </TabsContent>
                  <TabsContent value="nfts" className="mt-6">
                    {loading && <p className="text-gray-600">Loading NFT data...</p>}
                    {error && <p className="text-red-600">{error}</p>}
                    {!loading && !error && nftData.length > 0 && <NFTOverview nfts={nftData} />}
                  </TabsContent>
                  <TabsContent value="subscription" className="mt-6">
                    <SubscriptionPlans />
                  </TabsContent>
                  <TabsContent value="community" className="mt-6">
                    <CommunitySection />
                  </TabsContent>
                  <TabsContent value="api" className="mt-6">
                    <APISection />
                  </TabsContent>
                  <TabsContent value="mint" className="mt-6">
                    <MintFeature />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-center space-x-4">
            <Button size="lg" onClick={handleGetStarted}>
              Get Started with Blinkboard
              <ArrowRight className="ml-2 h-4 w-4" style={{ color: iconColor }} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}