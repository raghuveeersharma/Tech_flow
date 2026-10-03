// Registry of every domain shown on the picker screen, in display order.
// To add a domain: create src/data/domains/<id>/ (see data-engineering for the shape) and register it here.
import dataEngineering from "./data-engineering";
import dataAnalytics from "./data-analytics";
import dataScience from "./data-science";

export const domains = [dataEngineering, dataAnalytics, dataScience];

export const getDomain = (id) => domains.find((d) => d.id === id) ?? null;
