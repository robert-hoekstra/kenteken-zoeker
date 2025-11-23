import { NextRequest, NextResponse } from 'next/server';

// RDW Open Data API endpoint for vehicle information
const RDW_API_BASE = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerms = searchParams.get('terms');

  if (!searchTerms) {
    return NextResponse.json(
      { error: 'Search terms are required' },
      { status: 400 }
    );
  }

  try {
    // Parse search terms (comma-separated or array)
    const terms = searchTerms.split(',').map(term => term.trim().toUpperCase()).filter(term => term.length > 0);

    if (terms.length === 0) {
      return NextResponse.json(
        { error: 'At least one search term is required' },
        { status: 400 }
      );
    }

    // Build a query that matches any of the search terms in the license plate
    // RDW API uses Socrata, which supports $where parameter with SoQL syntax
    // We'll search for kenteken that contains any of the terms
    // Note: Socrata uses single quotes for string literals
    const whereConditions = terms.map(term => {
      // Remove dashes from the search term for matching
      const cleanTerm = term.replace(/-/g, '').replace(/'/g, "''"); // Escape single quotes
      return `UPPER(REPLACE(kenteken, '-', '')) LIKE '%${cleanTerm}%'`;
    }).join(' OR ');

    const url = `${RDW_API_BASE}?$where=${encodeURIComponent(whereConditions)}&$limit=100&$order=kenteken`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RDW API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter and enhance results with matched terms
    const enhancedResults = data.map((car: any) => {
      const kenteken = (car.kenteken || '').replace(/-/g, '').toUpperCase();
      const matchedTerms = terms.filter(term => {
        const cleanTerm = term.replace(/-/g, '');
        return kenteken.includes(cleanTerm);
      });
      
      return {
        ...car,
        matchedTerms,
      };
    });

    return NextResponse.json({
      results: enhancedResults,
      count: enhancedResults.length,
      searchTerms: terms,
    });
  } catch (error) {
    console.error('Error fetching RDW search data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle data' },
      { status: 500 }
    );
  }
}

