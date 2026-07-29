import type { Metadata } from "next";
import { getStorefrontBlogCategories } from "@/modules/storefront/actions/get-blog-categories";
import { getStorefrontBlogs } from "@/modules/storefront/actions/get-blogs";
import { BlogsCatalog } from "@/modules/storefront/components/blogs-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs | PETFOODCHOICE",
  description:
    "Pet care tips, nutrition guides, and product advice from PETFOODCHOICE.",
};

export default async function BlogsPage() {
  const [blogs, categories] = await Promise.all([
    getStorefrontBlogs(),
    getStorefrontBlogCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
          Blogs
        </h1>
      </div>

      <BlogsCatalog blogs={blogs} categories={categories} />
    </div>
  );
}
