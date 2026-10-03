import toast from "react-hot-toast";
import { getApiErrorMessage, isNetworkError } from "./api-error";

// =====================================================
// ERROR TOAST
// notifyError(err, "Failed to load plants.")
// Shows the backend message, or the fallback if the backend sent none.
// =====================================================
export function notifyError(err, fallback) {
  const message = getApiErrorMessage(err, fallback);

  // Same id = same toast is updated instead of stacked
  // (e.g. server down while 3 lists load at once -> only one toast)
  const id = isNetworkError(err) ? "network-error" : message;

  toast.error(message, { id });
}

// =====================================================
// SUCCESS TOAST
// =====================================================
export function notifySuccess(message) {
  toast.success(message, { id: message });
}
