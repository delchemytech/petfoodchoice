"use client";

import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { FormMessage } from "@/modules/common/ui/form-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import {
  BREED_SIZE_OPTIONS,
  FLAVOR_SUGGESTIONS,
  FOOD_TYPE_OPTIONS,
  LIFE_STAGE_OPTIONS,
  PACK_WEIGHT_UNIT_OPTIONS,
  PET_TYPE_OPTIONS,
  SELECT_NONE_VALUE,
} from "@/modules/common/lib/product-attribute-options";
import { cn } from "@/modules/common/utils";
import type { AddProductFormValues } from "../../types/add-product";

interface PetFoodAttributeFieldsProps {
  values: AddProductFormValues;
  errors?: Partial<Record<keyof AddProductFormValues, string>>;
  onChange: <K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K],
  ) => void;
}

function fieldClassName(hasError: boolean) {
  return cn(hasError && "border-destructive");
}

function optionalSelectValue(value: string) {
  return value.trim() ? value : SELECT_NONE_VALUE;
}

function optionalSelectChange(value: string) {
  return value === SELECT_NONE_VALUE ? "" : value;
}

export function PetFoodAttributeFields({
  values,
  errors,
  onChange,
}: PetFoodAttributeFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pet Food Attributes</CardTitle>
        <CardDescription>
          Pet type, life stage, pack size, and flavor. Auto-filled from Amazon
          scrape — edit if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Pet Type</Label>
            <Select
              value={optionalSelectValue(values.petType)}
              onValueChange={(value) => {
                if (value) onChange("petType", optionalSelectChange(value));
              }}
            >
              <SelectTrigger
                className={cn("w-full", fieldClassName(Boolean(errors?.petType)))}
                aria-invalid={Boolean(errors?.petType)}
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE_VALUE}>Not set</SelectItem>
                {PET_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors?.petType} />
          </div>

          <div className="space-y-2">
            <Label>Life Stage</Label>
            <Select
              value={optionalSelectValue(values.lifeStage)}
              onValueChange={(value) => {
                if (value) onChange("lifeStage", optionalSelectChange(value));
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldClassName(Boolean(errors?.lifeStage)),
                )}
                aria-invalid={Boolean(errors?.lifeStage)}
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE_VALUE}>Not set</SelectItem>
                {LIFE_STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors?.lifeStage} />
          </div>

          <div className="space-y-2">
            <Label>Breed Size</Label>
            <Select
              value={optionalSelectValue(values.breedSize)}
              onValueChange={(value) => {
                if (value) onChange("breedSize", optionalSelectChange(value));
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldClassName(Boolean(errors?.breedSize)),
                )}
                aria-invalid={Boolean(errors?.breedSize)}
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE_VALUE}>Not set</SelectItem>
                {BREED_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors?.breedSize} />
          </div>

          <div className="space-y-2">
            <Label>Food Type</Label>
            <Select
              value={optionalSelectValue(values.foodType)}
              onValueChange={(value) => {
                if (value) onChange("foodType", optionalSelectChange(value));
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldClassName(Boolean(errors?.foodType)),
                )}
                aria-invalid={Boolean(errors?.foodType)}
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE_VALUE}>Not set</SelectItem>
                {FOOD_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors?.foodType} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="flavor">Flavor</Label>
            <Input
              id="flavor"
              list="pet-food-flavor-suggestions"
              value={values.flavor}
              onChange={(event) => onChange("flavor", event.target.value)}
              placeholder="e.g. Chicken, Salmon"
              aria-invalid={Boolean(errors?.flavor)}
              className={fieldClassName(Boolean(errors?.flavor))}
            />
            <datalist id="pet-food-flavor-suggestions">
              {FLAVOR_SUGGESTIONS.map((flavor) => (
                <option key={flavor} value={flavor} />
              ))}
            </datalist>
            <FormMessage message={errors?.flavor} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packWeight">Pack Weight</Label>
            <Input
              id="packWeight"
              type="number"
              min="0"
              step="0.001"
              value={values.packWeight}
              onChange={(event) => onChange("packWeight", event.target.value)}
              placeholder="e.g. 3"
              aria-invalid={Boolean(errors?.packWeight)}
              className={fieldClassName(Boolean(errors?.packWeight))}
            />
            <FormMessage message={errors?.packWeight} />
          </div>

          <div className="space-y-2">
            <Label>Pack Weight Unit</Label>
            <Select
              value={optionalSelectValue(values.packWeightUnit)}
              onValueChange={(value) => {
                if (value) {
                  onChange("packWeightUnit", optionalSelectChange(value));
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldClassName(Boolean(errors?.packWeightUnit)),
                )}
                aria-invalid={Boolean(errors?.packWeightUnit)}
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE_VALUE}>Not set</SelectItem>
                {PACK_WEIGHT_UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors?.packWeightUnit} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packCount">Pack Count</Label>
            <Input
              id="packCount"
              type="number"
              min="1"
              step="1"
              value={values.packCount}
              onChange={(event) => onChange("packCount", event.target.value)}
              placeholder="e.g. 1"
              aria-invalid={Boolean(errors?.packCount)}
              className={fieldClassName(Boolean(errors?.packCount))}
            />
            <FormMessage message={errors?.packCount} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
