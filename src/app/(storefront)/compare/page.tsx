import type { Metadata } from "next";
import { ComparePageContent } from "@/modules/storefront/components/compare-page-content";

export const metadata: Metadata = {
  title: "Compare Products | PETFOODCHOICE",
  description:
    "Compare two pet food products side by side — prices, ratings, ingredients, and more.",
};

export default function ComparePage() {
  return <ComparePageContent />;
}
