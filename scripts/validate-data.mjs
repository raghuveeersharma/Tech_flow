// Validates every registered domain: schema, layout, edges, play paths and sample data.
// Usage: npm run validate            (all domains)
//        npm run validate -- <id>    (one domain, e.g. data-science)
import { createServer } from "vite";
import { existsSync } from "node:fs";

const only = process.argv[2];
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
// With an id, load just that domain's folder (so a domain can be validated before it is registered).
let domains;
if (only && existsSync(`src/data/domains/${only}/index.js`)) {
  domains = [(await server.ssrLoadModule(`/src/data/domains/${only}/index.js`)).default];
} else {
  domains = (await server.ssrLoadModule("/src/data/domains/index.js")).domains;
}
const { iconMap } = await server.ssrLoadModule("/src/data/icons.js");
const { ui } = await server.ssrLoadModule("/src/data/ui.js");
const LEVELS = ui.levels.map((l) => l.id);
const li = (l) => LEVELS.indexOf(l);

const NODE_W = 210;
const NODE_H = 78;
let totalErrors = 0;
let totalWarnings = 0;

function resolvePosition(n, level) {
  for (let i = li(level); i > 0; i--) {
    const p = n.positionByLevel?.[LEVELS[i]];
    if (p) return p;
  }
  return n.position;
}
const str = (v, min = 1) => typeof v === "string" && v.trim().length >= min;
const hex = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

// does the straight segment a->b pass through rectangle r (shrunk a little)?
function segmentHitsRect(a, b, r) {
  const pad = 12;
  const x1 = r.x + pad, x2 = r.x + NODE_W - pad, y1 = r.y + pad, y2 = r.y + NODE_H - pad;
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const clip = (p, q) => {
    if (p === 0) return q >= 0;
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    return true;
  };
  return clip(-dx, a.x - x1) && clip(dx, x2 - a.x) && clip(-dy, a.y - y1) && clip(dy, y2 - a.y);
}

for (const d of domains) {
  if (only && d.id !== only) continue;
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(m);
  const W = (m) => warnings.push(m);

  // ---------- meta ----------
  for (const k of ["id", "name", "tagline", "description", "example", "title", "subtitle", "sampleHeading"]) {
    if (!str(d[k], 3)) E(`meta.${k} missing`);
  }
  if (!iconMap[d.icon]) E(`meta.icon "${d.icon}" is not in icons.js`);
  if (!hex(d.color)) E(`meta.color must be #rrggbb`);
  for (const l of LEVELS) if (!str(d.levelDescriptions?.[l], 10)) E(`meta.levelDescriptions.${l} missing`);
  if (!Array.isArray(d.floatFields)) E("floatFields must be an array");

  // ---------- categories ----------
  const catIds = Object.keys(d.categories ?? {});
  if (catIds.length < 3) E("need at least 3 categories");
  for (const [id, c] of Object.entries(d.categories ?? {})) {
    if (!str(c.label)) E(`category ${id}: label`);
    if (!hex(c.color)) E(`category ${id}: color must be #rrggbb`);
    if (!iconMap[c.icon]) E(`category ${id}: icon "${c.icon}" not in icons.js`);
  }
  const catColors = catIds.map((c) => d.categories[c].color.toLowerCase());
  if (new Set(catColors).size !== catColors.length) W("two categories share a color");

  // ---------- nodes ----------
  const ids = new Set();
  for (const n of d.nodes) {
    if (ids.has(n.id)) E(`duplicate node id ${n.id}`);
    ids.add(n.id);
    if (!/^[a-z0-9_]+$/.test(n.id)) E(`${n.id}: id must be snake_case`);
    if (!LEVELS.includes(n.level)) E(`${n.id}: bad level`);
    if (!d.categories[n.category]) E(`${n.id}: unknown category ${n.category}`);
    if (!str(n.label, 3)) E(`${n.id}: label`);
    if (!str(n.shortLabel) || n.shortLabel.length > 12) E(`${n.id}: shortLabel required, max 12 chars`);
    if (n.label.length > 36) W(`${n.id}: label is long (${n.label.length} chars)`);
    if (!iconMap[n.icon]) E(`${n.id}: icon "${n.icon}" not in icons.js`);
    if (!Number.isFinite(n.position?.x) || !Number.isFinite(n.position?.y)) E(`${n.id}: position`);
    for (const [lvl, p] of Object.entries(n.positionByLevel ?? {})) {
      if (!LEVELS.includes(lvl) || li(lvl) <= li(n.level)) E(`${n.id}: positionByLevel.${lvl} invalid (must be a level AFTER ${n.level})`);
      if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) E(`${n.id}: positionByLevel.${lvl} needs x,y`);
    }
    const x = n.details;
    if (!x) { E(`${n.id}: details missing`); continue; }
    if (!str(x.summary, 20)) E(`${n.id}: summary`);
    if (!str(x.whatHappens, 150)) E(`${n.id}: whatHappens too short (<150 chars)`);
    if (!str(x.whyImportant, 120)) E(`${n.id}: whyImportant too short (<120 chars)`);
    if (!Array.isArray(x.howItHappens) || x.howItHappens.length < 3 || x.howItHappens.length > 6 || !x.howItHappens.every((s) => str(s, 15)))
      E(`${n.id}: howItHappens needs 3-6 real steps`);
    if (!Array.isArray(x.tools) || x.tools.length < 3 || !x.tools.every((t) => str(t.name) && str(t.type) && str(t.note, 10)))
      E(`${n.id}: tools needs >=3 entries with name/type/note`);
    if (!Array.isArray(x.commonProblems) || x.commonProblems.length < 3 || !x.commonProblems.every((s) => str(s, 15)))
      E(`${n.id}: commonProblems needs >=3 entries`);
    if (!n.sampleKey || !d.sampleData[n.sampleKey]) E(`${n.id}: sampleKey missing or not in sampleData`);
  }

  // ---------- sub-nodes (optional) ----------
  for (const [parentId, subs] of Object.entries(d.subNodes ?? {})) {
    if (!d.nodes.some((n) => n.id === parentId)) { E(`subNodes.${parentId}: no such node`); continue; }
    if (!Array.isArray(subs) || subs.length < 2 || subs.length > 8) E(`subNodes.${parentId}: needs 2-8 sub-nodes`);
    const subIds = new Set();
    for (const sn of subs ?? []) {
      const at = `subNodes.${parentId}.${sn.id}`;
      if (!/^[a-z0-9_]+$/.test(sn.id ?? "") || subIds.has(sn.id)) E(`${at}: id must be unique snake_case`);
      subIds.add(sn.id);
      if (!str(sn.label, 3)) E(`${at}: label`);
      if (!str(sn.shortLabel) || sn.shortLabel.length > 12) E(`${at}: shortLabel required, max 12 chars`);
      if (!iconMap[sn.icon]) E(`${at}: icon "${sn.icon}" not in icons.js`);
      if (!str(sn.summary, 15)) E(`${at}: summary`);
      if (!str(sn.whatHappens, 60)) E(`${at}: whatHappens too short (<60 chars)`);
      if (!Array.isArray(sn.howItHappens) || sn.howItHappens.length < 2 || !sn.howItHappens.every((x) => str(x, 10))) E(`${at}: howItHappens needs >=2 steps`);
      if (sn.tools && !sn.tools.every((t) => str(t.name) && str(t.type) && str(t.note, 10))) E(`${at}: tools need name/type/note`);
    }
  }

  // ---------- level counts ----------
  const added = (l) => d.nodes.filter((n) => n.level === l).length;
  const aB = added("basic"), aM = added("medium"), aA = added("advanced");
  if (aB < 5 || aB > 6) E(`basic must have 5-6 nodes (has ${aB})`);
  if (aM < 4 || aM > 8) E(`medium must add 4-8 nodes (adds ${aM})`);
  if (aA < 4 || aA > 9) E(`advanced must add 4-9 nodes (adds ${aA})`);

  // ---------- edges ----------
  const eids = new Set();
  const nodeById = Object.fromEntries(d.nodes.map((n) => [n.id, n]));
  for (const e of d.edges) {
    if (eids.has(e.id)) E(`duplicate edge id ${e.id}`);
    eids.add(e.id);
    if (!nodeById[e.source] || !nodeById[e.target]) { E(`edge ${e.id}: unknown source/target`); continue; }
    if (!LEVELS.includes(e.level)) E(`edge ${e.id}: bad level`);
    if (!str(e.label)) E(`edge ${e.id}: label required`);
    else if (e.label.length > 18) W(`edge ${e.id}: label long (${e.label.length})`);
    if (e.removedAt && (!LEVELS.includes(e.removedAt) || li(e.removedAt) <= li(e.level))) E(`edge ${e.id}: removedAt must be a level after ${e.level}`);
    if (li(e.level) < Math.max(li(nodeById[e.source].level), li(nodeById[e.target].level))) E(`edge ${e.id}: appears before one of its nodes exists`);
    if (e.source === e.target) E(`edge ${e.id}: self loop`);
  }

  // ---------- per-level checks ----------
  for (const level of LEVELS) {
    const vis = d.nodes.filter((n) => li(n.level) <= li(level));
    const pos = Object.fromEntries(vis.map((n) => [n.id, resolvePosition(n, level)]));
    const visEdges = d.edges.filter((e) => li(e.level) <= li(level) && !(e.removedAt && li(e.removedAt) <= li(level)) && pos[e.source] && pos[e.target]);

    // overlap
    for (let i = 0; i < vis.length; i++)
      for (let j = i + 1; j < vis.length; j++) {
        const a = pos[vis[i].id], b = pos[vis[j].id];
        if (Math.abs(a.x - b.x) < NODE_W + 40 && Math.abs(a.y - b.y) < NODE_H + 40) E(`[${level}] ${vis[i].id} and ${vis[j].id} overlap/too close`);
      }
    // orphans
    for (const n of vis) if (!visEdges.some((e) => e.source === n.id || e.target === n.id)) E(`[${level}] ${n.id} has no edges`);
    // edges through nodes (straight-line heuristic)
    for (const e of visEdges) {
      const a = { x: pos[e.source].x + NODE_W / 2, y: pos[e.source].y + NODE_H / 2 };
      const b = { x: pos[e.target].x + NODE_W / 2, y: pos[e.target].y + NODE_H / 2 };
      for (const n of vis) if (n.id !== e.source && n.id !== e.target && segmentHitsRect(a, b, pos[n.id])) W(`[${level}] edge ${e.id} passes behind ${n.id}`);
    }
    // basic = a single horizontal row
    if (level === "basic") {
      const ys = new Set(vis.map((n) => resolvePosition(n, "basic").y));
      if (ys.size !== 1) E("basic nodes must all share the same y (single row)");
    }
    // size sanity
    const xs = vis.map((n) => pos[n.id].x), ys = vis.map((n) => pos[n.id].y);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    if (w > 6 * 310) W(`[${level}] layout is very wide (${w}px)`);
    if (h > 5 * 170) W(`[${level}] layout is very tall (${h}px)`);

    // play path
    const path = d.playPaths?.[level];
    if (!Array.isArray(path) || path.length < 5) { E(`playPaths.${level} needs >=5 node ids`); continue; }
    path.forEach((id, i) => {
      if (!pos[id]) E(`playPaths.${level}: "${id}" is not visible at this level`);
      if (i > 0 && !visEdges.some((e) => e.source === path[i - 1] && e.target === id)) W(`[${level}] play hop ${path[i - 1]} -> ${id} has no edge`);
    });
    if (new Set(path).size !== path.length) E(`playPaths.${level} repeats a node`);
  }

  // ---------- sample data ----------
  for (const n of d.nodes) {
    const s = d.sampleData[n.sampleKey];
    if (!s) continue;
    if (!s.output || typeof s.output !== "object" || Array.isArray(s.output)) E(`${n.id}: sample.output must be an object`);
    if (s.input !== null && (typeof s.input !== "object" || Array.isArray(s.input))) E(`${n.id}: sample.input must be null or an object`);
    if (!str(s.note, 80)) E(`${n.id}: sample.note must explain the change (>=80 chars)`);
    if (s.output && JSON.stringify(s.input) === JSON.stringify(s.output)) E(`${n.id}: sample input and output are identical`);
    if (s.input && s.output) {
      const keys = new Set([...Object.keys(s.input), ...Object.keys(s.output)]);
      const changed = [...keys].filter((k) => JSON.stringify(s.input[k]) !== JSON.stringify(s.output[k])).length;
      if (changed === 0) E(`${n.id}: no visible change`);
      if (Object.keys(s.output).length > 14) W(`${n.id}: sample output has many fields (${Object.keys(s.output).length})`);
    }
  }
  const firstSample = d.nodes.find((n) => n.level === "basic" && d.sampleData[n.sampleKey]?.input === null);
  if (!firstSample) W("no basic node has input: null (the 'birth' of the record)");

  // ---------- report ----------
  console.log(`\n${d.name} (${d.id}): ${d.nodes.length} nodes (${aB}+${aM}+${aA}), ${d.edges.length} edges, ${catIds.length} categories`);
  errors.forEach((m) => console.log(`  ERROR   ${m}`));
  warnings.forEach((m) => console.log(`  warning ${m}`));
  if (!errors.length && !warnings.length) console.log("  OK");
  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

await server.close();
console.log(`\n${totalErrors} error(s), ${totalWarnings} warning(s)`);
process.exit(totalErrors ? 1 : 0);
