import { NextResponse } from 'next/server';

// Sample data to simulate community events
const events = [
  {
    id: 1,
    title: "Community Clean-Up Day",
    date: "2024-10-25T10:00:00Z",
    description: "Join us for a day of cleaning our local parks and neighborhoods. Supplies will be provided.",
  },
  {
    id: 2,
    title: "Monthly Book Club",
    date: "2024-11-05T18:00:00Z",
    description: "Discuss this month's book selection with fellow book lovers. All are welcome!",
  },
  {
    id: 3,
    title: "Annual Charity Run",
    date: "2024-12-15T09:00:00Z",
    description: "Participate in our charity run to support local shelters. Registration required.",
  },
  {
    id: 4,
    title: "Weekly Yoga in the Park",
    date: "2024-10-20T08:00:00Z",
    description: "Join us for a refreshing morning yoga session in the park. All skill levels welcome!",
  },
];

export async function GET() {
  return NextResponse.json(events);
}
