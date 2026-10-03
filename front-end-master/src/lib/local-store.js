// =====================================================
// BROWSER-ONLY STORAGE
// Job cards and planner drafts have no backend endpoint yet, so they live
// in localStorage. Swap these helpers for API calls once endpoints exist.
// =====================================================

export const JOB_CARDS_KEY = "mp-job-cards";
export const PLANNER_DRAFT_KEY = "mp-planner-draft";

function readList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export const loadJobCards = () => readList(JOB_CARDS_KEY);

export const saveJobCards = (list) => {
  try {
    writeList(JOB_CARDS_KEY, list);
  } catch {
    /* ignore - storage full or blocked */
  }
};

// Sample rows from the old planner demo may have been saved into the draft
const isDemoRow = (row) =>
  String(row?.id).startsWith("demo-row-") ||
  String(row?.projectID).startsWith("demo-") ||
  String(row?.componentID).startsWith("demo-");

export const loadPlannerDraft = () => {
  const saved = readList(PLANNER_DRAFT_KEY);
  const rows = saved.filter((row) => !isDemoRow(row));

  // Drop them from storage too so they never come back
  if (rows.length !== saved.length) {
    try {
      writeList(PLANNER_DRAFT_KEY, rows);
    } catch {
      /* ignore - storage full or blocked */
    }
  }

  return rows;
};

// Throws so the caller can tell the user the draft was not saved
export const savePlannerDraft = (list) => writeList(PLANNER_DRAFT_KEY, list);
