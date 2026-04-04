import { NextResponse } from 'next/server';

export async function GET() {
  const steps = [
    { id: 1, label: 'Find a problem', status: 'done' as const, route: '/discover' },
    { id: 2, label: 'Pick your best one', status: 'current' as const, route: '/opportunities' },
    { id: 3, label: 'Build your service', status: 'todo' as const, route: '/offers' },
    { id: 4, label: 'Land your first client', status: 'todo' as const, route: '/clients' },
  ];

  return NextResponse.json({
    steps,
    currentStep: 1,
    percentComplete: 25,
  });
}
