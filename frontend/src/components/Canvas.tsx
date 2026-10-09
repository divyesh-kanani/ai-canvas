// import { useMemo, useRef, useState, type MouseEvent, type PointerEvent, type ReactElement, type WheelEvent } from "react";
// import StickyNote from "./StickyNote";
// import { useCanvasStore } from "../store/canvasStore";
// import type { Connection, Note } from "../types/note";

// interface CanvasProps {
//   theme: "light" | "dark";
// }

// const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// const getBoardCoordinates = (
//   event: { clientX: number; clientY: number },
//   boardElement: HTMLDivElement | null,
//   zoom: number,
// ) => {
//   if (!boardElement) return { x: 0, y: 0 };
//   const rect = boardElement.getBoundingClientRect();
//   return {
//     x: (event.clientX - rect.left) / zoom,
//     y: (event.clientY - rect.top) / zoom,
//   };
// };

// const createConnectionPath = (source: Note, target: Note) => {
//   const startX = source.x + source.width;
//   const startY = source.y + source.height / 2;
//   const endX = target.x;
//   const endY = target.y + target.height / 2;
//   const dx = endX - startX;
//   const curve = Math.min(160, Math.max(70, Math.abs(dx) * 0.35));
//   const sign = dx >= 0 ? 1 : -1;
//   const cp1X = startX + curve;
//   const cp1Y = startY + sign * 40;
//   const cp2X = endX - curve;
//   const cp2Y = endY - sign * 40;
//   return `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
// };

// function Canvas({ theme }: CanvasProps) {
//   const {
//     notes,
//     links,
//     selectedId,
//     setSelectedNote,
//     addNote,
//     addNoteAt,
//     updateNote,
//     addLink,
//     clearLinks,
//   } = useCanvasStore();

//   const [zoom, setZoom] = useState(1);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [panStart, setPanStart] = useState<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
//   const [connectMode, setConnectMode] = useState(false);
//   const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
//   const [previewPoint, setPreviewPoint] = useState<{ x: number; y: number } | null>(null);
//   const boardRef = useRef<HTMLDivElement | null>(null);

//   const boardBackground = theme === "dark" ? "#020617" : "#f8fafc";

//   const handleConnectStart = (id: string, event: PointerEvent<HTMLButtonElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//     const boardPoint = getBoardCoordinates(event, boardRef.current, zoom);
//     setConnectMode(true);
//     setLinkSourceId(id);
//     setPreviewPoint(boardPoint);
//     setSelectedNote(id);
//   };

//   const finishConnect = (event: PointerEvent<HTMLDivElement>) => {
//     if (!connectMode || !linkSourceId) return;
//     const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
//     const targetNoteId = element?.closest("[data-note-id]")?.getAttribute("data-note-id");
//     if (targetNoteId && targetNoteId !== linkSourceId) {
//       addLink(linkSourceId, targetNoteId);
//     }
//     setConnectMode(false);
//     setLinkSourceId(null);
//     setPreviewPoint(null);
//   };

//   const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
//     if (connectMode && linkSourceId) {
//       setPreviewPoint(getBoardCoordinates(event, boardRef.current, zoom));
//       return;
//     }
//     handlePanMove(event);
//   };

//   const handleBoardPointerUp = (event: PointerEvent<HTMLDivElement>) => {
//     finishConnect(event);
//     handlePanEnd();
//   };

//   const connectionLines = useMemo(() => {
//     const lines: ReactElement[] = [];
//     links.forEach((link: Connection) => {
//       const source = notes.find((note) => note.id === link.sourceId);
//       const target = notes.find((note) => note.id === link.targetId);
//       if (!source || !target) return;
//       const path = createConnectionPath(source, target);
//       lines.push(
//         <path
//           key={link.id}
//           d={path}
//           stroke={theme === "dark" ? "#7dd3fc" : "#0f172a"}
//           strokeWidth="3"
//           fill="none"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />,
//       );
//     });

//     if (connectMode && linkSourceId && previewPoint) {
//       const source = notes.find((note) => note.id === linkSourceId);
//       if (source) {
//         const sourceX = source.x + source.width;
//         const sourceY = source.y + source.height / 2;
//         lines.push(
//           <path
//             key="preview-connection"
//             d={`M ${sourceX} ${sourceY} C ${sourceX + 80} ${sourceY} ${previewPoint.x - 80} ${previewPoint.y} ${previewPoint.x} ${previewPoint.y}`}
//             stroke={theme === "dark" ? "rgba(125,211,252,0.8)" : "rgba(15,23,42,0.8)"}
//             strokeWidth="3"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeDasharray="10 8"
//           />,
//         );
//       }
//     }

//     return lines;
//   }, [links, notes, theme, connectMode, linkSourceId, previewPoint]);

//   const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     const delta = -event.deltaY / 500;
//     setZoom((current) => clamp(current + delta, 0.6, 2.2));
//   };

//   const handleBackgroundDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
//     if ((event.target as HTMLElement).closest("[data-note]")) return;
//     const { x, y } = getBoardCoordinates(event, boardRef.current, zoom);
//     addNoteAt(Math.max(20, x - 140), Math.max(20, y - 100));
//   };

//   const handlePanStart = (event: PointerEvent<HTMLDivElement>) => {
//     if (event.button !== 0) return;
//     if ((event.target as HTMLElement).closest("[data-note]") !== null) return;
//     event.currentTarget.setPointerCapture(event.pointerId);
//     setPanStart({ x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y });
//   };

//   const handlePanMove = (event: PointerEvent<HTMLDivElement>) => {
//     if (connectMode && linkSourceId) {
//       setPreviewPoint(getBoardCoordinates(event, boardRef.current, zoom));
//       return;
//     }

//     if (!panStart) return;
//     const dx = (event.clientX - panStart.x) * 1.25;
//     const dy = (event.clientY - panStart.y) * 1.25;
//     setOffset({ x: panStart.offsetX + dx, y: panStart.offsetY + dy });
//   };

//   const handlePanEnd = () => {
//     setPanStart(null);
//   };

//   const handleNoteSelect = (id: string) => {
//     setSelectedNote(id);
//   };

//   const noteScale = zoom;

//   return (
//     <div className="h-full w-full px-4 pb-8 pt-4 sm:px-6">
//       <div className="flex h-full w-full flex-col space-y-4">
//         <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80">
//           <div>
//             <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Canvas controls</p>
//             <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Infinite workspace</h1>
//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               {connectMode
//                 ? linkSourceId
//                   ? "Click another note to complete the connection."
//                   : "Click a connect dot to start a connection."
//                 : "Scroll with your mouse to zoom. Drag the background to pan."}
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={addNote}
//               className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
//             >
//               Add sticky note
//             </button>
//             <button
//               onClick={() => setConnectMode((current) => !current)}
//               className={`rounded-full px-4 py-2 text-sm font-medium transition ${connectMode ? "bg-sky-600 text-white" : "border border-slate-300/80 bg-white/80 text-slate-800 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"}`}
//             >
//               {connectMode ? "Connecting..." : "Connect notes"}
//             </button>
//             <button
//               onClick={clearLinks}
//               className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
//             >
//               Clear links
//             </button>
//             <button
//               onClick={() => setZoom((current) => clamp(current + 0.1, 0.6, 2.2))}
//               className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
//             >
//               Zoom in
//             </button>
//             <button
//               onClick={() => setZoom((current) => clamp(current - 0.1, 0.6, 2.2))}
//               className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
//             >
//               Zoom out
//             </button>
//           </div>
//         </div>

//         <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-50/80 shadow-inner shadow-slate-300/10 dark:border-slate-700/70 dark:bg-slate-900/80">
//           <div
//             className="h-full min-h-0 w-full bg-[length:32px_32px] bg-[radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)]"
//             style={{ backgroundColor: boardBackground, touchAction: "none" }}
//             onWheel={handleWheel}
//             onDoubleClick={handleBackgroundDoubleClick}
//             onPointerDown={handlePanStart}
//             onPointerMove={handleBoardPointerMove}
//             onPointerUp={handleBoardPointerUp}
//             onPointerCancel={handleBoardPointerUp}
//           >
//             <div
//               ref={boardRef}
//               className="relative"
//               style={{
//                 transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
//                 transformOrigin: "0 0",
//                 width: "3200px",
//                 height: "3200px",
//               }}
//             >
//               <svg className="absolute inset-0 h-full w-full" viewBox="0 0 3200 3200" aria-hidden="true">
//                 {connectionLines}
//               </svg>
//               {notes.map((note: Note) => (
//                 <div data-note-id={note.id} data-note key={note.id}>
//                   <StickyNote
//                     note={note}
//                     boardScale={noteScale}
//                     isSelected={selectedId === note.id}
//                     connectMode={connectMode}
//                     isLinkSource={linkSourceId === note.id}
//                     onSelect={() => handleNoteSelect(note.id)}
//                     onConnectStart={(event) => handleConnectStart(note.id, event)}
//                     onUpdate={(update) => updateNote(note.id, update)}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Canvas;






























import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from "react";
import StickyNote, { BOARD_SIZE, type Side } from "./StickyNote";
import { useCanvasStore } from "../store/canvasStore";
import type { Note } from "../types/note";

interface CanvasProps {
  theme: "light" | "dark";
}

type Point = { x: number; y: number };
type View = { x: number; y: number; zoom: number };

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* ---------- connection geometry ---------- */

const NORMALS: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const centerOf = (n: Note): Point => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 });

const anchorOf = (n: Note, side: Side): Point => {
  switch (side) {
    case "top":
      return { x: n.x + n.width / 2, y: n.y };
    case "right":
      return { x: n.x + n.width, y: n.y + n.height / 2 };
    case "bottom":
      return { x: n.x + n.width / 2, y: n.y + n.height };
    case "left":
      return { x: n.x, y: n.y + n.height / 2 };
  }
};

/** The side of `n` that faces `toward`. */
const facingSide = (n: Note, toward: Point): Side => {
  const dx = (toward.x - (n.x + n.width / 2)) / n.width;
  const dy = (toward.y - (n.y + n.height / 2)) / n.height;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "bottom" : "top";
};

const curvePath = (a: Point, sideA: Side, b: Point, sideB: Side | null) => {
  const k = clamp(Math.hypot(b.x - a.x, b.y - a.y) * 0.4, 40, 200);
  const na = NORMALS[sideA];
  const c1 = { x: a.x + na.x * k, y: a.y + na.y * k };
  const c2 = sideB ? { x: b.x + NORMALS[sideB].x * k, y: b.y + NORMALS[sideB].y * k } : b;
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
};

const noteIdAt = (x: number, y: number, exclude: string) => {
  const id = document.elementFromPoint(x, y)?.closest("[data-note-id]")?.getAttribute("data-note-id");
  return id && id !== exclude ? id : null;
};

const toolbarButton =
  "rounded-full border border-slate-300/80 bg-white/80 px-3.5 py-1.5 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80";

function Canvas({ theme }: CanvasProps) {
  const { notes, links, selectedId, setSelectedNote, addNote, addNoteAt, updateNote, addLink, clearLinks } =
    useCanvasStore();

  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [connecting, setConnecting] = useState<{ sourceId: string; side: Side } | null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const panRef = useRef<{ startX: number; startY: number; viewX: number; viewY: number } | null>(null);

  const isDark = theme === "dark";
  const lineColor = isDark ? "#7dd3fc" : "#334155";

  /* ---------- coordinates & zoom ---------- */

  const toBoard = useCallback((clientX: number, clientY: number): Point => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const v = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - v.x) / v.zoom, y: (clientY - rect.top - v.y) / v.zoom };
  }, []);

  /** Zoom by `factor` keeping the point under (clientX, clientY) fixed. */
  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    setView((v) => {
      const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = zoom / v.zoom;
      return { zoom, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio };
    });
  }, []);

  const zoomFromCenter = (factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  };

  // React's onWheel is passive, so preventDefault only works on a native listener.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest("textarea")) return; // let notes scroll
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  /* ---------- panning ---------- */

  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.button !== 1) return;
    if ((event.target as HTMLElement).closest("[data-note-id]")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      viewX: viewRef.current.x,
      viewY: viewRef.current.y,
    };
    setIsPanning(true);
  };

  const handlePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan) return;
    const x = pan.viewX + (event.clientX - pan.startX);
    const y = pan.viewY + (event.clientY - pan.startY);
    setView((v) => ({ ...v, x, y }));
  };

  const handlePanEnd = () => {
    panRef.current = null;
    setIsPanning(false);
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-note-id]")) return;
    const p = toBoard(event.clientX, event.clientY);
    addNoteAt(clamp(p.x - 140, 20, BOARD_SIZE - 300), clamp(p.y - 100, 20, BOARD_SIZE - 220));
  };

  /* ---------- connecting ---------- */

  const handleConnectStart = useCallback(
    (id: string, side: Side, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setConnecting({ sourceId: id, side });
      setPreviewPoint(toBoard(event.clientX, event.clientY));
      setSelectedNote(id);
    },
    [toBoard, setSelectedNote],
  );

  useEffect(() => {
    if (!connecting) return;
    const { sourceId } = connecting;

    const finish = () => {
      setConnecting(null);
      setPreviewPoint(null);
      setHoverTargetId(null);
    };
    const onMove = (event: PointerEvent) => {
      setPreviewPoint(toBoard(event.clientX, event.clientY));
      setHoverTargetId(noteIdAt(event.clientX, event.clientY, sourceId));
    };
    const onUp = (event: PointerEvent) => {
      const targetId = noteIdAt(event.clientX, event.clientY, sourceId);
      const exists =
        targetId !== null &&
        links.some(
          (l) =>
            (l.sourceId === sourceId && l.targetId === targetId) ||
            (l.sourceId === targetId && l.targetId === sourceId),
        );
      if (targetId && !exists) addLink(sourceId, targetId);
      finish();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", onKey);
    };
  }, [connecting, links, addLink, toBoard]);

  const handleSelect = useCallback((id: string) => setSelectedNote(id), [setSelectedNote]);

  /* ---------- connection lines ---------- */

  const connectionPaths = useMemo(() => {
    const byId = new Map(notes.map((n: Note) => [n.id, n]));
    const paths: ReactElement[] = [];

    links.forEach((link) => {
      const source = byId.get(link.sourceId);
      const target = byId.get(link.targetId);
      if (!source || !target) return;
      const sideA = facingSide(source, centerOf(target));
      const sideB = facingSide(target, centerOf(source));
      paths.push(
        <path
          key={link.id}
          d={curvePath(anchorOf(source, sideA), sideA, anchorOf(target, sideB), sideB)}
          stroke={lineColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          markerEnd="url(#arrow)"
        />,
      );
    });

    if (connecting && previewPoint) {
      const source = byId.get(connecting.sourceId);
      if (source) {
        const start = anchorOf(source, connecting.side);
        const hovered = hoverTargetId ? byId.get(hoverTargetId) : undefined;
        let end = previewPoint;
        let endSide: Side | null = null;
        if (hovered) {
          endSide = facingSide(hovered, centerOf(source));
          end = anchorOf(hovered, endSide);
        }
        paths.push(
          <path
            key="preview"
            d={curvePath(start, connecting.side, end, endSide)}
            stroke={lineColor}
            strokeOpacity={0.7}
            strokeWidth={2.5}
            strokeDasharray="8 7"
            fill="none"
            strokeLinecap="round"
          />,
        );
      }
    }
    return paths;
  }, [links, notes, connecting, previewPoint, hoverTargetId, lineColor]);

  /* ---------- render ---------- */

  const dot = isDark ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.28)";
  const gridSize = 32 * view.zoom;

  const hint = connecting
    ? "Drop on another note to connect. Esc to cancel."
    : "Scroll to zoom, drag the background to pan, double-click to add a note, drag a + to connect.";

  return (
    <div className="h-full w-full px-4 pb-6 pt-4 sm:px-6">
      <div className="flex h-full w-full flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/70 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Canvas</h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={addNote}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Add note
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => zoomFromCenter(1 / 1.2)} className={toolbarButton} aria-label="Zoom out">
                -
              </button>
              <button
                onClick={() => setView({ x: 0, y: 0, zoom: 1 })}
                className={`${toolbarButton} min-w-16 tabular-nums`}
                title="Reset view"
              >
                {Math.round(view.zoom * 100)}%
              </button>
              <button onClick={() => zoomFromCenter(1.2)} className={toolbarButton} aria-label="Zoom in">
                +
              </button>
            </div>
            <button onClick={clearLinks} className={toolbarButton}>
              Clear links
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="relative min-h-0 flex-1 select-none overflow-hidden rounded-4xl border border-slate-200/70 dark:border-slate-700/70"
          style={{
            backgroundColor: isDark ? "#020617" : "#f8fafc",
            backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${view.x}px ${view.y}px`,
            touchAction: "none",
            cursor: connecting ? "crosshair" : isPanning ? "grabbing" : "grab",
          }}
          onDoubleClick={handleDoubleClick}
          onPointerDown={handlePanStart}
          onPointerMove={handlePanMove}
          onPointerUp={handlePanEnd}
          onPointerCancel={handlePanEnd}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: BOARD_SIZE,
              height: BOARD_SIZE,
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.zoom})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={BOARD_SIZE}
              height={BOARD_SIZE}
              aria-hidden="true"
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColor} />
                </marker>
              </defs>
              {connectionPaths}
            </svg>

            {notes.map((note: Note) => (
              <StickyNote
                key={note.id}
                note={note}
                zoom={view.zoom}
                isSelected={selectedId === note.id}
                isLinkSource={connecting?.sourceId === note.id}
                isConnectTarget={hoverTargetId === note.id}
                onSelect={handleSelect}
                onUpdate={updateNote}
                onConnectStart={handleConnectStart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canvas;