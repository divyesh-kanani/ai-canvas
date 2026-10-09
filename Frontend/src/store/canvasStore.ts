import { create } from "zustand";
import type { Connection, Note } from "../types/note";

interface CanvasStore {
  notes: Note[];
  links: Connection[];
  selectedId: string | null;
  addNote: () => void;
  addNoteAt: (x: number, y: number) => void;
  updateNote: (id: string, update: Partial<Note>) => void;
  deleteNote: (id: string | null) => void;
  setSelectedNote: (id: string | null) => void;
  addLink: (sourceId: string, targetId: string) => void;
  removeLink: (id: string) => void;
  clearLinks: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  notes: [
    {
      id: "note-1",
      x: 260,
      y: 160,
      width: 280,
      height: 220,
      title: "Welcome",
      content: "Drag, resize and edit this note. Add more cards with the toolbar above.",
      color: "#fde68a",
    },
  ],
  links: [],
  selectedId: null,
  addNote: () =>
    set((state) => {
      const id = `note-${Date.now()}`;
      return {
        notes: [
          ...state.notes,
          {
            id,
            x: 320,
            y: 280,
            width: 280,
            height: 220,
            title: "New note",
            content: "Type here to capture ideas.",
            color: "#c7d2fe",
          },
        ],
        selectedId: id,
      };
    }),
  addNoteAt: (x, y) =>
    set((state) => {
      const id = `note-${Date.now()}`;
      return {
        notes: [
          ...state.notes,
          {
            id,
            x,
            y,
            width: 280,
            height: 220,
            title: "New note",
            content: "Type here to capture ideas.",
            color: "#c7d2fe",
          },
        ],
        selectedId: id,
      };
    }),
  updateNote: (id, update) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...update } : note,
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: id ? state.notes.filter((note) => note.id !== id) : state.notes,
      links: id ? state.links.filter((link) => link.sourceId !== id && link.targetId !== id) : state.links,
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  setSelectedNote: (id) => set({ selectedId: id }),
  addLink: (sourceId, targetId) =>
    set((state) => {
      if (sourceId === targetId) return { links: state.links };
      const exists = state.links.some(
        (link) =>
          (link.sourceId === sourceId && link.targetId === targetId) ||
          (link.sourceId === targetId && link.targetId === sourceId),
      );
      if (exists) return { links: state.links };
      const id = `link-${Date.now()}`;
      return { links: [...state.links, { id, sourceId, targetId }] };
    }),
  removeLink: (id) => set((state) => ({ links: state.links.filter((link) => link.id !== id) })),
  clearLinks: () => set({ links: [] }),
}));
