"use client";

import { useEffect, useState } from "react";
import { Button } from "@/modules/common/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/common/ui/dialog";
import { PetFoodAttributeFields } from "@/modules/admin/products/components/add-product/pet-food-attribute-fields";
import type { BulkFetchedProduct } from "../types";

interface BulkFetchPetFoodEditDialogProps {
  product: BulkFetchedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: BulkFetchedProduct) => void;
}

export function BulkFetchPetFoodEditDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: BulkFetchPetFoodEditDialogProps) {
  const [draft, setDraft] = useState<BulkFetchedProduct | null>(null);

  useEffect(() => {
    if (product) {
      setDraft({ ...product });
    }
  }, [product]);

  if (!draft) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit pet food attributes</DialogTitle>
          <DialogDescription>
            {draft.name || draft.asin}
          </DialogDescription>
        </DialogHeader>

        <PetFoodAttributeFields
          values={draft}
          onChange={(key, value) => {
            setDraft((current) =>
              current ? { ...current, [key]: value } : current,
            );
          }}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save attributes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
