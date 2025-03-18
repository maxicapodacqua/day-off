"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { isAHoliday } from "@18f/us-federal-holidays";

interface TVHostProps {
  state: "idle" | "selecting" | "dropping" | "result";
  selectedMonth: string;
  selectedDate: Date | null;
}

export function TVHost({ state, selectedMonth, selectedDate }: TVHostProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Set different messages based on the current state
    switch (state) {
      case "idle":
        setMessage("Welcome to Day Off Plinko! Select a month to get started!");
        break;
      case "selecting":
        setMessage(
          `Great choice! ${selectedMonth} has some excellent days off. Ready to drop the ball?`
        );
        break;
      case "dropping":
        const phrases = [
          "Watch it bounce! Where will it land?",
          "The suspense is killing me!",
          "Bouncing, bouncing, bouncing!",
          "Look at that ball go!",
        ];
        setMessage(phrases[Math.floor(Math.random() * phrases.length)]);
        break;
      case "result":
        if (selectedDate) {
          const dayName = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const monthName = selectedDate.toLocaleDateString("en-US", {
            month: "long",
          });
          const dayNum = selectedDate.getDate();

          if (isAHoliday(selectedDate)) {
            setMessage(
              `Congratulations! You got ${dayName}, ${monthName} ${dayNum}. That's a holiday! Double win!`
            );
          } else {
            setMessage(
              `Congratulations! Your day off will be ${dayName}, ${monthName} ${dayNum}. Enjoy your long weekend!`
            );
          }
        }
        break;
    }
  }, [state, selectedMonth, selectedDate]);

  return (
    <div className="relative">
      <div className="flex items-end">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="min-w-24 w-24 h-24 relative"
        >
          <Image
            src="/avatar_face.png"
            alt="TV Host"
            width={96}
            height={96}
            className="rounded-full border-4 border-yellow-400 bg-blue-600"
          />
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
  );
}
