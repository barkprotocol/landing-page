'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const CommunityPage = () => {
  const { toast } = useToast();
  const [communityEvents, setCommunityEvents] = useState([]);

  useEffect(() => {
    // Fetch community events or details from an API
    const fetchCommunityEvents = async () => {
      try {
        const response = await fetch('/api/v1/community-events'); // Replace with your API endpoint
        const data = await response.json();
        setCommunityEvents(data);
      } catch (error) {
        toast({
          title: "Error fetching events",
          description: error.message || "Failed to load community events.",
          variant: "destructive",
        });
      }
    };

    fetchCommunityEvents();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Our Community</h1>
      <p className="text-lg mb-4">Join us in engaging with our amazing community and participate in upcoming events!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {communityEvents.length > 0 ? (
          communityEvents.map((event) => (
            <Card key={event.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
              </CardContent>
              <div className="flex justify-end p-4">
                <Button variant="outline" onClick={() => alert(`Registering for ${event.title}`)}>
                  Register
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center">
            <p className="text-lg">No community events available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
