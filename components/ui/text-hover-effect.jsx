"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
export const TextHoverEffect = ({ text, duration, }) => {
    const svgRef = useRef(null);
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
    useEffect(() => {
        if (svgRef.current && cursor.x !== null && cursor.y !== null) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
            const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
            setMaskPosition({
                cx: `${cxPercentage}%`,
                cy: `${cyPercentage}%`,
            });
        }
    }, [cursor]);
    return (<svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1000 130" xmlns="http://www.w3.org/2000/svg" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onMouseMove={(e) => {
            setCursor({ x: e.clientX, y: e.clientY });
            setHovered(true);
        }} className="select-none pointer-events-auto cursor-default overflow-visible">
      <defs>
        
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2d78"/>
          <stop offset="25%" stopColor="#ec4899"/>
          <stop offset="50%" stopColor="#f43f5e"/>
          <stop offset="75%" stopColor="#fb7185"/>
          <stop offset="100%" stopColor="#e11d48"/>
        </linearGradient>

        <motion.radialGradient id="revealMask" gradientUnits="userSpaceOnUse" r="22%" initial={{ cx: "50%", cy: "50%" }} animate={maskPosition} transition={{ duration: duration ?? 0, ease: "easeOut" }}>
          <stop offset="0%" stopColor="white"/>
          <stop offset="100%" stopColor="black"/>
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)"/>
        </mask>
      </defs>

      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" strokeWidth="1.2" className="fill-transparent stroke-white/20 font-heading font-black uppercase tracking-[0.18em]" style={{
            fontSize: "66px",
            opacity: hovered ? 0.75 : 0.35,
            transition: "opacity 0.25s ease",
        }}>
        {text}
      </text>

      <motion.text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" strokeWidth="1.2" className="fill-transparent stroke-white/25 font-heading font-black uppercase tracking-[0.18em]" style={{ fontSize: "66px" }} initial={{ strokeDashoffset: 1500, strokeDasharray: 1500 }} animate={{
            strokeDashoffset: 0,
            strokeDasharray: 1500,
        }} transition={{
            duration: 3,
            ease: "easeInOut",
        }}>
        {text}
      </motion.text>

      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" stroke="url(#textGradient)" strokeWidth="1.6" fill="url(#textGradient)" fillOpacity="0.22" mask="url(#textMask)" className="font-heading font-black uppercase tracking-[0.18em]" style={{ fontSize: "66px" }}>
        {text}
      </text>
    </svg>);
};
export default TextHoverEffect;
