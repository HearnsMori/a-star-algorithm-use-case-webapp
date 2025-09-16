"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [path, setPath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [gridSize, setGridSize] = useState(10);
  const [startNode, setStartNode] = useState({ x: 0, y: 0 });
  const [goalNode, setGoalNode] = useState({ x: 9, y: 9 });
  const [error, setError] = useState("");

  const handleStartPathfinding = async (e) => {
    e.preventDefault();
    if (
      startNode.x < 0 ||
      startNode.x >= gridSize ||
      startNode.y < 0 ||
      startNode.y >= gridSize ||
      goalNode.x < 0 ||
      goalNode.x >= gridSize ||
      goalNode.y < 0 ||
      goalNode.y >= gridSize
    ) {
      setError("Start or goal coordinates are out of bounds. Please check your inputs.");
      return;
    }
    setError("");
    setIsLoading(true);

    const requestBody = {
      start_node: startNode,
      goal_node: goalNode,
      available_path: [
        { x1: 0, y1: 0, x2: 0, y2: 1 },
        { x1: 0, y1: 1, x2: 0, y2: 2 },
        { x1: 0, y1: 2, x2: 1, y2: 2 },
        { x1: 1, y1: 2, x2: 2, y2: 2 },
        { x1: 2, y1: 2, x2: 2, y2: 3 },
        { x1: 2, y1: 3, x2: 3, y2: 3 },
        { x1: 3, y1: 3, x2: 3, y2: 4 },
        { x1: 3, y1: 4, x2: 4, y2: 4 },
        { x1: 2, y1: 2, x2: 3, y2: 2 },
        { x1: 3, y1: 2, x2: 4, y2: 2 },
        { x1: 4, y1: 2, x2: 4, y2: 3 },
        { x1: 4, y1: 3, x2: 4, y2: 4 },
      ],
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/astar/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setPath(data.Movement);
      setIsGridVisible(true);
    } catch (error) {
      console.error("Failed to fetch path:", error);
      setError("Failed to fetch path. Check if the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        grid.push({ x, y });
      }
    }

    return (
      <div
        className="grid border-2 border-gray-400 relative"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 40px)`,
          gridTemplateRows: `repeat(${gridSize}, 40px)`,
        }}
      >
        <AnimatePresence>
          {grid.map((cell) => {
            // Add a conditional check here
            const isPath = Array.isArray(path) && path.some((p) => p[0] === cell.x && p[1] === cell.y);
            const isStart = cell.x === startNode.x && cell.y === startNode.y;
            const isGoal = cell.x === goalNode.x && cell.y === goalNode.y;

            const cellVariants = {
              hidden: { scale: 0 },
              visible: { scale: 1 },
            };

            return (
              <motion.div
                key={`${cell.x}-${cell.y}`}
                className={`w-10 h-10 border border-gray-300 flex items-center justify-center font-bold relative`}
                variants={cellVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: isPath ? path.findIndex((p) => p[0] === cell.x && p[1] === cell.y) * 0.1 : 0,
                }}
                style={{
                  backgroundColor: isPath
                    ? isStart
                      ? "rgb(255, 165, 0)" // Orange for start
                      : isGoal
                      ? "rgb(0, 128, 0)" // Green for goal
                      : "rgb(173, 216, 230)" // Light blue for path
                    : "white",
                }}
              >
                {isStart && "S"}
                {isGoal && "G"}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">A* Pathfinding</h1>
      <AnimatePresence>
        {!isGridVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="p-8 bg-white rounded-lg shadow-xl w-96"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">Set up your grid</h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={handleStartPathfinding}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Grid Size:</label>
                <input
                  type="number"
                  value={gridSize}
                  onChange={(e) => setGridSize(Math.max(2, parseInt(e.target.value)))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2"
                  max="50"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Start Node (x, y):</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={startNode.x}
                    onChange={(e) => setStartNode({ ...startNode, x: parseInt(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={startNode.y}
                    onChange={(e) => setStartNode({ ...startNode, y: parseInt(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Goal Node (x, y):</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={goalNode.x}
                    onChange={(e) => setGoalNode({ ...goalNode, x: parseInt(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={goalNode.y}
                    onChange={(e) => setGoalNode({ ...goalNode, y: parseInt(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
              >
                {isLoading ? "Finding Path..." : "Start Pathfinding"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isGridVisible && (
          <motion.div
            key="grid-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            {renderGrid()}
            <button
              onClick={() => setIsGridVisible(false)}
              className="mt-6 bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              Back to Setup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}