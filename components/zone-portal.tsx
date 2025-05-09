"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { playSound } from "@/lib/sound-utils";
import { FallbackImage } from "@/components/fallback-image";

interface ZonePortalProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  fallbackIcon: string;
  color: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  animation: any;
  glow: any;
  tooltip: string;
  unlockRequirement: number;
  badges: string[];
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  soundEnabled?: boolean;
  className?: string;
}

export function ZonePortal({
  id,
  name,
  description,
  icon,
  fallbackIcon,
  color,
  position,
  animation,
  glow,
  tooltip,
  unlockRequirement,
  badges,
  onClick,
  onHoverStart,
  onHoverEnd,
  soundEnabled = true,
  className,
}: ZonePortalProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Check if zone is unlocked
  const isUnlocked = badges.length >= unlockRequirement;

  // Get background color class based on color
  const bgColorClass = `bg-${color}-500/30`;
  const borderColorClass = `border-${color}-400`;
  const glowColorClass = `bg-${color}-400/20`;

  const handleHoverStart = () => {
    setIsHovered(true);
    onHoverStart();

    if (soundEnabled) {
      playSound("/sounds/hover.mp3", 0.2);
    }
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    onHoverEnd();
  };

  const handleClick = () => {
    if (!isUnlocked) {
      if (soundEnabled) {
        playSound("/sounds/locked.mp3", 0.5);
      }
      return;
    }

    onClick();

    if (soundEnabled) {
      playSound("/sounds/portal-enter.mp3", 0.5);
    }
  };

  return (
    <motion.div
      className="absolute z-10"
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
    >
      <div className="relative cursor-pointer">
        <motion.div
          animate={animation}
          transition={{
            duration: animation.duration || 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: animation.repeatType || "loop",
          }}
        >
          <div
            className={`w-24 h-24 md:w-32 md:h-32 ${bgColorClass} rounded-full  flex items-center justify-center backdrop-blur-sm border-2 border-blue-300 bg-white`}
          >
            <FallbackImage
              src={icon}
              alt={name}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20"
              fallbackEmoji={fallbackIcon}
            />
          </div>
        </motion.div>

        <motion.div
          className={`absolute -inset-1 rounded-full ${glowColorClass}`}
          animate={glow}
          transition={{
            duration: glow.duration || 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: glow.repeatType || "loop",
          }}
        />

        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg text-blue-600 font-medium text-sm whitespace-nowrap"
          >
            {tooltip}
          </motion.div>
        )}

        {/* Lock icon for locked zones */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-2xl">🔒</div>
            <div className="absolute -bottom-8 text-white text-xs font-bold bg-red-500 px-2 py-0.5 rounded-full">
              Need {unlockRequirement} badges
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
