import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import { motion, useReducedMotion } from "framer-motion";
import { PACKET_MS } from "../data/layout";

const PARTICLE_SPEED = 90; // px per second, so particles move at the same speed on every edge

function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) {
  const { color, label, highlighted, dimmed, exiting, enterDelay = 0, packet, packetKey } = data;
  const reduceMotion = useReducedMotion();
  const pathRef = useRef(null);
  const packetRef = useRef(null);
  const entered = useRef(false);
  const [length, setLength] = useState(300);
  const [packetLive, setPacketLive] = useState(false);

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Measure the real path so duration = length / speed (constant speed).
  useLayoutEffect(() => {
    if (pathRef.current) {
      const l = pathRef.current.getTotalLength();
      if (Number.isFinite(l) && l > 0) setLength(Math.max(40, Math.round(l / 20) * 20));
    }
  }, [path]);

  // Fire the one-shot "Play data flow" packet whenever the key changes.
  useEffect(() => {
    if (packet && packetRef.current && typeof packetRef.current.beginElement === "function") {
      packetRef.current.beginElement();
      setPacketLive(true);
    } else {
      setPacketLive(false);
    }
  }, [packet, packetKey]);

  const duration = length / PARTICLE_SPEED;
  const particleCount = Math.min(3, Math.max(1, Math.round(length / 200)));
  const opacity = dimmed ? 0.12 : highlighted || packet ? 1 : 0.5;
  const draw = enterDelay;

  return (
    <>
      <g style={{ opacity: exiting ? 0 : 1, transition: "opacity 0.35s ease" }}>
        {(highlighted || packet) && (
          <path d={path} fill="none" stroke={color} strokeWidth={7} strokeOpacity={0.18} strokeLinecap="round" />
        )}
        <motion.path
          ref={pathRef}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={highlighted || packet ? 2.5 : 1.6}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity }}
          transition={{
            pathLength: { duration: 0.7, delay: entered.current ? 0 : draw, ease: "easeInOut" },
            opacity: { duration: 0.35, delay: entered.current ? 0 : draw },
          }}
          onAnimationComplete={() => {
            entered.current = true;
          }}
        />

        {/* Looping glow particles travelling source -> target */}
        {!reduceMotion && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: dimmed ? 0.15 : 1 }}
            transition={{ duration: 0.4, delay: entered.current ? 0 : draw + 0.7 }}
          >
            {Array.from({ length: particleCount }).map((_, i) => (
              <g key={i}>
                <animateMotion
                  dur={`${duration}s`}
                  begin={`${-(i * duration) / particleCount}s`}
                  repeatCount="indefinite"
                  path={path}
                  calcMode="linear"
                />
                <circle r={7} fill={color} opacity={0.22} />
                <circle r={3.2} fill={color} />
                <circle r={1.4} fill="#fff" opacity={0.9} />
              </g>
            ))}
          </motion.g>
        )}

        {/* One-shot highlighted packet for "Play data flow" */}
        {packet && (
          <g style={{ visibility: packetLive ? "visible" : "hidden" }}>
            <animateMotion
              ref={packetRef}
              dur={`${PACKET_MS}ms`}
              begin="indefinite"
              fill="freeze"
              path={path}
              calcMode="linear"
            />
            <circle r={13} fill={color} opacity={0.25} />
            <circle r={7} fill={color} />
            <circle r={3} fill="#fff" />
          </g>
        )}
      </g>

      {label && (
        <EdgeLabelRenderer>
          <div
            className="edge-label nodrag nopan pointer-events-none absolute max-md:hidden"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              opacity: exiting ? 0 : dimmed ? 0.15 : 1,
              color: highlighted ? "#f8fafc" : undefined,
              borderColor: highlighted ? color : undefined,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(AnimatedEdge);
