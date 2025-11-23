'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
}

interface CarResultCardProps {
  car: CarData;
  onSelect?: (car: CarData) => void;
}

export function CarResultCard({ car, onSelect }: CarResultCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL');
    } catch {
      return dateString;
    }
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
      </CardContent>
    </Card>
  );
}

