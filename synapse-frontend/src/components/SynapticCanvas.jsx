import { useEffect, useRef } from 'react'

export default function SynapticCanvas() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.parentElement) return
    const parent = canvas.parentElement
    const ctx    = canvas.getContext('2d')
    let animId
    let W = canvas.width  = parent.clientWidth
    let H = canvas.height = parent.clientHeight

    const NODES = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
    }))

    function draw() {
      ctx.clearRect(0, 0, W, H)
      // Connections
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const dx = NODES[i].x - NODES[j].x
          const dy = NODES[i].y - NODES[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - d / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(NODES[i].x, NODES[i].y)
            ctx.lineTo(NODES[j].x, NODES[j].y)
            ctx.stroke()
          }
        }
      }
      // Nodes
      NODES.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(34,211,238,0.6)'
        ctx.fill()
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return
      W = canvas.width  = canvas.parentElement.clientWidth
      H = canvas.height = canvas.parentElement.clientHeight
    }
    
    // We also use ResizeObserver to catch flexbox layout shifts if window didn't strictly resize
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(parent)
    window.addEventListener('resize', onResize)
    
    return () => { 
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [])
  
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}
