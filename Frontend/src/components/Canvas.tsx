import { useMemo, useRef, useState, type MouseEvent, type PointerEvent, type ReactElement, type WheelEvent } from "react";
import StickyNote from "./StickyNote";
import { useCanvasStore } from "../store/canvasStore";
import type { Connection, Note } from "../types/note";

interface CanvasProps {
  theme: "light" | "dark";
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getBoardCoordinates = (
  event: { clientX: number; clientY: number },
  boardElement: HTMLDivElement | null,
  zoom: number,
) => {
  if (!boardElement) return { x: 0, y: 0 };
  const rect = boardElement.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / zoom,
    y: (event.clientY - rect.top) / zoom,
  };
};

const createConnectionPath = (source: Note, target: Note) => {
  const startX = source.x + source.width;
  const startY = source.y + source.height / 2;
  const endX = target.x;
  const endY = target.y + target.height / 2;
  const dx = endX - startX;
  const curve = Math.min(160, Math.max(70, Math.abs(dx) * 0.35));
  const sign = dx >= 0 ? 1 : -1;
  const cp1X = startX + curve;
  const cp1Y = startY + sign * 40;
  const cp2X = endX - curve;
  const cp2Y = endY - sign * 40;
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
};

function Canvas({ theme }: CanvasProps) {
  const {
    notes,
    links,
    selectedId,
    setSelectedNote,
    addNote,
    addNoteAt,
    updateNote,
    addLink,
    clearLinks,
  } = useCanvasStore();

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  const [previewPoint, setPreviewPoint] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const boardBackground = theme === "dark" ? "#020617" : "#f8fafc";

  const handleConnectStart = (id: string, event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const boardPoint = getBoardCoordinates(event, boardRef.current, zoom);
    setConnectMode(true);
    setLinkSourceId(id);
    setPreviewPoint(boardPoint);
    setSelectedNote(id);
  };

  const finishConnect = (event: PointerEvent<HTMLDivElement>) => {
    if (!connectMode || !linkSourceId) return;
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const targetNoteId = element?.closest("[data-note-id]")?.getAttribute("data-note-id");
    if (targetNoteId && targetNoteId !== linkSourceId) {
      addLink(linkSourceId, targetNoteId);
    }
    setConnectMode(false);
    setLinkSourceId(null);
    setPreviewPoint(null);
  };

  const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (connectMode && linkSourceId) {
      setPreviewPoint(getBoardCoordinates(event, boardRef.current, zoom));
      return;
    }
    handlePanMove(event);
  };

  const handleBoardPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    finishConnect(event);
    handlePanEnd();
  };

  const connectionLines = useMemo(() => {
    const lines: ReactElement[] = [];
    links.forEach((link: Connection) => {
      const source = notes.find((note) => note.id === link.sourceId);
      const target = notes.find((note) => note.id === link.targetId);
      if (!source || !target) return;
      const path = createConnectionPath(source, target);
      lines.push(
        <path
          key={link.id}
          d={path}
          stroke={theme === "dark" ? "#7dd3fc" : "#0f172a"}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
      );
    });

    if (connectMode && linkSourceId && previewPoint) {
      const source = notes.find((note) => note.id === linkSourceId);
      if (source) {
        const sourceX = source.x + source.width;
        const sourceY = source.y + source.height / 2;
        lines.push(
          <path
            key="preview-connection"
            d={`M ${sourceX} ${sourceY} C ${sourceX + 80} ${sourceY} ${previewPoint.x - 80} ${previewPoint.y} ${previewPoint.x} ${previewPoint.y}`}
            stroke={theme === "dark" ? "rgba(125,211,252,0.8)" : "rgba(15,23,42,0.8)"}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 8"
          />,
        );
      }
    }

    return lines;
  }, [links, notes, theme, connectMode, linkSourceId, previewPoint]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY / 500;
    setZoom((current) => clamp(current + delta, 0.6, 2.2));
  };

  const handleBackgroundDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-note]")) return;
    const { x, y } = getBoardCoordinates(event, boardRef.current, zoom);
    addNoteAt(Math.max(20, x - 140), Math.max(20, y - 100));
  };

  const handlePanStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-note]") !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanStart({ x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y });
  };

  const handlePanMove = (event: PointerEvent<HTMLDivElement>) => {
    if (connectMode && linkSourceId) {
      setPreviewPoint(getBoardCoordinates(event, boardRef.current, zoom));
      return;
    }

    if (!panStart) return;
    const dx = (event.clientX - panStart.x) * 1.25;
    const dy = (event.clientY - panStart.y) * 1.25;
    setOffset({ x: panStart.offsetX + dx, y: panStart.offsetY + dy });
  };

  const handlePanEnd = () => {
    setPanStart(null);
  };

  const handleNoteSelect = (id: string) => {
    setSelectedNote(id);
  };

  const noteScale = zoom;

  return (
    <div className="h-full w-full px-4 pb-8 pt-4 sm:px-6">
      <div className="flex h-full w-full flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Canvas controls</p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Infinite workspace</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {connectMode
                ? linkSourceId
                  ? "Click another note to complete the connection."
                  : "Click a connect dot to start a connection."
                : "Scroll with your mouse to zoom. Drag the background to pan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={addNote}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Add sticky note
            </button>
            <button
              onClick={() => setConnectMode((current) => !current)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${connectMode ? "bg-sky-600 text-white" : "border border-slate-300/80 bg-white/80 text-slate-800 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"}`}
            >
              {connectMode ? "Connecting..." : "Connect notes"}
            </button>
            <button
              onClick={clearLinks}
              className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
            >
              Clear links
            </button>
            <button
              onClick={() => setZoom((current) => clamp(current + 0.1, 0.6, 2.2))}
              className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
            >
              Zoom in
            </button>
            <button
              onClick={() => setZoom((current) => clamp(current - 0.1, 0.6, 2.2))}
              className="rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800/80"
            >
              Zoom out
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-50/80 shadow-inner shadow-slate-300/10 dark:border-slate-700/70 dark:bg-slate-900/80">
          <div
            className="h-full min-h-0 w-full bg-[length:32px_32px] bg-[radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)]"
            style={{ backgroundColor: boardBackground, touchAction: "none" }}
            onWheel={handleWheel}
            onDoubleClick={handleBackgroundDoubleClick}
            onPointerDown={handlePanStart}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
            onPointerCancel={handleBoardPointerUp}
          >
            <div
              ref={boardRef}
              className="relative"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: "3200px",
                height: "3200px",
              }}
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 3200 3200" aria-hidden="true">
                {connectionLines}
              </svg>
              {notes.map((note: Note) => (
                <div data-note-id={note.id} data-note key={note.id}>
                  <StickyNote
                    note={note}
                    boardScale={noteScale}
                    isSelected={selectedId === note.id}
                    connectMode={connectMode}
                    isLinkSource={linkSourceId === note.id}
                    onSelect={() => handleNoteSelect(note.id)}
                    onConnectStart={(event) => handleConnectStart(note.id, event)}
                    onUpdate={(update) => updateNote(note.id, update)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
