export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}
