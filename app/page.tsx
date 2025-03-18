"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Share2 } from "lucide-react"
import { PlinkoBoard } from "@/components/plinko-board"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TVHost } from "@/components/tv-host"

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDropping, setIsDropping] = useState(false)
  const [appState, setAppState] = useState<"idle" | "selecting" | "dropping" | "result">("idle")
  const actionButtonsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (appState === "result" && actionButtonsRef.current) {
      actionButtonsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [appState])

  // Get current year
  const currentYear = new Date().getFullYear()

  // Generate months for dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get all Mondays and Fridays for the selected month
  const getDaysForMonth = (month: number) => {
    const days = []
    const date = new Date(currentYear, month, 1)

    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 1 || dayOfWeek === 5) {
        // Monday (1) or Friday (5)
        days.push(new Date(date))
      }
      date.setDate(date.getDate() + 1)
    }

    return days
  }

  // US Holidays for current year
  // TODO: fix this, it's currently hardcoding some holisdays like Memorial day and Presidents day
  const holidays = [
    { name: "New Year's Day", date: new Date(currentYear, 0, 1) },
    { name: "Martin Luther King Jr. Day", date: new Date(currentYear, 0, 15) }, // 3rd Monday in January (approximate)
    { name: "Presidents' Day", date: new Date(currentYear, 1, 19) }, // 3rd Monday in February (approximate)
    { name: "Memorial Day", date: new Date(currentYear, 4, 27) }, // Last Monday in May (approximate)
    { name: "Juneteenth", date: new Date(currentYear, 5, 19) },
    { name: "Independence Day", date: new Date(currentYear, 6, 4) },
    { name: "Labor Day", date: new Date(currentYear, 8, 2) }, // 1st Monday in September (approximate)
    { name: "Columbus Day", date: new Date(currentYear, 9, 14) }, // 2nd Monday in October (approximate)
    { name: "Veterans Day", date: new Date(currentYear, 10, 11) },
    { name: "Thanksgiving Day", date: new Date(currentYear, 10, 28) }, // 4th Thursday in November (approximate)
    { name: "Christmas Day", date: new Date(currentYear, 11, 25) },
  ]

  // Check if a date is a holiday
  const isHoliday = (date: Date) => {
    return holidays.some(
      (holiday) => holiday.date.getDate() === date.getDate() && holiday.date.getMonth() === date.getMonth(),
    )
  }

  // Handle month selection
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    setSelectedDate(null)
    setAppState("selecting")
  }

  // Handle drop button click
  const handleDrop = () => {
    if (selectedMonth && !isDropping) {
      setIsDropping(true)
      setAppState("dropping")
    }
  }

  // Handle drop completion
  const handleDropComplete = (date: Date) => {
    console.log("Drop complete, setting date:", date.toDateString())
    setSelectedDate(date)
    setIsDropping(false)
    setAppState("result")
  }

  // Generate Google Calendar link
  const getCalendarLink = () => {
    if (!selectedDate) return "#"

    const year = selectedDate.getFullYear()
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0")
    const day = selectedDate.getDate().toString().padStart(2, "0")

    const startDate = `${year}${month}${day}`
    const endDate = startDate

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Day+Off&dates=${startDate}/${endDate}&details=Scheduled+day+off+from+work`
  }

  // Handle sharing the calendar link
  const handleShare = async () => {
    if (!selectedDate) return

    const dateString = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const shareText = `I'm taking a day off on ${dateString}. Add it to your calendar!`
    const shareUrl = getCalendarLink()

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Day Off Calendar",
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to copying to clipboard
        copyToClipboard(shareUrl)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard(shareUrl)
    }
  }

  // Add a helper function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gradient-to-b from-yellow-300 to-yellow-500">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-6 border-4 border-blue-600">
        <h1
          className="text-3xl font-extrabold text-center mb-8 text-red-600 drop-shadow-md pricedown-font"
          style={{ textShadow: "2px 2px 0 #FFD700" }}
        >
          DAY OFF PLINKO
        </h1>

        <TVHost state={appState} selectedMonth={selectedMonth} selectedDate={selectedDate} />

        <div className="space-y-6">
          <div>
            <div className="mt-2">
            <label className="block text-lg font-medium mb-2">Select a Month</label>
            </div>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month} {currentYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMonth && (
            <>
              <div className="flex justify-center">
                <PlinkoBoard
                  days={getDaysForMonth(months.indexOf(selectedMonth))}
                  isDropping={isDropping}
                  selectedDate={selectedDate}
                  isHoliday={isHoliday}
                  onDropComplete={handleDropComplete}
                />
              </div>

              <Button
                onClick={handleDrop}
                disabled={isDropping}
                className={`w-full py-6 text-xl bg-red-600 hover:bg-red-700 text-white pricedown-font rounded-full shadow-lg transition-all ${isDropping ? "animate-pulse" : ""}`}
              >
                {isDropping ? "DROPPING..." : "DROP THE BALL!"}
              </Button>

              {selectedDate && (
                <div
                  ref={actionButtonsRef}
                  className="mt-6 p-4 bg-yellow-100 rounded-lg text-center"
                >
                  <h2 className="text-2xl font-bold text-blue-800">Your Day Off:</h2>
                  <p className="text-xl my-2">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                    <a
                      href={getCalendarLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Add to Calendar
                    </a>
                    <Button
                      onClick={handleShare}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Share Calendar link
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

