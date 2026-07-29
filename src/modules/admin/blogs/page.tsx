import { getBlogs } from "./actions/get-blogs";
import { BlogsPageContent } from "./components/blogs-page-content";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return <BlogsPageContent initialBlogs={blogs} />;
}
