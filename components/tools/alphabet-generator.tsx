"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  RefreshCw,
  Download,
  HelpCircle,
  History,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function AlphabetGenerator() {
  const [combinations, setCombinations] = useState<string[]>([]);
  const [options, setOptions] = useState({
    useLength: true,
    minLength: 5,
    maxLength: 10,
    useVowelCount: false,
    vowelCount: { min: 2, max: 5 },
    useConsonantCount: false,
    consonantCount: { min: 3, max: 7 },
    useCase: true,
    case: "mixed",
    useIncludeChars: false,
    includeChars: "",
    useExcludeChars: false,
    excludeChars: "",
    count: 5,
    allowDuplicates: false,
  });

  const [history, setHistory] = useState<
    Array<{ id: string; date: string; combinations: string[] }>
  >([]);

  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";

  const saveToHistory = (newCombinations: string[]) => {
    if (newCombinations.length === 0) return;

    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      combinations: [...newCombinations],
    };

    const updatedHistory = [historyItem, ...history].slice(0, 50); // Keep only the last 50 entries
    setHistory(updatedHistory);
    localStorage.setItem(
      "alphabetGeneratorHistory",
      JSON.stringify(updatedHistory)
    );
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("alphabetGeneratorHistory");
    toast.success("History cleared", {
      description: "Your generation history has been cleared.",
      duration: 2000,
    });
  };

  const loadFromHistory = (historyItem: {
    id: string;
    date: string;
    combinations: string[];
  }) => {
    setCombinations(historyItem.combinations);
    toast.success(`Loaded from history`, {
      description: `Loaded ${historyItem.combinations.length} combinations from ${historyItem.date}`,
      duration: 2000,
    });
  };

  const generateCombinations = () => {
    const results: string[] = [];
    const {
      useLength,
      minLength,
      maxLength,
      useVowelCount,
      vowelCount,
      useConsonantCount,
      consonantCount,
      useCase,
      case: caseOption,
      useIncludeChars,
      includeChars,
      useExcludeChars,
      excludeChars,
      count,
      allowDuplicates,
    } = options;

    for (let i = 0; i < count; i++) {
      // Determine the length for this combination
      const length = useLength
        ? Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
        : 5; // Default to 5 if length option is disabled

      // Determine how many vowels and consonants to use
      const vowelsToUse = useVowelCount
        ? Math.min(
            Math.floor(Math.random() * (vowelCount.max - vowelCount.min + 1)) +
              vowelCount.min,
            length
          )
        : Math.floor(Math.random() * 3) + 1; // Default to 1-3 vowels if disabled

      const consonantsToUse = useConsonantCount
        ? Math.min(
            length - vowelsToUse,
            Math.floor(
              Math.random() * (consonantCount.max - consonantCount.min + 1)
            ) + consonantCount.min
          )
        : length - vowelsToUse; // Fill the rest with consonants if disabled

      // Create filtered character sets based on include/exclude options
      let filteredVowels = [...vowels];
      let filteredConsonants = [...consonants];

      if (useExcludeChars) {
        filteredVowels = filteredVowels.filter(
          (c) => !excludeChars.includes(c)
        );
        filteredConsonants = filteredConsonants.filter(
          (c) => !excludeChars.includes(c)
        );
      }

      // Add any included characters to the appropriate sets
      if (useIncludeChars) {
        for (const char of includeChars) {
          if (
            vowels.includes(char.toLowerCase()) &&
            !filteredVowels.includes(char.toLowerCase())
          ) {
            filteredVowels.push(char.toLowerCase());
          } else if (
            consonants.includes(char.toLowerCase()) &&
            !filteredConsonants.includes(char.toLowerCase())
          ) {
            filteredConsonants.push(char.toLowerCase());
          }
        }
      }

      // Generate the combination
      let combination = "";

      // Add vowels
      for (let v = 0; v < vowelsToUse; v++) {
        const randomVowel =
          filteredVowels[Math.floor(Math.random() * filteredVowels.length)];
        combination += randomVowel;
      }

      // Add consonants
      for (let c = 0; c < consonantsToUse; c++) {
        const randomConsonant =
          filteredConsonants[
            Math.floor(Math.random() * filteredConsonants.length)
          ];
        combination += randomConsonant;
      }

      // Fill the rest with random characters if needed
      const remaining = length - (vowelsToUse + consonantsToUse);
      const allChars = [...filteredVowels, ...filteredConsonants];
      for (let r = 0; r < remaining; r++) {
        const randomChar =
          allChars[Math.floor(Math.random() * allChars.length)];
        combination += randomChar;
      }

      // Shuffle the combination
      combination = shuffleString(combination);

      // Apply case option
      if (useCase) {
        if (caseOption === "uppercase") {
          combination = combination.toUpperCase();
        } else if (caseOption === "lowercase") {
          combination = combination.toLowerCase();
        } else if (caseOption === "mixed") {
          combination = [...combination]
            .map((char) =>
              Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
            )
            .join("");
        } else if (caseOption === "capitalize") {
          combination =
            combination.charAt(0).toUpperCase() +
            combination.slice(1).toLowerCase();
        }
      } else {
        combination = combination.toLowerCase(); // Default to lowercase if case option is disabled
      }

      // Check for duplicates
      if (!allowDuplicates && results.includes(combination)) {
        i--;
        continue;
      }

      results.push(combination);
    }

    setCombinations(results);
    saveToHistory(results);
  };

  const shuffleString = (str: string) => {
    const arr = [...str];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: text,
      duration: 2000,
    });
  };

  const downloadCombinations = () => {
    const content = combinations.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alphabet-combinations.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("alphabetGeneratorHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
      }
    }

    // Generate initial combinations
    generateCombinations();
  }, []);

  // Helper component for option labels with tooltips
  const LabelWithTooltip = ({
    htmlFor,
    label,
    tooltip,
  }: {
    htmlFor?: string;
    label: string;
    tooltip: string;
  }) => (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Random Alphabet Combination Generator
          </CardTitle>
          <CardDescription>
            Generate random combinations of letters with customizable options
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Options Panel */}
            <div>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="basic">Basic Options</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                  <TabsTrigger value="history">
                    <div className="flex items-center gap-1">
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useLength"
                          checked={options.useLength}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, useLength: checked })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useLength"
                          label="Use Length Range"
                          tooltip="When enabled, generated words will have a length between the minimum and maximum values. When disabled, all words will be 5 letters long."
                        />
                      </div>

                      {options.useLength && (
                        <>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor="length">
                              Length Range: {options.minLength} -{" "}
                              {options.maxLength}
                            </Label>
                          </div>
                          <div className="flex gap-4">
                            <Input
                              id="minLength"
                              type="number"
                              min={1}
                              max={options.maxLength}
                              value={options.minLength}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  minLength: Number.parseInt(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                            <span className="self-center">to</span>
                            <Input
                              id="maxLength"
                              type="number"
                              min={options.minLength}
                              max={30}
                              value={options.maxLength}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  maxLength: Number.parseInt(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useCase"
                          checked={options.useCase}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, useCase: checked })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useCase"
                          label="Use Letter Case"
                          tooltip="When enabled, the selected case style will be applied. When disabled, all words will be lowercase."
                        />
                      </div>

                      {options.useCase && (
                        <>
                          <Label htmlFor="case">Letter Case</Label>
                          <Select
                            value={options.case}
                            onValueChange={(value) =>
                              setOptions({ ...options, case: value })
                            }
                          >
                            <SelectTrigger id="case">
                              <SelectValue placeholder="Select case style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lowercase">
                                lowercase
                              </SelectItem>
                              <SelectItem value="uppercase">
                                UPPERCASE
                              </SelectItem>
                              <SelectItem value="mixed">MiXeD cAsE</SelectItem>
                              <SelectItem value="capitalize">
                                Capitalize
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>

                    <div>
                      <LabelWithTooltip
                        htmlFor="count"
                        label="Number of Combinations"
                        tooltip="The number of random words to generate."
                      />
                      <Input
                        id="count"
                        type="number"
                        min={1}
                        max={100}
                        value={options.count}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            count: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useVowelCount"
                          checked={options.useVowelCount}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, useVowelCount: checked })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useVowelCount"
                          label="Control Vowel Count"
                          tooltip="When enabled, you can specify how many vowels (a, e, i, o, u) should be in each word. When disabled, a random number of vowels will be used."
                        />
                      </div>

                      {options.useVowelCount && (
                        <>
                          <div className="flex justify-between mb-2">
                            <Label>
                              Vowels: {options.vowelCount.min} -{" "}
                              {options.vowelCount.max}
                            </Label>
                          </div>
                          <div className="flex gap-4">
                            <Input
                              type="number"
                              min={0}
                              max={options.vowelCount.max}
                              value={options.vowelCount.min}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  vowelCount: {
                                    ...options.vowelCount,
                                    min: Number.parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-24"
                            />
                            <span className="self-center">to</span>
                            <Input
                              type="number"
                              min={options.vowelCount.min}
                              max={options.maxLength}
                              value={options.vowelCount.max}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  vowelCount: {
                                    ...options.vowelCount,
                                    max: Number.parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useConsonantCount"
                          checked={options.useConsonantCount}
                          onCheckedChange={(checked) =>
                            setOptions({
                              ...options,
                              useConsonantCount: checked,
                            })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useConsonantCount"
                          label="Control Consonant Count"
                          tooltip="When enabled, you can specify how many consonants should be in each word. When disabled, consonants will fill the remaining space after vowels."
                        />
                      </div>

                      {options.useConsonantCount && (
                        <>
                          <div className="flex justify-between mb-2">
                            <Label>
                              Consonants: {options.consonantCount.min} -{" "}
                              {options.consonantCount.max}
                            </Label>
                          </div>
                          <div className="flex gap-4">
                            <Input
                              type="number"
                              min={0}
                              max={options.consonantCount.max}
                              value={options.consonantCount.min}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  consonantCount: {
                                    ...options.consonantCount,
                                    min: Number.parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-24"
                            />
                            <span className="self-center">to</span>
                            <Input
                              type="number"
                              min={options.consonantCount.min}
                              max={options.maxLength}
                              value={options.consonantCount.max}
                              onChange={(e) =>
                                setOptions({
                                  ...options,
                                  consonantCount: {
                                    ...options.consonantCount,
                                    max: Number.parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="allowDuplicates"
                        checked={options.allowDuplicates}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, allowDuplicates: checked })
                        }
                      />
                      <LabelWithTooltip
                        htmlFor="allowDuplicates"
                        label="Allow Duplicate Combinations"
                        tooltip="When enabled, the same word may appear multiple times in the results. When disabled, all generated words will be unique."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useIncludeChars"
                          checked={options.useIncludeChars}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, useIncludeChars: checked })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useIncludeChars"
                          label="Include Specific Characters"
                          tooltip="When enabled, the characters you specify will be included in the character pool used to generate words."
                        />
                      </div>

                      {options.useIncludeChars && (
                        <>
                          <Input
                            id="includeChars"
                            placeholder="e.g. xyz"
                            value={options.includeChars}
                            onChange={(e) =>
                              setOptions({
                                ...options,
                                includeChars: e.target.value,
                              })
                            }
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Characters that must be included in the combinations
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch
                          id="useExcludeChars"
                          checked={options.useExcludeChars}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, useExcludeChars: checked })
                          }
                        />
                        <LabelWithTooltip
                          htmlFor="useExcludeChars"
                          label="Exclude Specific Characters"
                          tooltip="When enabled, the characters you specify will be excluded from the character pool used to generate words."
                        />
                      </div>

                      {options.useExcludeChars && (
                        <>
                          <Input
                            id="excludeChars"
                            placeholder="e.g. abc"
                            value={options.excludeChars}
                            onChange={(e) =>
                              setOptions({
                                ...options,
                                excludeChars: e.target.value,
                              })
                            }
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Characters that will not appear in the combinations
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Generation History</h3>
                    {history.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearHistory}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear History
                      </Button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      No history yet. Generate some combinations to see them
                      here.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {history.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{item.date}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadFromHistory(item)}
                              >
                                Load
                              </Button>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {item.combinations.length} combinations
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.combinations
                                  .slice(0, 3)
                                  .map((combo, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-muted px-2 py-1 rounded text-xs font-mono"
                                    >
                                      {combo}
                                    </span>
                                  ))}
                                {item.combinations.length > 3 && (
                                  <span className="bg-muted px-2 py-1 rounded text-xs">
                                    +{item.combinations.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Button onClick={generateCombinations} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Combinations
                </Button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Results ({combinations.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(combinations.join("\n"))}
                    disabled={combinations.length === 0}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCombinations}
                    disabled={combinations.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">
                      Download
                    </span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
                {combinations.map((combo, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3 flex justify-between items-center">
                      <span className="font-mono text-lg">{combo}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(combo)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {combinations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  No combinations generated yet. Adjust your options and
                  generate some!
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between lg:hidden">
          <Button onClick={generateCombinations} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Combinations
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={downloadCombinations}
              disabled={combinations.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>

            <Button
              variant="outline"
              onClick={() => copyToClipboard(combinations.join("\n"))}
              disabled={combinations.length === 0}
              className="w-full sm:w-auto"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
