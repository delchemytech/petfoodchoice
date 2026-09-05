import type { Metadata } from "next";
import StorefrontPage from "@/modules/storefront/page";

export const metadata: Metadata = {
  title: "Buy Pet food for Dogs & Cats Online in India | Petfoodchoice",
  description: "Buy premium pet food for dogs and cats online in India at Petfoodchoice. Explore nutritious dog and cat food from trusted brands at great prices. Shop now!",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <StorefrontPage searchParams={params} />;
}
