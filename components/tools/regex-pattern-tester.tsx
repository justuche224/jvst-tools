"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Save, Info, Trash2, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";

// Common regex patterns with descriptions
const commonPatterns = [
  {
    id: "email",
    name: "Email Address",
    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    description: "Matches a valid email address format",
    example: "example@domain.com",
  },
  {
    id: "phone",
    name: "Phone Number (US)",
    pattern: "^(\\+\\d{1,2}\\s)?$$?\\d{3}$$?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$",
    description: "Matches US phone numbers in various formats",
    example: "(123) 456-7890, 123-456-7890, 123.456.7890",
  },
  {
    id: "url",
    name: "URL",
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "Matches URLs (http or https)",
    example: "https://www.example.com",
  },
  {
    id: "date",
    name: "Date (MM/DD/YYYY)",
    pattern: "^(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])\\/(19|20)\\d{2}$",
    description: "Matches dates in MM/DD/YYYY format",
    example: "01/31/2023",
  },
  {
    id: "time",
    name: "Time (24-hour)",
    pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
    description: "Matches time in 24-hour format (HH:MM)",
    example: "13:45",
  },
  {
    id: "ipv4",
    name: "IPv4 Address",
    pattern:
      "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    description: "Matches a valid IPv4 address",
    example: "192.168.1.1",
  },
  {
    id: "zipcode",
    name: "Zip Code (US)",
    pattern: "^\\d{5}(?:[-\\s]\\d{4})?$",
    description: "Matches US zip codes (5 digits or 5+4 format)",
    example: "12345, 12345-6789",
  },
  {
    id: "password",
    name: "Strong Password",
    pattern:
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    description:
      "Matches passwords with at least 8 characters, one uppercase, one lowercase, one number and one special character",
    example: "Password1!",
  },
];

// Regex building blocks with descriptions
const regexBlocks = [
  {
    id: "any-digit",
    name: "Any Digit",
    pattern: "\\d",
    description: "Matches any digit (0-9)",
  },
  {
    id: "any-non-digit",
    name: "Any Non-Digit",
    pattern: "\\D",
    description: "Matches any character that is not a digit",
  },
  {
    id: "any-word-char",
    name: "Any Word Character",
    pattern: "\\w",
    description: "Matches any word character (alphanumeric + underscore)",
  },
  {
    id: "any-non-word-char",
    name: "Any Non-Word Character",
    pattern: "\\W",
    description: "Matches any non-word character",
  },
  {
    id: "any-whitespace",
    name: "Any Whitespace",
    pattern: "\\s",
    description: "Matches any whitespace character (spaces, tabs, line breaks)",
  },
  {
    id: "any-non-whitespace",
    name: "Any Non-Whitespace",
    pattern: "\\S",
    description: "Matches any character that is not a whitespace",
  },
  {
    id: "any-char",
    name: "Any Character",
    pattern: ".",
    description: "Matches any character except line breaks",
  },
  {
    id: "zero-or-more",
    name: "Zero or More",
    pattern: "*",
    description: "Matches 0 or more of the preceding character",
  },
  {
    id: "one-or-more",
    name: "One or More",
    pattern: "+",
    description: "Matches 1 or more of the preceding character",
  },
  {
    id: "zero-or-one",
    name: "Zero or One",
    pattern: "?",
    description: "Matches 0 or 1 of the preceding character",
  },
  {
    id: "start-of-line",
    name: "Start of Line",
    pattern: "^",
    description: "Matches the start of a line",
  },
  {
    id: "end-of-line",
    name: "End of Line",
    pattern: "$",
    description: "Matches the end of a line",
  },
  {
    id: "digit-range",
    name: "Digit Range",
    pattern: "[0-9]",
    description: "Matches any digit from 0 to 9",
  },
  {
    id: "letter-range-lower",
    name: "Lowercase Letters",
    pattern: "[a-z]",
    description: "Matches any lowercase letter from a to z",
  },
  {
    id: "letter-range-upper",
    name: "Uppercase Letters",
    pattern: "[A-Z]",
    description: "Matches any uppercase letter from A to Z",
  },
  {
    id: "not-in-range",
    name: "Not in Range",
    pattern: "[^...]",
    description: "Matches any character not in the brackets",
  },
  {
    id: "or",
    name: "Or",
    pattern: "|",
    description: "Matches either the expression before or after the |",
  },
  {
    id: "group",
    name: "Group",
    pattern: "(...)",
    description:
      "Groups multiple tokens together and captures the matched substring",
  },
  {
    id: "non-capturing-group",
    name: "Non-Capturing Group",
    pattern: "(?:...)",
    description: "Groups multiple tokens together without capturing the match",
  },
  {
    id: "exact-count",
    name: "Exact Count",
    pattern: "{n}",
    description: "Matches exactly n occurrences of the preceding character",
  },
  {
    id: "min-max-count",
    name: "Min-Max Count",
    pattern: "{min,max}",
    description:
      "Matches between min and max occurrences of the preceding character",
  },
];

interface SavedPattern {
  id: string;
  name: string;
  pattern: string;
  description?: string;
  date: string;
}

export default function RegexPatternTester() {
  const [pattern, setPattern] = useState<string>("");
  const [testText, setTestText] = useState<string>("");
  const [flags, setFlags] = useState<string>("g");
  const [matches, setMatches] = useState<RegExpMatchArray | null>(null);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [patternName, setPatternName] = useState<string>("");
  const [patternDescription, setPatternDescription] = useState<string>("");
  const [highlightedText, setHighlightedText] = useState<string>("");

  const testTextRef = useRef<HTMLTextAreaElement>(null);

  // Load saved patterns from localStorage
  useEffect(() => {
    const savedPatternsFromStorage = localStorage.getItem("regexSavedPatterns");
    if (savedPatternsFromStorage) {
      try {
        setSavedPatterns(JSON.parse(savedPatternsFromStorage));
      } catch (e) {
        console.error("Failed to parse saved patterns from localStorage", e);
      }
    }
  }, []);

  // Test the regex pattern against the test text
  const testPattern = () => {
    if (!pattern) {
      setMatches(null);
      setMatchCount(0);
      setHighlightedText(testText);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      setErrorMessage("");

      // Find all matches
      const allMatches = Array.from(testText.matchAll(regex));
      setMatches(allMatches.length > 0 ? allMatches : null);
      setMatchCount(allMatches.length);

      // Highlight matches in the test text
      highlightMatches(allMatches);
    } catch (e) {
      setIsValid(false);
      setErrorMessage((e as Error).message);
      setMatches(null);
      setMatchCount(0);
      setHighlightedText(testText);
    }
  };

  // Highlight matches in the test text
  const highlightMatches = (matches: RegExpMatchArray[]) => {
    if (!matches || matches.length === 0) {
      setHighlightedText(testText);
      return;
    }

    // Sort matches by index to handle overlapping matches correctly
    const sortedMatches = [...matches].sort((a, b) => {
      return (a.index || 0) - (b.index || 0);
    });

    let result = "";
    let lastIndex = 0;

    for (const match of sortedMatches) {
      const matchIndex = match.index || 0;
      const matchText = match[0];

      // Add text before the match
      if (matchIndex > lastIndex) {
        result += testText.substring(lastIndex, matchIndex);
      }

      // Add the highlighted match
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800">${matchText}</mark>`;

      lastIndex = matchIndex + matchText.length;
    }

    // Add any remaining text after the last match
    if (lastIndex < testText.length) {
      result += testText.substring(lastIndex);
    }

    setHighlightedText(result);
  };

  // Save the current pattern
  const savePattern = () => {
    if (!pattern) {
      toast({
        title: "Cannot save empty pattern",
        description: "Please enter a pattern before saving.",
        duration: 3000,
      });
      return;
    }

    if (!patternName) {
      toast({
        title: "Name required",
        description: "Please enter a name for your pattern.",
        duration: 3000,
      });
      return;
    }

    const newPattern: SavedPattern = {
      id: Date.now().toString(),
      name: patternName,
      pattern: pattern,
      description: patternDescription,
      date: new Date().toLocaleString(),
    };

    const updatedPatterns = [newPattern, ...savedPatterns];
    setSavedPatterns(updatedPatterns);
    localStorage.setItem("regexSavedPatterns", JSON.stringify(updatedPatterns));

    toast({
      title: "Pattern saved",
      description: `"${patternName}" has been saved to your patterns.`,
      duration: 2000,
    });

    // Reset form
    setPatternName("");
    setPatternDescription("");
  };

  // Load a pattern
  const loadPattern = (savedPattern: SavedPattern) => {
    setPattern(savedPattern.pattern);
    setPatternName(savedPattern.name);
    setPatternDescription(savedPattern.description || "");

    // Test the pattern immediately
    setTimeout(() => {
      testPattern();
    }, 0);

    toast({
      title: "Pattern loaded",
      description: `"${savedPattern.name}" has been loaded.`,
      duration: 2000,
    });
  };

  // Delete a saved pattern
  const deletePattern = (id: string) => {
    const updatedPatterns = savedPatterns.filter((p) => p.id !== id);
    setSavedPatterns(updatedPatterns);
    localStorage.setItem("regexSavedPatterns", JSON.stringify(updatedPatterns));

    toast({
      title: "Pattern deleted",
      description: "The pattern has been removed from your saved patterns.",
      duration: 2000,
    });
  };

  // Load a common pattern
  const loadCommonPattern = (pattern: (typeof commonPatterns)[0]) => {
    setPattern(pattern.pattern);
    setPatternName(pattern.name);
    setPatternDescription(pattern.description);
    setTestText(pattern.example);

    // Test the pattern immediately
    setTimeout(() => {
      testPattern();
    }, 0);
  };

  // Add a regex block to the pattern
  const addRegexBlock = (block: (typeof regexBlocks)[0]) => {
    setPattern((prev) => prev + block.pattern);

    // Test the pattern immediately
    setTimeout(() => {
      testPattern();
    }, 0);
  };

  // Run the test whenever pattern, flags, or test text changes
  useEffect(() => {
    testPattern();
  }, [pattern, flags, testText]);

  // Helper component for tooltips
  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Regex Pattern Tester & Generator
          </CardTitle>
          <CardDescription>
            Build, test, and save regular expressions with real-time feedback
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pattern Builder Panel */}
            <div className="space-y-6">
              <Tabs defaultValue="builder" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="library">Pattern Library</TabsTrigger>
                  <TabsTrigger value="saved">Saved Patterns</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Label htmlFor="pattern">Regular Expression</Label>
                      {!isValid && (
                        <Badge variant="destructive" className="ml-2">
                          Invalid
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          /
                        </span>
                        <Input
                          id="pattern"
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          className="pl-6 pr-12 font-mono"
                          placeholder="Enter regex pattern..."
                        />
                        <span className="absolute right-8 top-2.5 text-muted-foreground">
                          /
                        </span>
                        <Input
                          value={flags}
                          onChange={(e) => setFlags(e.target.value)}
                          className="absolute right-0 top-0 w-7 font-mono text-center"
                          maxLength={4}
                        />
                      </div>
                      <Button onClick={testPattern} size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    {!isValid && (
                      <p className="text-sm text-destructive mt-1">
                        {errorMessage}
                      </p>
                    )}
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-muted-foreground">
                        Flags:
                      </span>
                      <div className="flex gap-2 ml-2">
                        <Badge
                          variant={flags.includes("g") ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setFlags((prev) =>
                              prev.includes("g")
                                ? prev.replace("g", "")
                                : prev + "g"
                            )
                          }
                        >
                          g <InfoTooltip content="Global - Find all matches" />
                        </Badge>
                        <Badge
                          variant={flags.includes("i") ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setFlags((prev) =>
                              prev.includes("i")
                                ? prev.replace("i", "")
                                : prev + "i"
                            )
                          }
                        >
                          i <InfoTooltip content="Case Insensitive" />
                        </Badge>
                        <Badge
                          variant={flags.includes("m") ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setFlags((prev) =>
                              prev.includes("m")
                                ? prev.replace("m", "")
                                : prev + "m"
                            )
                          }
                        >
                          m{" "}
                          <InfoTooltip content="Multiline - ^ and $ match start/end of line" />
                        </Badge>
                        <Badge
                          variant={flags.includes("s") ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setFlags((prev) =>
                              prev.includes("s")
                                ? prev.replace("s", "")
                                : prev + "s"
                            )
                          }
                        >
                          s{" "}
                          <InfoTooltip content="Dot All - . matches newlines too" />
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="save-name">Save This Pattern</Label>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      <Input
                        id="save-name"
                        value={patternName}
                        onChange={(e) => setPatternName(e.target.value)}
                        placeholder="Pattern name..."
                      />
                      <Textarea
                        value={patternDescription}
                        onChange={(e) => setPatternDescription(e.target.value)}
                        placeholder="Description (optional)..."
                        rows={2}
                      />
                      <Button onClick={savePattern} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Save Pattern
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Building Blocks</Label>
                    <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto p-1 border rounded-md">
                      {regexBlocks.map((block) => (
                        <TooltipProvider key={block.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => addRegexBlock(block)}
                              >
                                {block.pattern}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{block.name}</p>
                              <p className="text-sm">{block.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="library" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Click on any pattern to load it into the editor
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {commonPatterns.map((commonPattern) => (
                      <Card key={commonPattern.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {commonPattern.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {commonPattern.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadCommonPattern(commonPattern)}
                            >
                              Load
                            </Button>
                          </div>
                          <div className="mt-2">
                            <code className="text-xs bg-muted p-1 rounded font-mono block overflow-x-auto">
                              {commonPattern.pattern}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: {commonPattern.example}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  {savedPatterns.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      No saved patterns yet. Create and save a pattern to see it
                      here.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedPatterns.map((savedPattern) => (
                        <Card key={savedPattern.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  {savedPattern.name}
                                </h4>
                                {savedPattern.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {savedPattern.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {savedPattern.date}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => loadPattern(savedPattern)}
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePattern(savedPattern.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <code className="text-xs bg-muted p-1 rounded font-mono block overflow-x-auto">
                                {savedPattern.pattern}
                              </code>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="test-text">Test Text</Label>
                  <span className="text-sm text-muted-foreground">
                    {matchCount} {matchCount === 1 ? "match" : "matches"} found
                  </span>
                </div>
                <Textarea
                  id="test-text"
                  ref={testTextRef}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test your regex against..."
                  rows={5}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Results</h3>
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Highlighted Matches
                        </h4>
                        <div
                          className="min-h-[100px] max-h-[200px] overflow-auto p-3 border rounded-md font-mono text-sm whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: highlightedText }}
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Match Details
                        </h4>
                        {matches && matches.length > 0 ? (
                          <div className="max-h-[200px] overflow-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-left p-2">#</th>
                                  <th className="text-left p-2">Match</th>
                                  <th className="text-left p-2">Position</th>
                                  <th className="text-left p-2">Groups</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.from(matches).map((match, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2 font-mono">
                                      {match[0]}
                                    </td>
                                    <td className="p-2">{match.index}</td>
                                    <td className="p-2">
                                      {match.length > 1 && (
                                        <div className="space-y-1">
                                          {match
                                            .slice(1)
                                            .map((group, groupIndex) => (
                                              <div
                                                key={groupIndex}
                                                className="text-xs"
                                              >
                                                Group {groupIndex + 1}:{" "}
                                                <span className="font-mono">
                                                  {group}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                      {match.length <= 1 && (
                                        <span className="text-muted-foreground text-xs">
                                          No groups
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground border rounded-md">
                            {testText
                              ? "No matches found"
                              : "Enter some test text to see matches"}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Pattern Explanation
                </h3>
                <Card>
                  <CardContent className="p-4">
                    {pattern ? (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="explanation">
                          <AccordionTrigger>
                            What does this pattern do?
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm">
                              <p>This regular expression:</p>
                              <code className="text-xs bg-muted p-1 rounded font-mono block">
                                /{pattern}/{flags}
                              </code>

                              {/* Simple explanation based on pattern characteristics */}
                              <div className="space-y-1 mt-2">
                                {pattern.includes("^") && (
                                  <p>• Matches at the beginning of the text</p>
                                )}
                                {pattern.includes("$") && (
                                  <p>• Matches at the end of the text</p>
                                )}
                                {pattern.includes("\\d") && (
                                  <p>• Looks for digits (0-9)</p>
                                )}
                                {pattern.includes("\\w") && (
                                  <p>
                                    • Looks for word characters (letters,
                                    digits, underscore)
                                  </p>
                                )}
                                {pattern.includes("\\s") && (
                                  <p>
                                    • Looks for whitespace characters (spaces,
                                    tabs, line breaks)
                                  </p>
                                )}
                                {pattern.includes("[") &&
                                  pattern.includes("]") && (
                                    <p>
                                      • Uses character classes to match specific
                                      sets of characters
                                    </p>
                                  )}
                                {pattern.includes("(") &&
                                  pattern.includes(")") && (
                                    <p>
                                      • Contains capturing groups to extract
                                      specific parts of the match
                                    </p>
                                  )}
                                {pattern.includes("+") && (
                                  <p>
                                    • Looks for one or more occurrences of
                                    something
                                  </p>
                                )}
                                {pattern.includes("*") && (
                                  <p>
                                    • Looks for zero or more occurrences of
                                    something
                                  </p>
                                )}
                                {pattern.includes("?") && (
                                  <p>
                                    • Contains optional elements or non-greedy
                                    quantifiers
                                  </p>
                                )}
                                {pattern.includes("|") && (
                                  <p>
                                    • Contains alternatives (matches either this
                                    OR that)
                                  </p>
                                )}
                                {flags.includes("g") && (
                                  <p>
                                    • Searches for all matches in the text
                                    (global flag)
                                  </p>
                                )}
                                {flags.includes("i") && (
                                  <p>
                                    • Ignores case when matching
                                    (case-insensitive flag)
                                  </p>
                                )}
                                {flags.includes("m") && (
                                  <p>
                                    • Treats each line as a separate string for
                                    ^ and $ (multiline flag)
                                  </p>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="breakdown">
                          <AccordionTrigger>Pattern Breakdown</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm">
                              <p>Breaking down each part of the pattern:</p>

                              <div className="space-y-2 mt-2 font-mono text-xs">
                                {pattern.split("").map((char, index) => {
                                  // Determine what this character or sequence means
                                  let explanation = "";

                                  if (char === "^")
                                    explanation = "Start of line/string";
                                  else if (char === "$")
                                    explanation = "End of line/string";
                                  else if (char === ".")
                                    explanation =
                                      "Any character except newline";
                                  else if (
                                    char === "\\" &&
                                    pattern[index + 1] === "d"
                                  )
                                    explanation = "Any digit (0-9)";
                                  else if (
                                    char === "\\" &&
                                    pattern[index + 1] === "w"
                                  )
                                    explanation =
                                      "Any word character (a-z, A-Z, 0-9, _)";
                                  else if (
                                    char === "\\" &&
                                    pattern[index + 1] === "s"
                                  )
                                    explanation = "Any whitespace character";
                                  else if (char === "*")
                                    explanation =
                                      "Zero or more of the preceding character";
                                  else if (char === "+")
                                    explanation =
                                      "One or more of the preceding character";
                                  else if (char === "?")
                                    explanation =
                                      "Zero or one of the preceding character";
                                  else if (char === "|")
                                    explanation = "OR operator";
                                  else if (char === "(")
                                    explanation = "Start of capturing group";
                                  else if (char === ")")
                                    explanation = "End of capturing group";
                                  else if (char === "[")
                                    explanation = "Start of character class";
                                  else if (char === "]")
                                    explanation = "End of character class";
                                  else if (char === "{")
                                    explanation = "Start of quantifier";
                                  else if (char === "}")
                                    explanation = "End of quantifier";

                                  // Skip if this is part of an escape sequence we've already explained
                                  if (
                                    pattern[index - 1] === "\\" &&
                                    (char === "d" ||
                                      char === "w" ||
                                      char === "s")
                                  ) {
                                    return null;
                                  }

                                  return explanation ? (
                                    <div
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <code className="bg-muted p-1 rounded mr-2 inline-block min-w-[30px] text-center">
                                        {char}
                                      </code>
                                      <span>{explanation}</span>
                                    </div>
                                  ) : (
                                    <div
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <code className="bg-muted p-1 rounded mr-2 inline-block min-w-[30px] text-center">
                                        {char}
                                      </code>
                                      <span>
                                        {/[a-zA-Z0-9]/.test(char)
                                          ? "Literal character"
                                          : "Special character"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="examples">
                          <AccordionTrigger>Common Use Cases</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 text-sm">
                              <p>
                                Here are some common regex patterns and their
                                uses:
                              </p>

                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium">
                                    Email validation:
                                  </p>
                                  <code className="text-xs bg-muted p-1 rounded font-mono block">
                                    ^[\w-\.]+@([\w-]+\.)+[\w-]{(2, 4)}$
                                  </code>
                                </div>

                                <div>
                                  <p className="font-medium">URL validation:</p>
                                  <code className="text-xs bg-muted p-1 rounded font-mono block">
                                    https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]
                                    {(1, 256)}\.[a-zA-Z0-9()]{(1, 6)}
                                    \b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)
                                  </code>
                                </div>

                                <div>
                                  <p className="font-medium">
                                    Phone number (US):
                                  </p>
                                  <code className="text-xs bg-muted p-1 rounded font-mono block">
                                    (\+\d{(1, 2)}\s)?$$?\d{3}$$?[\s.-]?\d{3}
                                    [\s.-]?\d{4}
                                  </code>
                                </div>

                                <div>
                                  <p className="font-medium">
                                    Date (MM/DD/YYYY):
                                  </p>
                                  <code className="text-xs bg-muted p-1 rounded font-mono block">
                                    ^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d
                                    {2}$
                                  </code>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Enter a pattern to see an explanation
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Regular expressions are powerful pattern matching tools for text
            processing
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(pattern);
                toast({
                  title: "Pattern copied",
                  description:
                    "The regex pattern has been copied to your clipboard.",
                  duration: 2000,
                });
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Pattern
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
