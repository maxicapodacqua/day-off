"use client"

import { useRef, useEffect } from "react"

interface DayWheelProps {
  days: Date[]
  isSpinning: boolean
  selectedDate: Date | null
  isHoliday: (date: Date) => boolean
  targetDate?: Date | null
  onSpinComplete?: (date: Date) => void
}

export function DayWheel({ days, isSpinning, selectedDate, isHoliday, targetDate, onSpinComplete }: DayWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spinningRef = useRef<boolean>(false)
  const animationRef = useRef<number | null>(null)
  const finalDateRef = useRef<Date | null>(null)

  useEffect(() => {
    if (!canvasRef.current || days.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = 300
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw wheel
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    // Draw segments
    const segmentAngle = (2 * Math.PI) / days.length
    // Add a slight offset to align segments with the pointer
    const startOffset = -segmentAngle / 2

    // Draw wheel background
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "#f8f8f8"
    ctx.fill()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 2
    ctx.stroke()

    days.forEach((day, index) => {
      const startAngle = startOffset + index * segmentAngle
      const endAngle = startOffset + (index + 1) * segmentAngle

      // Determine if this day is a holiday
      const holiday = isHoliday(day)

      // Set segment color
      ctx.fillStyle = holiday ? "#FF6B6B" : day.getDay() === 1 ? "#4ECDC4" : "#FFE66D"

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      // Add segment border
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add date text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#000"
      ctx.font = "bold 14px Arial"

      const dayOfMonth = day.getDate()
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" })

      ctx.fillText(`${dayName} ${dayOfMonth}`, radius - 20, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#333"
    ctx.fill()

    // Draw outer arrow (outside the wheel)
    const arrowSize = 20
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 5) // Start at top center, just outside the wheel
    ctx.lineTo(centerX - arrowSize, centerY - radius - arrowSize - 5) // Left point
    ctx.lineTo(centerX + arrowSize, centerY - radius - arrowSize - 5) // Right point
    ctx.closePath()
    ctx.fillStyle = "#FF0000"
    ctx.fill()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Animation for spinning
    if (isSpinning && !spinningRef.current) {
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      spinningRef.current = true
      let rotation = 0
      let startTime: number | null = null
      const spinDuration = 3000 // 3 seconds in milliseconds

      // Physics constants for natural spinning
      const minRotations = 5 // Minimum number of full rotations
      const maxRotations = 10 // Maximum number of full rotations

      // Find index of the target date
      let targetIndex = -1

      if (targetDate) {
        // Find the index of the target date by comparing date strings
        targetIndex = days.findIndex(
          (day) =>
            day.getDate() === targetDate.getDate() &&
            day.getMonth() === targetDate.getMonth() &&
            day.getFullYear() === targetDate.getFullYear(),
        )

        // Store the actual date object from the days array
        if (targetIndex !== -1) {
          finalDateRef.current = days[targetIndex]
        }
      }

      // If no target date or not found, use random
      if (targetIndex === -1) {
        targetIndex = Math.floor(Math.random() * days.length)
        finalDateRef.current = days[targetIndex]
      }

      console.log("Target index:", targetIndex, "Target date:", finalDateRef.current?.toDateString())

      // Calculate the exact angle needed to land on the target segment
      // The segment should be centered under the arrow
      const targetAngle = startOffset + (targetIndex + 0.5) * segmentAngle

      // We need to rotate clockwise, so we need a negative angle
      // Plus we need to add enough full rotations to make it spin several times
      const fullRotations = minRotations + Math.random() * (maxRotations - minRotations)
      const targetRotation = fullRotations * 2 * Math.PI - targetAngle

      console.log("Target angle:", targetAngle, "Target rotation:", targetRotation)

      const animate = (timestamp: number) => {
        if (!canvasRef.current) return

        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / spinDuration, 1) // 0 to 1

        // Easing function for natural slowdown (cubic ease-out)
        // Start fast, end slow
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

        // Calculate current rotation based on easing
        rotation = targetRotation * easeOut(progress)

        // Clear canvas
        ctx.clearRect(0, 0, size, size)

        // Draw wheel background
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fillStyle = "#f8f8f8"
        ctx.fill()
        ctx.strokeStyle = "#333"
        ctx.lineWidth = 2
        ctx.stroke()

        // Save context state
        ctx.save()

        // Translate to center and rotate
        ctx.translate(centerX, centerY)
        ctx.rotate(rotation)
        ctx.translate(-centerX, -centerY)

        // Redraw wheel
        days.forEach((day, index) => {
          const startAngle = startOffset + index * segmentAngle
          const endAngle = startOffset + (index + 1) * segmentAngle

          const holiday = isHoliday(day)
          ctx.fillStyle = holiday ? "#FF6B6B" : day.getDay() === 1 ? "#4ECDC4" : "#FFE66D"

          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, endAngle)
          ctx.closePath()
          ctx.fill()

          ctx.strokeStyle = "#333"
          ctx.lineWidth = 1
          ctx.stroke()

          // Add date text
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(startAngle + segmentAngle / 2)
          ctx.textAlign = "right"
          ctx.fillStyle = "#000"
          ctx.font = "bold 14px Arial"

          const dayOfMonth = day.getDate()
          const dayName = day.toLocaleDateString("en-US", { weekday: "short" })

          ctx.fillText(`${dayName} ${dayOfMonth}`, radius - 20, 5)
          ctx.restore()
        })

        // Restore context state
        ctx.restore()

        // Draw center circle (not affected by rotation)
        ctx.beginPath()
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
        ctx.fillStyle = "#333"
        ctx.fill()

        // Draw outer arrow (outside the wheel, not affected by rotation)
        const arrowSize = 20
        ctx.beginPath()
        ctx.moveTo(centerX, centerY - radius - 5) // Start at top center, just outside the wheel
        ctx.lineTo(centerX - arrowSize, centerY - radius - arrowSize - 5) // Left point
        ctx.lineTo(centerX + arrowSize, centerY - radius - arrowSize - 5) // Right point
        ctx.closePath()
        ctx.fillStyle = "#FF0000"
        ctx.fill()
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.stroke()

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          // Spinning is complete
          spinningRef.current = false
          animationRef.current = null

          // Debug: Check if we landed on the correct segment
          console.log("Final rotation:", rotation % (2 * Math.PI))
          console.log("Should land on segment at angle:", targetAngle)

          // Notify parent component of the selected date
          if (onSpinComplete && finalDateRef.current) {
            onSpinComplete(finalDateRef.current)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Highlight selected date if not spinning
    if (selectedDate && !isSpinning && !spinningRef.current) {
      const selectedIndex = days.findIndex(
        (day) =>
          day.getDate() === selectedDate.getDate() &&
          day.getMonth() === selectedDate.getMonth() &&
          day.getFullYear() === selectedDate.getFullYear(),
      )

      if (selectedIndex >= 0) {
        const startAngle = startOffset + selectedIndex * segmentAngle
        const endAngle = startOffset + (selectedIndex + 1) * segmentAngle

        // Draw highlight
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius + 5, startAngle, endAngle)
        ctx.closePath()
        ctx.strokeStyle = "#FF0000"
        ctx.lineWidth = 5
        ctx.stroke()
      }
    }

    // Cleanup function to cancel animation on unmount or re-render
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [days, isSpinning, selectedDate, isHoliday, targetDate, onSpinComplete])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={300} height={300} className="border-4 border-gray-800 rounded-full shadow-xl" />
      {days.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-bold text-gray-500">Select a month to see available days</p>
        </div>
      )}
    </div>
  )
}

