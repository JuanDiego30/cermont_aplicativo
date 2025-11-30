'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, X, RotateCcw, Pen } from 'lucide-react';

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  lineColor?: string;
  lineWidth?: number;
  backgroundColor?: string;
  disabled?: boolean;
}

export function SignatureCanvas({
  width = 500,
  height = 200,
  onSave,
  onCancel,
  lineColor = '#000000',
  lineWidth = 2,
  backgroundColor = '#ffffff',
  disabled = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(dpr, dpr);

    // Set drawing styles
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Fill background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);

    setCtx(context);
  }, [width, height, lineColor, lineWidth, backgroundColor]);

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }

      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !ctx) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    },
    [ctx, disabled, getCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled || !ctx) return;

      e.preventDefault();
      const coords = getCoordinates(e);
      if (!coords) return;

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasSignature(true);
    },
    [isDrawing, ctx, disabled, getCoordinates]
  );

  const stopDrawing = useCallback(() => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  }, [ctx]);

  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
  }, [ctx, width, height, backgroundColor]);

  const saveSignature = useCallback(() => {
    if (!canvasRef.current || !hasSignature) return;

    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  }, [hasSignature, onSave]);

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`border-2 rounded-lg cursor-crosshair touch-none ${
            disabled
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
              : 'border-gray-400 dark:border-gray-600 bg-white'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Signature line */}
        <div className="absolute bottom-8 left-8 right-8 border-b-2 border-dashed border-gray-300 dark:border-gray-600" />
        
        {/* Helper text */}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-gray-400">
              <Pen className="w-5 h-5" />
              <span className="text-sm">Firme aquí</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={clearCanvas}
          disabled={disabled || !hasSignature}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpiar</span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          <button
            type="button"
            onClick={saveSignature}
            disabled={disabled || !hasSignature}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Firma</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignatureCanvas;
