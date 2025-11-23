import React, { useState, useRef, useEffect } from 'react'

const pxPerFoot = 20 // base pixels per foot (unscaled)

function randColor(){
  const h = Math.floor(Math.random()*360)
  return `hsl(${h}deg 80% 70%)`
}

export default function FloorPlanner(){
  const [floorW, setFloorW] = useState(20) // feet
  const [floorH, setFloorH] = useState(15) // feet
  const [gridFeet, setGridFeet] = useState(2) // each grid cell = x feet
  const [rooms, setRooms] = useState(() => {
    try{
      const raw = localStorage.getItem('floorplan_autosave')
      return raw ? JSON.parse(raw) : []
    }catch(e){return []}
  })
  const [roomName, setRoomName] = useState('Room')
  const [roomL, setRoomL] = useState(10)
  const [roomB, setRoomB] = useState(8)
  const [scale, setScale] = useState(1)

  const containerRef = useRef(null)
  const containerWrapRef = useRef(null)
  const draggingRef = useRef(null)
  const resizingRef = useRef(null)

  const gridPx = gridFeet * pxPerFoot
  const containerPxW = Math.round(floorW * pxPerFoot)
  const containerPxH = Math.round(floorH * pxPerFoot)

  useEffect(()=>{ // autosave
    localStorage.setItem('floorplan_autosave', JSON.stringify(rooms))
  }, [rooms])

  function addRoom(){
    const room = {
      id: Date.now(),
      name: roomName || 'Room',
      wFeet: Number(roomL),
      hFeet: Number(roomB),
      xFeet: 0,
      yFeet: 0,
      color: randColor()
    }
    setRooms(r => [...r, room])
  }

  function startDrag(e, room){
    e.preventDefault()
    draggingRef.current = { id: room.id, startX: e.clientX, startY: e.clientY, origX: room.xFeet, origY: room.yFeet }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', endDrag)
  }

  function onDrag(e){
    const drag = draggingRef.current
    if(!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    const dxFeet = dx / (pxPerFoot * scale)
    const dyFeet = dy / (pxPerFoot * scale)
    let nx = drag.origX + dxFeet
    let ny = drag.origY + dyFeet
    // constrain to floor
    const room = rooms.find(r => r.id === drag.id)
    if(!room) return
    nx = Math.max(0, Math.min(nx, floorW - room.wFeet))
    ny = Math.max(0, Math.min(ny, floorH - room.hFeet))
    // snap to grid
    nx = Math.round(nx / gridFeet) * gridFeet
    ny = Math.round(ny / gridFeet) * gridFeet
    setRooms(rs => rs.map(r => r.id===drag.id ? {...r, xFeet:nx, yFeet:ny} : r))
  }

  function endDrag(){
    draggingRef.current = null
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', endDrag)
  }

  function startResize(e, room){
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = { id: room.id, startX: e.clientX, startY: e.clientY, origW: room.wFeet, origH: room.hFeet }
    window.addEventListener('mousemove', onResize)
    window.addEventListener('mouseup', endResize)
  }

  function onResize(e){
    const rs = resizingRef.current
    if(!rs) return
    const dx = e.clientX - rs.startX
    const dy = e.clientY - rs.startY
    const dwFeet = dx / (pxPerFoot * scale)
    const dhFeet = dy / (pxPerFoot * scale)
    let nw = Math.max(1, rs.origW + dwFeet)
    let nh = Math.max(1, rs.origH + dhFeet)
    // snap to grid
    nw = Math.max(gridFeet, Math.round(nw / gridFeet) * gridFeet)
    nh = Math.max(gridFeet, Math.round(nh / gridFeet) * gridFeet)
    // constrain to floor (need room position)
    const room = rooms.find(r => r.id === rs.id)
    if(!room) return
    nw = Math.min(nw, floorW - room.xFeet)
    nh = Math.min(nh, floorH - room.yFeet)
    setRooms(all => all.map(r => r.id===rs.id ? {...r, wFeet: nw, hFeet: nh} : r))
  }

  function endResize(){
    resizingRef.current = null
    window.removeEventListener('mousemove', onResize)
    window.removeEventListener('mouseup', endResize)
  }

  // adjacency: determine which borders to hide for common walls
  function computeBorders(){
    const map = {}
    for(const a of rooms){
      map[a.id] = {hideLeft:false, hideRight:false, hideTop:false, hideBottom:false}
    }
    for(let i=0;i<rooms.length;i++){
      for(let j=i+1;j<rooms.length;j++){
        const A = rooms[i]
        const B = rooms[j]
        // coordinates in feet
        const Ax1 = A.xFeet, Ay1 = A.yFeet, Ax2 = A.xFeet + A.wFeet, Ay2 = A.yFeet + A.hFeet
        const Bx1 = B.xFeet, By1 = B.yFeet, Bx2 = B.xFeet + B.wFeet, By2 = B.yFeet + B.hFeet
        // horizontal adjacency: A to left of B
        const yOverlap = Math.max(0, Math.min(Ay2, By2) - Math.max(Ay1, By1))
        if(Math.abs(Ax2 - Bx1) < 1e-3 && yOverlap > 0){
          map[A.id].hideRight = true
          map[B.id].hideLeft = true
        }
        if(Math.abs(Bx2 - Ax1) < 1e-3 && yOverlap > 0){
          map[B.id].hideRight = true
          map[A.id].hideLeft = true
        }
        // vertical adjacency: A above B
        const xOverlap = Math.max(0, Math.min(Ax2, Bx2) - Math.max(Ax1, Bx1))
        if(Math.abs(Ay2 - By1) < 1e-3 && xOverlap > 0){
          map[A.id].hideBottom = true
          map[B.id].hideTop = true
        }
        if(Math.abs(By2 - Ay1) < 1e-3 && xOverlap > 0){
          map[B.id].hideBottom = true
          map[A.id].hideTop = true
        }
      }
    }
    return map
  }

  const borders = computeBorders()

  function savePlan(){
    const name = prompt('Save plan as (name):', 'My Plan') || `plan-${Date.now()}`
    const saved = JSON.parse(localStorage.getItem('saved_floor_plans') || '[]')
    saved.push({name, meta:{floorW, floorH, gridFeet}, rooms})
    localStorage.setItem('saved_floor_plans', JSON.stringify(saved))
    alert('Saved')
  }

  function loadPlan(){
    const saved = JSON.parse(localStorage.getItem('saved_floor_plans') || '[]')
    if(saved.length===0){ alert('No saved plans found'); return }
    const names = saved.map((s,i)=>`${i}: ${s.name}`).join('\n')
    const idx = parseInt(prompt('Choose plan index:\n'+names, '0')||'0',10)
    if(Number.isNaN(idx) || !saved[idx]) return
    const p = saved[idx]
    setFloorW(p.meta.floorW)
    setFloorH(p.meta.floorH)
    setGridFeet(p.meta.gridFeet)
    setRooms(p.rooms)
  }

  function clearPlan(){
    if(!confirm('Clear current plan?')) return
    setRooms([])
  }

  function fitToView(){
    const wrap = containerWrapRef.current
    if(!wrap) return
    const aw = wrap.clientWidth - 16 // some padding
    const ah = wrap.clientHeight - 16
    const s = Math.min(aw / containerPxW, ah / containerPxH, 1)
    setScale(s || 1)
  }

  return (
    <div className="planner">
      <div className="controls">
        <div>
          <label>Floor Width (ft): <input type="number" value={floorW} onChange={e=>setFloorW(Number(e.target.value))} /></label>
          <label>Floor Height (ft): <input type="number" value={floorH} onChange={e=>setFloorH(Number(e.target.value))} /></label>
        </div>
        <div>
          <label>Grid Size (ft per cell): <input type="number" value={gridFeet} onChange={e=>setGridFeet(Number(e.target.value) || 1)} /></label>
        </div>

        <div className="new-room">
          <h4>Create Room</h4>
          <label>Name: <input value={roomName} onChange={e=>setRoomName(e.target.value)} /></label>
          <label>Length (ft): <input type="number" value={roomL} onChange={e=>setRoomL(Number(e.target.value))} /></label>
          <label>Breadth (ft): <input type="number" value={roomB} onChange={e=>setRoomB(Number(e.target.value))} /></label>
          <button onClick={addRoom}>Add Room</button>
        </div>

        <div className="actions">
          <button onClick={savePlan}>Save Plan</button>
          <button onClick={loadPlan}>Load Plan</button>
          <button onClick={clearPlan}>Clear</button>
          <button onClick={() => window.print()}>Print</button>
        </div>

        <div style={{marginTop:12}}>
          <h4>View / Scale</h4>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={()=>setScale(s=>Math.max(0.1, +(s-0.1).toFixed(2)))}>-</button>
            <div>Zoom: {(scale*100).toFixed(0)}%</div>
            <button onClick={()=>setScale(s=>Math.min(3, +(s+0.1).toFixed(2)))}>+</button>
            <button onClick={fitToView}>Fit to view</button>
          </div>
        </div>
      </div>

      <div className="canvas-wrap" ref={containerWrapRef}>
        <div className="canvas" ref={containerRef}
             style={{width:containerPxW, height:containerPxH, backgroundSize: `${gridPx}px ${gridPx}px`, border: '1px solid #ddd', transform: `scale(${scale})`, transformOrigin: 'top left'}}>
          {rooms.map(r=>{
            const left = Math.round(r.xFeet * pxPerFoot)
            const top = Math.round(r.yFeet * pxPerFoot)
            const width = Math.round(r.wFeet * pxPerFoot)
            const height = Math.round(r.hFeet * pxPerFoot)
            const b = borders[r.id] || {}
            const style = {
              left, top, width, height, background: r.color, position: 'absolute',
              border: '2px solid #222', boxSizing: 'border-box', cursor: 'grab',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }
            if(b.hideLeft) style.borderLeftWidth = 0
            if(b.hideRight) style.borderRightWidth = 0
            if(b.hideTop) style.borderTopWidth = 0
            if(b.hideBottom) style.borderBottomWidth = 0
            return (
              <div key={r.id} className="room" style={style} onMouseDown={(e)=>startDrag(e,r)}>
                <div style={{pointerEvents:'none', fontSize:12}}>{r.name}<br/>{r.wFeet}×{r.hFeet} ft</div>
                <div className="resize-handle" onMouseDown={(e)=>startResize(e,r)} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
