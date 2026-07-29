import { cn } from "@/modules/common/utils";

interface BlogSidebarPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BlogSidebarPanel({
  title,
  children,
  className,
}: BlogSidebarPanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-sm border border-[#c3c4c7] bg-white shadow-sm",
        className,
      )}
    >
      <header className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-3 py-2">
        <h3 className="text-[13px] font-semibold text-[#1d2327]">{title}</h3>
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
