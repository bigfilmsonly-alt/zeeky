"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  size: number;
  label: string;
}

const songNodes: Node[] = [
  { id: "1", x: 200, y: 120, baseX: 200, baseY: 120, color: "#8b5cf6", size: 18, label: "Blinding Lights" },
  { id: "2", x: 260, y: 160, baseX: 260, baseY: 160, color: "#a78bfa", size: 14, label: "Save Your Tears" },
  { id: "3", x: 170, y: 180, baseX: 170, baseY: 180, color: "#7c3aed", size: 12, label: "After Hours" },
  { id: "4", x: 340, y: 100, baseX: 340, baseY: 100, color: "#3b82f6", size: 16, label: "Levitating" },
  { id: "5", x: 380, y: 160, baseX: 380, baseY: 160, color: "#60a5fa", size: 12, label: "Don't Start Now" },
  { id: "6", x: 100, y: 80, baseX: 100, baseY: 80, color: "#06b6d4", size: 15, label: "Peaches" },
  { id: "7", x: 80, y: 150, baseX: 80, baseY: 150, color: "#22d3ee", size: 11, label: "Stay" },
  { id: "8", x: 300, y: 220, baseX: 300, baseY: 220, color: "#8b5cf6", size: 13, label: "Heat Waves" },
  { id: "9", x: 440, y: 200, baseX: 440, baseY: 200, color: "#3b82f6", size: 10, label: "Shivers" },
  { id: "10", x: 150, y: 240, baseX: 150, baseY: 240, color: "#06b6d4", size: 11, label: "Kiss Me More" },
];

const edges = [
  ["1", "2", 0.92], ["1", "3", 0.85], ["2", "3", 0.78],
  ["4", "5", 0.88], ["1", "4", 0.65], ["6", "7", 0.82],
  ["8", "2", 0.7], ["4", "9", 0.75], ["3", "10", 0.6],
  ["8", "5", 0.58], ["6", "10", 0.72],
] as const;

export default function SimilarityGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState(songNodes);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.02;
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          x: n.baseX + Math.sin(timeRef.current + parseFloat(n.id) * 1.5) * 4,
          y: n.baseY + Math.cos(timeRef.current + parseFloat(n.id) * 2) * 3,
        }))
      );
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-2">Song Similarity in Hilbert Space</h3>
      <p className="text-text-muted text-sm mb-6">
        Songs plotted by mathematical proximity. Closer nodes = more similar sound DNA.
      </p>
      <svg viewBox="0 0 520 280" className="w-full" style={{ maxHeight: 320 }}>
        {/* Edges */}
        {edges.map(([from, to, strength]) => {
          const a = nodeMap[from];
          const b = nodeMap[to];
          const isHighlighted =
            hoveredNode === from || hoveredNode === to;
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isHighlighted ? "#8b5cf6" : "rgba(139,92,246,0.15)"}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeDasharray={isHighlighted ? "none" : "4 4"}
              animate={{
                opacity: hoveredNode
                  ? isHighlighted
                    ? 1
                    : 0.1
                  : (strength as number) * 0.5,
              }}
              transition={{ duration: 0.2 }}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          const isConnected =
            hoveredNode &&
            edges.some(
              ([a, b]) =>
                (a === hoveredNode && b === node.id) ||
                (b === hoveredNode && a === node.id)
            );
          const dimmed = hoveredNode && !isHovered && !isConnected;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? node.size + 4 : node.size}
                fill={node.color}
                animate={{ opacity: dimmed ? 0.2 : 1 }}
                transition={{ duration: 0.2 }}
              />
              {/* Glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size + 8}
                fill="none"
                stroke={node.color}
                strokeWidth={1}
                opacity={isHovered ? 0.4 : 0}
              />
              {/* Label */}
              {isHovered && (
                <text
                  x={node.x}
                  y={node.y - node.size - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
