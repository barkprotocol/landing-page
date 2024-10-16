'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Info, Zap, Repeat, CreditCard, Users, Code, Printer, ArrowRight, Play } from 'lucide-react';
import { VideoPresentation } from "@/components/ui/video-presentation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const BlinkboardDemo = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">Blinkboard Demo</h3>
    <p>This is a placeholder for the Blinkboard demo component.</p>
  </div>
);

const NFTOverview = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">NFT Overview</h3>
    <p>This is a placeholder for the NFT overview component.</p>
  </div>
);

const BlinkTypes = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">Blink Types</h3>
    <p>This is a placeholder for the Blink types component.</p>
  </div>
);

const SubscriptionPlans = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">Subscription Plans</h3>
    <p>This is a placeholder for the subscription plans component.</p>
  </div>
);

const CommunitySection = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">Community Section</h3>
    <p>This is a placeholder for the community section component.</p>
  </div>
);

const APISection = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">API Section</h3>
    <p>This is a placeholder for the API section component.</p>
  </div>
);

const MintFeature = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2">Mint Feature</h3>
    <p>This is a placeholder for the mint feature component.</p>
  </div>
);

export default function Blinkboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showVideo, setShowVideo] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg?height=1080&width=1920&text=Default+Background");
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
    { id: "get-started", label: "Get Started", icon: ArrowRight }
  ];

  const interfaceImages = [
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+1",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+2",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+3",
  ];

  // Function to fetch NFT data from an API
  const fetchNftData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/nfts'); // Update this URL to your actual API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNftData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'nfts') {
      fetchNftData();
    }
  }, [activeTab]);

  const handlePlayVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="relative py-24 bg-gray-100" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Experience Blinkboard</h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Lightning-fast transactions, powerful features, and an intuitive interface for Solana. Join us in shaping the future of blockchain interactions!
          </p>
        </motion.div>

        <Card className="bg-white rounded-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black">Welcome to Blinkboard</CardTitle>
            <CardDescription className="text-gray-700">
              Blinkboard is a revolutionary platform that simplifies blockchain interactions on the Solana network. 
              Create, manage, and engage with various blockchain activities through our innovative Blink system. 
              Whether you're a seasoned blockchain enthusiast or new to the space, Blinkboard provides the tools 
              you need to participate in the decentralized future.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <nav className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-800'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              ))}
            </nav>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="mb-6">
                  {showVideo ? (
                    <VideoPresentation
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Blinkboard Overview"
                    />
                  ) : (
                    <div className="relative aspect-video">
                      <img
                        src="/placeholder.svg?height=400&width=800&text=Blinkboard+Video+Thumbnail"
                        alt="Blinkboard Video Thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        onClick={handlePlayVideo}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        How it Works
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
                  <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2">
                    &lt;
                  </CarouselPrevious>
                  <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2">
                    &gt;
                  </CarouselNext>
                </Carousel>
              </div>
            )}

            {activeTab === "demo" && <BlinkboardDemo />}
            {activeTab === "blink-types" && <BlinkTypes />}
            {activeTab === "nfts" && (
              <>
                {loading && <p className="text-gray-700">Loading NFT data...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && nftData.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">NFT Data:</h3>
                    <ul>
                      {nftData.map((nft, index) => (
                        <li key={index} className="border-b border-gray-200 py-2">
                          {nft.name} - {nft.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {activeTab === "subscription" && <SubscriptionPlans />}
            {activeTab === "community" && <CommunitySection />}
            {activeTab === "api" && <APISection />}
            {activeTab === "mint" && <MintFeature />}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => alert("Get started with Blinkboard!")}>
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
