// src/components/ui/Card.js
import React from "react";
import { theme } from "../../styles/theme";

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: theme.borderRadius,
        padding: theme.spacing.medium,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
