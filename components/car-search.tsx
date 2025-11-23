'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CarResultCard } from './car-result-card';
import { X, Plus, Search } from 'lucide-react';

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

interface SearchResponse {
  results: CarData[];
  count: number;
  searchTerms: string[];
}

export function CarSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'exact' | 'pattern'>('pattern');

  const addSearchTerm = () => {
    const term = searchTerm.trim().toUpperCase();
    if (term && !searchTerms.includes(term)) {
      setSearchTerms([...searchTerms, term]);
      setSearchTerm('');
      setError(null);
    }
  };

  const removeSearchTerm = (termToRemove: string) => {
    setSearchTerms(searchTerms.filter(term => term !== termToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchMode === 'pattern') {
        addSearchTerm();
      } else {
        handleExactSearch();
      }
    }
  };

  const handleExactSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Voer een kenteken in');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);
    setSelectedCar(null);

    try {
      const normalizedPlate = searchTerm.replace(/\s+/g, '-').toUpperCase();
      const response = await fetch(`/api/rdw?kenteken=${encodeURIComponent(normalizedPlate)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kon geen voertuiggegevens ophalen');
      }

      const data = await response.json();
      setSelectedCar(data);
      setSearchResults({ results: [data], count: 1, searchTerms: [normalizedPlate] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const handlePatternSearch = async () => {
    if (searchTerms.length === 0) {
      setError('Voeg ten minste één zoekterm toe');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);
    setSelectedCar(null);

    try {
      const termsString = searchTerms.join(',');
      const response = await fetch(`/api/rdw/search?terms=${encodeURIComponent(termsString)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kon geen voertuiggegevens ophalen');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);
      
      if (data.results.length === 0) {
        setError('Geen voertuigen gevonden die overeenkomen met de zoektermen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kenteken Zoeker</CardTitle>
          <CardDescription>
            Zoek voertuigen op exact kenteken of gebruik meerdere zoektermen om voertuigen te vinden die interessante combinaties bevatten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={searchMode === 'exact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSearchMode('exact');
                setSearchTerms([]);
                setSearchResults(null);
                setSelectedCar(null);
                setError(null);
              }}
            >
              Exact Kenteken
            </Button>
            <Button
              variant={searchMode === 'pattern' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSearchMode('pattern');
                setSelectedCar(null);
                setError(null);
              }}
            >
              Patroon Zoeken
            </Button>
          </div>

          <Separator />

          {/* Exact Search Mode */}
          {searchMode === 'exact' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Voer kenteken in (bijv. 91-RFH-93)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={loading}
                />
                <Button onClick={handleExactSearch} disabled={loading}>
                  {loading ? 'Zoeken...' : <><Search className="mr-2 h-4 w-4" /> Zoek</>}
                </Button>
              </div>
            </div>
          )}

          {/* Pattern Search Mode */}
          {searchMode === 'pattern' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Voeg zoekterm toe (bijv. 91, RFH, 93)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={loading}
                />
                <Button onClick={addSearchTerm} disabled={loading || !searchTerm.trim()} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Toevoegen
                </Button>
              </div>

              {searchTerms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchTerms.map((term, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                      {term}
                      <button
                        onClick={() => removeSearchTerm(term)}
                        className="ml-2 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                onClick={handlePatternSearch} 
                disabled={loading || searchTerms.length === 0}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  'Zoeken...'
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Zoek voertuigen met deze termen ({searchTerms.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results Summary */}
      {searchResults && searchResults.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {searchResults.count} {searchResults.count === 1 ? 'voertuig gevonden' : 'voertuigen gevonden'}
            </CardTitle>
            <CardDescription>
              Zoektermen: {searchResults.searchTerms.join(', ')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pattern Search Results Grid */}
      {searchMode === 'pattern' && searchResults && searchResults.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.results.map((car, idx) => (
            <CarResultCard
              key={car.kenteken || idx}
              car={car}
              onSelect={setSelectedCar}
            />
          ))}
        </div>
      )}

      {/* Exact Search Result or Selected Car Details */}
      {(selectedCar || (searchMode === 'exact' && searchResults && searchResults.results.length > 0)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {(selectedCar || searchResults?.results[0])?.merk || 'Onbekend'} {(selectedCar || searchResults?.results[0])?.handelsbenaming || ''}
                </CardTitle>
                <CardDescription className="text-lg mt-1">
                  Kenteken: {(selectedCar || searchResults?.results[0])?.kenteken || 'N/A'}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {(selectedCar || searchResults?.results[0])?.voertuigsoort || 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const car = selectedCar || searchResults?.results[0];
              if (!car) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-3">Basis Informatie</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Merk:</span>
                        <span className="font-medium">{car.merk || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Handelsbenaming:</span>
                        <span className="font-medium">{car.handelsbenaming || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Voertuigsoort:</span>
                        <span className="font-medium">{car.voertuigsoort || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Inrichting:</span>
                        <span className="font-medium">{car.inrichting || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Kleur:</span>
                        <span className="font-medium">{car.kleur || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Brandstof:</span>
                        <span className="font-medium">{car.brandstof_omschrijving || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-3">Technische Specificaties</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Aantal cilinders:</span>
                        <span className="font-medium">{car.aantal_cilinders || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Cilinderinhoud:</span>
                        <span className="font-medium">
                          {car.cilinderinhoud ? `${car.cilinderinhoud} cc` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Massa ledig voertuig:</span>
                        <span className="font-medium">
                          {car.massa_ledig_voertuig ? `${car.massa_ledig_voertuig} kg` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Max. massa:</span>
                        <span className="font-medium">
                          {car.toegestane_maximum_massa_voertuig 
                            ? `${car.toegestane_maximum_massa_voertuig} kg` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Aantal zitplaatsen:</span>
                        <span className="font-medium">{car.aantal_zitplaatsen || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Aantal deuren:</span>
                        <span className="font-medium">{car.aantal_deuren || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Lengte:</span>
                        <span className="font-medium">
                          {car.lengte ? `${car.lengte} cm` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Breedte:</span>
                        <span className="font-medium">
                          {car.breedte ? `${car.breedte} cm` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <h3 className="font-semibold text-lg mb-3">Overige Informatie</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Eerste toelating:</span>
                        <span className="font-medium">{formatDate(car.eerste_toelating_dt)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">APK vervaldatum:</span>
                        <span className="font-medium">{formatDate(car.vervaldatum_apk_dt)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">WAM verzekerd:</span>
                        <span className="font-medium">{car.wam_verzekerd === 'Ja' ? 'Ja' : 'Nee'}</span>
                      </div>
                      {car.catalogusprijs && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Catalogusprijs:</span>
                          <span className="font-medium">
                            €{parseInt(car.catalogusprijs).toLocaleString('nl-NL')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
