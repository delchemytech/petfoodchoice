import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/common/ui/table";
import { Button } from "@/modules/common/ui/button";
import { Badge } from "@/modules/common/ui/badge";
import type { RecentProduct } from "../types";

interface RecentProductsTableProps {
  products: RecentProduct[];
}

export function RecentProductsTable({ products }: RecentProductsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>Latest products in your catalog</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          render={<Link href="/admin/products" />}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No products yet. Add your first product to get started.
          </p>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="line-clamp-2 font-medium leading-snug">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.store} · {product.category}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm font-medium tabular-nums">
                      {product.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden lg:table-cell">Store</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="max-w-[220px] whitespace-normal">
                        <span
                          className="block truncate font-medium"
                          title={product.name}
                        >
                          {product.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground lg:hidden">
                          {product.store} · {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-[120px] truncate lg:table-cell">
                        {product.store}
                      </TableCell>
                      <TableCell className="hidden max-w-[140px] truncate lg:table-cell">
                        {product.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            product.status === "active" ? "default" : "secondary"
                          }
                        >
                          {product.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {product.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
