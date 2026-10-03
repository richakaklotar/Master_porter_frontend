import { Toaster } from "react-hot-toast";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Global toast container: top-right on desktop, top-center on phones.
function AppToaster() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Toaster
      position="bottom-center"
      gutter={8}
      // Above MUI dialogs (z-index 1300)
      containerStyle={{ zIndex: 2000, top: isMobile ? 12 : 20 }}
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: "0.875rem",
          lineHeight: 1.4,
          color: "var(--foreground)",
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "10px 14px",
          maxWidth: isMobile ? "calc(100vw - 24px)" : 420,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
        success: {
          iconTheme: { primary: "#059669", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#dc2626", secondary: "#fff" },
        },
      }}
    />
  );
}

export default AppToaster;
