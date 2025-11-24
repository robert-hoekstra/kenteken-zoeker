import { CarSearch } from '@/components/car-search';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Kenteken Zoeker
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 font-medium">
            Ontdek jouw perfecte Nederlandse auto met intelligente kenteken zoekfunctie
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Zoek op exact kenteken voor directe informatie, of gebruik patroonzoeken met meerdere termen 
            (zoals "91", "RFH", "93") om auto's te vinden die jouw favoriete combinaties bevatten. 
            Filter op merk en type om precies te vinden wat je zoekt.
          </p>
        </div>
        <CarSearch />
      </main>
    </div>
  );
}
