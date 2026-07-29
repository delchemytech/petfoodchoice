"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/modules/common/ui/sheet";

const navLinks = [
  { href: "/#picks", label: "Shop" },
  { href: "/blogs", label: "Blogs" },
  { href: "/#trust", label: "How we pick" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="size-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            PET<span className="text-primary">FOODCHOICE</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden rounded-full sm:inline-flex"
            aria-label="Search"
          >
            <Search />
          </Button>

          <Button
            className="hidden rounded-full px-4 sm:inline-flex"
            render={<Link href="/#picks" />}
          >
            <ShoppingBag data-icon="inline-start" />
            Shop picks
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  className="mt-4 w-full rounded-full"
                  render={<Link href="/#picks" onClick={() => setOpen(false)} />}
                >
                  Shop picks
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
