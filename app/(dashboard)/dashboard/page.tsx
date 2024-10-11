import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  let teamData;
  let error = null;

  try {
    teamData = await getTeamForUser(user.id);
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!teamData) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Fetching data...</p>
        </CardContent>
      </Card>
    );
  }

  return <Settings teamData={teamData} />;
}