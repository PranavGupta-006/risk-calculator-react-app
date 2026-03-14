import React, { useState, useEffect } from "react";

const GRID_SIZE = 70;

export default function App() {

  const [start, setStart] = useState("0,0");
  const [goal, setGoal] = useState("69,69");

  const [density, setDensity] = useState(0.25);

  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const [botIndex, setBotIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGrid();
  }, []);

  const fetchGrid = async () => {
    try {
      const res = await fetch("http://localhost:8000/grid");
      const data = await res.json();

      if (Array.isArray(data.grid)) {
        setGrid(data.grid);
      } else {
        setGrid([]);
      }

    } catch (err) {
      console.error("Grid fetch failed:", err);
      setGrid([]);
    }
  };

  const reset = () => {
    setPath([]);
    setBotIndex(-1);
  };

  const startBotAnimation = (pathData) => {

    let i = 0;

    const interval = setInterval(async () => {

      setBotIndex(i);
      await fetchGrid();

      i++;

      if (i >= pathData.length) {
        clearInterval(interval);
      }

    }, 30);

  };

  const computePath = async () => {

    setLoading(true);

    try {

      const res = await fetch(
        `http://localhost:8000/astar?start=${start}&goal=${goal}`
      );

      const data = await res.json();

      if (data.path) {
        setPath(data.path);
        startBotAnimation(data.path);
      }

    } catch (err) {
      console.error("A* failed:", err);
    }

    setLoading(false);
  };

  const computePathdynamic = async () => {

    setLoading(true);

    try {

      const res = await fetch(
        `http://localhost:8000/astardynamic?start=${start}&goal=${goal}`
      );

      const data = await res.json();

      if (data.path) {
        setPath(data.path);
        startBotAnimation(data.path);
      }

    } catch (err) {
      console.error("Dynamic A* failed:", err);
    }

    setLoading(false);
  };

  const generateGrid = async () => {

    try {

      await fetch(
        `http://localhost:8000/set-density?value=${Number(density)}`,
        { method: "POST" }
      );

      await fetch(
        "http://localhost:8000/generate-grid",
        { method: "POST" }
      );

      await fetchGrid();
      reset();

    } catch (err) {
      console.error("Grid generation failed:", err);
    }

  };

  const isPathCell = (row,col) =>
    path.some(p => p[0] === row && p[1] === col);

  const isBotCell = (row,col) => {
    if(botIndex < 0 || botIndex >= path.length) return false;
    const [x,y] = path[botIndex];
    return x === row && y === col;
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center p-10">

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-10">

        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-1">
          Unmanned Ground Vehicle Path Finder
        </h1>

        <p className="text-gray-500 mb-8">
          Battlefield Pathfinder using A<sup>*</sup> Algorithm
        </p>

        {/* Controls */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Start Node</label>
            <input
              value={start}
              onChange={(e)=>setStart(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Goal Node</label>
            <input
              value={goal}
              onChange={(e)=>setGoal(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Obstacle Density
            </label>

            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={density}
              onChange={(e)=>setDensity(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={generateGrid}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm transition"
          >
            Generate Grid
          </button>

          <button
            onClick={computePath}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 shadow-sm transition"
          >
            {loading ? "Computing..." : "Start Navigation"}
          </button>

          <button
            onClick={computePathdynamic}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 py-2 shadow-sm transition"
          >
            Dynamic Navigation
          </button>

          <button
            onClick={reset}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 shadow-sm transition"
          >
            Reset Path
          </button>

        </div>

        {/* Grid */}

        <div
          className="grid gap-[1px] bg-gray-200 p-2 rounded-xl"
          style={{gridTemplateColumns:`repeat(${GRID_SIZE},8px)`}}
        >

          {Array.isArray(grid) && grid.length > 0 &&
            grid.flatMap((row,rowIndex) =>
              row.map((cell,colIndex) => {

                let className = "w-[8px] h-[8px] bg-white";

                if(cell === 1) className += " bg-gray-800";
                if(isPathCell(rowIndex,colIndex)) className += " bg-blue-400";
                if(isBotCell(rowIndex,colIndex)) className += " bg-green-500";
                if(start === `${rowIndex},${colIndex}`) className += " bg-yellow-400";
                if(goal === `${rowIndex},${colIndex}`) className += " bg-red-500";

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={className}
                  />
                );

              })
            )
          }

        </div>

        {/* Result */}

        {path.length > 0 && (

          <div className="mt-8 bg-gray-50 border rounded-xl p-6">

            <div className="text-3xl font-bold text-gray-900">
              {path.length}
              <span className="text-sm text-gray-500 ml-2">
                steps
              </span>
            </div>

            <div className="text-gray-500 mt-1">
              {start} → {goal}
            </div>

            <div className="mt-4 p-3 bg-white border rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(path)}
            </div>

          </div>

        )}

      </div>

    </div>

  );
}