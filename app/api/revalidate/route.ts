import { revalidate } from 'lib/bigcommerce';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  void req;
  const result = await revalidate();
  return new NextResponse(result.body, { status: result.status });
}
