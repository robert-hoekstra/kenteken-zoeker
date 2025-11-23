import { NextRequest, NextResponse } from 'next/server';

// RDW Open Data API endpoint for vehicle information
const RDW_API_BASE = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kenteken = searchParams.get('kenteken');

  if (!kenteken) {
    return NextResponse.json(
      { error: 'Kenteken (license plate) is required' },
      { status: 400 }
    );
  }

  try {
    // Normalize the license plate: remove dashes and convert to uppercase
    const normalizedKenteken = kenteken.replace(/-/g, '').toUpperCase();
    
    // RDW API expects the license plate without dashes
    const url = `${RDW_API_BASE}?kenteken=${encodeURIComponent(normalizedKenteken)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RDW API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No vehicle found with this license plate' },
        { status: 404 }
      );
    }

    // Return the first result (should be unique for a license plate)
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error fetching RDW data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle data' },
      { status: 500 }
    );
  }
}

