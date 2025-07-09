// src/components/ui/Button.js
import React from "react";
import { theme } from "../../styles/theme";

function Button({ children, onClick, color = "primary", style = {}, ...props }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: theme.colors[color],
        color: "white",
        padding: theme.spacing.small,
        fontSize: theme.fontSize.medium,
        border: "none",
        borderRadius: theme.borderRadius,
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
