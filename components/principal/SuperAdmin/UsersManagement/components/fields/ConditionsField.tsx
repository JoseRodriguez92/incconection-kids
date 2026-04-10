"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import type { ConditionItem } from "../../types";

interface ConditionsFieldProps {
  conditions: ConditionItem[];
  catalog: ConditionItem[];
  selectedConditionId: string;
  onSelectConditionId: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function ConditionsField({
  conditions,
  catalog,
  selectedConditionId,
  onSelectConditionId,
  onAdd,
  onRemove,
  disabled,
}: ConditionsFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Condiciones de aprendizaje</Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px] bg-gray-50">
        {conditions.length > 0 ? (
          conditions.map((c) => (
            <Badge
              key={c.id}
              variant="secondary"
              className="text-sm px-3 py-1 flex items-center gap-2"
            >
              {c.name}
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                className="hover:bg-red-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Sin condiciones asignadas</span>
        )}
      </div>
      <div className="flex gap-2">
        <Select
          value={selectedConditionId}
          onValueChange={onSelectConditionId}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Agregar condición..." />
          </SelectTrigger>
          <SelectContent>
            {catalog
              .filter((c) => !conditions.some((x) => x.id === c.id))
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!selectedConditionId || disabled}
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
