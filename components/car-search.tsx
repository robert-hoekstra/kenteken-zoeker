'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CarResultCard } from './car-result-card';
import { CarCardSkeleton } from './car-card-skeleton';
import { CarDetailSkeleton } from './car-detail-skeleton';
import { CarBrandLogo } from './car-brand-logo';
import { X, Plus, Search, ExternalLink, ShoppingCart, Filter, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  const [selectedCarForSale, setSelectedCarForSale] = useState<ForSaleData | null>(null);
  const [loadingForSale, setLoadingForSale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'exact' | 'pattern'>('pattern');
  const [filterMerk, setFilterMerk] = useState<string>('');
  const [filterHandelsbenaming, setFilterHandelsbenaming] = useState<string>('');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

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
      setSidePanelOpen(true);
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
      setSelectedCar(null);
      setSidePanelOpen(false);
      
      if (data.results.length === 0) {
        setError('Geen voertuigen gevonden die overeenkomen met de zoektermen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  // Fetch for-sale data when a car is selected
  useEffect(() => {
    const car = selectedCar || (searchMode === 'exact' && searchResults?.results[0]);
    if (car && car.kenteken) {
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
            setSelectedCarForSale(data);
          }
        })
        .catch(err => {
          console.error('Error fetching for-sale data:', err);
        })
        .finally(() => {
          setLoadingForSale(false);
        });
    } else {
      setSelectedCarForSale(null);
    }
  }, [selectedCar, searchResults, searchMode]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL');
    } catch {
      return dateString;
    }
  };

  const handleForSaleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get unique brands and types from search results for filter dropdowns
  const getUniqueBrands = (results: CarData[]): string[] => {
    const brands = new Set<string>();
    results.forEach(car => {
      if (car.merk) {
        brands.add(car.merk);
      }
    });
    return Array.from(brands).sort();
  };

  const getUniqueTypes = (results: CarData[], selectedMerk?: string): string[] => {
    const types = new Set<string>();
    results.forEach(car => {
      // If a merk is selected, only show types for that merk
      if (selectedMerk && car.merk !== selectedMerk) {
        return;
      }
      if (car.handelsbenaming) {
        types.add(car.handelsbenaming);
      }
    });
    return Array.from(types).sort();
  };

  // Filter results based on selected filters
  const getFilteredResults = (): CarData[] => {
    if (!searchResults) return [];
    
    return searchResults.results.filter(car => {
      // Filter by merk
      if (filterMerk && car.merk !== filterMerk) {
        return false;
      }
      
      // Filter by handelsbenaming
      if (filterHandelsbenaming && car.handelsbenaming !== filterHandelsbenaming) {
        return false;
      }
      
      return true;
    });
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Zoek Voertuigen</CardTitle>
          <CardDescription className="text-base">
            Kies een zoekmethode en begin met zoeken naar jouw ideale voertuig
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
                setFilterMerk('');
                setFilterHandelsbenaming('');
                setSidePanelOpen(false);
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
                setFilterMerk('');
                setFilterHandelsbenaming('');
                setSidePanelOpen(false);
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
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zoeken...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Zoek
                    </>
                  )}
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zoeken...
                  </>
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

      {/* Filters */}
      {searchMode === 'pattern' && !loading && searchResults && searchResults.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter de resultaten op merk en/of type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Merk</label>
                  <Select 
                    value={filterMerk || undefined} 
                    onValueChange={(value) => {
                      setFilterMerk(value || '');
                      // Reset type filter when merk changes
                      setFilterHandelsbenaming('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle merken" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniqueBrands(searchResults.results).map((merk) => (
                        <SelectItem key={merk} value={merk}>
                          {merk}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={filterHandelsbenaming || undefined} 
                    onValueChange={(value) => setFilterHandelsbenaming(value || '')}
                    disabled={!filterMerk && searchResults.results.length > 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filterMerk ? "Alle types" : "Selecteer eerst een merk"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniqueTypes(searchResults.results, filterMerk || undefined).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {(filterMerk || filterHandelsbenaming) && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterMerk('');
                    setFilterHandelsbenaming('');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Filters wissen
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredResults.length} van {searchResults.results.length} resultaten
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && searchMode === 'pattern' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <CarCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Pattern Search Results Grid */}
      {!loading && searchMode === 'pattern' && searchResults && searchResults.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((car, idx) => (
            <CarResultCard
              key={car.kenteken || idx}
              car={car}
              onSelect={(car) => {
                setSelectedCar(car);
                setSidePanelOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* No results message when filters are applied */}
      {searchMode === 'pattern' && searchResults && searchResults.results.length > 0 && filteredResults.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Geen resultaten gevonden met de geselecteerde filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilterMerk('');
                setFilterHandelsbenaming('');
              }}
            >
              Filters wissen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Side Panel for Car Details */}
      <Sheet open={sidePanelOpen} onOpenChange={setSidePanelOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {loading && searchMode === 'exact' ? (
            <CarDetailSkeleton />
          ) : (selectedCar || (searchMode === 'exact' && searchResults && searchResults.results.length > 0)) && (() => {
            const car = selectedCar || searchResults?.results[0];
            if (!car) return null;
            
            // Generate car image URL - using a car image placeholder service
            // In production, you could integrate with a car image API or use Unsplash with API key
            const carImageQuery = `${car.merk || ''} ${car.handelsbenaming || ''}`.trim();
            // Using a placeholder service - for production, consider using a dedicated car image API
            const carImageUrl = `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&q=80`;
            
            return (
              <div className="space-y-6 px-6 pt-6 pb-6">
                <SheetHeader className="px-0 pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <SheetTitle className="text-2xl">
                        {car.merk || 'Onbekend'} {car.handelsbenaming || ''}
                      </SheetTitle>
                      <SheetDescription className="text-lg mt-2">
                        Kenteken: <span className="font-mono font-semibold">{car.kenteken || 'N/A'}</span>
                      </SheetDescription>
                    </div>
                    {car.voertuigsoort && (
                      <Badge variant="secondary" className="text-sm shrink-0">
                        {car.voertuigsoort}
                      </Badge>
                    )}
                  </div>
                </SheetHeader>

                {/* Car Brand Logo */}
                <div className="flex justify-center">
                  <CarBrandLogo 
                    merk={car.merk || ''} 
                    size={120}
                    className="shadow-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Search on Sale Sites Section */}
                  {selectedCarForSale && selectedCarForSale.listings && selectedCarForSale.listings.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Zoek op verkoopsites
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Controleer of dit voertuig te koop staat op de volgende websites:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedCarForSale.listings.map((listing, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              className="justify-start h-auto py-3 px-4"
                              onClick={() => handleForSaleLinkClick(listing.url)}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <span className="font-medium">{listing.name}</span>
                                <ExternalLink className="h-4 w-4 ml-auto shrink-0" />
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
