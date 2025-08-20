"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  RefreshCw,
  Syringe,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/providers/trpc-provider";
import type { VaccinationClient } from "@/server/types";
import { ContextModal } from "./context-modal";

interface AnimalDetailProps {
  animalId: number;
}

export function AnimalDetail({ animalId }: AnimalDetailProps) {
  const {
    data: animalData,
    isLoading,
    error,
    refetch,
  } = trpc.getAnimalVaccinationHistory.useQuery({ animalId });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatConfidence = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "default";

    if (percentage >= 90) variant = "default";
    else if (percentage >= 70) variant = "secondary";
    else variant = "destructive";

    return <Badge variant={variant}>{percentage}% jistota</Badge>;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Seznam zvířat</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Zvíře #{animalId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Chyba při načítání dat pro zvíře #{animalId}: {error.message}
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Seznam zvířat</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Zvíře #{animalId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na seznam
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Syringe className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Zvíře #{animalId}</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Načítání historie vakcinací..."
              : `${animalData?.vaccinations.length || 0} záznamů vakcinací`}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Načítání historie vakcinací...</span>
        </div>
      )}

      {/* Vaccination history */}
      {!isLoading && animalData && (
        <>
          {/* Summary card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Přehled vakcinací
              </CardTitle>
              <CardDescription>
                {animalData.vaccinations.length === 0
                  ? "Žádné záznamy o vakcinacích"
                  : `Poslední vakcinace: ${formatDate(new Date(animalData.vaccinations[0].vaccinationDate))}`}
              </CardDescription>
            </CardHeader>
            {animalData.vaccinations.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {animalData.vaccinations.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Celkem vakcinací
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {
                        new Set(
                          animalData.vaccinations.map(
                            (v: VaccinationClient) => v.vaccineName,
                          ),
                        ).size
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Různých vakcín
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(
                        (animalData.vaccinations.reduce(
                          (sum: number, v: VaccinationClient) =>
                            sum + v.confidence,
                          0,
                        ) /
                          animalData.vaccinations.length) *
                          100,
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Průměrná jistota
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Vaccination history table */}
          {animalData.vaccinations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Historie vakcinací</CardTitle>
                <CardDescription>
                  Chronologický seznam všech vakcinací (nejnovější první)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum vakcinace</TableHead>
                      <TableHead>Název vakcíny</TableHead>
                      <TableHead>Jistota extrakce</TableHead>
                      <TableHead>ID návštěvy</TableHead>
                      <TableHead>Kontext</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animalData.vaccinations.map(
                      (vaccination: VaccinationClient) => (
                        <TableRow key={vaccination.id}>
                          <TableCell className="font-medium">
                            {formatDate(new Date(vaccination.vaccinationDate))}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {vaccination.vaccineName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatConfidence(vaccination.confidence)}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              #{vaccination.sourceVisitId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ContextModal
                              vaccineName={vaccination.vaccineName}
                              context={
                                vaccination.extractedText ||
                                "Žádný kontext k dispozici"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            /* Empty state */
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Syringe className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">
                  Žádné záznamy o vakcinacích
                </CardTitle>
                <CardDescription className="mb-4">
                  Pro zvíře #{animalId} nebyly nalezeny žádné záznamy o
                  vakcinacích.
                </CardDescription>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aktualizovat data
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
