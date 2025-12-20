'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface DrawingPoint {
  x: number;
  y: number;
}

interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser' | 'highlighter';
}

interface WhiteboardAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WhiteboardApp({
  isVisible,
  onClose,
}: WhiteboardAppProps) {
  const colors = useThemeColors();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [selectedTool, setSelectedTool] = useState<
    'pen' | 'eraser' | 'highlighter'
  >('pen');
  const [selectedColor, setSelectedColor] = useState('colors.brand.primary');
  const [brushSize, setBrushSize] = useState(3);
  const [showGrid, setShowGrid] = useState(false);

  const colorOptions = [
    'colors.brand.primary',
    'colors.brand.tertiary',
    '#ff6b6b',
    '#ffa502',
    '#2ed573',
    '#1e90ff',
    '#ffffff',
    '#000000',
    '#888888',
    '#ff00ff',
    '#00ffff',
    '#ffff00',
  ];

  const brushSizes = [2, 4, 6, 8, 12, 16];

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      const gridSize = 20;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= rect.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y <= rect.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    }

    strokes.forEach((stroke) => drawStroke(ctx, stroke));

    if (currentStroke.length > 0) {
      drawStroke(ctx, {
        id: 'temp',
        points: currentStroke,
        color: selectedColor,
        width: brushSize,
        tool: selectedTool,
      });
    }
  }, [
    isVisible,
    strokes,
    currentStroke,
    selectedColor,
    brushSize,
    selectedTool,
    showGrid,
  ]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = stroke.width * 2;
    } else if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const getPointFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEvent(e);
      if (!point) return;
      setIsDrawing(true);
      setCurrentStroke([point]);
    },
    [getPointFromEvent]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getPointFromEvent(e);
      if (!point) return;
      setCurrentStroke((prev) => [...prev, point]);
    },
    [isDrawing, getPointFromEvent]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentStroke.length === 0) return;
    setStrokes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        points: currentStroke,
        color: selectedColor,
        width: brushSize,
        tool: selectedTool,
      },
    ]);
    setCurrentStroke([]);
    setIsDrawing(false);
  }, [isDrawing, currentStroke, selectedColor, brushSize, selectedTool]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
  }, []);

  const undoLastStroke = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🎨</span> Whiteboard Pro
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Draw, sketch, and create
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={downloadCanvas}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            💾
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Tools */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'pen', icon: '✏️', label: 'Pen' },
              { id: 'highlighter', icon: '🖍️', label: 'Highlighter' },
              { id: 'eraser', icon: '🧽', label: 'Eraser' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id as typeof selectedTool)}
                title={tool.label}
                style={{
                  background:
                    selectedTool === tool.id
                      ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          <div
            style={{
              width: '1px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
            }}
          />

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={undoLastStroke}
              disabled={strokes.length === 0}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: strokes.length > 0 ? 'pointer' : 'not-allowed',
                opacity: strokes.length > 0 ? 1 : 0.5,
                fontSize: '0.9rem',
                color: 'white',
              }}
            >
              ↶
            </button>
            <button
              onClick={clearCanvas}
              disabled={strokes.length === 0}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: strokes.length > 0 ? 'pointer' : 'not-allowed',
                opacity: strokes.length > 0 ? 1 : 0.5,
                fontSize: '0.9rem',
                color: 'white',
              }}
            >
              🗑️
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              style={{
                background: showGrid
                  ? 'rgba(102, 126, 234, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'white',
              }}
            >
              ⊞
            </button>
          </div>
        </div>

        {/* Colors */}
        {selectedTool !== 'eraser' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border:
                    selectedColor === color
                      ? '2px solid rgba(255, 255, 255, 0.8)'
                      : '2px solid transparent',
                  background: color,
                  cursor: 'pointer',
                  boxShadow:
                    selectedColor === color
                      ? '0 0 8px rgba(102, 126, 234, 0.5)'
                      : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Brush Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Size:
          </span>
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border:
                  brushSize === size
                    ? '2px solid rgba(102, 126, 234, 0.8)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                background:
                  brushSize === size
                    ? 'rgba(102, 126, 234, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: Math.min(size * 2, 16),
                  height: Math.min(size * 2, 16),
                  borderRadius: '50%',
                  background:
                    selectedTool === 'eraser'
                      ? 'rgba(255, 255, 255, 0.5)'
                      : selectedColor,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            height: '100%',
            cursor: selectedTool === 'eraser' ? 'cell' : 'crosshair',
          }}
        />

        {/* Status Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <span>Strokes: {strokes.length}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Tool: {selectedTool} | Size: {brushSize}px
            {selectedTool !== 'eraser' && (
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: selectedColor,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
