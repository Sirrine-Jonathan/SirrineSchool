import React, { useState, useEffect, useRef, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Info,
  Sparkles,
  Award,
  Zap,
  Repeat,
  Volume2,
  VolumeX,
  ArrowUp,
  RefreshCw,
  RefreshCcw,
} from "lucide-react";

import GameContainer from "../../components/GameContainer";
import { useUser } from "../../hooks/useUser";

// --- TYPES ---
type BlockType = "FORWARD" | "TURN_LEFT" | "TURN_RIGHT" | "REPEAT";

interface CommandBlock {
  id: string;
  type: BlockType;
  repeatCount?: number; // For REPEAT block
  nestedCommands?: CommandBlock[]; // For REPEAT block
}

interface Level {
  id: number;
  name: string;
  gridSize: number;
  startPos: { x: number; y: number };
  startHeading: number; // 0 = Up, 90 = Right, 180 = Down, 270 = Left
  portalPos: { x: number; y: number };
  cores: { x: number; y: number; collected: boolean }[];
  walls: { x: number; y: number }[];
  teleporters?: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  }[];
  description: string;
  hint: string;
}

interface TraceStep {
  blockId: string;
  type:
    | "START"
    | "FORWARD"
    | "TURN_LEFT"
    | "TURN_RIGHT"
    | "TELEPORT_IN"
    | "TELEPORT_OUT"
    | "COLLECT"
    | "BONK"
    | "PORTAL_WIN"
    | "FAIL";
  x: number;
  y: number;
  heading: number;
  collectedCores: { x: number; y: number }[];
  errorMessage?: string;
  isWin?: boolean;
}

// --- GLOW EFFECTS & ANIMATIONS ---
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 240, 255, 0.2), inset 0 0 5px rgba(0, 240, 255, 0.1); }
  50% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(0, 240, 255, 0.3); }
  100% { box-shadow: 0 0 5px rgba(0, 240, 255, 0.2), inset 0 0 5px rgba(0, 240, 255, 0.1); }
`;

const gridPulse = keyframes`
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
`;

// --- STYLED COMPONENTS ---
const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: radial-gradient(circle at 50% 50%, #0d061f 0%, #05020a 100%);
  position: relative;
  overflow: hidden;
  font-family: "Outfit", -apple-system, sans-serif;
  color: #fff;
  user-select: none;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        rgba(18, 16, 16, 0) 50%,
        rgba(0, 0, 0, 0.25) 50%
      ),
      linear-gradient(
        90deg,
        rgba(255, 0, 0, 0.06),
        rgba(0, 255, 0, 0.02),
        rgba(0, 255, 0, 0.06)
      );
    background-size: 100% 4px, 6px 100%;
    z-index: 100;
    pointer-events: none;
    opacity: 0.4;
  }
`;

const TopPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  background: rgba(13, 6, 31, 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  gap: 0.5rem;
  z-index: 5;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
  }
`;

const LevelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #00f0ff;
  border-radius: 8px;
  width: auto;
  height: auto;
  padding: 3px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: #00f0ff !important;
    stroke: #00f0ff !important;
    fill: none !important;
    width: 20px !important;
    height: 20px !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;

    path,
    line,
    polyline,
    polygon,
    circle,
    rect {
      stroke: #00f0ff !important;
      fill: none !important;
      stroke-width: 2px !important;
    }
  }

  &:hover:not(:disabled) {
    background: rgba(0, 240, 255, 0.2);
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const LevelTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  min-width: 140px;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const InfoPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const InfoBadge = styled.div<{ $color?: string }>`
  background: rgba(13, 6, 31, 0.6);
  border: 1px solid ${(props) => props.$color || "rgba(0, 240, 255, 0.3)"};
  color: ${(props) => props.$color || "#00f0ff"};
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-shadow: 0 0 5px ${(props) => props.$color || "rgba(0, 240, 255, 0.3)"};

  svg {
    color: ${(props) => props.$color || "#00f0ff"} !important;
    stroke: ${(props) => props.$color || "#00f0ff"} !important;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  width: 100%;

  @media (min-width: 992px) {
    flex-direction: row;
  }
`;

// --- GRID BOARD SIDE ---
const BoardContainer = styled.div`
  flex: 1.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  position: relative;
  overflow: hidden;
  min-height: 240px;

  @media (min-width: 992px) {
    padding: 1.5rem;
    height: 100%;
    min-height: auto;
  }
`;

const GridBoundary = styled.div`
  position: relative;
  width: 100%;
  max-width: min(70vw, 290px);
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  padding: 4px;
  background: rgba(5, 2, 10, 0.8);
  border: 2px solid rgba(144, 0, 255, 0.4);
  box-shadow: 0 0 15px rgba(144, 0, 255, 0.15),
    inset 0 0 15px rgba(0, 240, 255, 0.05);
  animation: ${pulseGlow} 4s infinite ease-in-out;
  overflow: hidden;

  @media (max-height: 700px) and (max-width: 991px) {
    max-width: 220px;
  }
`;

const GridContainer = styled.div<{ $gridSize: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$gridSize}, 1fr);
  grid-template-rows: repeat(${(props) => props.$gridSize}, 1fr);
  gap: 3px;
  width: 100%;
  height: 100%;
  position: relative;
`;

const GridCell = styled.div<{ $isWall?: boolean }>`
  background: ${(props) =>
    props.$isWall ? "rgba(255, 0, 127, 0.15)" : "rgba(10, 10, 30, 0.4)"};
  border: 1px solid
    ${(props) =>
      props.$isWall ? "rgba(255, 0, 127, 0.4)" : "rgba(0, 240, 255, 0.06)"};
  border-radius: 6px;
  position: relative;
  aspect-ratio: 1 / 1;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$isWall
      ? "inset 0 0 10px rgba(255, 0, 127, 0.2), 0 0 5px rgba(255, 0, 127, 0.1)"
      : "none"};
`;

const GridBackgroundEffects = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.15;
  background-image: radial-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 0);
  background-size: 16px 16px;
  animation: ${gridPulse} 3s infinite ease-in-out;
  border-radius: 12px;
`;

// --- GRID ELEMENTS ---
const OverlayElement = styled(motion.div)<{
  $x: number;
  $y: number;
  $gridSize: number;
}>`
  position: absolute;
  width: calc(100% / ${(props) => props.$gridSize} - 4px);
  height: calc(100% / ${(props) => props.$gridSize} - 4px);
  left: calc(
    (${(props) => props.$x} / ${(props) => props.$gridSize}) * 100% + 2px
  );
  top: calc(
    (${(props) => props.$y} / ${(props) => props.$gridSize}) * 100% + 2px
  );
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const TrailDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff, 0 0 15px #00f0ff;
`;

const PortalGlow = styled(motion.div)`
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PowerCoreGlow = styled(motion.div)`
  width: 85%;
  height: 85%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TeleporterGlow = styled(motion.div)`
  width: 95%;
  height: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Drone = styled(motion.div)`
  width: 85%;
  height: 85%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- CODE PANEL SIDE ---
const CodeWorkspace = styled.div`
  flex: 0.9;
  display: flex;
  flex-direction: column;
  background: rgba(9, 4, 20, 0.95);
  border-top: 1px solid rgba(144, 0, 255, 0.2);
  overflow: hidden;
  height: 100%;

  @media (min-width: 992px) {
    border-top: none;
    border-left: 1px solid rgba(144, 0, 255, 0.25);
  }
`;

const WorkspaceSplit = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  padding: 0.5rem;
  gap: 0.5rem;
  min-height: 150px;
`;

const ToolboxSection = styled.div`
  width: 90px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
`;

const ProgramSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: rgba(5, 2, 10, 0.4);
  border-radius: 10px;
  padding: 0.5rem;
  border: 1px dashed rgba(144, 0, 255, 0.2);
  gap: 0.4rem;
`;

const ToolboxCard = styled.button<{ $color: string }>`
  background: rgba(15, 8, 38, 0.85);
  border: 1px solid ${(props) => props.$color}4d;
  border-left: 3px solid ${(props) => props.$color};
  border-radius: 6px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  color: white;
  font-weight: 700;
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  height: 52px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    border-color: ${(props) => props.$color};
    box-shadow: 0 0 10px ${(props) => props.$color}4d;
    transform: translateY(-1px);
    background: rgba(15, 8, 38, 1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    color: ${(props) => props.$color} !important;
    stroke: ${(props) => props.$color} !important;
    fill: none !important;
    width: 16px !important;
    height: 16px !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex-shrink: 0 !important;

    path,
    line,
    polyline,
    polygon,
    circle,
    rect {
      stroke: ${(props) => props.$color} !important;
      fill: none !important;
      stroke-width: 2px !important;
    }
  }
`;

const pulseEditing = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); border-color: rgba(255, 215, 0, 1); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.4); }
`;

// --- PROGRAM BLOCKS STYLING ---
const BlockCard = styled.div<{
  $color: string;
  $active?: boolean;
  $isEditing?: boolean;
}>`
  display: flex;
  align-items: center;
  background: rgba(15, 8, 38, 0.9);
  border: ${(props) =>
    props.$isEditing
      ? "2px dashed #ffd700"
      : props.$active
      ? "2px solid #ffd700"
      : `1px solid ${props.$color}33`};
  border-left: 5px solid
    ${(props) =>
      props.$isEditing ? "#ffd700" : props.$active ? "#ffd700" : props.$color};
  box-shadow: ${(props) =>
    props.$isEditing
      ? "0 0 12px rgba(255, 215, 0, 0.4)"
      : props.$active
      ? "0 0 15px rgba(255, 215, 0, 0.6)"
      : "0 2px 4px rgba(0,0,0,0.2)"};
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  animation: ${(props) =>
    props.$isEditing
      ? css`
          ${pulseEditing} 2s infinite ease-in-out
        `
      : "none"};
`;

const BlockControls = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
`;

const ActionIconBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #fff;
  border-radius: 4px;
  width: auto;
  height: auto;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  svg {
    color: inherit !important;
    fill: none !important;
    width: 16px !important;
    height: 16px !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex-shrink: 0 !important;

    path,
    line,
    polyline,
    polygon,
    circle,
    rect {
      stroke: inherit !important;
      fill: none !important;
      stroke-width: 2px !important;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ff007f;
  }
`;

const LoopBlockBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 2px dashed rgba(255, 215, 0, 0.3);
  padding-left: 0.75rem;
  margin: 0.25rem 0 0.5rem 0.5rem;
`;

const LoopToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 215, 0, 0.06);
  border: 1px dashed rgba(255, 215, 0, 0.25);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;

  span {
    font-size: 0.75rem;
    color: #ffd700;
    font-weight: bold;
    margin-right: 0.2rem;
  }
`;

const LoopToolBtn = styled.button`
  background: rgba(13, 6, 31, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffd700;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
`;

const LoopCounter = styled.div`
  display: flex;
  align-items: center;
  background: rgba(13, 6, 31, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  padding: 0.1rem 0.4rem;
  gap: 0.35rem;
  color: #ffd700;
  font-size: 0.75rem;
  font-weight: bold;
`;

// --- SIMULATION CONTROL BAR ---
const SimulationBar = styled.div`
  background: rgba(5, 2, 10, 0.95);
  border-top: 1px solid rgba(144, 0, 255, 0.25);
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 5;
`;

const ActionButton = styled.button<{
  $variant?: "primary" | "secondary" | "danger";
}>`
  flex: 1;
  background: ${(props) =>
    props.$variant === "primary"
      ? "linear-gradient(135deg, #ff007f 0%, #ad0057 100%)"
      : props.$variant === "danger"
      ? "linear-gradient(135deg, #d32f2f 0%, #9a0007 100%)"
      : "linear-gradient(135deg, #3a226b 0%, #1c0e3a 100%)"};
  border: 1px solid
    ${(props) =>
      props.$variant === "primary"
        ? "#ff007f"
        : props.$variant === "danger"
        ? "#f44336"
        : "#9000ff"}80;
  color: #fff;
  border-radius: 10px;
  padding: 0.75rem 0.5rem;
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  @media (min-width: 576px) {
    flex: none;
    padding: 0.75rem 1.25rem;
    min-width: 120px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 15px
      ${(props) =>
        props.$variant === "primary"
          ? "#ff007f66"
          : props.$variant === "danger"
          ? "#f4433666"
          : "#9000ff66"};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// --- SCREEN OVERLAYS & MODALS ---
const FeedbackMessage = styled(motion.div)`
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
  pointer-events: none;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 240, 255, 0.8);
  color: #00f0ff;
  letter-spacing: 1px;
`;

const OverlayMask = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 2, 10, 0.85);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;

const VictoryCard = styled(motion.div)`
  background: radial-gradient(circle at 50% 0%, #1c0e3a 0%, #080313 100%);
  border: 2px solid #00f0ff;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.3),
    inset 0 0 15px rgba(0, 240, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem 1rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.15) 50%
    );
    background-size: 100% 4px;
    z-index: 1;
    pointer-events: none;
  }
`;

const VictoryTitle = styled.h2`
  font-size: 1.4rem;
  margin: 0;
  background: linear-gradient(90deg, #00f0ff, #ff007f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
`;

const XPReveal = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
  margin: 0.25rem 0;
`;

const VictoryStat = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #b0a4d4;
  span {
    color: #ff007f;
    font-weight: bold;
  }
`;

// --- GAMELEVEL DATA ---
const LEVELS: Level[] = [
  {
    id: 1,
    name: "Ignition Grid",
    gridSize: 5,
    startPos: { x: 1, y: 3 },
    startHeading: 90, // facing Right
    portalPos: { x: 3, y: 1 },
    cores: [{ x: 3, y: 3, collected: false }],
    walls: [{ x: 2, y: 2 }],
    description:
      "Program your drone to grab the energy core, then guide it safely into the swirling portal.",
    hint: "Start with Move Forward, then Turn Left, and finally Move Forward to reach both goals.",
  },
  {
    id: 2,
    name: "Loop Lane",
    gridSize: 6,
    startPos: { x: 0, y: 5 },
    startHeading: 0, // facing Up
    portalPos: { x: 5, y: 5 },
    cores: [
      { x: 0, y: 3, collected: false },
      { x: 0, y: 1, collected: false },
    ],
    walls: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ],
    description:
      "Write a program using the REPEAT loop to fly up the grid, collect cores, and wrap around to the Portal.",
    hint: "Use a Repeat loop (Forward x 5) to fly straight up to the top, turn right, fly across, turn right, and fly down!",
  },
  {
    id: 3,
    name: "Laser Shield",
    gridSize: 6,
    startPos: { x: 1, y: 4 },
    startHeading: 90, // facing Right
    portalPos: { x: 4, y: 1 },
    cores: [
      { x: 4, y: 4, collected: false },
      { x: 1, y: 1, collected: false },
    ],
    walls: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    description:
      "Central barriers are dangerous. Program your path clockwise to circle the obstacles and recover all cores.",
    hint: "Grab the bottom core first, then make two left turns around the central shield blocks to retrieve the top core.",
  },
  {
    id: 4,
    name: "Quantum Bridge",
    gridSize: 7,
    startPos: { x: 0, y: 5 },
    startHeading: 90, // facing Right
    portalPos: { x: 6, y: 5 },
    cores: [
      { x: 0, y: 1, collected: false },
      { x: 6, y: 1, collected: false },
    ],
    walls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 3, y: 6 },
    ],
    teleporters: [{ from: { x: 1, y: 3 }, to: { x: 5, y: 3 } }],
    description:
      "Forcefields isolate the sides. Flying onto the green warp pad at (1,3) will teleport you instantly to (5,3)!",
    hint: "Warp across to grab the core on the right, and then program your return path to collect the left core and reach the portal.",
  },
  {
    id: 5,
    name: "Circuit Spiral",
    gridSize: 7,
    startPos: { x: 0, y: 6 },
    startHeading: 0, // facing Up
    portalPos: { x: 3, y: 3 },
    cores: [
      { x: 0, y: 0, collected: false },
      { x: 6, y: 0, collected: false },
      { x: 6, y: 6, collected: false },
    ],
    walls: [
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
    ],
    description:
      "The ultimate circuit labyrinth! Traverse the perimeter, capture all three power cores, and guide your drone into the central hatch.",
    hint: "Loop along the outer perimeter to acquire all cores. Look for a gap at (3,5) to navigate into the center portal!",
  },
];

// --- MAIN COMPONENT ---
const RoboCodeNeon: React.FC = () => {
  const { addXP, currentUser, recordGameWin } = useUser();
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [program, setProgram] = useState<CommandBlock[]>([]);
  const [activeFunctionId, setActiveFunctionId] = useState<string | null>(null);

  // Execution states
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [traceIndex, setTraceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load current level
  const currentLevel = useMemo(
    () => LEVELS[currentLevelIdx],
    [currentLevelIdx],
  );

  // Total steps in current code (including contents of loop counts)
  const codeBlockCount = useMemo(() => {
    const countBlocks = (list: CommandBlock[]): number => {
      return list.reduce((acc, curr) => {
        if (curr.type === "REPEAT") {
          return acc + 1 + countBlocks(curr.nestedCommands || []);
        }
        return acc + 1;
      }, 0);
    };
    return countBlocks(program);
  }, [program]);

  // Web Audio Synth Sounds
  const playSynth = (
    type: "move" | "turn" | "pickup" | "bonk" | "win" | "teleport" | "click",
  ) => {
    if (isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "move") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "turn") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "pickup") {
        osc.type = "sine";
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
        notes.forEach((freq, idx) => {
          const time = now + idx * 0.06;
          osc.frequency.setValueAtTime(freq, time);
        });
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "bonk") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "win") {
        osc.type = "sine";
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 - E5 - G5 - C6 - E6 - G6
        chord.forEach((freq, idx) => {
          const time = now + idx * 0.07;
          osc.frequency.setValueAtTime(freq, time);
        });
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (type === "teleport") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        osc.frequency.linearRampToValueAtTime(300, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {
      console.warn("AudioContext initialization failed: ", e);
    }
  };

  // Compile trace based on current program and level layout
  const compileTrace = (blocks: CommandBlock[], lvl: Level): TraceStep[] => {
    const steps: TraceStep[] = [];
    let cx = lvl.startPos.x;
    let cy = lvl.startPos.y;
    let cheading = lvl.startHeading;
    let ccollected: { x: number; y: number }[] = [];
    let hitObstacle = false;
    let won = false;

    const addStep = (
      blockId: string,
      type: TraceStep["type"],
      extra?: Partial<TraceStep>,
    ) => {
      steps.push({
        blockId,
        type,
        x: cx,
        y: cy,
        heading: cheading,
        collectedCores: [...ccollected],
        ...extra,
      });
    };

    // Push start step
    steps.push({
      blockId: "start",
      type: "START",
      x: cx,
      y: cy,
      heading: cheading,
      collectedCores: [],
    });

    const runBlocks = (blockList: CommandBlock[], depth = 0) => {
      if (steps.length > 500 || hitObstacle || won) return;

      for (const block of blockList) {
        if (hitObstacle || won) return;

        if (block.type === "FORWARD") {
          let dx = 0;
          let dy = 0;
          const normH = ((cheading % 360) + 360) % 360;
          if (normH === 0) dy = -1;
          else if (normH === 90) dx = 1;
          else if (normH === 180) dy = 1;
          else if (normH === 270) dx = -1;

          const nx = cx + dx;
          const ny = cy + dy;

          // Border check
          if (nx < 0 || nx >= lvl.gridSize || ny < 0 || ny >= lvl.gridSize) {
            cx = nx;
            cy = ny;
            hitObstacle = true;
            addStep(block.id, "BONK", { errorMessage: "OUT OF BOUNDS!" });
            return;
          }

          // Wall check
          const isWall = lvl.walls.some((w) => w.x === nx && w.y === ny);
          if (isWall) {
            cx = nx;
            cy = ny;
            hitObstacle = true;
            addStep(block.id, "BONK", {
              errorMessage: "LASER BLOCK DETECTED!",
            });
            return;
          }

          cx = nx;
          cy = ny;
          addStep(block.id, "FORWARD");

          // Teleporter warp check
          if (lvl.teleporters) {
            for (const tp of lvl.teleporters) {
              if (cx === tp.from.x && cy === tp.from.y) {
                addStep(block.id, "TELEPORT_IN");
                cx = tp.to.x;
                cy = tp.to.y;
                addStep(block.id, "TELEPORT_OUT");
                break;
              } else if (cx === tp.to.x && cy === tp.to.y) {
                addStep(block.id, "TELEPORT_IN");
                cx = tp.from.x;
                cy = tp.from.y;
                addStep(block.id, "TELEPORT_OUT");
                break;
              }
            }
          }

          // Energy core collection
          const coreIndex = lvl.cores.findIndex(
            (c) => c.x === cx && c.y === cy,
          );
          if (coreIndex !== -1) {
            const alreadyCollected = ccollected.some(
              (c) => c.x === cx && c.y === cy,
            );
            if (!alreadyCollected) {
              ccollected.push({ x: cx, y: cy });
              addStep(block.id, "COLLECT");
            }
          }

          // Portal reach check
          if (cx === lvl.portalPos.x && cy === lvl.portalPos.y) {
            if (ccollected.length === lvl.cores.length) {
              won = true;
              addStep(block.id, "PORTAL_WIN", { isWin: true });
              return;
            }
          }
        } else if (block.type === "TURN_LEFT") {
          cheading -= 90;
          addStep(block.id, "TURN_LEFT");
        } else if (block.type === "TURN_RIGHT") {
          cheading += 90;
          addStep(block.id, "TURN_RIGHT");
        } else if (block.type === "REPEAT") {
          const count = block.repeatCount || 2;
          const inner = block.nestedCommands || [];
          for (let i = 0; i < count; i++) {
            if (hitObstacle || won) return;
            runBlocks(inner, depth + 1);
          }
        }
      }
    };

    runBlocks(blocks);

    // End failure fallback if we did not reach portal in victory state
    if (!hitObstacle && !won) {
      if (
        cx === lvl.portalPos.x &&
        cy === lvl.portalPos.y &&
        ccollected.length === lvl.cores.length
      ) {
        won = true;
        addStep("end", "PORTAL_WIN", { isWin: true });
      } else {
        addStep("end", "FAIL", {
          errorMessage: "OUT OF CODE! TARGET REACH FAILED.",
        });
      }
    }

    return steps;
  };

  // Re-generate trace whenever program changes or level changes
  useEffect(() => {
    const t = compileTrace(program, currentLevel);
    setTrace(t);
    setTraceIndex(0);
    setIsPlaying(false);
    setFeedback(null);
  }, [program, currentLevel]);

  // Loop execution timer
  useEffect(() => {
    if (isPlaying) {
      const delay = 300;
      timerRef.current = setTimeout(() => {
        handlePlayStep();
      }, delay);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, traceIndex, trace]);

  // Keyboard arrow keys programming handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (isWinModalOpen) {
          handleNextLevel();
        } else if (
          !isPlaying &&
          program.length > 0 &&
          traceIndex !== trace.length - 1
        ) {
          setActiveFunctionId(null);
          startSimulation();
        }
        return;
      }

      if (e.key.toLowerCase() === "x") {
        e.preventDefault();
        if (isPlaying) return;
        if (activeFunctionId) {
          const activeBlock = program.find((b) => b.id === activeFunctionId);
          if (
            activeBlock &&
            activeBlock.type === "REPEAT" &&
            (!activeBlock.nestedCommands ||
              activeBlock.nestedCommands.length === 0)
          ) {
            // Empty function block - delete it on exit
            setProgram((prev) => prev.filter((b) => b.id !== activeFunctionId));
          }
          setActiveFunctionId(null);
          playSynth("click");
        } else {
          const lastBlock = program[program.length - 1];
          if (lastBlock && lastBlock.type === "REPEAT") {
            setActiveFunctionId(lastBlock.id);
            playSynth("click");
          } else {
            const newBlock: CommandBlock = {
              id: Math.random().toString(36).substr(2, 9),
              type: "REPEAT",
              repeatCount: 3,
              nestedCommands: [],
            };
            setProgram((prev) => [...prev, newBlock]);
            setActiveFunctionId(newBlock.id);
            playSynth("click");
          }
        }
        return;
      }

      if (activeFunctionId && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        if (isPlaying) return;
        const num = parseInt(e.key);
        setProgram((prev) =>
          prev.map((block) => {
            if (block.id === activeFunctionId && block.type === "REPEAT") {
              playSynth("click");
              return { ...block, repeatCount: num };
            }
            return block;
          }),
        );
        return;
      }

      if (isPlaying) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        appendBlock("FORWARD");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        appendBlock("TURN_LEFT");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        appendBlock("TURN_RIGHT");
      } else if (e.key === "Backspace") {
        e.preventDefault();

        if (activeFunctionId) {
          const activeBlock = program.find((b) => b.id === activeFunctionId);
          if (activeBlock && activeBlock.type === "REPEAT") {
            const nested = activeBlock.nestedCommands || [];
            if (nested.length > 0) {
              const updatedNested = nested.slice(0, -1);
              playSynth("click");
              setProgram((prev) =>
                prev.map((b) =>
                  b.id === activeFunctionId
                    ? { ...b, nestedCommands: updatedNested }
                    : b,
                ),
              );
            } else {
              setActiveFunctionId(null);
              playSynth("click");
              // Remove the empty REPEAT block on exit
              setProgram((prev) => prev.filter((b) => b.id !== activeBlock.id));
            }
          } else {
            // Active block does not exist anymore. Heal state!
            setActiveFunctionId(null);
          }
          return;
        }

        setProgram((prev) => {
          if (prev.length === 0) return prev;

          const lastBlock = prev[prev.length - 1];
          if (lastBlock.type === "REPEAT") {
            if (
              lastBlock.nestedCommands &&
              lastBlock.nestedCommands.length > 0
            ) {
              // Backspacing into a function - activate it (flashing) and delete last nested block
              setActiveFunctionId(lastBlock.id);
              const updatedNested = lastBlock.nestedCommands.slice(0, -1);
              const updatedList = [...prev];
              updatedList[prev.length - 1] = {
                ...lastBlock,
                nestedCommands: updatedNested,
              };
              playSynth("click");
              return updatedList;
            } else {
              // Empty function block - delete it
              playSynth("click");
              return prev.slice(0, -1);
            }
          }

          playSynth("click");
          return prev.slice(0, -1);
        });
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isPlaying, program, isWinModalOpen, traceIndex, trace, activeFunctionId]);

  const handlePlayStep = () => {
    if (traceIndex < trace.length - 1) {
      const nextIdx = traceIndex + 1;
      setTraceIndex(nextIdx);
      const nextStep = trace[nextIdx];

      // Play matching synthesised sound effects
      if (nextStep.type === "FORWARD") {
        playSynth("move");
      } else if (
        nextStep.type === "TURN_LEFT" ||
        nextStep.type === "TURN_RIGHT"
      ) {
        playSynth("turn");
      } else if (nextStep.type === "COLLECT") {
        playSynth("pickup");
        setFeedback("CORE EXTRACTED! ⚡");
        setTimeout(() => setFeedback(null), 1000);
      } else if (
        nextStep.type === "TELEPORT_IN" ||
        nextStep.type === "TELEPORT_OUT"
      ) {
        playSynth("teleport");
      } else if (nextStep.type === "BONK") {
        playSynth("bonk");
        setFeedback("COLLISION! 💥");
        setIsPlaying(false);
      } else if (nextStep.type === "FAIL") {
        playSynth("bonk");
        setFeedback("GOAL NOT REACHED ❌");
        setIsPlaying(false);
      } else if (nextStep.type === "PORTAL_WIN") {
        playSynth("win");
        setFeedback("SYSTEM ONLINE! 🌟");
        setIsPlaying(false);
        // Win simulation!
        setTimeout(() => {
          setIsWinModalOpen(true);
          if (currentUser) {
            addXP(currentUser, 25);
            recordGameWin(currentUser, "robocode");
          }
        }, 1200);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Run execution
  const startSimulation = () => {
    if (trace.length <= 1) return;
    setActiveFunctionId(null);
    if (traceIndex === trace.length - 1) {
      // Re-compile or reset index first
      setTraceIndex(0);
    }
    setIsPlaying(true);
    playSynth("click");
  };

  // Pause execution
  const pauseSimulation = () => {
    setIsPlaying(false);
    playSynth("click");
  };

  // Step-by-step debugger
  const triggerSingleStep = () => {
    if (isPlaying) setIsPlaying(false);
    if (traceIndex >= trace.length - 1) {
      setTraceIndex(0);
      // Wait for React state
      setTimeout(handlePlayStep, 50);
    } else {
      handlePlayStep();
    }
    playSynth("click");
  };

  // Reset simulation state
  const resetSimulation = () => {
    setIsPlaying(false);
    setTraceIndex(0);
    setFeedback(null);
    playSynth("click");
  };

  // --- PROGRAM CODE BUILDER METHODS ---
  // Append action to bottom of program
  const appendBlock = (type: BlockType) => {
    const activeBlockExists =
      activeFunctionId && program.some((b) => b.id === activeFunctionId);
    if (!activeBlockExists && activeFunctionId) {
      setActiveFunctionId(null);
    }

    if (activeBlockExists && activeFunctionId) {
      if (type === "REPEAT") {
        setActiveFunctionId(null);
        playSynth("click");
        return;
      }
      appendNestedBlock(activeFunctionId, type);
      return;
    }

    const newBlock: CommandBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      ...(type === "REPEAT" ? { repeatCount: 3, nestedCommands: [] } : {}),
    };
    setProgram((prev) => [...prev, newBlock]);
    if (type === "REPEAT") {
      setActiveFunctionId(newBlock.id);
    }
    playSynth("click");
  };

  // Insert action inside repeat loop
  const appendNestedBlock = (loopId: string, type: BlockType) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id === loopId && block.type === "REPEAT") {
          const newNested: CommandBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
          };
          return {
            ...block,
            nestedCommands: [...(block.nestedCommands || []), newNested],
          };
        }
        return block;
      }),
    );
    playSynth("click");
  };

  // Delete instruction block
  const deleteBlock = (id: string, parentLoopId?: string) => {
    if (id === activeFunctionId) {
      setActiveFunctionId(null);
    }
    if (parentLoopId) {
      setProgram((prev) =>
        prev.map((block) => {
          if (block.id === parentLoopId && block.type === "REPEAT") {
            return {
              ...block,
              nestedCommands: (block.nestedCommands || []).filter(
                (nb) => nb.id !== id,
              ),
            };
          }
          return block;
        }),
      );
    } else {
      setProgram((prev) => prev.filter((b) => b.id !== id));
    }
    playSynth("click");
  };

  // Update repeat loop factor
  const changeRepeatCount = (loopId: string, delta: number) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id === loopId && block.type === "REPEAT") {
          const current = block.repeatCount || 3;
          const next = Math.max(2, Math.min(8, current + delta));
          return { ...block, repeatCount: next };
        }
        return block;
      }),
    );
    playSynth("click");
  };

  // Rearrange order of instructions
  const moveBlock = (
    id: string,
    direction: "up" | "down",
    parentLoopId?: string,
  ) => {
    if (parentLoopId) {
      setProgram((prev) =>
        prev.map((block) => {
          if (block.id === parentLoopId && block.type === "REPEAT") {
            const list = [...(block.nestedCommands || [])];
            const idx = list.findIndex((b) => b.id === id);
            if (idx === -1) return block;
            const nextIdx = direction === "up" ? idx - 1 : idx + 1;
            if (nextIdx < 0 || nextIdx >= list.length) return block;
            // Swap
            const temp = list[idx];
            list[idx] = list[nextIdx];
            list[nextIdx] = temp;
            return { ...block, nestedCommands: list };
          }
          return block;
        }),
      );
    } else {
      setProgram((prev) => {
        const list = [...prev];
        const idx = list.findIndex((b) => b.id === id);
        if (idx === -1) return list;
        const nextIdx = direction === "up" ? idx - 1 : idx + 1;
        if (nextIdx < 0 || nextIdx >= list.length) return list;
        // Swap
        const temp = list[idx];
        list[idx] = list[nextIdx];
        list[nextIdx] = temp;
        return list;
      });
    }
    playSynth("click");
  };

  // Clean program
  const clearProgram = () => {
    setProgram([]);
    setActiveFunctionId(null);
    playSynth("click");
  };

  // Switch levels
  const changeLevel = (direction: "prev" | "next") => {
    if (direction === "prev" && currentLevelIdx > 0) {
      setCurrentLevelIdx((prev) => prev - 1);
      clearProgram();
    } else if (direction === "next" && currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      clearProgram();
    }
    playSynth("click");
  };

  // Next level sequence from win modal
  const handleNextLevel = () => {
    setIsWinModalOpen(false);
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      clearProgram();
    } else {
      // Loop back to Level 1
      setCurrentLevelIdx(0);
      clearProgram();
    }
  };

  // --- SUB-RENDERERS ---
  // Active block highlighting identifier
  const currentStepBlockId = useMemo(() => {
    if (traceIndex >= 0 && traceIndex < trace.length) {
      return trace[traceIndex].blockId;
    }
    return "";
  }, [traceIndex, trace]);

  // Current simulation state details
  const simState = useMemo(() => {
    if (traceIndex >= 0 && traceIndex < trace.length) {
      return trace[traceIndex];
    }
    return {
      x: currentLevel.startPos.x,
      y: currentLevel.startPos.y,
      heading: currentLevel.startHeading,
      collectedCores: [],
    };
  }, [traceIndex, trace, currentLevel]);

  // Track coordinates of collected cores in the active step
  const activeCollectedCores = simState.collectedCores;

  // Path history trail for high tech visual feedback
  const visitedCells = useMemo(() => {
    return trace
      .slice(0, traceIndex + 1)
      .map((step) => ({ x: step.x, y: step.y }));
  }, [trace, traceIndex]);

  // Render a block card in script tree
  const renderBlock = (
    block: CommandBlock,
    index: number,
    isNested = false,
    parentId?: string,
  ) => {
    const isActivelyRunning = block.id === currentStepBlockId;

    // Choose block specific color accent
    let accentColor = "#00f0ff"; // FORWARD (Cyan)
    let label = "MOVE FORWARD";
    let Icon = ArrowUp;

    if (block.type === "TURN_LEFT") {
      accentColor = "#ff007f"; // Left (Pink)
      label = "TURN LEFT ↶";
      Icon = RefreshCcw;
    } else if (block.type === "TURN_RIGHT") {
      accentColor = "#9000ff"; // Right (Purple)
      label = "TURN RIGHT ↷";
      Icon = RefreshCw;
    } else if (block.type === "REPEAT") {
      accentColor = "#ffd700"; // Repeat (Gold)
      label = `FUNCTION (${block.repeatCount}x)`;
    }

    if (block.type === "REPEAT") {
      const isEditing = activeFunctionId === block.id;
      return (
        <div key={block.id}>
          <BlockCard
            $color={accentColor}
            $active={isActivelyRunning}
            $isEditing={isEditing}
          >
            <RefreshCw size={16} color={accentColor} />
            <span>FUNCTION</span>
            <LoopCounter>
              <Minus
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => changeRepeatCount(block.id, -1)}
              />
              <span>{block.repeatCount}x</span>
              <Plus
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => changeRepeatCount(block.id, 1)}
              />
            </LoopCounter>
            <span>RUNS</span>

            <BlockControls>
              <ActionIconBtn
                onClick={() => moveBlock(block.id, "up")}
                disabled={index === 0}
              >
                <ChevronUp size={16} />
              </ActionIconBtn>
              <ActionIconBtn
                onClick={() => moveBlock(block.id, "down")}
                disabled={index === program.length - 1}
              >
                <ChevronDown size={16} />
              </ActionIconBtn>
              <ActionIconBtn onClick={() => deleteBlock(block.id)}>
                <Trash2 size={16} />
              </ActionIconBtn>
            </BlockControls>
          </BlockCard>

          {((block.nestedCommands || []).length > 0 || isEditing) && (
            <LoopBlockBody>
              {block.nestedCommands?.map((nestedBlock, nIdx) =>
                renderBlock(nestedBlock, nIdx, true, block.id),
              )}

              {isEditing && (block.nestedCommands || []).length === 0 && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#ffd700",
                    padding: "0.4rem",
                    opacity: 0.8,
                    fontStyle: "italic",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Info size={12} style={{ stroke: "#ffd700" }} /> Press Arrow
                  Keys (↑ / ← / →) to build function
                </div>
              )}

              {isEditing && (
                <LoopToolbar>
                  <span>+ Inside:</span>
                  <LoopToolBtn
                    onClick={() => appendNestedBlock(block.id, "FORWARD")}
                  >
                    <ArrowUp size={10} /> Forward
                  </LoopToolBtn>
                  <LoopToolBtn
                    onClick={() => appendNestedBlock(block.id, "TURN_LEFT")}
                  >
                    <RefreshCcw size={10} /> Turn L
                  </LoopToolBtn>
                  <LoopToolBtn
                    onClick={() => appendNestedBlock(block.id, "TURN_RIGHT")}
                  >
                    <RefreshCw size={10} /> Turn R
                  </LoopToolBtn>
                </LoopToolbar>
              )}
            </LoopBlockBody>
          )}
        </div>
      );
    }

    const parentListLength = isNested
      ? program.find((p) => p.id === parentId)?.nestedCommands?.length || 0
      : program.length;

    return (
      <BlockCard
        key={block.id}
        $color={accentColor}
        $active={isActivelyRunning}
      >
        <Icon size={16} />
        <span>{label}</span>

        <BlockControls>
          <ActionIconBtn
            onClick={() => moveBlock(block.id, "up", parentId)}
            disabled={index === 0}
          >
            <ChevronUp size={16} />
          </ActionIconBtn>
          <ActionIconBtn
            onClick={() => moveBlock(block.id, "down", parentId)}
            disabled={index === parentListLength - 1}
          >
            <ChevronDown size={16} />
          </ActionIconBtn>
          <ActionIconBtn onClick={() => deleteBlock(block.id, parentId)}>
            <Trash2 size={16} />
          </ActionIconBtn>
        </BlockControls>
      </BlockCard>
    );
  };

  return (
    <GameContainer title="RoboCode Neon">
      <GameWrapper theme={{ gridSize: currentLevel.gridSize }}>
        {/* --- TOP MENU BAR --- */}
        <TopPanel>
          <LevelSelector>
            <NavBtn
              onClick={() => changeLevel("prev")}
              disabled={currentLevelIdx === 0 || isPlaying}
            >
              <ChevronLeft size={20} />
            </NavBtn>
            <LevelTitle>
              Level {currentLevel.id}: {currentLevel.name}
            </LevelTitle>
            <NavBtn
              onClick={() => changeLevel("next")}
              disabled={currentLevelIdx === LEVELS.length - 1 || isPlaying}
            >
              <ChevronRight size={20} />
            </NavBtn>
          </LevelSelector>

          <InfoPanel>
            <InfoBadge $color="#ffd700">
              <Zap size={14} />
              Cores: {activeCollectedCores.length} / {currentLevel.cores.length}
            </InfoBadge>
            <InfoBadge $color="#00f0ff">
              <Info
                size={14}
                style={{ cursor: "pointer" }}
                onClick={() => playSynth("click")}
              />
              Steps: {codeBlockCount}
            </InfoBadge>
            <NavBtn onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </NavBtn>
          </InfoPanel>
        </TopPanel>

        {/* --- MAIN LAYOUT WINDOW --- */}
        <MainContent>
          {/* --- GAME GRID BOARD --- */}
          <BoardContainer>
            <GridBoundary>
              <GridBackgroundEffects />
              <GridContainer $gridSize={currentLevel.gridSize}>
                {/* 1. Base static grid with Walls */}
                {Array.from({
                  length: currentLevel.gridSize * currentLevel.gridSize,
                }).map((_, i) => {
                  const x = i % currentLevel.gridSize;
                  const y = Math.floor(i / currentLevel.gridSize);
                  const isWall = currentLevel.walls.some(
                    (w) => w.x === x && w.y === y,
                  );
                  return <GridCell key={i} $isWall={isWall} />;
                })}

                {/* 2. Hover trace path trails */}
                {visitedCells.map((cell, idx) => (
                  <OverlayElement
                    key={`trail-${idx}`}
                    $x={cell.x}
                    $y={cell.y}
                    $gridSize={currentLevel.gridSize}
                  >
                    <TrailDot
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      transition={{ duration: 0.3 }}
                    />
                  </OverlayElement>
                ))}

                {/* 3. Teleporter pads */}
                {currentLevel.teleporters?.map((tp, idx) => (
                  <React.Fragment key={`tp-${idx}`}>
                    <OverlayElement
                      $x={tp.from.x}
                      $y={tp.from.y}
                      $gridSize={currentLevel.gridSize}
                    >
                      <TeleporterGlow>
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <ellipse
                            cx="50"
                            cy="50"
                            rx="42"
                            ry="32"
                            fill="none"
                            stroke="#00ff7f"
                            strokeWidth="4"
                            strokeDasharray="10 5"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              values="0;15"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </ellipse>
                          <circle
                            cx="50"
                            cy="50"
                            r="10"
                            fill="#00ff7f"
                            opacity="0.5"
                          />
                        </svg>
                      </TeleporterGlow>
                    </OverlayElement>
                    <OverlayElement
                      $x={tp.to.x}
                      $y={tp.to.y}
                      $gridSize={currentLevel.gridSize}
                    >
                      <TeleporterGlow>
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <ellipse
                            cx="50"
                            cy="50"
                            rx="42"
                            ry="32"
                            fill="none"
                            stroke="#00ff7f"
                            strokeWidth="4"
                            strokeDasharray="10 5"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              values="0;15"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </ellipse>
                          <circle
                            cx="50"
                            cy="50"
                            r="10"
                            fill="#00ff7f"
                            opacity="0.5"
                          />
                        </svg>
                      </TeleporterGlow>
                    </OverlayElement>
                  </React.Fragment>
                ))}

                {/* 4. Power Cores */}
                {currentLevel.cores.map((core, idx) => {
                  const isCollected = activeCollectedCores.some(
                    (c) => c.x === core.x && c.y === core.y,
                  );
                  return (
                    <AnimatePresence key={`core-${idx}`}>
                      {!isCollected && (
                        <OverlayElement
                          $x={core.x}
                          $y={core.y}
                          $gridSize={currentLevel.gridSize}
                        >
                          <PowerCoreGlow
                            animate={{
                              y: [0, -6, 0],
                              filter: [
                                "drop-shadow(0 0 4px #ffd700)",
                                "drop-shadow(0 0 10px #ffd700)",
                                "drop-shadow(0 0 4px #ffd700)",
                              ],
                            }}
                            transition={{
                              y: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut",
                              },
                              filter: { repeat: Infinity, duration: 1.5 },
                            }}
                            exit={{
                              scale: 0,
                              opacity: 0,
                              transition: { duration: 0.25 },
                            }}
                          >
                            <svg viewBox="0 0 100 100" width="70%" height="70%">
                              <rect
                                x="35"
                                y="20"
                                width="30"
                                height="60"
                                rx="10"
                                fill="rgba(255, 215, 0, 0.15)"
                                stroke="#ffd700"
                                strokeWidth="4"
                              />
                              <rect
                                x="42"
                                y="10"
                                width="16"
                                height="10"
                                rx="2"
                                fill="#ffd700"
                              />
                              <path
                                d="M 50 30 L 40 50 L 50 50 L 45 70 L 60 45 L 50 45 Z"
                                fill="#ffd700"
                              />
                            </svg>
                          </PowerCoreGlow>
                        </OverlayElement>
                      )}
                    </AnimatePresence>
                  );
                })}

                {/* 5. Portal Entrance */}
                <OverlayElement
                  $x={currentLevel.portalPos.x}
                  $y={currentLevel.portalPos.y}
                  $gridSize={currentLevel.gridSize}
                >
                  <PortalGlow
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 6,
                      ease: "linear",
                    }}
                  >
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#ff007f"
                        strokeWidth="4"
                        strokeDasharray="14 8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="32"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="18"
                        fill="rgba(255, 0, 127, 0.1)"
                      />
                    </svg>
                  </PortalGlow>
                </OverlayElement>

                {/* 6. Glowing Drone Robot */}
                <OverlayElement
                  $x={simState.x}
                  $y={simState.y}
                  $gridSize={currentLevel.gridSize}
                >
                  <Drone
                    animate={{
                      rotate: simState.heading,
                      y: [0, -3, 0],
                    }}
                    transition={{
                      rotate: { type: "spring", stiffness: 220, damping: 25 },
                      y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
                    }}
                    layout
                  >
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <circle
                        cx="20"
                        cy="50"
                        r="8"
                        fill="#140c2d"
                        stroke="#00f0ff"
                        strokeWidth="2"
                      />
                      <circle
                        cx="80"
                        cy="50"
                        r="8"
                        fill="#140c2d"
                        stroke="#00f0ff"
                        strokeWidth="2"
                      />

                      {/* Fire thrust */}
                      <path
                        d="M 16 58 L 20 78 L 24 58 Z"
                        fill="#00f0ff"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="d"
                          values="M 16 58 L 20 78 L 24 58 Z; M 16 58 L 20 68 L 24 58 Z; M 16 58 L 20 78 L 24 58 Z"
                          dur="0.2s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path
                        d="M 76 58 L 80 78 L 84 58 Z"
                        fill="#00f0ff"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="d"
                          values="M 76 58 L 80 78 L 84 58 Z; M 76 58 L 80 68 L 84 58 Z; M 76 58 L 80 78 L 84 58 Z"
                          dur="0.2s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* Main dome */}
                      <circle
                        cx="50"
                        cy="48"
                        r="26"
                        fill="#100826"
                        stroke="#00f0ff"
                        strokeWidth="4"
                      />

                      {/* Cyber Visor */}
                      <rect
                        x="30"
                        y="34"
                        width="40"
                        height="12"
                        rx="6"
                        fill="#05020c"
                        stroke="#ff007f"
                        strokeWidth="2.5"
                      />
                      <ellipse cx="50" cy="40" rx="15" ry="3.5" fill="#ff007f">
                        <animate
                          attributeName="opacity"
                          values="1;0.4;1"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </ellipse>

                      {/* Antenna */}
                      <line
                        x1="50"
                        y1="22"
                        x2="50"
                        y2="10"
                        stroke="#00f0ff"
                        strokeWidth="3"
                      />
                      <circle cx="50" cy="8" r="4.5" fill="#ff007f" />
                    </svg>
                  </Drone>
                </OverlayElement>
              </GridContainer>
            </GridBoundary>

            {/* --- VISUAL FLOAT FEEDBACK --- */}
            <AnimatePresence>
              {feedback && (
                <FeedbackMessage
                  initial={{ scale: 0.5, opacity: 0, y: 20, x: "-50%" }}
                  animate={{ scale: 1, opacity: 1, y: 0, x: "-50%" }}
                  exit={{ scale: 1.2, opacity: 0, y: -20, x: "-50%" }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  {feedback}
                </FeedbackMessage>
              )}
            </AnimatePresence>
          </BoardContainer>

          {/* --- WORKSPACE BUILDER PANEL --- */}
          <CodeWorkspace>
            <WorkspaceSplit>
              <ToolboxSection>
                <ToolboxCard
                  $color="#00f0ff"
                  onClick={() => appendBlock("FORWARD")}
                  disabled={isPlaying}
                >
                  <ArrowUp size={16} />
                  FORWARD
                </ToolboxCard>
                <ToolboxCard
                  $color="#ff007f"
                  onClick={() => appendBlock("TURN_LEFT")}
                  disabled={isPlaying}
                >
                  <RefreshCcw size={16} />
                  LEFT
                </ToolboxCard>
                <ToolboxCard
                  $color="#9000ff"
                  onClick={() => appendBlock("TURN_RIGHT")}
                  disabled={isPlaying}
                >
                  <RefreshCw size={16} />
                  RIGHT
                </ToolboxCard>
                <ToolboxCard
                  $color="#ffd700"
                  onClick={() => appendBlock("REPEAT")}
                  disabled={isPlaying}
                >
                  <Repeat size={16} />
                  FUNCTION
                </ToolboxCard>
              </ToolboxSection>

              <ProgramSection>
                {program.map((block, idx) => renderBlock(block, idx))}

                {program.length === 0 && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.35,
                      padding: "1rem",
                      textAlign: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Zap size={24} />
                    <div style={{ fontSize: "0.75rem" }}>
                      No actions. Use Arrow Keys or tap buttons on left.
                    </div>
                  </div>
                )}

                {program.length > 0 && !isPlaying && (
                  <button
                    onClick={clearProgram}
                    style={{
                      marginTop: "0.5rem",
                      alignSelf: "center",
                      background: "rgba(255, 0, 127, 0.1)",
                      border: "1px solid #ff007f80",
                      color: "#ff007f",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255, 0, 127, 0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255, 0, 127, 0.1)")
                    }
                  >
                    CLEAR SCRIPT
                  </button>
                )}
              </ProgramSection>
            </WorkspaceSplit>

            {/* --- SIMULATION PLAYBACK PANEL --- */}
            <SimulationBar>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <ActionButton
                  $variant="secondary"
                  onClick={resetSimulation}
                  disabled={traceIndex === 0 && !isPlaying}
                >
                  <RotateCcw size={16} /> RESET
                </ActionButton>

                <ActionButton
                  $variant="secondary"
                  onClick={triggerSingleStep}
                  disabled={isPlaying || trace.length <= 1}
                >
                  <SkipForward size={16} /> STEP
                </ActionButton>

                {isPlaying ? (
                  <ActionButton
                    $variant="primary"
                    onClick={pauseSimulation}
                    style={{ minWidth: "120px" }}
                  >
                    <Pause size={16} /> PAUSE
                  </ActionButton>
                ) : (
                  <ActionButton
                    $variant="primary"
                    onClick={startSimulation}
                    disabled={
                      program.length === 0 || traceIndex === trace.length - 1
                    }
                    style={{ minWidth: "120px" }}
                  >
                    <Play size={16} fill="#fff" /> RUN CODE
                  </ActionButton>
                )}
              </div>
            </SimulationBar>
          </CodeWorkspace>
        </MainContent>

        {/* --- VICTORY CONGRATULATIONS MODAL --- */}
        <AnimatePresence>
          {isWinModalOpen && (
            <OverlayMask
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VictoryCard
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Award
                  size={40}
                  color="#ffd700"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))",
                  }}
                />
                <VictoryTitle>LEVEL COMPLETED!</VictoryTitle>

                <XPReveal>
                  <Sparkles size={16} /> +25 XP EARNED <Sparkles size={16} />
                </XPReveal>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem",
                    margin: "0.2rem 0",
                  }}
                >
                  <VictoryStat>
                    Grid Pathfinding: <span>SUCCESS</span>
                  </VictoryStat>
                  <VictoryStat>
                    Code Size: <span>{codeBlockCount} Blocks</span>
                  </VictoryStat>
                </div>

                <ActionButton
                  $variant="primary"
                  onClick={handleNextLevel}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.5rem",
                    fontSize: "0.9rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {currentLevelIdx < LEVELS.length - 1
                    ? "PROCEED TO NEXT LEVEL"
                    : "REPLAY GAME"}
                </ActionButton>
              </VictoryCard>
            </OverlayMask>
          )}
        </AnimatePresence>
      </GameWrapper>
    </GameContainer>
  );
};

export default RoboCodeNeon;
