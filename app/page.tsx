"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tools = [
  {
    name: "Alphabet Generator",
    description:
      "Generate custom alphabets and character sets for your projects",
    path: "/random-word-generator",
    icon: "🔤",
  },
  {
    name: "Color Format Converter",
    description:
      "Convert between HEX, RGB, HSL and other color formats effortlessly",
    path: "/color-tools",
    icon: "🎨",
  },
  {
    name: "Random Decision Maker",
    description:
      "Let algorithms make random choices when you're stuck deciding",
    path: "/random-decision-maker",
    icon: "🎲",
  },
  {
    name: "Regex Pattern Tester",
    description:
      "Test, validate and debug your regular expressions with real-time feedback",
    path: "/regex-pattern-tester",
    icon: "🔍",
  },
  {
    name: "Unit Converter",
    description:
      "Convert between different units of measurement with precision",
    path: "/unit-converter",
    icon: "📏",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            JVST <span className="text-primary">Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A collection of beautifully designed, powerful utilities you never
            knew you needed
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={tools[0].path}>
                Source code <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Contribute</Link>
            </Button>
          </div>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {tools.map((tool) => (
            <motion.div key={tool.path} variants={item} className="shadow-md">
              <Link href={tool.path} className="block h-full">
                <Card className="h-full overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tool.icon}</span>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <span className="text-sm text-primary font-medium">
                      Explore Tool
                    </span>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
