/**
 * Festival Interests API Route
 * GET /api/festivals/interests - Get user's festival interests categorized by level
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInterestCalculator } from '@/lib/interest-calculator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.spotifyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calculator = getInterestCalculator();

    // Get interests categorized by level
    const [high, medium, low] = await Promise.all([
      calculator.getUserInterestsByLevel(session.user.spotifyId, 'high'),
      calculator.getUserInterestsByLevel(session.user.spotifyId, 'medium'),
      calculator.getUserInterestsByLevel(session.user.spotifyId, 'low'),
    ]);

    return NextResponse.json({
      success: true,
      interests: {
        high,
        medium,
        low,
      },
      counts: {
        high: high.length,
        medium: medium.length,
        low: low.length,
        total: high.length + medium.length + low.length,
      },
    });
  } catch (error) {
    console.error('Error fetching festival interests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch festival interests' },
      { status: 500 }
    );
  }
}
