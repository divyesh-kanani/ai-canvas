import { useRef, useState, type PointerEvent } from "react";
import type { Note } from "../types/note";

interface StickyNoteProps {
  note: Note;
  boardScale?: number;
  isSelected: boolean;
  connectMode: boolean;
  isLinkSource: boolean;
  onSelect: () => void;
  onConnectStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onUpdate: (update: Partial<Note>) => void;
}

const palette = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fef2f2"];

function StickyNote({ note, boardScale = 1, isSelected, connectMode, isLinkSource, onSelect, onConnectStart, onUpdate }: StickyNoteProps) {
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("input") || target.closest("textarea") || target.closest("button") || target.classList.contains("connect-point")) {
      return;
    }
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, x: note.x, y: note.y };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeRef.current) {
      const deltaX = (event.clientX - resizeRef.current.startX) / boardScale;
      const deltaY = (event.clientY - resizeRef.current.startY) / boardScale;
      onUpdate({
        width: Math.max(180, resizeRef.current.width + deltaX),
        height: Math.max(140, resizeRef.current.height + deltaY),
      });
      return;
    }

    if (!dragRef.current) {
      return;
    }

    const deltaX = (event.clientX - dragRef.current.startX) / boardScale;
    const deltaY = (event.clientY - dragRef.current.startY) / boardScale;
    onUpdate({ x: Math.max(0, dragRef.current.x + deltaX), y: Math.max(0, dragRef.current.y + deltaY) });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    resizeRef.current = null;
    setIsDragging(false);
  };

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      width: note.width,
      height: note.height,
    };
  };

  return (
    <div
      className={`absolute rounded-3xl border p-3 shadow-[0_22px_80px_rgba(15,23,42,0.15)] transition-all ${
        isSelected ? "border-slate-500/60 ring-2 ring-slate-400/40" : "border-transparent"
      }`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="mb-3 flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl dark:bg-slate-950/70 dark:text-slate-100"
      >
        <input
          className="w-full bg-transparent text-left text-sm font-semibold outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
          value={note.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
          onClick={(event) => event.stopPropagation()}
          placeholder="Title"
        />
        <button
          type="button"
          className={`connect-point ml-3 h-8 w-8 rounded-full border-2 transition ${
            isLinkSource ? "border-rose-500 bg-rose-500/20" : "border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800/80"
          }`}
          onPointerDown={(event) => {
            event.stopPropagation();
            onConnectStart(event);
          }}
          title={connectMode ? "Choose target note" : "Start connecting"}
        />
      </div>

      <textarea
        className="h-[calc(100%-104px)] w-full resize-none bg-transparent text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-600 dark:text-slate-900 dark:placeholder:text-slate-500"
        value={note.content}
        onChange={(event) => onUpdate({ content: event.target.value })}
        onClick={(event) => event.stopPropagation()}
      />

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-700">
        <div className="flex gap-1">
          {palette.map((color) => (
            <button
              key={color}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUpdate({ color });
              }}
              className="h-7 w-7 rounded-full border border-slate-300/70 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div
          className="absolute right-3 bottom-3 h-4 w-4 cursor-se-resize rounded-sm bg-slate-700/40"
          onPointerDown={handleResizeStart}
        />
      </div>
    </div>
  );
}

export default StickyNote;
