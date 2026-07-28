import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/modules/common/ui/card";

export function FetchLoadingState() {
  return (
    <Card className="mx-auto w-full max-w-2xl animate-in fade-in duration-300">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="size-10 animate-spin text-primary" />
        <div className="space-y-1 text-center">
          <p className="font-medium">Fetching product details...</p>
          <p className="text-sm text-muted-foreground">
            Retrieving information from the affiliate link
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
