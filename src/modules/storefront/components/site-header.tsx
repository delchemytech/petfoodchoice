"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/modules/common/ui/sheet";
import { HeaderSearch } from "./header-search";

const navLinks = [
  { href: "/#picks", label: "Shop" },
  { href: "/blogs", label: "Blogs" },
  { href: "/#trust", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-auto max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:h-16 lg:flex-row lg:items-center lg:gap-4 lg:py-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <ShoppingBag className="size-4" />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Pet<span className="text-primary">foodchoice</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-8 md:flex lg:ml-0">
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

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
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
                    render={
                      <Link href="/#picks" onClick={() => setOpen(false)} />
                    }
                  >
                    Shop picks
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 lg:ml-auto lg:w-auto">
          <HeaderSearch />
          <Button
            className="hidden rounded-full px-4 sm:inline-flex"
            render={<Link href="/#picks" />}
          >
            <ShoppingBag data-icon="inline-start" />
            Shop picks
          </Button>
        </div>
      </div>
    </header>
  );
}
