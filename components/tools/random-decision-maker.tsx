"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dices,
  Coins,
  PieChart,
  List,
  WalletCardsIcon as Cards,
  Save,
  Upload,
  Download,
  Copy,
  Trash2,
  Plus,
  Minus,
  Clock,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Types
interface Option {
  id: string
  text: string
  weight: number
  color: string
}

interface DecisionSet {
  id: string
  name: string
  options: Option[]
  method: string
  date: string
}

interface HistoryItem {
  id: string
  date: string
  method: string
  options: Option[]
  result: string
  resultOption?: Option
}

interface AppSettings {
  animations: boolean
  sounds: boolean
  darkMode: boolean
  spinDuration: number
  excludePreviousResults: boolean
  maxHistoryItems: number
}

// Generate a random color
const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#EF476F",
    "#FFC43D",
    "#1B9AAA",
    "#6F2DBD",
    "#83E377",
    "#FB5607",
    "#FFBE0B",
    "#3A86FF",
    "#8338EC",
    "#FF006E",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export default function RandomDecisionMaker() {
  // State for options
  const [options, setOptions] = useState<Option[]>([
    { id: generateId(), text: "Option 1", weight: 1, color: getRandomColor() },
    { id: generateId(), text: "Option 2", weight: 1, color: getRandomColor() },
  ])

  // State for decision method
  const [method, setMethod] = useState<string>("wheel")

  // State for results
  const [result, setResult] = useState<string>("")
  const [resultOption, setResultOption] = useState<Option | null>(null)
  const [isSpinning, setIsSpinning] = useState<boolean>(false)

  // State for history
  const [history, setHistory] = useState<HistoryItem[]>([])

  // State for saved decision sets
  const [savedSets, setSavedSets] = useState<DecisionSet[]>([])
  const [currentSetName, setCurrentSetName] = useState<string>("")

  // State for settings
  const [settings, setSettings] = useState<AppSettings>({
    animations: true,
    sounds: true,
    darkMode: false,
    spinDuration: 3,
    excludePreviousResults: false,
    maxHistoryItems: 50,
  })

  // State for dice settings
  const [diceType, setDiceType] = useState<string>("d6")
  const [numberOfDice, setNumberOfDice] = useState<number>(1)

  // State for coin settings
  const [coinSides, setCoinSides] = useState<{ heads: string; tails: string }>({
    heads: "Heads",
    tails: "Tails",
  })
  const [numberOfCoins, setNumberOfCoins] = useState<number>(1)

  // State for card settings
  const [deckType, setDeckType] = useState<string>("standard")
  const [numberOfCards, setNumberOfCards] = useState<number>(1)

  // State for number generator settings
  const [numberRange, setNumberRange] = useState<{ min: number; max: number }>({
    min: 1,
    max: 100,
  })
  const [uniqueNumbers, setUniqueNumbers] = useState<boolean>(false)
  const [numberOfNumbers, setNumberOfNumbers] = useState<number>(1)

  // Refs
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null)
  const wheelRef = useRef<{
    angle: number
    spinVelocity: number
    isSpinning: boolean
    animationId: number | null
  }>({
    angle: 0,
    spinVelocity: 0,
    isSpinning: false,
    animationId: null,
  })

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("randomDecisionHistory")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse history from localStorage", e)
      }
    }

    const savedDecisionSets = localStorage.getItem("randomDecisionSets")
    if (savedDecisionSets) {
      try {
        setSavedSets(JSON.parse(savedDecisionSets))
      } catch (e) {
        console.error("Failed to parse saved sets from localStorage", e)
      }
    }

    const savedSettings = localStorage.getItem("randomDecisionSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e)
      }
    }
  }, [])

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("randomDecisionHistory", JSON.stringify(history))
  }, [history])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("randomDecisionSettings", JSON.stringify(settings))
  }, [settings])

  // Save decision sets to localStorage when they change
  useEffect(() => {
    localStorage.setItem("randomDecisionSets", JSON.stringify(savedSets))
  }, [savedSets])

  // Draw the wheel when options change
  useEffect(() => {
    if (method === "wheel") {
      drawWheel()
    }
  }, [options, method])

  // Draw the wheel
  const drawWheel = () => {
    const canvas = wheelCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate total weight
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)

    // Draw wheel sections
    let startAngle = wheelRef.current.angle
    let endAngle = startAngle

    options.forEach((option, index) => {
      const sliceAngle = (option.weight / totalWeight) * 2 * Math.PI
      endAngle = startAngle + sliceAngle

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      // Fill slice
      ctx.fillStyle = option.color
      ctx.fill()

      // Draw slice border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      const textAngle = startAngle + sliceAngle / 2
      const textX = centerX + radius * 0.75 * Math.cos(textAngle)
      const textY = centerY + radius * 0.75 * Math.sin(textAngle)

      ctx.save()
      ctx.translate(textX, textY)
      ctx.rotate(textAngle + Math.PI / 2)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Truncate text if too long
      const maxTextLength = 15
      const displayText =
        option.text.length > maxTextLength ? option.text.substring(0, maxTextLength) + "..." : option.text

      ctx.fillText(displayText, 0, 0)
      ctx.restore()

      startAngle = endAngle
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 10, centerY - radius + 10)
    ctx.lineTo(centerX + 10, centerY - radius + 10)
    ctx.closePath()
    ctx.fillStyle = "#e11d48"
    ctx.fill()
  }

  // Spin the wheel
  const spinWheel = () => {
    if (isSpinning || options.length < 2) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Calculate total weight
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)

    // Generate a random spin velocity
    const spinVelocity = 0.1 + Math.random() * 0.2

    // Set up the wheel animation
    wheelRef.current = {
      angle: wheelRef.current.angle,
      spinVelocity,
      isSpinning: true,
      animationId: null,
    }

    // Start the animation
    const startTime = Date.now()
    const spinDuration = settings.spinDuration * 1000 // Convert to milliseconds

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)

      // Ease out the spin
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
      const slowdown = 1 - easeOut(progress)

      // Update the angle
      wheelRef.current.angle += wheelRef.current.spinVelocity * slowdown

      // Draw the wheel
      drawWheel()

      if (progress < 1) {
        // Continue the animation
        wheelRef.current.animationId = requestAnimationFrame(animate)
      } else {
        // End the animation
        wheelRef.current.isSpinning = false
        setIsSpinning(false)

        // Determine the result
        const resultAngle = ((wheelRef.current.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        let currentAngle = 0

        for (const option of options) {
          const sliceAngle = (option.weight / totalWeight) * 2 * Math.PI
          if (resultAngle >= currentAngle && resultAngle < currentAngle + sliceAngle) {
            setResult(option.text)
            setResultOption(option)

            // Add to history
            addToHistory(option)

            // Play sound if enabled
            if (settings.sounds) {
              playSound("success")
            }

            break
          }
          currentAngle += sliceAngle
        }
      }
    }

    // Start the animation
    wheelRef.current.animationId = requestAnimationFrame(animate)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("spin")
    }
  }

  // Roll dice
  const rollDice = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("dice")
    }

    // Simulate rolling animation
    let rollCount = 0
    const maxRolls = 10
    const rollInterval = setInterval(() => {
      rollCount++

      // Generate random dice values
      const diceValues: number[] = []
      const diceMax = Number.parseInt(diceType.substring(1))

      for (let i = 0; i < numberOfDice; i++) {
        diceValues.push(Math.floor(Math.random() * diceMax) + 1)
      }

      // Update the result
      const resultText = diceValues.join(", ")
      setResult(resultText)

      // End the animation
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval)
        setIsSpinning(false)

        // Calculate total
        const total = diceValues.reduce((sum, value) => sum + value, 0)
        const finalResult = `${resultText} (Total: ${total})`
        setResult(finalResult)

        // Create a virtual option for history
        const resultOption: Option = {
          id: generateId(),
          text: finalResult,
          weight: 1,
          color: getRandomColor(),
        }

        setResultOption(resultOption)

        // Add to history
        addToHistory(resultOption)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 100)
  }

  // Flip coins
  const flipCoins = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("coin")
    }

    // Simulate flipping animation
    let flipCount = 0
    const maxFlips = 10
    const flipInterval = setInterval(() => {
      flipCount++

      // Generate random coin results
      const coinResults: string[] = []

      for (let i = 0; i < numberOfCoins; i++) {
        coinResults.push(Math.random() < 0.5 ? coinSides.heads : coinSides.tails)
      }

      // Update the result
      const resultText = coinResults.join(", ")
      setResult(resultText)

      // End the animation
      if (flipCount >= maxFlips) {
        clearInterval(flipInterval)
        setIsSpinning(false)

        // Count occurrences
        const headsCount = coinResults.filter((result) => result === coinSides.heads).length
        const tailsCount = coinResults.filter((result) => result === coinSides.tails).length

        const finalResult =
          numberOfCoins > 1
            ? `${resultText} (${coinSides.heads}: ${headsCount}, ${coinSides.tails}: ${tailsCount})`
            : resultText

        setResult(finalResult)

        // Create a virtual option for history
        const resultOption: Option = {
          id: generateId(),
          text: finalResult,
          weight: 1,
          color: getRandomColor(),
        }

        setResultOption(resultOption)

        // Add to history
        addToHistory(resultOption)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 100)
  }

  // Draw cards
  const drawCards = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("cards")
    }

    // Define card deck
    let deck: string[] = []

    if (deckType === "standard") {
      const suits = ["♠️", "♥️", "♦️", "♣️"]
      const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

      for (const suit of suits) {
        for (const value of values) {
          deck.push(`${value}${suit}`)
        }
      }
    } else if (deckType === "tarot") {
      // Simplified tarot deck
      const majorArcana = [
        "The Fool",
        "The Magician",
        "The High Priestess",
        "The Empress",
        "The Emperor",
        "The Hierophant",
        "The Lovers",
        "The Chariot",
        "Strength",
        "The Hermit",
        "Wheel of Fortune",
        "Justice",
        "The Hanged Man",
        "Death",
        "Temperance",
        "The Devil",
        "The Tower",
        "The Star",
        "The Moon",
        "The Sun",
        "Judgement",
        "The World",
      ]

      deck = [...majorArcana]
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }

    // Draw cards
    const drawnCards = deck.slice(0, Math.min(numberOfCards, deck.length))

    // Simulate drawing animation
    let drawCount = 0
    const maxDraws = 5
    const drawInterval = setInterval(() => {
      drawCount++

      // Update the result
      const resultText = drawnCards.slice(0, Math.ceil((drawnCards.length * drawCount) / maxDraws)).join(", ")
      setResult(resultText)

      // End the animation
      if (drawCount >= maxDraws) {
        clearInterval(drawInterval)
        setIsSpinning(false)

        const finalResult = drawnCards.join(", ")
        setResult(finalResult)

        // Create a virtual option for history
        const resultOption: Option = {
          id: generateId(),
          text: finalResult,
          weight: 1,
          color: getRandomColor(),
        }

        setResultOption(resultOption)

        // Add to history
        addToHistory(resultOption)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 200)
  }

  // Generate random numbers
  const generateRandomNumbers = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("number")
    }

    // Validate range
    const min = Math.min(numberRange.min, numberRange.max)
    const max = Math.max(numberRange.min, numberRange.max)
    const range = max - min + 1

    // Check if unique numbers are possible
    if (uniqueNumbers && numberOfNumbers > range) {
      toast({
        title: "Error",
        description: `Cannot generate ${numberOfNumbers} unique numbers in the range ${min}-${max}`,
        duration: 3000,
      })
      setIsSpinning(false)
      return
    }

    // Generate numbers
    const numbers: number[] = []

    if (uniqueNumbers) {
      // Generate unique numbers
      const availableNumbers = Array.from({ length: range }, (_, i) => min + i)

      for (let i = 0; i < numberOfNumbers; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length)
        numbers.push(availableNumbers[randomIndex])
        availableNumbers.splice(randomIndex, 1)
      }

      // Sort the numbers
      numbers.sort((a, b) => a - b)
    } else {
      // Generate random numbers
      for (let i = 0; i < numberOfNumbers; i++) {
        numbers.push(Math.floor(Math.random() * range) + min)
      }
    }

    // Simulate generation animation
    let genCount = 0
    const maxGens = 10
    const genInterval = setInterval(() => {
      genCount++

      if (genCount < maxGens) {
        // Generate random numbers for animation
        const animNumbers: number[] = []

        for (let i = 0; i < numberOfNumbers; i++) {
          animNumbers.push(Math.floor(Math.random() * range) + min)
        }

        setResult(animNumbers.join(", "))
      } else {
        // Show final result
        clearInterval(genInterval)
        setIsSpinning(false)

        const finalResult = numbers.join(", ")
        setResult(finalResult)

        // Create a virtual option for history
        const resultOption: Option = {
          id: generateId(),
          text: finalResult,
          weight: 1,
          color: getRandomColor(),
        }

        setResultOption(resultOption)

        // Add to history
        addToHistory(resultOption)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 100)
  }

  // Shuffle list
  const shuffleList = () => {
    if (isSpinning || options.length < 2) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("shuffle")
    }

    // Create a copy of the options
    const shuffledOptions = [...options]

    // Simulate shuffling animation
    let shuffleCount = 0
    const maxShuffles = 10
    const shuffleInterval = setInterval(() => {
      shuffleCount++

      // Shuffle the options
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]
      }

      // Update the result
      const resultText = shuffledOptions.map((option) => option.text).join(", ")
      setResult(resultText)

      // End the animation
      if (shuffleCount >= maxShuffles) {
        clearInterval(shuffleInterval)
        setIsSpinning(false)

        // Create a virtual option for history
        const resultOption: Option = {
          id: generateId(),
          text: resultText,
          weight: 1,
          color: getRandomColor(),
        }

        setResultOption(resultOption)

        // Add to history
        addToHistory(resultOption)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 100)
  }

  // Pick a random option
  const pickRandomOption = () => {
    if (isSpinning || options.length < 1) return

    setIsSpinning(true)
    setResult("")
    setResultOption(null)

    // Play sound if enabled
    if (settings.sounds) {
      playSound("pick")
    }

    // Calculate total weight
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)

    // Filter out previous result if setting is enabled
    let availableOptions = [...options]

    if (settings.excludePreviousResults && history.length > 0) {
      const lastResult = history[0].resultOption

      if (lastResult) {
        availableOptions = availableOptions.filter((option) => option.text !== lastResult.text)
      }

      // If no options left, use all options
      if (availableOptions.length === 0) {
        availableOptions = [...options]
      }
    }

    // Simulate picking animation
    let pickCount = 0
    const maxPicks = 10
    const pickInterval = setInterval(() => {
      pickCount++

      // Pick a random option for animation
      const randomIndex = Math.floor(Math.random() * availableOptions.length)
      const randomOption = availableOptions[randomIndex]

      setResult(randomOption.text)

      // End the animation
      if (pickCount >= maxPicks) {
        clearInterval(pickInterval)

        // Pick the final option based on weights
        const randomValue = Math.random() * totalWeight
        let cumulativeWeight = 0
        let selectedOption: Option | null = null

        for (const option of availableOptions) {
          cumulativeWeight += option.weight

          if (randomValue <= cumulativeWeight) {
            selectedOption = option
            break
          }
        }

        // If no option was selected (shouldn't happen), pick the first one
        if (!selectedOption && availableOptions.length > 0) {
          selectedOption = availableOptions[0]
        }

        if (selectedOption) {
          setResult(selectedOption.text)
          setResultOption(selectedOption)

          // Add to history
          addToHistory(selectedOption)
        }

        setIsSpinning(false)

        // Play sound if enabled
        if (settings.sounds) {
          playSound("success")
        }
      }
    }, 100)
  }

  // Add a result to history
  const addToHistory = (option: Option) => {
    const historyItem: HistoryItem = {
      id: generateId(),
      date: new Date().toLocaleString(),
      method,
      options: [...options],
      result: option.text,
      resultOption: { ...option },
    }

    const updatedHistory = [historyItem, ...history].slice(0, settings.maxHistoryItems)
    setHistory(updatedHistory)
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    toast({
      title: "History cleared",
      description: "Your decision history has been cleared.",
      duration: 2000,
    })
  }

  // Add a new option
  const addOption = () => {
    const newOption: Option = {
      id: generateId(),
      text: `Option ${options.length + 1}`,
      weight: 1,
      color: getRandomColor(),
    }

    setOptions([...options, newOption])
  }

  // Remove an option
  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least two options.",
        duration: 2000,
      })
      return
    }

    const updatedOptions = options.filter((option) => option.id !== id)
    setOptions(updatedOptions)
  }

  // Update an option
  const updateOption = (id: string, updates: Partial<Option>) => {
    const updatedOptions = options.map((option) => {
      if (option.id === id) {
        return { ...option, ...updates }
      }
      return option
    })

    setOptions(updatedOptions)
  }

  // Move an option up
  const moveOptionUp = (index: number) => {
    if (index <= 0) return

    const updatedOptions = [...options]
    ;[updatedOptions[index], updatedOptions[index - 1]] = [updatedOptions[index - 1], updatedOptions[index]]

    setOptions(updatedOptions)
  }

  // Move an option down
  const moveOptionDown = (index: number) => {
    if (index >= options.length - 1) return

    const updatedOptions = [...options]
    ;[updatedOptions[index], updatedOptions[index + 1]] = [updatedOptions[index + 1], updatedOptions[index]]

    setOptions(updatedOptions)
  }

  // Equalize weights
  const equalizeWeights = () => {
    const updatedOptions = options.map((option) => ({
      ...option,
      weight: 1,
    }))

    setOptions(updatedOptions)

    toast({
      title: "Weights equalized",
      description: "All options now have equal weight.",
      duration: 2000,
    })
  }

  // Randomize colors
  const randomizeColors = () => {
    const updatedOptions = options.map((option) => ({
      ...option,
      color: getRandomColor(),
    }))

    setOptions(updatedOptions)

    toast({
      title: "Colors randomized",
      description: "All options now have new random colors.",
      duration: 2000,
    })
  }

  // Save current decision set
  const saveDecisionSet = () => {
    if (options.length < 2) {
      toast({
        title: "Cannot save set",
        description: "You need at least two options to save a decision set.",
        duration: 2000,
      })
      return
    }

    if (!currentSetName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your decision set.",
        duration: 2000,
      })
      return
    }

    const newSet: DecisionSet = {
      id: generateId(),
      name: currentSetName,
      options: [...options],
      method,
      date: new Date().toLocaleString(),
    }

    const updatedSets = [newSet, ...savedSets]
    setSavedSets(updatedSets)

    toast({
      title: "Decision set saved",
      description: `"${currentSetName}" has been saved.`,
      duration: 2000,
    })

    setCurrentSetName("")
  }

  // Load a decision set
  const loadDecisionSet = (set: DecisionSet) => {
    setOptions(set.options)
    setMethod(set.method)

    toast({
      title: "Decision set loaded",
      description: `"${set.name}" has been loaded.`,
      duration: 2000,
    })
  }

  // Delete a decision set
  const deleteDecisionSet = (id: string) => {
    const updatedSets = savedSets.filter((set) => set.id !== id)
    setSavedSets(updatedSets)

    toast({
      title: "Decision set deleted",
      description: "The decision set has been deleted.",
      duration: 2000,
    })
  }

  // Export decision sets
  const exportDecisionSets = () => {
    const dataStr = JSON.stringify(savedSets)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `random-decision-sets-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Decision sets exported",
      description: "Your decision sets have been exported to a JSON file.",
      duration: 2000,
    })
  }

  // Import decision sets
  const importDecisionSets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importedSets = JSON.parse(e.target?.result as string)

        if (Array.isArray(importedSets)) {
          setSavedSets([...importedSets, ...savedSets])

          toast({
            title: "Decision sets imported",
            description: `${importedSets.length} decision sets have been imported.`,
            duration: 2000,
          })
        } else {
          throw new Error("Invalid format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid.",
          duration: 2000,
        })
      }
    }

    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  // Copy result to clipboard
  const copyResultToClipboard = () => {
    if (!result) return

    navigator.clipboard.writeText(result)

    toast({
      title: "Copied to clipboard",
      description: "The result has been copied to your clipboard.",
      duration: 2000,
    })
  }

  // Play a sound
  const playSound = (type: string) => {
    if (!settings.sounds) return

    // In a real implementation, you would play actual sound files
    console.log(`Playing ${type} sound`)
  }

  // Calculate total weight
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)

  // Get the appropriate decision button based on the method
  const getDecisionButton = () => {
    switch (method) {
      case "wheel":
        return (
          <Button onClick={spinWheel} disabled={isSpinning || options.length < 2} className="w-full">
            Spin the Wheel
          </Button>
        )
      case "dice":
        return (
          <Button onClick={rollDice} disabled={isSpinning} className="w-full">
            Roll {numberOfDice > 1 ? "Dice" : "Die"}
          </Button>
        )
      case "coin":
        return (
          <Button onClick={flipCoins} disabled={isSpinning} className="w-full">
            Flip {numberOfCoins > 1 ? "Coins" : "Coin"}
          </Button>
        )
      case "cards":
        return (
          <Button onClick={drawCards} disabled={isSpinning} className="w-full">
            Draw {numberOfCards > 1 ? "Cards" : "a Card"}
          </Button>
        )
      case "numbers":
        return (
          <Button onClick={generateRandomNumbers} disabled={isSpinning} className="w-full">
            Generate {numberOfNumbers > 1 ? "Numbers" : "a Number"}
          </Button>
        )
      case "list":
        return (
          <Button onClick={shuffleList} disabled={isSpinning || options.length < 2} className="w-full">
            Shuffle List
          </Button>
        )
      default:
        return (
          <Button onClick={pickRandomOption} disabled={isSpinning || options.length < 1} className="w-full">
            Pick Random Option
          </Button>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Random Decision Maker</CardTitle>
              <CardDescription>Make decisions with various randomization methods</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>Customize your decision-making experience</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">Animations</Label>
                      <Switch
                        id="animations"
                        checked={settings.animations}
                        onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sounds">Sound Effects</Label>
                      <Switch
                        id="sounds"
                        checked={settings.sounds}
                        onCheckedChange={(checked) => setSettings({ ...settings, sounds: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <Switch
                        id="darkMode"
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spinDuration">Spin Duration (seconds)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="spinDuration"
                          min={1}
                          max={10}
                          step={0.5}
                          value={[settings.spinDuration]}
                          onValueChange={(value) => setSettings({ ...settings, spinDuration: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.spinDuration}s</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="excludePreviousResults">Exclude Previous Results</Label>
                      <Switch
                        id="excludePreviousResults"
                        checked={settings.excludePreviousResults}
                        onCheckedChange={(checked) => setSettings({ ...settings, excludePreviousResults: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxHistoryItems">Max History Items</Label>
                      <Select
                        value={settings.maxHistoryItems.toString()}
                        onValueChange={(value) => setSettings({ ...settings, maxHistoryItems: Number.parseInt(value) })}
                      >
                        <SelectTrigger id="maxHistoryItems">
                          <SelectValue placeholder="Select max history items" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="wheel" value={method} onValueChange={setMethod} className="w-full">
            <TabsList className="grid grid-cols-7 mb-6">
              <TabsTrigger value="wheel">
                <PieChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Wheel</span>
              </TabsTrigger>
              <TabsTrigger value="dice">
                <Dices className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dice</span>
              </TabsTrigger>
              <TabsTrigger value="coin">
                <Coins className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Coin</span>
              </TabsTrigger>
              <TabsTrigger value="cards">
                <Cards className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="numbers">
                <span className="text-lg font-bold mr-1">#</span>
                <span className="hidden sm:inline">Numbers</span>
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
            </TabsList>

            {/* Wheel Tab */}
            <TabsContent value="wheel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Wheel */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-xs aspect-square">
                    <canvas ref={wheelCanvasRef} width={300} height={300} className="w-full h-full" />
                  </div>

                  <div className="mt-4 w-full max-w-xs">{getDecisionButton()}</div>
                </div>

                {/* Right column - Options */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Options</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={equalizeWeights}>
                        Equalize Weights
                      </Button>
                      <Button variant="outline" size="sm" onClick={randomizeColors}>
                        Randomize Colors
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[300px] border rounded-md p-2">
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: option.color }}
                          />

                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(option.id, { text: e.target.value })}
                            className="flex-1"
                          />

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOptionUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOptionDown(index)}
                              disabled={index === options.length - 1}
                              className="h-8 w-8"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Weight: {option.weight}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Adjust Weight</h4>
                                <p className="text-sm text-muted-foreground">
                                  Higher weight means higher chance of selection. Current probability:{" "}
                                  {((option.weight / totalWeight) * 100).toFixed(1)}%
                                </p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      updateOption(option.id, { weight: Math.max(0.1, option.weight - 0.1) })
                                    }
                                    className="h-8 w-8"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Slider
                                    min={0.1}
                                    max={10}
                                    step={0.1}
                                    value={[option.weight]}
                                    onValueChange={(value) => updateOption(option.id, { weight: value[0] })}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateOption(option.id, { weight: option.weight + 0.1 })}
                                    className="h-8 w-8"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button onClick={addOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Decision set name..."
                        value={currentSetName}
                        onChange={(e) => setCurrentSetName(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={saveDecisionSet}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Set
                    </Button>
                  </div>
                </div>
              </div>

              {/* Result Section */}
              {result && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Result</h3>
                      <Button variant="ghost" size="icon" onClick={copyResultToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 p-4 border rounded-md bg-muted text-center">
                      <p className="text-xl font-bold">{result}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Dice Tab */}
            <TabsContent value="dice" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Dice Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dice Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="diceType">Dice Type</Label>
                    <Select value={diceType} onValueChange={setDiceType}>
                      <SelectTrigger id="diceType">
                        <SelectValue placeholder="Select dice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d4">D4 (4-sided)</SelectItem>
                        <SelectItem value="d6">D6 (6-sided)</SelectItem>
                        <SelectItem value="d8">D8 (8-sided)</SelectItem>
                        <SelectItem value="d10">D10 (10-sided)</SelectItem>
                        <SelectItem value="d12">D12 (12-sided)</SelectItem>
                        <SelectItem value="d20">D20 (20-sided)</SelectItem>
                        <SelectItem value="d100">D100 (100-sided)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfDice">Number of Dice</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfDice(Math.max(1, numberOfDice - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="numberOfDice"
                        type="number"
                        min={1}
                        max={10}
                        value={numberOfDice}
                        onChange={(e) => setNumberOfDice(Number.parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfDice(Math.min(10, numberOfDice + 1))}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">{getDecisionButton()}</div>
                </div>

                {/* Right column - Result */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex items-center justify-center border rounded-md bg-muted">
                    {result ? (
                      <p className="text-3xl font-bold">{result}</p>
                    ) : (
                      <p className="text-muted-foreground">Roll the dice to see the result</p>
                    )}
                  </div>

                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyResultToClipboard} className="mt-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Coin Tab */}
            <TabsContent value="coin" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Coin Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Coin Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="headsName">Heads Name</Label>
                    <Input
                      id="headsName"
                      value={coinSides.heads}
                      onChange={(e) => setCoinSides({ ...coinSides, heads: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tailsName">Tails Name</Label>
                    <Input
                      id="tailsName"
                      value={coinSides.tails}
                      onChange={(e) => setCoinSides({ ...coinSides, tails: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfCoins">Number of Coins</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfCoins(Math.max(1, numberOfCoins - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="numberOfCoins"
                        type="number"
                        min={1}
                        max={10}
                        value={numberOfCoins}
                        onChange={(e) => setNumberOfCoins(Number.parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfCoins(Math.min(10, numberOfCoins + 1))}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">{getDecisionButton()}</div>
                </div>

                {/* Right column - Result */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex items-center justify-center border rounded-md bg-muted">
                    {result ? (
                      <p className="text-3xl font-bold">{result}</p>
                    ) : (
                      <p className="text-muted-foreground">Flip the coin to see the result</p>
                    )}
                  </div>

                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyResultToClipboard} className="mt-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Cards Tab */}
            <TabsContent value="cards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Card Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="deckType">Deck Type</Label>
                    <Select value={deckType} onValueChange={setDeckType}>
                      <SelectTrigger id="deckType">
                        <SelectValue placeholder="Select deck type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (52 cards)</SelectItem>
                        <SelectItem value="tarot">Tarot (Major Arcana)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfCards">Number of Cards</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfCards(Math.max(1, numberOfCards - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="numberOfCards"
                        type="number"
                        min={1}
                        max={deckType === "standard" ? 52 : 22}
                        value={numberOfCards}
                        onChange={(e) => setNumberOfCards(Number.parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfCards(Math.min(deckType === "standard" ? 52 : 22, numberOfCards + 1))}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">{getDecisionButton()}</div>
                </div>

                {/* Right column - Result */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex items-center justify-center border rounded-md bg-muted overflow-auto">
                    {result ? (
                      <p className="text-xl font-bold p-4">{result}</p>
                    ) : (
                      <p className="text-muted-foreground">Draw cards to see the result</p>
                    )}
                  </div>

                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyResultToClipboard} className="mt-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Numbers Tab */}
            <TabsContent value="numbers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Number Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Number Generator Settings</h3>

                  <div className="space-y-2">
                    <Label>Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={numberRange.min}
                        onChange={(e) => setNumberRange({ ...numberRange, min: Number.parseInt(e.target.value) || 0 })}
                        className="text-center"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={numberRange.max}
                        onChange={(e) =>
                          setNumberRange({ ...numberRange, max: Number.parseInt(e.target.value) || 100 })
                        }
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfNumbers">Number of Numbers</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfNumbers(Math.max(1, numberOfNumbers - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="numberOfNumbers"
                        type="number"
                        min={1}
                        max={100}
                        value={numberOfNumbers}
                        onChange={(e) => setNumberOfNumbers(Number.parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfNumbers(Math.min(100, numberOfNumbers + 1))}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="uniqueNumbers" checked={uniqueNumbers} onCheckedChange={setUniqueNumbers} />
                    <Label htmlFor="uniqueNumbers">Generate unique numbers</Label>
                  </div>

                  <div className="pt-4">{getDecisionButton()}</div>
                </div>

                {/* Right column - Result */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex items-center justify-center border rounded-md bg-muted overflow-auto">
                    {result ? (
                      <p className="text-xl font-bold p-4">{result}</p>
                    ) : (
                      <p className="text-muted-foreground">Generate numbers to see the result</p>
                    )}
                  </div>

                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyResultToClipboard} className="mt-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* List Tab */}
            <TabsContent value="list" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - List Options */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">List Items</h3>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px] border rounded-md p-2">
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(option.id, { text: e.target.value })}
                            className="flex-1"
                          />

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOptionUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOptionDown(index)}
                              disabled={index === options.length - 1}
                              className="h-8 w-8"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="pt-4">{getDecisionButton()}</div>
                </div>

                {/* Right column - Result */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex items-center justify-center border rounded-md bg-muted overflow-auto">
                    {result ? (
                      <p className="text-xl font-bold p-4">{result}</p>
                    ) : (
                      <p className="text-muted-foreground">Shuffle the list to see the result</p>
                    )}
                  </div>

                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyResultToClipboard} className="mt-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Saved Tab */}
            <TabsContent value="saved" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Saved Decision Sets</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportDecisionSets}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="import-file">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </label>
                    </Button>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={importDecisionSets}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>

              {savedSets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  <Save className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No saved decision sets yet. Save a set to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSets.map((set) => (
                    <Card key={set.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{set.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{set.method}</Badge>
                              <p className="text-xs text-muted-foreground">{set.options.length} options</p>
                              <p className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {set.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => loadDecisionSet(set)}>
                              Load
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteDecisionSet(set.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="history">
              <AccordionTrigger>
                <div className="flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Decision History
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Recent Decisions</h3>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg">
                    <p>No decision history yet. Make some decisions to see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {history.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.method}</Badge>
                                <p className="text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {item.date}
                                </p>
                              </div>
                              <p className="font-medium mt-1">{item.result}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyResultToClipboard()}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardFooter>
      </Card>
    </div>
  )
}

