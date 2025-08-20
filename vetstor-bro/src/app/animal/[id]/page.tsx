import { AnimalDetail } from "@/components/animal-detail";

interface AnimalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnimalPage({ params }: AnimalPageProps) {
  const { id } = await params;
  const animalId = parseInt(id, 10);

  if (Number.isNaN(animalId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Neplatné ID zvířete
          </h1>
          <p className="text-muted-foreground">ID zvířete musí být číslo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimalDetail animalId={animalId} />
    </div>
  );
}
