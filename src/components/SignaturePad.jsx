import { useEffect, useRef, useState } from "react";
import { Button } from "@fluentui/react-components";

export default function SignaturePad({
  width = 720,
  height = 180,
  onChangePngDataUrl,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(false);

  function setupCanvas() {
    const c = canvasRef.current;
    if (!c) return;

    const dpr = window.devicePixelRatio || 1;

    // Preserve CSS size while scaling internal bitmap for crisp lines
    c.style.width = "100%";
    c.style.maxWidth = `${width}px`;

    c.width = Math.floor(width * dpr);
    c.height = Math.floor(height * dpr);

    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;
  }

  useEffect(() => {
    setupCanvas();

    const onResize = () => {
      // If you want responsive reflow, you'd need to snapshot and redraw.
      // For now, keep it stable.
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function getPosFromPointerEvent(e) {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    const c = canvasRef.current;
    c.setPointerCapture?.(e.pointerId);

    drawingRef.current = true;
    lastRef.current = getPosFromPointerEvent(e);
  }

  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    const pos = getPosFromPointerEvent(e);

    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastRef.current = pos;
    if (!hasInk) setHasInk(true);
  }

  function end(e) {
    if (!drawingRef.current) return;
    e?.preventDefault?.();
    drawingRef.current = false;

    // If nothing was drawn, emit empty signature, not a blank PNG.
    if (!hasInk) {
      onChangePngDataUrl?.("");
      return;
    }

    const c = canvasRef.current;

    // Convert at native resolution; the browser handles it.
    const png = c.toDataURL("image/png");
    onChangePngDataUrl?.(png);
  }

  function clear() {
    const c = canvasRef.current;
    const ctx = ctxRef.current;
    if (!c || !ctx) return;

    // Clear in CSS pixel space (transform already set)
    ctx.clearRect(0, 0, width, height);
    setHasInk(false);
    onChangePngDataUrl?.("");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #c8c8c8",
          borderRadius: 8,
          background: "white",
          touchAction: "none",
          display: "block",
          width: "100%",
          maxWidth: width,
          height,
        }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        aria-label="Signature canvas"
      />
      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <Button appearance="secondary" onClick={clear} disabled={!hasInk}>
          Clear
        </Button>
      </div>
    </div>
  );
}
