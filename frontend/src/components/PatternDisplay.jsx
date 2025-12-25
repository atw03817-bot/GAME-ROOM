import { useRef, useEffect } from 'react'

function PatternDisplay({ patternValue, size = 150 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (patternValue && canvasRef.current) {
      drawPattern()
    }
  }, [patternValue, size])

  const drawPattern = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = size
    canvas.height = size
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    try {
      const pattern = JSON.parse(patternValue)
      
      // Calculate grid positions for this canvas size
      const gridPositions = []
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const x = (j + 1) * (canvas.width / 4)
          const y = (i + 1) * (canvas.height / 4)
          gridPositions.push({ x, y, row: i, col: j })
        }
      }
      
      // Draw all grid dots
      ctx.fillStyle = '#d1d5db'
      gridPositions.forEach(pos => {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI)
        ctx.fill()
      })
      
      // Draw pattern if exists
      if (pattern && pattern.length > 0) {
        // Convert pattern points to current canvas coordinates
        const scaledPattern = pattern.map(point => {
          // Find the grid position that matches this point's row/col
          const gridPos = gridPositions.find(pos => 
            pos.row === point.row && pos.col === point.col
          )
          return gridPos || point // fallback to original if not found
        })
        
        // Draw connecting lines
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        if (scaledPattern.length > 1) {
          ctx.beginPath()
          ctx.moveTo(scaledPattern[0].x, scaledPattern[0].y)
          
          for (let i = 1; i < scaledPattern.length; i++) {
            ctx.lineTo(scaledPattern[i].x, scaledPattern[i].y)
          }
          ctx.stroke()
        }
        
        // Draw filled dots for pattern points with numbers
        scaledPattern.forEach((point, index) => {
          // Draw blue filled circle
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
          ctx.fill()
          
          // Draw white number on top
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText((index + 1).toString(), point.x, point.y)
        })
        
        // Add arrow indicators for direction
        if (scaledPattern.length > 1) {
          ctx.fillStyle = '#1d4ed8'
          for (let i = 0; i < scaledPattern.length - 1; i++) {
            const current = scaledPattern[i]
            const next = scaledPattern[i + 1]
            
            // Calculate arrow position (midpoint between two points)
            const midX = (current.x + next.x) / 2
            const midY = (current.y + next.y) / 2
            
            // Calculate arrow direction
            const angle = Math.atan2(next.y - current.y, next.x - current.x)
            
            // Draw small arrow
            ctx.save()
            ctx.translate(midX, midY)
            ctx.rotate(angle)
            
            ctx.beginPath()
            ctx.moveTo(-5, -3)
            ctx.lineTo(5, 0)
            ctx.lineTo(-5, 3)
            ctx.closePath()
            ctx.fill()
            
            ctx.restore()
          }
        }
      }
    } catch (error) {
      console.error('Error parsing pattern:', error)
      
      // Draw error message
      ctx.fillStyle = '#ef4444'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('خطأ في عرض النمط', canvas.width / 2, canvas.height / 2)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg bg-white shadow-sm"
        style={{ width: size, height: size }}
      />
      <div className="text-center">
        <p className="text-xs text-gray-500">
          نمط الفتح المحفوظ
        </p>
        {patternValue && (
          <p className="text-xs text-blue-600 font-medium">
            {(() => {
              try {
                const pattern = JSON.parse(patternValue)
                return `${pattern.length} نقطة - اتبع الأرقام والأسهم`
              } catch {
                return 'نمط غير صالح'
              }
            })()}
          </p>
        )}
      </div>
    </div>
  )
}

export default PatternDisplay