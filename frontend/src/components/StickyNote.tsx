// import { useRef, useState, type PointerEvent } from "react";
// import type { Note } from "../types/note";

// interface StickyNoteProps {
//   note: Note;
//   boardScale?: number;
//   isSelected: boolean;
//   connectMode: boolean;
//   isLinkSource: boolean;
//   onSelect: () => void;
//   onConnectStart: (event: PointerEvent<HTMLButtonElement>) => void;
//   onUpdate: (update: Partial<Note>) => void;
// }

// const palette = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fef2f2"];

// function StickyNote({ note, boardScale = 1, isSelected, connectMode, isLinkSource, onSelect, onConnectStart, onUpdate }: StickyNoteProps) {
//   const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
//   const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
//   const [isDragging, setIsDragging] = useState(false);

//   const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
//     if (event.button !== 0) return;
//     const target = event.target as HTMLElement;
//     if (target.closest("input") || target.closest("textarea") || target.closest("button") || target.classList.contains("connect-point")) {
//       return;
//     }
//     event.stopPropagation();
//     event.currentTarget.setPointerCapture(event.pointerId);
//     dragRef.current = { startX: event.clientX, startY: event.clientY, x: note.x, y: note.y };
//     setIsDragging(true);
//   };

//   const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
//     if (resizeRef.current) {
//       const deltaX = (event.clientX - resizeRef.current.startX) / boardScale;
//       const deltaY = (event.clientY - resizeRef.current.startY) / boardScale;
//       onUpdate({
//         width: Math.max(180, resizeRef.current.width + deltaX),
//         height: Math.max(140, resizeRef.current.height + deltaY),
//       });
//       return;
//     }

//     if (!dragRef.current) {
//       return;
//     }

//     const deltaX = (event.clientX - dragRef.current.startX) / boardScale;
//     const deltaY = (event.clientY - dragRef.current.startY) / boardScale;
//     onUpdate({ x: Math.max(0, dragRef.current.x + deltaX), y: Math.max(0, dragRef.current.y + deltaY) });
//   };

//   const handlePointerUp = () => {
//     dragRef.current = null;
//     resizeRef.current = null;
//     setIsDragging(false);
//   };

//   const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
//     event.stopPropagation();
//     if (event.button !== 0) return;
//     event.currentTarget.setPointerCapture(event.pointerId);
//     resizeRef.current = {
//       startX: event.clientX,
//       startY: event.clientY,
//       width: note.width,
//       height: note.height,
//     };
//   };

//   return (
//     <div
//       className={`absolute rounded-3xl border p-3 shadow-[0_22px_80px_rgba(15,23,42,0.15)] transition-all ${
//         isSelected ? "border-slate-500/60 ring-2 ring-slate-400/40" : "border-transparent"
//       }`}
//       style={{
//         left: note.x,
//         top: note.y,
//         width: note.width,
//         height: note.height,
//         backgroundColor: note.color,
//         cursor: isDragging ? "grabbing" : "grab",
//       }}
//       onClick={(event) => {
//         event.stopPropagation();
//         onSelect();
//       }}
//       onPointerDown={handlePointerDown}
//       onPointerMove={handlePointerMove}
//       onPointerUp={handlePointerUp}
//       onPointerCancel={handlePointerUp}
//     >
//       <div
//         className="mb-3 flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl dark:bg-slate-950/70 dark:text-slate-100"
//       >
//         <input
//           className="w-full bg-transparent text-left text-sm font-semibold outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
//           value={note.title}
//           onChange={(event) => onUpdate({ title: event.target.value })}
//           onClick={(event) => event.stopPropagation()}
//           placeholder="Title"
//         />
//         <button
//           type="button"
//           className={`connect-point ml-3 h-8 w-8 rounded-full border-2 transition ${
//             isLinkSource ? "border-rose-500 bg-rose-500/20" : "border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800/80"
//           }`}
//           onPointerDown={(event) => {
//             event.stopPropagation();
//             onConnectStart(event);
//           }}
//           title={connectMode ? "Choose target note" : "Start connecting"}
//         />
//       </div>

//       <textarea
//         className="h-[calc(100%-104px)] w-full resize-none bg-transparent text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-600 dark:text-slate-900 dark:placeholder:text-slate-500"
//         value={note.content}
//         onChange={(event) => onUpdate({ content: event.target.value })}
//         onClick={(event) => event.stopPropagation()}
//       />

//       <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-700">
//         <div className="flex gap-1">
//           {palette.map((color) => (
//             <button
//               key={color}
//               type="button"
//               onClick={(event) => {
//                 event.stopPropagation();
//                 onUpdate({ color });
//               }}
//               className="h-7 w-7 rounded-full border border-slate-300/70 shadow-sm"
//               style={{ backgroundColor: color }}
//             />
//           ))}
//         </div>
//         <div
//           className="absolute right-3 bottom-3 h-4 w-4 cursor-se-resize rounded-sm bg-slate-700/40"
//           onPointerDown={handleResizeStart}
//         />
//       </div>
//     </div>
//   );
// }

// export default StickyNote;


























import { memo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Note } from "../types/note";

export type Side = "top" | "right" | "bottom" | "left";

export const BOARD_SIZE = 3200;
const MIN_WIDTH = 180;
const MIN_HEIGHT = 140;

/** Which sides show a "+" connect handle. Add "left" here for all four. */
const HANDLE_SIDES: Side[] = ["top", "right", "bottom"];

const PALETTE = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fecaca"];

const HANDLE_POSITION: Record<Side, string> = {
  top: "left-1/2 -top-3.5 -translate-x-1/2",
  right: "top-1/2 -right-3.5 -translate-y-1/2",
  bottom: "left-1/2 -bottom-3.5 -translate-x-1/2",
  left: "top-1/2 -left-3.5 -translate-y-1/2",
};

interface StickyNoteProps {
  note: Note;
  zoom: number;
  isSelected: boolean;
  isLinkSource: boolean;
  isConnectTarget: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, update: Partial<Note>) => void;
  onConnectStart: (id: string, side: Side, event: ReactPointerEvent<HTMLButtonElement>) => void;
}

function StickyNote({
  note,
  zoom,
  isSelected,
  isLinkSource,
  isConnectTarget,
  onSelect,
  onUpdate,
  onConnectStart,
}: StickyNoteProps) {
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* ---------- drag ---------- */

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("input, textarea, button, [data-no-drag]")) return;
    event.stopPropagation(); // don't start a canvas pan
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, x: note.x, y: note.y };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const x = drag.x + (event.clientX - drag.startX) / zoom;
    const y = drag.y + (event.clientY - drag.startY) / zoom;
    onUpdate(note.id, {
      x: Math.min(Math.max(0, x), BOARD_SIZE - note.width),
      y: Math.min(Math.max(0, y), BOARD_SIZE - note.height),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  /* ---------- resize ---------- */

  const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      width: note.width,
      height: note.height,
    };
  };

  const handleResizeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (!resize) return;
    const width = resize.width + (event.clientX - resize.startX) / zoom;
    const height = resize.height + (event.clientY - resize.startY) / zoom;
    onUpdate(note.id, {
      width: Math.min(Math.max(MIN_WIDTH, width), BOARD_SIZE - note.x),
      height: Math.min(Math.max(MIN_HEIGHT, height), BOARD_SIZE - note.y),
    });
  };

  const endResize = () => {
    resizeRef.current = null;
  };

  /* ---------- render ---------- */

  const ringClass = isConnectTarget
    ? "ring-4 ring-sky-500/70"
    : isLinkSource
      ? "ring-2 ring-sky-500"
      : isSelected
        ? "ring-2 ring-slate-900/40"
        : "ring-1 ring-black/5";

  const handlesVisible = isSelected || isLinkSource;

  return (
    <div
      data-note-id={note.id}
      className={`group absolute left-0 top-0 flex flex-col rounded-2xl p-3 shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition-shadow ${ringClass} ${
        isDragging ? "shadow-[0_20px_50px_rgba(15,23,42,0.28)]" : ""
      }`}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 30 : isSelected ? 20 : 1,
        touchAction: "none",
        willChange: isDragging ? "transform" : undefined,
      }}
      onPointerDownCapture={() => {
        if (!isSelected) onSelect(note.id);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* connect handles */}
      {HANDLE_SIDES.map((side) => (
        <button
          key={side}
          type="button"
          aria-label={`Connect from ${side}`}
          title="Drag to another note to connect"
          onPointerDown={(event) => {
            event.stopPropagation();
            onConnectStart(note.id, side, event);
          }}
          className={`absolute z-10 flex h-7 w-7 touch-none cursor-crosshair items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-md transition hover:scale-110 hover:border-sky-500 hover:bg-sky-500 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 ${
            handlesVisible ? "opacity-100" : "opacity-0"
          } ${HANDLE_POSITION[side]}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ))}

      {/* title */}
      <input
        className="w-full cursor-text rounded-lg bg-white/60 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-500 focus:bg-white/80"
        value={note.title}
        onChange={(event) => onUpdate(note.id, { title: event.target.value })}
        placeholder="Title"
      />

      {/* body */}
      <textarea
        className="mt-2 min-h-0 flex-1 cursor-text resize-none bg-transparent px-1 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-500"
        value={note.content}
        onChange={(event) => onUpdate(note.id, { content: event.target.value })}
        placeholder="Write something..."
      />

      {/* footer */}
      <div className="mt-2 flex items-center gap-1.5 pr-6">
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Set color ${color}`}
            onClick={() => onUpdate(note.id, { color })}
            className={`h-5 w-5 rounded-full border border-black/10 transition hover:scale-110 ${
              note.color === color ? "ring-2 ring-slate-800/70 ring-offset-1 ring-offset-transparent" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* resize grip */}
      <div
        data-no-drag
        role="separator"
        aria-label="Resize note"
        className="absolute bottom-1 right-1 flex h-6 w-6 touch-none cursor-se-resize items-end justify-end p-1 text-slate-700/50 hover:text-slate-900/80"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M9 1L1 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default memo(StickyNote);