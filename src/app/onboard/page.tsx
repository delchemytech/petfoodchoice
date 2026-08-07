import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";

export default function OnboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="size-5" />
          </div>
          <CardTitle className="text-xl">Please onboard</CardTitle>
          <CardDescription>
            Your account is not linked to a website yet. Contact the
            administrator to complete setup before accessing the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            render={<Link href="/login" />}
            className="w-full"
            nativeButton={false}
          >
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
