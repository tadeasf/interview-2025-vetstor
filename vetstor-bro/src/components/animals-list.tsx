"use client";

import {
  AlertCircle,
  ArrowUpDown,
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

type SortField = 'animalId' | 'latestVaccinationDate' | 'latestVaccineName' | 'totalVaccinations' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AnimalsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('animalId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  // Filter and sort animals
  const filteredAndSortedAnimals = (() => {
    const filtered = animals?.filter((animal: AnimalWithLatestVaccinationClient) =>
      animal.animalId.toString().includes(searchTerm),
    ) || [];

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'animalId':
          comparison = a.animalId - b.animalId;
          break;
        case 'latestVaccinationDate':
          const dateA = a.latestVaccinationDate ? new Date(a.latestVaccinationDate).getTime() : 0;
          const dateB = b.latestVaccinationDate ? new Date(b.latestVaccinationDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'latestVaccineName':
          const nameA = a.latestVaccineName || '';
          const nameB = b.latestVaccineName || '';
          comparison = nameA.localeCompare(nameB, 'cs-CZ');
          break;
        case 'totalVaccinations':
          comparison = a.totalVaccinations - b.totalVaccinations;
          break;
        case 'status':
          const statusA = a.latestVaccinationDate ? 1 : 0;
          const statusB = b.latestVaccinationDate ? 1 : 0;
          comparison = statusA - statusB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  })();

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

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
      {!isLoading && filteredAndSortedAnimals.length > 0 && (
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
                  <SortableHeader field="animalId">ID zvířete</SortableHeader>
                  <SortableHeader field="latestVaccinationDate">Poslední vakcinace</SortableHeader>
                  <SortableHeader field="latestVaccineName">Název vakcíny</SortableHeader>
                  <SortableHeader field="totalVaccinations">Celkem vakcinací</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAnimals.map(
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
      {!isLoading && filteredAndSortedAnimals.length === 0 && animals && (
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
