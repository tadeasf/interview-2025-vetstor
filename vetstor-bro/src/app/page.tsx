import AnimalsList from "@/components/animals-list";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          VETSTOR - Veterinary Records
        </h1>
        <p className="text-center text-muted-foreground">
          View vaccination records for animals
        </p>
      </header>

      <main>
        <AnimalsList />
      </main>
    </div>
  );
}
