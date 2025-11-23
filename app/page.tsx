import { CarSearch } from '@/components/car-search';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Kenteken Zoeker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vind gedetailleerde informatie over Nederlandse voertuigen. Zoek op exact kenteken of gebruik meerdere zoektermen 
            (zoals "91", "RFH", "93") om voertuigen te vinden die interessante combinaties bevatten.
          </p>
        </div>
        <CarSearch />
      </main>
    </div>
  );
}
