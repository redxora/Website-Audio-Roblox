"use client";
import React from "react";
export default function CustomIcon({ name, size = 18, className = "", alt, ...props }) {
    const dimension = typeof size === "number" ? `${size}px` : size;
    return (<img src={`/asset/icons/${name}.svg`} alt={alt || name} width={typeof size === "number" ? size : undefined} height={typeof size === "number" ? size : undefined} style={{
            width: dimension,
            height: dimension,
            display: "block",
            objectFit: "contain",
            flexShrink: 0,
        }} className={`select-none pointer-events-none ${className}`} loading="eager" decoding="async" {...props}/>);
}
