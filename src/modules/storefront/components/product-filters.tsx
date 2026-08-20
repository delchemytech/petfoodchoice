"use client";

import { Checkbox } from "@/modules/common/ui/checkbox";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { cn } from "@/modules/common/utils";
import { formatPrice } from "../lib/format-price";
import {
  RATING_FILTER_OPTIONS,
  type ProductFilterState,
} from "../lib/filter-products";

interface ProductFiltersProps {
  filters: ProductFilterState;
  categories: string[];
  brands: { name: string; count: number }[];
  petTypes: { name: string; count: number }[];
  lifeStages: { name: string; count: number }[];
  breedSizes: { name: string; count: number }[];
  foodTypes: { name: string; count: number }[];
  flavors: { name: string; count: number }[];
  priceBounds: { min: number; max: number };
  packWeightBounds: { min: number; max: number };
  currency: string;
  onChange: (next: ProductFilterState) => void;
  onClear: () => void;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border/70 pb-5 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function CheckboxFilterList({
  options,
  selected,
  onToggle,
}: {
  options: { name: string; count: number }[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
      {options.map((option) => {
        const checked = selected.includes(option.name);
        const disabled = option.count === 0 && !checked;
        return (
          <label
            key={option.name}
            className={cn(
              "flex items-center gap-2 text-sm text-foreground",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
          >
            <Checkbox
              checked={checked}
              disabled={disabled}
              onCheckedChange={() => {
                if (!disabled) onToggle(option.name);
              }}
            />
            <span className="min-w-0 flex-1 truncate">{option.name}</span>
            <span className="text-xs text-muted-foreground">
              ({option.count})
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function ProductFilters({
  filters,
  categories,
  brands,
  petTypes,
  lifeStages,
  breedSizes,
  foodTypes,
  flavors,
  priceBounds,
  packWeightBounds,
  currency,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const categoryOptions = ["All", ...categories];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Filters</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterSection title="Category">
        <div className="space-y-2">
          {categoryOptions.map((category) => {
            const checked = filters.category === category;
            return (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => {
                    if (nextChecked === true) {
                      onChange({ ...filters, category });
                    }
                  }}
                />
                <span>{category}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {petTypes.length > 0 ? (
        <FilterSection title="Pet Type">
          <CheckboxFilterList
            options={petTypes}
            selected={filters.petTypes}
            onToggle={(name) =>
              onChange({
                ...filters,
                petTypes: toggleValue(filters.petTypes, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      {lifeStages.length > 0 ? (
        <FilterSection title="Life Stage">
          <CheckboxFilterList
            options={lifeStages}
            selected={filters.lifeStages}
            onToggle={(name) =>
              onChange({
                ...filters,
                lifeStages: toggleValue(filters.lifeStages, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      {breedSizes.length > 0 ? (
        <FilterSection title="Breed Size">
          <CheckboxFilterList
            options={breedSizes}
            selected={filters.breedSizes}
            onToggle={(name) =>
              onChange({
                ...filters,
                breedSizes: toggleValue(filters.breedSizes, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      {foodTypes.length > 0 ? (
        <FilterSection title="Food Type">
          <CheckboxFilterList
            options={foodTypes}
            selected={filters.foodTypes}
            onToggle={(name) =>
              onChange({
                ...filters,
                foodTypes: toggleValue(filters.foodTypes, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      {flavors.length > 0 ? (
        <FilterSection title="Flavor">
          <CheckboxFilterList
            options={flavors}
            selected={filters.flavors}
            onToggle={(name) =>
              onChange({
                ...filters,
                flavors: toggleValue(filters.flavors, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      {brands.length > 0 ? (
        <FilterSection title="Brand">
          <CheckboxFilterList
            options={brands}
            selected={filters.brands}
            onToggle={(name) =>
              onChange({
                ...filters,
                brands: toggleValue(filters.brands, name),
              })
            }
          />
        </FilterSection>
      ) : null}

      <FilterSection title="Price">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="filter-min-price" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="filter-min-price"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={priceBounds.min > 0 ? String(priceBounds.min) : "0"}
              value={filters.minPrice ?? ""}
              onChange={(event) => {
                const value = event.target.value.trim();
                onChange({
                  ...filters,
                  minPrice: value ? Number.parseInt(value, 10) : null,
                });
              }}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-max-price" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="filter-max-price"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={priceBounds.max > 0 ? String(priceBounds.max) : "0"}
              value={filters.maxPrice ?? ""}
              onChange={(event) => {
                const value = event.target.value.trim();
                onChange({
                  ...filters,
                  maxPrice: value ? Number.parseInt(value, 10) : null,
                });
              }}
              className="h-8"
            />
          </div>
        </div>
        {priceBounds.max > 0 ? (
          <p className="text-xs text-muted-foreground">
            Range: {formatPrice(priceBounds.min, currency)} –{" "}
            {formatPrice(priceBounds.max, currency)}
          </p>
        ) : null}
      </FilterSection>

      <FilterSection title="Pack Weight (kg)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="filter-min-pack-weight"
              className="text-xs text-muted-foreground"
            >
              Min
            </Label>
            <Input
              id="filter-min-pack-weight"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              placeholder={String(packWeightBounds.min)}
              value={filters.minPackWeight ?? ""}
              onChange={(event) => {
                const value = event.target.value.trim();
                onChange({
                  ...filters,
                  minPackWeight: value ? Number.parseFloat(value) : null,
                });
              }}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="filter-max-pack-weight"
              className="text-xs text-muted-foreground"
            >
              Max
            </Label>
            <Input
              id="filter-max-pack-weight"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              placeholder={String(packWeightBounds.max)}
              value={filters.maxPackWeight ?? ""}
              onChange={(event) => {
                const value = event.target.value.trim();
                onChange({
                  ...filters,
                  maxPackWeight: value ? Number.parseFloat(value) : null,
                });
              }}
              className="h-8"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Range: {packWeightBounds.min} kg – {packWeightBounds.max} kg
        </p>
      </FilterSection>

      <FilterSection title="Customer Review">
        <div className="space-y-2">
          {RATING_FILTER_OPTIONS.map((option) => {
            const checked = filters.minRating === option.value;
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      minRating: checked ? null : option.value,
                    })
                  }
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Offers">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.onSaleOnly}
            onCheckedChange={(checked) =>
              onChange({
                ...filters,
                onSaleOnly: checked === true,
              })
            }
          />
          <span>On sale</span>
        </label>
      </FilterSection>
    </div>
  );
}
