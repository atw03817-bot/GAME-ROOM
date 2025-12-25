import { useState, useRef, useEffect } from 'react'

function PatternInput({ value, onChange, disabled = false }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [pattern, setPattern] = useState([])

  useEffect(() => {
    if (value) {
      try {
        const savedPattern = JSON.parse(value)
        setPattern(savedPattern)
        drawPattern(savedPattern)
      } catch (error) {
        console.error('Error parsing pattern:', error)
      }
    }
  }, [value])

  const drawPattern = (patternPoints = pattern) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid dots
    ctx.fillStyle = '#d1d5db'
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (j + 1) * (canvas.width / 4)
        const y = (i + 1) * (canvas.height / 4)
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
    
    // Draw pattern
    if (patternPoints.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(patternPoints[0].x, patternPoints[0].y)
      
      for (let i = 1; i < patternPoints.length; i++) {
        ctx.lineTo(patternPoints[i].x, patternPoints[i].y)
      }
      ctx.stroke()
      
      // Draw dots for pattern points
      ctx.fillStyle = '#3b82f6'
      patternPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
        ctx.fill()
      })
    }
  }

  const getGridPosition = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top
    
    // Find closest grid point
    let closestPoint = null
    let minDistance = Infinity
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const gridX = (j + 1) * (canvas.width / 4)
        const gridY = (i + 1) * (canvas.height / 4)
        const distance = Math.sqrt((canvasX - gridX) ** 2 + (canvasY - gridY) ** 2)
        
        if (distance < minDistance && distance < 30) {
          minDistance = distance
          closestPoint = { x: gridX, y: gridY, row: i, col: j }
        }
      }
    }
    
    return closestPoint
  }

  const handleStart = (clientX, clientY) => {
    if (disabled) return
    
    const point = getGridPosition(clientX, clientY)
    if (point) {
      setIsDrawing(true)
      const newPattern = [{ x: point.x, y: point.y, row: point.row, col: point.col }]
      setPattern(newPattern)
      drawPattern(newPattern)
    }
  }

  const handleMove = (clientX, clientY) => {
    if (!isDrawing || disabled) return
    
    const point = getGridPosition(clientX, clientY)
    if (point) {
      const exists = pattern.some(p => p.row === point.row && p.col === point.col)
      if (!exists) {
        const newPattern = [...pattern, { x: point.x, y: point.y, row: point.row, col: point.col }]
        setPattern(newPattern)
        drawPattern(newPattern)
      }
    }
  }

  const handleEnd = () => {
    if (disabled) return
    
    setIsDrawing(false)
    if (pattern.length > 0) {
      onChange(JSON.stringify(pattern))
    }
  }

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e) => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e) => {
    handleEnd()
  }

  const clearPattern = () => {
    if (disabled) return
    
    setPattern([])
    onChange('')
    drawPattern([])
  }

  useEffect(() => {
    drawPattern()
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="border-2 border-gray-300 rounded-lg cursor-pointer bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
        {disabled && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg"></div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          ارسم النمط بالضغط والسحب على النقاط
        </p>
        {!disabled && (
          <button
            type="button"
            onClick={clearPattern}
            className="text-xs text-red-600 hover:text-red-700 underline"
          >
            مسح النمط
          </button>
        )}
      </div>
      
      {pattern.length > 0 && (
        <p className="text-xs text-green-600">
          تم رسم نمط من {pattern.length} نقطة
        </p>
      )}
    </div>
  )
}

export default PatternInput