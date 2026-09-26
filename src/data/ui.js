// Every piece of UI text lives here so components contain no hardcoded copy.
export const ui = {
  picker: {
    eyebrow: "Interactive guide",
    heading: "Which domain do you want to understand?",
    subtitle:
      "Pick a field and watch how its work flows, stage by stage, following one real example you can click through.",
    follow: "You'll follow",
    stages: "{count} stages",
    explore: "Explore",
    levelsLabel: "Stages at each level",
    footer: "Every domain has three levels: Basic, Medium and Advanced.",
  },
  header: {
    back: "All domains",
    backLabel: "Back to the domain list",
  },
  levels: [
    { id: "basic", label: "Basic" },
    { id: "medium", label: "Medium" },
    { id: "advanced", label: "Advanced" },
  ],
  levelSwitcher: {
    groupLabel: "Complexity level",
    nodeCount: "{count} nodes",
  },
  legend: {
    title: "Categories",
    show: "Show legend",
    hide: "Hide legend",
  },
  canvas: {
    ariaLabel: "Flow diagram",
    nodeHint: "Press Enter to open details",
    miniMapLabel: "Overview map",
  },
  panel: {
    close: "Close details",
    tabs: { info: "Overview", data: "Example data" },
    tablistLabel: "Detail sections",
    sections: {
      what: "What happens here",
      how: "How it happens",
      why: "Why it's important",
      tools: "Tools used",
      problems: "Common problems",
    },
  },
  sampleView: {
    input: "Input",
    output: "Output",
    noInput: "This is where the record is born, so there is no input yet.",
    whatChanged: "What changed",
    legend: {
      added: "Added",
      modified: "Modified",
      removed: "Removed",
      unchanged: "Unchanged",
    },
    summary: "{added} added · {modified} modified · {removed} removed",
  },
  play: {
    start: "Play data flow",
    stop: "Stop",
    status: "Step {current} of {total}",
    hint: "Watch one order travel through every stage",
  },
};

// Tiny helper for "{count} nodes" style templates.
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? values[key] : `{${key}}`));
}
