import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">ai canvas</p>
            <h1 className="text-xl font-semibold">Minimal Idea Board</h1>
          </div>
          <button
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            className="rounded-full border border-slate-300/70 bg-slate-950/10 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400 dark:border-slate-500/70 dark:bg-white/10 dark:text-slate-100"
          >
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Canvas theme={theme} />
      </main>
    </div>
  );
}

export default App;