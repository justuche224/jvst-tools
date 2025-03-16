"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/random-word-generator", label: "Random Word Generator" },
    { href: "/color-tools", label: "Color Tools" },
    { href: "/random-decision-maker", label: "Random Decision Maker" },
    { href: "/regex-pattern-tester", label: "Regex Pattern Tester" },
    { href: "/unit-converter", label: "Unit Converter" },
  ];

  return (
    <nav className="flex justify-between items-center px-4 md:px-6 py-3 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="font-bold text-lg">Jvst Tools</div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex space-x-1 lg:space-x-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              pathname === link.href
                ? "bg-accent text-accent-foreground"
                : "text-foreground/80"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}

      <div className="flex items-center">
        <ModeToggle />
        <div className="flex lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTitle className="sr-only">Tools</SheetTitle>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
