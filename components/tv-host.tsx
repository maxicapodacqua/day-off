"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {Laugh} from "lucide-react";

interface TVHostProps {
  state: "idle" | "selecting" | "dropping" | "result"
  selectedMonth: string
  selectedDate: Date | null
}

export function TVHost({ state, selectedMonth, selectedDate }: TVHostProps) {
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Set different messages based on the current state
    switch (state) {
      case "idle":
        setMessage("Welcome to Day Off Plinko! Select a month to get started!")
        break
      case "selecting":
        setMessage(`Great choice! ${selectedMonth} has some excellent days off. Ready to drop the ball?`)
        break
      case "dropping":
        const phrases = [
          "Watch it bounce! Where will it land?",
          "The suspense is killing me!",
          "Bouncing, bouncing, bouncing!",
          "Look at that ball go!",
        ]
        setMessage(phrases[Math.floor(Math.random() * phrases.length)])
        break
      case "result":
        if (selectedDate) {
          const isHoliday = [
            { month: 0, day: 1, name: "New Year's Day" },
            { month: 0, day: 15, name: "Martin Luther King Jr. Day" },
            { month: 1, day: 19, name: "Presidents' Day" },
            { month: 4, day: 27, name: "Memorial Day" },
            { month: 5, day: 19, name: "Juneteenth" },
            { month: 6, day: 4, name: "Independence Day" },
            { month: 8, day: 2, name: "Labor Day" },
            { month: 9, day: 14, name: "Columbus Day" },
            { month: 10, day: 11, name: "Veterans Day" },
            { month: 10, day: 28, name: "Thanksgiving Day" },
            { month: 11, day: 25, name: "Christmas Day" },
          ].some((h) => h.month === selectedDate.getMonth() && h.day === selectedDate.getDate())

          const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" })
          const monthName = selectedDate.toLocaleDateString("en-US", { month: "long" })
          const dayNum = selectedDate.getDate()

          if (isHoliday) {
            setMessage(`Congratulations! You got ${dayName}, ${monthName} ${dayNum}. That's a holiday! Double win!`)
          } else {
            setMessage(
              `Congratulations! Your day off will be ${dayName}, ${monthName} ${dayNum}. Enjoy your long weekend!`,
            )
          }
        }
        break
    }
  }, [state, selectedMonth, selectedDate])

  return (
    <div className="relative">
      <div className="flex items-end">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-24 h-24 relative">
          <Image
            src="/avatar_face.png"
            alt="TV Host"
            width={96}
            height={96}
            className="rounded-full border-4 border-yellow-400 bg-blue-600"
          />
           {/* <Laugh color="#facc15" className="rounded-full border-4 -border-yellow-400 -bg-blue-600 w-24 h-24"/> */}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="ml-2 p-4 bg-white rounded-xl rounded-bl-none shadow-lg max-w-xs"
          >
            <p className="text-sm md:text-base">{message}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

