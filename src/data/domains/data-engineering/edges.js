// Edge schema:
// { id, source, target, level, label, removedAt? }
//   level     - first level at which the edge appears
//   removedAt - optional: first level at which the edge disappears (it is replaced by a richer path)
export const edges = [
  // ---------- BASIC ----------
  { id: "e-source-ingestion", source: "source", target: "ingestion", level: "basic", label: "raw events" },
  { id: "e-ingestion-raw_storage", source: "ingestion", target: "raw_storage", level: "basic", label: "raw copy" },
  {
    id: "e-raw_storage-processing",
    source: "raw_storage",
    target: "processing",
    level: "basic",
    removedAt: "medium",
    label: "read raw files",
  },
  { id: "e-processing-warehouse", source: "processing", target: "warehouse", level: "basic", label: "clean tables" },
  {
    id: "e-warehouse-bi",
    source: "warehouse",
    target: "bi",
    level: "basic",
    removedAt: "medium",
    label: "SQL queries",
  },

  // ---------- MEDIUM ----------
  { id: "e-source-streaming", source: "source", target: "streaming", level: "medium", label: "live events" },
  { id: "e-streaming-raw_storage", source: "streaming", target: "raw_storage", level: "medium", label: "micro-batches" },
  { id: "e-raw_storage-quality", source: "raw_storage", target: "quality", level: "medium", label: "validate" },
  { id: "e-quality-medallion", source: "quality", target: "medallion", level: "medium", label: "passed rows" },
  {
    id: "e-medallion-processing",
    source: "medallion",
    target: "processing",
    level: "medium",
    removedAt: "advanced",
    label: "bronze → silver",
  },
  { id: "e-warehouse-dbt", source: "warehouse", target: "dbt", level: "medium", label: "SQL models" },
  { id: "e-dbt-bi", source: "dbt", target: "bi", level: "medium", label: "marts" },
  { id: "e-orchestration-ingestion", source: "orchestration", target: "ingestion", level: "medium", label: "schedules" },
  { id: "e-orchestration-processing", source: "orchestration", target: "processing", level: "medium", label: "triggers" },
  { id: "e-orchestration-warehouse", source: "orchestration", target: "warehouse", level: "medium", label: "triggers" },
  { id: "e-medallion-catalog", source: "medallion", target: "catalog", level: "medium", label: "schemas" },

  // ---------- ADVANCED ----------
  { id: "e-source-cdc", source: "source", target: "cdc", level: "advanced", label: "row changes" },
  { id: "e-cdc-streaming", source: "cdc", target: "streaming", level: "advanced", label: "change events" },
  { id: "e-streaming-stream_processing", source: "streaming", target: "stream_processing", level: "advanced", label: "event stream" },
  { id: "e-stream_processing-lakehouse", source: "stream_processing", target: "lakehouse", level: "advanced", label: "fresh tables" },
  { id: "e-medallion-lakehouse", source: "medallion", target: "lakehouse", level: "advanced", label: "ACID tables" },
  { id: "e-lakehouse-processing", source: "lakehouse", target: "processing", level: "advanced", label: "table reads" },
  { id: "e-lakehouse-catalog", source: "lakehouse", target: "catalog", level: "advanced", label: "table metadata" },
  { id: "e-dbt-feature_store", source: "dbt", target: "feature_store", level: "advanced", label: "feature tables" },
  { id: "e-feature_store-ml", source: "feature_store", target: "ml", level: "advanced", label: "training data" },
  { id: "e-ml-bi", source: "ml", target: "bi", level: "advanced", label: "predictions" },
  { id: "e-ml-reverse_etl", source: "ml", target: "reverse_etl", level: "advanced", label: "scores" },
  { id: "e-quality-observability", source: "quality", target: "observability", level: "advanced", label: "check results" },
  { id: "e-orchestration-observability", source: "orchestration", target: "observability", level: "advanced", label: "run metrics" },
  { id: "e-catalog-governance", source: "catalog", target: "governance", level: "advanced", label: "PII tags" },
  { id: "e-governance-lakehouse", source: "governance", target: "lakehouse", level: "advanced", label: "access policies" },
];
