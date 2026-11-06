// Optional sub-steps for a node: { [nodeId]: [ { id, label, shortLabel, icon, summary, whatHappens, howItHappens[], whyImportant?, tools?[], commonProblems?[] } ] }
// A node listed here gets an enabled "See sub-steps" button; every other node shows it disabled.
// Sub-steps run in order (they are drawn as a chain). Icons must exist in icons.js.

export const subNodes = {
  data_cleaning: [
    {
      id: "profile", label: "Profile the data", shortLabel: "Profile", icon: "FileSearch",
      summary: "Look at what is actually in the table before touching it.",
      whatHappens: "Counts, ranges and missing-value rates show where the data is dirty, so cleaning effort goes to the problems that matter.",
      howItHappens: ["Count rows and nulls per column.", "Check min, max and distinct values.", "List suspicious columns."],
      tools: [{ name: "pandas-profiling", type: "Python", note: "Automatic report" }, { name: "SQL COUNT / MIN / MAX", type: "SQL", note: "Quick checks" }],
    },
    {
      id: "missing", label: "Handle missing values", shortLabel: "Missing", icon: "CircleHelp",
      summary: "Decide to fill, flag or drop empty values.",
      whatHappens: "Each gap is treated according to what it means. Some are filled with a sensible value, some are flagged, and some rows are dropped when too much is missing.",
      howItHappens: ["Separate 'unknown' from 'not applicable'.", "Fill with median or a label such as Unknown.", "Document every rule used."],
      commonProblems: ["Filling blindly with zero skews averages."],
    },
    {
      id: "duplicates", label: "Remove duplicates", shortLabel: "Dedupe", icon: "Eraser",
      summary: "Make sure one customer or order counts once.",
      whatHappens: "Repeated rows inflate totals. Duplicates are found by a business key and removed or merged.",
      howItHappens: ["Pick the key (order_id).", "Find repeated keys.", "Keep the most recent row."],
      tools: [{ name: "DISTINCT / ROW_NUMBER", type: "SQL", note: "Standard approach" }],
    },
    {
      id: "outliers", label: "Check outliers", shortLabel: "Outliers", icon: "Crosshair",
      summary: "Spot extreme values and decide if they are errors.",
      whatHappens: "A 1,000,000 order might be a typo or a real bulk deal. Outliers are reviewed, then corrected, capped or kept with a note.",
      howItHappens: ["Plot distributions.", "Flag values beyond the usual range.", "Confirm with the data owner."],
      commonProblems: ["Deleting real big customers hides the most valuable cases."],
    },
  ],
  analysis: [
    {
      id: "hypothesis", label: "State the hypothesis", shortLabel: "Hypothesis", icon: "Lightbulb",
      summary: "Turn the business question into something testable.",
      whatHappens: "The question 'why did sales drop?' becomes concrete guesses, such as 'the drop is concentrated in one region'. This keeps the analysis focused.",
      howItHappens: ["Write the question in one line.", "List 2-3 likely explanations.", "Decide which number would confirm each."],
    },
    {
      id: "compare", label: "Compare and break down", shortLabel: "Compare", icon: "GitCompare",
      summary: "Split the metric by time, region and customer type.",
      whatHappens: "Totals hide the story. Breaking the number down and comparing periods shows where the change really happens.",
      howItHappens: ["Group by region, product and segment.", "Compare against last month and last year.", "Rank the biggest contributors to the change."],
      tools: [{ name: "SQL GROUP BY", type: "SQL", note: "Breakdowns" }, { name: "Pivot tables", type: "Spreadsheet", note: "Quick slicing" }],
    },
    {
      id: "test", label: "Test the evidence", shortLabel: "Test", icon: "Calculator",
      summary: "Check the difference is real, not just noise.",
      whatHappens: "Simple statistics show whether a gap is large enough to trust, so the team does not act on random variation.",
      howItHappens: ["Compute averages and confidence ranges.", "Run a significance test where needed.", "Look for confounding factors."],
      commonProblems: ["Mistaking correlation for cause."],
    },
    {
      id: "conclude", label: "Draw the conclusion", shortLabel: "Conclude", icon: "Flag",
      summary: "Answer the question and say how sure you are.",
      whatHappens: "Findings are summarized in plain language with the key number, the reason and the level of confidence, ready to be visualized.",
      howItHappens: ["Pick the one finding that answers the question.", "State the caveats.", "Suggest the next action."],
    },
  ],
};
