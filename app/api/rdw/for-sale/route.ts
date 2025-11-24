import { NextRequest, NextResponse } from 'next/server';

interface ForSaleListing {
  site: string;
  name: string;
  url: string;
  available: boolean;
}

// Function to check if a car is listed on AutoScout24
async function checkAutoScout24(kenteken: string): Promise<boolean> {
  try {
    // AutoScout24 search URL - try with and without dashes
    // First try with dashes (L-590-PX format)
    const kentekenWithDashes = kenteken.length === 6 
      ? `${kenteken.slice(0, 1)}-${kenteken.slice(1, 4)}-${kenteken.slice(4)}`
      : kenteken;
    
    // Try the search URL - AutoScout24 might use different parameter names
    const searchUrl = `https://www.autoscout24.nl/lst?searchtext=${encodeURIComponent(kenteken)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Referer': 'https://www.autoscout24.nl/',
      },
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.log(`AutoScout24 response not OK: ${response.status}`);
      return false;
    }

    const html = await response.text();
    
    // AutoScout24 is a React app, so we need to look for:
    // 1. Preload links to images (indicates listings exist)
    // 2. JSON-LD structured data
    // 3. Meta tags indicating results
    // 4. Specific data attributes or IDs
    
    // Check for image preloads - if there are listing images, car is likely for sale
    const imagePreloadPattern = /prod\.pictures\.autoscout24\.net\/listing-images/;
    if (imagePreloadPattern.test(html)) {
      console.log('Found listing images in preload - car likely for sale');
      return true;
    }
    
    // Check for JSON-LD structured data with Car type
    const jsonLdPattern = /"@type"\s*:\s*"Car"/;
    if (jsonLdPattern.test(html)) {
      console.log('Found Car JSON-LD - car likely for sale');
      return true;
    }
    
    // Check for specific AutoScout24 listing indicators
    // Look for listing IDs or vehicle data in the HTML
    const listingIdPattern = /listing-images\/[a-f0-9-]+/i;
    if (listingIdPattern.test(html)) {
      console.log('Found listing ID pattern - car likely for sale');
      return true;
    }
    
    // Check for "0 resultaten" or "geen resultaten" - means NOT for sale
    if (html.includes('0 resultaten') || 
        html.includes('geen resultaten') || 
        html.includes('Geen resultaten gevonden') ||
        html.includes('No results found') ||
        html.includes('geen voertuigen gevonden')) {
      console.log('Found "no results" text - car not for sale');
      return false;
    }
    
    // Check for result count in meta description or title
    const resultCountMatch = html.match(/(\d+)\s+resulta?ten?/i);
    if (resultCountMatch) {
      const count = parseInt(resultCountMatch[1]);
      console.log(`Found result count: ${count}`);
      return count > 0;
    }
    
    // If we can't determine from initial HTML, return false
    // (The page might be client-side rendered and we'd need to wait for JS)
    console.log('Could not determine if car is for sale from HTML');
    return false;
  } catch (error) {
    console.error('Error checking AutoScout24:', error);
    // Return false on error to be safe
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kenteken = searchParams.get('kenteken');
  const merk = searchParams.get('merk');
  const handelsbenaming = searchParams.get('handelsbenaming');

  if (!kenteken) {
    return NextResponse.json(
      { error: 'Kenteken is required' },
      { status: 400 }
    );
  }

  try {
    // Normalize license plate (remove dashes, uppercase)
    const normalizedKenteken = kenteken.replace(/-/g, '').toUpperCase();
    
    // Build search query for car listings
    const searchQuery = merk && handelsbenaming 
      ? `${merk} ${handelsbenaming} ${normalizedKenteken}`
      : normalizedKenteken;

    // Check disabled - only provide search links
    // const autoscout24Available = await checkAutoScout24(normalizedKenteken);

    const listings: ForSaleListing[] = [
      {
        site: 'autoscout24',
        name: 'AutoScout24',
        url: `https://www.autoscout24.nl/lst?searchtext=${encodeURIComponent(normalizedKenteken)}`,
        available: false, // Check disabled
      },
      {
        site: 'autotrader',
        name: 'AutoTrader',
        url: `https://www.autotrader.nl/auto/zoeken?q=${encodeURIComponent(normalizedKenteken)}`,
        available: false, // Could be enhanced similarly
      },
      {
        site: 'marktplaats',
        name: 'Marktplaats',
        url: `https://www.marktplaats.nl/q/${encodeURIComponent(searchQuery)}/c/91`,
        available: false, // Could be enhanced similarly
      },
      {
        site: 'gaspedaal',
        name: 'Gaspedaal',
        url: `https://www.gaspedaal.nl/zoeken?q=${encodeURIComponent(normalizedKenteken)}`,
        available: false, // Could be enhanced similarly
      },
      {
        site: 'bovag',
        name: 'BOVAG',
        url: `https://www.bovag.nl/occasions?search=${encodeURIComponent(normalizedKenteken)}`,
        available: false, // Could be enhanced similarly
      },
    ];

    // Always return false for hasListings since we're not checking
    // Users can click the links to check manually
    const hasListings = false;

    return NextResponse.json({
      kenteken: normalizedKenteken,
      listings,
      hasListings,
    });
  } catch (error) {
    console.error('Error checking for sale listings:', error);
    return NextResponse.json(
      { error: 'Failed to check for sale listings' },
      { status: 500 }
    );
  }
}

