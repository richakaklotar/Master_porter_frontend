import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./index.css";
import App from "./App.jsx";

const muiTheme = createTheme({
  palette: {
    primary: { main: "#6d28d9", contrastText: "#ffffff" },
    secondary: { main: "#f3f4f6", contrastText: "#111827" },
    error: { main: "#dc2626", contrastText: "#ffffff" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#09090b", secondary: "#6b7280" },
    divider: "#e4e4e7",
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "inherit" },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);