// =====================================================
// API ERROR MESSAGE
// Turns an axios error into one short, user-facing message.
// Priority: message sent by the backend -> connection problem -> fallback.
// =====================================================

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Please check your connection and try again.";
const TIMEOUT_ERROR_MESSAGE =
  "The server took too long to respond. Please try again.";

const MAX_LENGTH = 200;

const clean = (value) => {
  if (typeof value !== "string") return "";
  const text = value.trim();
  // Ignore HTML error pages (IIS / proxy) - they are not readable messages
  if (!text || text.startsWith("<")) return "";
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
};

// First message from an ASP.NET style { errors: { Field: ["msg"] } } object
const firstValidationMessage = (errors) => {
  if (!errors) return "";
  if (Array.isArray(errors)) return clean(String(errors[0] ?? ""));
  if (typeof errors === "object") {
    for (const value of Object.values(errors)) {
      const msg = Array.isArray(value) ? value[0] : value;
      const text = clean(typeof msg === "string" ? msg : "");
      if (text) return text;
    }
  }
  return "";
};

const messageFromBody = (data) => {
  if (!data) return "";
  if (typeof data === "string") return clean(data);
  if (typeof data !== "object") return "";

  return (
    clean(data.message) ||
    clean(data.Message) ||
    clean(data.detail) ||
    clean(typeof data.error === "string" ? data.error : data.error?.message) ||
    firstValidationMessage(data.errors) ||
    clean(data.title)
  );
};

export function isNetworkError(err) {
  return Boolean(err?.isAxiosError && !err.response);
}

export function getApiErrorMessage(err, fallback = GENERIC_ERROR_MESSAGE) {
  if (!err) return fallback;

  // Server answered -> use whatever message it sent
  if (err.response) {
    return messageFromBody(err.response.data) || fallback;
  }

  // Request never got an answer
  if (err.isAxiosError) {
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return TIMEOUT_ERROR_MESSAGE;
    }
    return NETWORK_ERROR_MESSAGE;
  }

  // Non-API error (bug, bad data) -> keep technical text out of the UI
  return fallback;
}
