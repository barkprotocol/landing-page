'use client'

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember } from '@/app/(login)/actions';

interface TeamManagementProps {
  team: TeamDataWithMembers;
  currentUser: User;
}

export function TeamManagement({ team, currentUser }: TeamManagementProps) {
  const [customerPortalState, customerPortalAction] = useActionState(customerPortalAction);
  const [removeMemberState, removeMemberAction] = useActionState(removeTeamMember);

  const handleCustomerPortal = async () => {
    const result = await customerPortalAction();
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMemberAction({ teamId: team.id, userId: memberId });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team: {team.name}</h3>
            <Button onClick={handleCustomerPortal} disabled={customerPortalState.pending}>
              {customerPortalState.pending ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </div>
          <div className="divide-y">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.image || undefined} alt={member.name || 'Team member'} />
                    <AvatarFallback>{member.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                {currentUser.id !== member.id && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removeMemberState.pending}
                  >
                    {removeMemberState.pending ? 'Removing...' : 'Remove'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}