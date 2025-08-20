"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ContextModalProps {
  vaccineName: string;
  context: string;
}

export function ContextModal({ vaccineName, context }: ContextModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kontext extrakce vakcíny</DialogTitle>
          <DialogDescription>
            Detailní kontext pro vakcínu: <strong>{vaccineName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">
              Původní text / Fakturační položky:
            </h4>
            <div className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded border max-h-96 overflow-y-auto">
              {context}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
