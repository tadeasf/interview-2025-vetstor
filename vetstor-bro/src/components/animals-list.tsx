"use client";

import {
  AlertCircle,
  Calendar,
  RefreshCw,
  Search,
  Syringe,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/providers/trpc-provider";
import type { AnimalWithLatestVaccinationClient } from "@/server/types";

export default function AnimalsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: animals,
    isLoading,
    error,
    refetch,
  } = trpc.getAnimalsWithLatestVaccination.useQuery();

  const processRecords = trpc.processAllRecords.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Filter animals based on search term
  const filteredAnimals =
    animals?.filter((animal: AnimalWithLatestVaccinationClient) =>
      animal.animalId.toString().includes(searchTerm),
    ) || [];

  const formatDate = (date: string | null) => {
    if (!date) return "Žádná vakcinace";
    return new Intl.DateTimeFormat("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleProcessRecords = () => {
    processRecords.mutate();
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Chyba při načítání dat: {error.message}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Zkusit znovu
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Hledat podle ID zvířete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={handleProcessRecords}
          disabled={processRecords.isPending}
          variant="outline"
        >
          {processRecords.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Syringe className="h-4 w-4 mr-2" />
          )}
          Aktualizovat data
        </Button>
      </div>

      {/* Stats card */}
      {animals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Přehled vakcinací
            </CardTitle>
            <CardDescription>
              Celkem zvířat: {animals.length} | Vakcinovaných:{" "}
              {
                animals.filter(
                  (a: AnimalWithLatestVaccinationClient) =>
                    a.latestVaccinationDate,
                ).length
              }{" "}
              | Nevakcinovaných:{" "}
              {
                animals.filter(
                  (a: AnimalWithLatestVaccinationClient) =>
                    !a.latestVaccinationDate,
                ).length
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Načítání dat...</span>
        </div>
      )}

      {/* Animals table */}
      {!isLoading && filteredAnimals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seznam zvířat</CardTitle>
            <CardDescription>
              Klikněte na zvíře pro zobrazení detailní historie vakcinací
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID zvířete</TableHead>
                  <TableHead>Poslední vakcinace</TableHead>
                  <TableHead>Název vakcíny</TableHead>
                  <TableHead>Celkem vakcinací</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map(
                  (animal: AnimalWithLatestVaccinationClient) => (
                    <TableRow
                      key={animal.animalId}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link
                          href={`/animal/${animal.animalId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          #{animal.animalId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatDate(animal.latestVaccinationDate)}
                      </TableCell>
                      <TableCell>{animal.latestVaccineName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {animal.totalVaccinations}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {animal.latestVaccinationDate ? (
                          <Badge variant="default">Vakcinováno</Badge>
                        ) : (
                          <Badge variant="destructive">Bez vakcinace</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && filteredAnimals.length === 0 && animals && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Syringe className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Žádná zvířata nenalezena</CardTitle>
            <CardDescription>
              {searchTerm
                ? `Nebyla nalezena žádná zvířata odpovídající hledání "${searchTerm}"`
                : "Zkuste aktualizovat data nebo zkontrolovat připojení k databázi."}
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Process records result */}
      {processRecords.data && (
        <Alert>
          <Syringe className="h-4 w-4" />
          <AlertDescription>
            Zpracování dokončeno: {processRecords.data.totalRecords} záznamů,
            {processRecords.data.totalVaccinations} vakcinací nalezeno,
            {processRecords.data.processedAnimals} zvířat zpracováno.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
