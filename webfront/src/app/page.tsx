"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Avoid intersect between edges for 2d visualization purposes
function segmentsIntersect(p1, p2, p3, p4) {
  const ccw = (a, b, c) =>
    (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

//check if initial to goal exist
function bfsPathExists(start, goal, edges) {
  const adj = {};
  edges.forEach(e => {
    const a = `${e.x1},${e.y1}`;
    const b = `${e.x2},${e.y2}`;
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  });

  const visited = new Set([`${start.x},${start.y}`]);
  const queue = [[start.x, start.y]];

  while (queue.length) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    if (key === `${goal.x},${goal.y}`) return true;
    (adj[key] || []).forEach(nb => {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb.split(",").map(Number));
      }
    });
  }
  return false;
}

//generate the Maze for A star search algorithm
function generateMaze(gridSize = 12) {
  while (true) {
    const edges = [];
    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1],
      [2, 1], [-2, 1], [1, 2], [-1, 2],
    ];

    // Step 1: Build a dense network of edges
    function addEdge(p1, p2) {
      if (p2.x < 0 || p2.y < 0 || p2.x >= gridSize || p2.y >= gridSize) return;
      if (p1.x === p2.x && p1.y === p2.y) return;

      // Prevent intersections
      for (const e of edges) {
        if (segmentsIntersect(p1, p2, { x: e.x1, y: e.y1 }, { x: e.x2, y: e.y2 })) {
          return;
        }
      }

      edges.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        directions.forEach(([dx, dy]) => {
          if (Math.random() < 0.7) { // ⬅️ denser (30% chance)
            addEdge({ x, y }, { x: x + dx, y: y + dy });
          }
        });
      }
    }

    if (edges.length < 10) continue; // avoid empty networks

    // Step 2: Pick random start/goal from nodes that appear in edges
    const nodes = Array.from(
      new Set(edges.flatMap(e => [`${e.x1},${e.y1}`, `${e.x2},${e.y2}`]))
    ).map(str => {
      const [x, y] = str.split(",").map(Number);
      return { x, y };
    });

    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    let goalNode;
    do {
      goalNode = nodes[Math.floor(Math.random() * nodes.length)];
    } while (goalNode.x === startNode.x && goalNode.y === startNode.y);

    // Step 3: Ensure connectivity
    if (bfsPathExists(startNode, goalNode, edges)) {
      return { startNode, goalNode, available: edges };
    }
  }
};

export default function Home() {
	const router = useRouter();
	const maze = generateMaze();
    const [startNode] = useState(maze.startNode);
    const [goalNode] = useState(maze.goalNode);
    const [path, setPath] = useState([]);
    const [availablePath, setAvailablePath] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
	
    const handleStartPathfinding = async (e) => {
        e.preventDefault();

    	const available = maze.available;
		
        setAvailablePath(available);

        try {
            const res = await fetch("http://127.0.0.1:8000/astar/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_node: startNode,
                    goal_node: goalNode,
                    available_path: available,
                }),
            });

            const data = await res.json();

            let movement = [];
            if (Array.isArray(data.Movement)) {
                movement = data.Movement.map(([x, y]) => ({ x, y }));
            }

            setPath(movement);
            setActiveIndex(-1);
            setIsAnimating(true);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };
	
    // Animate path step-by-step
    useEffect(() => {
        if (!isAnimating || path.length === 0) return;
		
        let i = 0;
        const interval = setInterval(() => {
            setActiveIndex(i);
            i++;
            if (i >= path.length - 1) {
                clearInterval(interval);
                setIsAnimating(false);
            }
        }, 400);
		
        return () => clearInterval(interval);
    }, [isAnimating, path]);

    return (
    <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>A* Pathfinding Animation</h2>
            

        <div style={{
            width: "100%",
            margin: "0",
            padding: "0",
        }}>
            <svg
            width="100vw"
            height="100vw"
            style={{ border: "1px solid #ccc", background: "#f9f9f9" }}
            >
                {/* Available paths (static lightgray lines) */}
                {availablePath.map((edge, idx) => (
                    <line
                    key={`avail-${idx}`}
                    x1={edge.x1 * 80 + 40}
                    y1={edge.y1 * 80 + 40}
                    x2={edge.x2 * 80 + 40}
                    y2={edge.y2 * 80 + 40}
                    stroke="lightgray"
                    strokeWidth="2"
                    />
                ))}

                {/* A* path (animated blue lines) */}
                {path.map((node, idx) =>
                    idx < path.length - 1 ? (
                    <motion.line
                      key={`path-${idx}`}
                      x1={node.x * 80 + 40}
                      y1={node.y * 80 + 40}
                      x2={path[idx + 1].x * 80 + 40}
                      y2={path[idx + 1].y * 80 + 40}
                      stroke={idx <= activeIndex ? "blue" : "transparent"}
                      strokeWidth="4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: idx <= activeIndex ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : null
                 )}

                 {/* Start Node */}
                 {path[0] && (
                     <circle
                     cx={path[0].x * 80 + 40}
                     cy={path[0].y * 80 + 40}
                     r="10"
                     fill="green"
                     />
                 )}

                 {/* Goal Node */}
                 {path[path.length - 1] && (
                     <circle
                     cx={path[path.length - 1].x * 80 + 40}
                     cy={path[path.length - 1].y * 80 + 40}
                     r="10"
                     fill="red"
                     />
                 )}
            </svg>
            <br/>
            <br/>
            <button
            onClick={handleStartPathfinding}
            style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginBottom: "20px",
                cursor: "pointer",
            }}
            >
                Start
            </button>
            <button
            onClick={()=>{window.location.reload();}}
            style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginBottom: "20px",
                cursor: "pointer",
            }}
            >
                New Random
            </button>
        </div>
        
    </div>
    );
}
