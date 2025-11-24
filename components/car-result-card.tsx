'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface ForSaleListing {
  site: string;
  name: string;
  url: string;
  available: boolean;
}

interface ForSaleData {
  kenteken: string;
  listings: ForSaleListing[];
  hasListings: boolean;
}

interface CarData {
  kenteken?: string;
  merk?: string;
  handelsbenaming?: string;
  voertuigsoort?: string;
  inrichting?: string;
  eerste_toelating_dt?: string;
  vervaldatum_apk_dt?: string;
  catalogusprijs?: string;
  wam_verzekerd?: string;
  aantal_cilinders?: string;
  cilinderinhoud?: string;
  massa_ledig_voertuig?: string;
  toegestane_maximum_massa_voertuig?: string;
  aantal_zitplaatsen?: string;
  aantal_deuren?: string;
  lengte?: string;
  breedte?: string;
  brandstof_omschrijving?: string;
  kleur?: string;
  matchedTerms?: string[];
  forSale?: ForSaleData;
}

interface CarResultCardProps {
  car: CarData;
  onSelect?: (car: CarData) => void;
  checkForSale?: boolean;
}

export function CarResultCard({ car, onSelect, checkForSale = true }: CarResultCardProps) {
  const [forSaleData, setForSaleData] = useState<ForSaleData | null>(car.forSale || null);
  const [loadingForSale, setLoadingForSale] = useState(false);

  useEffect(() => {
    if (checkForSale && !forSaleData && car.kenteken) {
      setLoadingForSale(true);
      const params = new URLSearchParams({
        kenteken: car.kenteken,
      });
      if (car.merk) params.append('merk', car.merk);
      if (car.handelsbenaming) params.append('handelsbenaming', car.handelsbenaming);

      fetch(`/api/rdw/for-sale?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.listings) {
            setForSaleData(data);
          }
        })
        .catch(err => {
          console.error('Error fetching for-sale data:', err);
        })
        .finally(() => {
          setLoadingForSale(false);
        });
    }
  }, [car.kenteken, car.merk, car.handelsbenaming, checkForSale, forSaleData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL');
    } catch {
      return dateString;
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer h-full"
      onClick={() => onSelect?.(car)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1">
              {car.merk || 'Onbekend'} {car.handelsbenaming || ''}
            </CardTitle>
            <CardDescription className="text-base font-mono">
              {car.kenteken || 'N/A'}
            </CardDescription>
          </div>
          {car.voertuigsoort && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {car.voertuigsoort}
            </Badge>
          )}
        </div>
        {/* "Te koop" badge removed - only showing search links */}
        {car.matchedTerms && car.matchedTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {car.matchedTerms.map((term, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            {car.kleur && (
              <div>
                <span className="text-muted-foreground">Kleur: </span>
                <span className="font-medium">{car.kleur}</span>
              </div>
            )}
            {car.brandstof_omschrijving && (
              <div>
                <span className="text-muted-foreground">Brandstof: </span>
                <span className="font-medium">{car.brandstof_omschrijving}</span>
              </div>
            )}
            {car.eerste_toelating_dt && (
              <div>
                <span className="text-muted-foreground">Toelating: </span>
                <span className="font-medium">{formatDate(car.eerste_toelating_dt)}</span>
              </div>
            )}
            {car.cilinderinhoud && (
              <div>
                <span className="text-muted-foreground">Cilinderinhoud: </span>
                <span className="font-medium">{car.cilinderinhoud} cc</span>
              </div>
            )}
          </div>
          {car.catalogusprijs && (
            <div className="pt-2 border-t">
              <span className="text-muted-foreground">Catalogusprijs: </span>
              <span className="font-semibold text-lg">
                €{parseInt(car.catalogusprijs).toLocaleString('nl-NL')}
              </span>
            </div>
          )}
        </div>
        {forSaleData && forSaleData.listings && forSaleData.listings.length > 0 && (
          <div className="pt-3 mt-3 border-t space-y-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Zoek op verkoopsites:
            </div>
            <div className="flex flex-wrap gap-2">
              {forSaleData.listings.slice(0, 3).map((listing, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={(e) => handleLinkClick(e, listing.url)}
                >
                  {listing.name}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

