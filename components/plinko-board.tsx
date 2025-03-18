"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { isAHoliday } from "@18f/us-federal-holidays"

interface PlinkoProps {
  days: Date[]
  isDropping: boolean
  selectedDate: Date | null
  onDropComplete: (date: Date) => void
}

export function PlinkoBoard({ days, isDropping, selectedDate, onDropComplete }: PlinkoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ballPosition, setBallPosition] = useState({ x: 0, y: -30 })
  const [showBall, setShowBall] = useState(false)
  const [landedSlot, setLandedSlot] = useState<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const droppingRef = useRef<boolean>(false)
  const finalDateRef = useRef<Date | null>(null)

  // Reset state when days change
  useEffect(() => {
    setShowBall(false)
    setLandedSlot(null)
    finalDateRef.current = null
  }, [days])

  // Draw the Plinko board
  useEffect(() => {
    if (!canvasRef.current || days.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = 300
    const height = 400
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = "#1a237e"
    ctx.fillRect(0, 0, width, height)

    // Draw pegs
    const pegRadius = 4
    const pegRows = 8
    const pegSpacing = width / 8

    for (let row = 0; row < pegRows; row++) {
      const offsetX = row % 2 === 0 ? 0 : pegSpacing / 2
      const pegsInRow = row % 2 === 0 ? 8 : 7

      for (let col = 0; col < pegsInRow; col++) {
        const x = offsetX + col * pegSpacing + pegSpacing / 2
        const y = 50 + row * 40

        ctx.beginPath()
        ctx.arc(x, y, pegRadius, 0, 2 * Math.PI)
        ctx.fillStyle = "#FFD700"
        ctx.fill()
        ctx.strokeStyle = "#FFA000"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Draw slots at the bottom
    const slotWidth = width / days.length
    const slotHeight = 60
    const slotY = height - slotHeight

    days.forEach((day, index) => {
      const x = index * slotWidth

      // Determine if this day is a holiday
      const holiday = isAHoliday(day)

      // Set slot color
      ctx.fillStyle = holiday ? "#FF6B6B" : day.getDay() === 1 ? "#4ECDC4" : "#FFE66D"

      // Draw slot
      ctx.fillRect(x, slotY, slotWidth, slotHeight)

      // Add border
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 1
      ctx.strokeRect(x, slotY, slotWidth, slotHeight)

      // Add date text
      ctx.fillStyle = "#000"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"

      const dayOfMonth = day.getDate()
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" })

      ctx.fillText(`${dayName}`, x + slotWidth / 2, slotY + 20)
      ctx.fillText(`${dayOfMonth}`, x + slotWidth / 2, slotY + 40)
    })

    // Highlight selected date if not dropping
    if (selectedDate && !isDropping && !droppingRef.current) {
      const selectedIndex = days.findIndex(
        (day) =>
          day.getDate() === selectedDate.getDate() &&
          day.getMonth() === selectedDate.getMonth() &&
          day.getFullYear() === selectedDate.getFullYear(),
      )

      if (selectedIndex >= 0) {
        const x = selectedIndex * slotWidth

        // Draw highlight
        ctx.strokeStyle = "#FF0000"
        ctx.lineWidth = 3
        ctx.strokeRect(x, slotY, slotWidth, slotHeight)
      }
    }

    // Cleanup function to cancel animation on unmount or re-render
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [days, isDropping, selectedDate])

  // Handle ball dropping animation
  useEffect(() => {
    if (isDropping && !droppingRef.current && days.length > 0) {
      droppingRef.current = true
      setShowBall(true)

      // Start ball at a random position at the top
      const startX = 150 + (Math.random() * 60 - 30)
      setBallPosition({ x: startX, y: -30 })

      // Physics parameters
      let x = startX
      let y = -30
      let vx = 0
      let vy = 0
      const gravity = 0.05
      const bounceFactor = 0.7
      const horizontalRandomness = 0.4

      // Determine target slot (random)
      const targetSlot = Math.floor(Math.random() * days.length)
      finalDateRef.current = days[targetSlot]

      // Calculate slot position
      const slotWidth = 300 / days.length
      const targetX = targetSlot * slotWidth + slotWidth / 2

      // Slightly bias initial velocity toward target
      vx = (targetX - x) * 0.01

      const animate = () => {
        // Apply gravity
        vy += gravity

        // Update position
        x += vx
        y += vy

        // Bounce off walls
        if (x < 10) {
          x = 10
          vx = -vx * bounceFactor
        } else if (x > 290) {
          x = 290
          vx = -vx * bounceFactor
        }

        // Check for collisions with pegs
        const pegRows = 8
        const pegSpacing = 300 / 8

        for (let row = 0; row < pegRows; row++) {
          const offsetX = row % 2 === 0 ? 0 : pegSpacing / 2
          const pegsInRow = row % 2 === 0 ? 8 : 7

          for (let col = 0; col < pegsInRow; col++) {
            const pegX = offsetX + col * pegSpacing + pegSpacing / 2
            const pegY = 50 + row * 40

            // Simple distance check for collision
            const dx = pegX - x
            const dy = pegY - y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 10) {
              // Ball radius + peg radius
              // Bounce off peg
              const angle = Math.atan2(dy, dx)
              const bounceX = -Math.cos(angle) * 2
              const bounceY = -Math.sin(angle) * 2

              vx = bounceX * bounceFactor + (Math.random() * horizontalRandomness - horizontalRandomness / 2)
              vy = bounceY * bounceFactor

              // Ensure we don't get stuck
              x += bounceX * 2
              y += bounceY * 2
            }
          }
        }

        // Check if ball has reached bottom
        if (y > 350) {
          // Determine which slot the ball landed in
          const slotWidth = 300 / days.length
          const landedSlotIndex = Math.min(Math.floor(x / slotWidth), days.length - 1)

          // Stop animation
          setLandedSlot(landedSlotIndex)
          droppingRef.current = false

          // Ensure the ball is centered in the slot
          x = landedSlotIndex * slotWidth + slotWidth / 2
          y = 370

          // Call onDropComplete with the selected date
          if (onDropComplete && finalDateRef.current) {
            finalDateRef.current = days[landedSlotIndex]
            onDropComplete(finalDateRef.current)
          }

          // Cancel animation
          return
        }

        // Update ball position state for rendering
        setBallPosition({ x, y })

        // Continue animation
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isDropping, days, onDropComplete])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={300} height={400} className="border-4 border-gray-800 rounded-lg shadow-xl" />

      {showBall && (
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg"
          style={{
            left: ballPosition.x - 20,
            top: ballPosition.y - 20,
          }}
          animate={{
            x: 0,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
          }}
        />
      )}

      {days.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-bold text-white">Select a month to see available days</p>
        </div>
      )}
    </div>
  )
}

