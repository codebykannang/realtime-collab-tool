import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";

const COLORS = ["#111111", "#4F46E5", "#FF6B57", "#14B8A6", "#F5A623", "#8B5CF6"];

export default function Whiteboard({ boardId }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const currentStroke = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);

  const getCtx = () => canvasRef.current?.getContext("2d");

  const drawStroke = (stroke) => {
    const ctx = getCtx();
    if (!ctx || !stroke?.points?.length) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  };

  const redrawAll = (strokes) => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawStroke);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = 480;

    // Load persisted strokes for this board
    api.get(`/boards/${boardId}`).then(({ data }) => {
      redrawAll(data.board.whiteboardStrokes || []);
    });

    const socket = getSocket();
    socket.emit("whiteboard:join", { boardId });

    socket.on("whiteboard:draw", (stroke) => drawStroke(stroke));
    socket.on("whiteboard:stroke:end", (stroke) => drawStroke(stroke));
    socket.on("whiteboard:clear", () => {
      const ctx = getCtx();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    socket.on("whiteboard:sync", (strokes) => redrawAll(strokes));

    return () => {
      ["whiteboard:draw", "whiteboard:stroke:end", "whiteboard:clear", "whiteboard:sync"].forEach((ev) =>
        socket.off(ev)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    drawing.current = true;
    const pos = getPos(e);
    currentStroke.current = { id: `${Date.now()}`, points: [pos], color, width };
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    const pos = getPos(e);
    currentStroke.current.points.push(pos);
    drawStroke({ ...currentStroke.current, points: currentStroke.current.points.slice(-2) });

    // Throttle broadcast to every ~2 points to reduce socket traffic (Redis pub/sub still fans this out to all instances)
    if (currentStroke.current.points.length % 2 === 0) {
      getSocket()?.emit("whiteboard:draw", {
        boardId,
        stroke: { ...currentStroke.current, points: currentStroke.current.points.slice(-2) },
      });
    }
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentStroke.current?.points.length > 1) {
      getSocket()?.emit("whiteboard:stroke:end", { boardId, stroke: currentStroke.current });
    }
    currentStroke.current = null;
  };

  const clearBoard = () => getSocket()?.emit("whiteboard:clear", { boardId });
  const undo = () => getSocket()?.emit("whiteboard:undo", { boardId });

  return (
    <div className="bg-white border border-paper-300 rounded-xl overflow-hidden card-shadow">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-ink-900">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              color === c ? "border-white scale-110" : "border-white/20"
            }`}
            style={{ background: c }}
          />
        ))}
        <input
          type="range"
          min={1}
          max={12}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-24 accent-indigo-500"
        />
        <button onClick={undo} className="ml-auto px-3 py-1 text-xs rounded-md bg-white/10 text-white hover:bg-teal-500 transition-colors">
          Undo
        </button>
        <button onClick={clearBoard} className="px-3 py-1 text-xs rounded-md bg-white/10 text-white hover:bg-coral-500 transition-colors">
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full bg-white cursor-crosshair touch-none block"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
    </div>
  );
}
