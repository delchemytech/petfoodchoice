import StorefrontPage from "@/modules/storefront/page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <StorefrontPage searchParams={params} />;
}
