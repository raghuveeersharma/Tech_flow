// Optional sub-steps for a node: { [nodeId]: [ { id, label, shortLabel, icon, summary, whatHappens, howItHappens[], whyImportant?, tools?[], commonProblems?[] } ] }
// A node listed here gets an enabled "See sub-steps" button; every other node shows it disabled.
// Sub-steps run in order (they are drawn as a chain). Icons must exist in icons.js.

export const subNodes = {
  ingestion: [
    {
      id: "connect", label: "Connect to the source", shortLabel: "Connect", icon: "Plug",
      summary: "Authenticate and open a safe, read-only connection.",
      whatHappens: "The connector logs in to the source system with a dedicated read-only account, so ingestion can never change or break the production data it copies.",
      howItHappens: ["Fetch credentials from a secrets manager.", "Open a connection (JDBC, HTTPS or SFTP) with a timeout.", "Check the account can only read the tables it needs."],
      tools: [{ name: "AWS Secrets Manager", type: "Secrets", note: "Keeps passwords out of code" }, { name: "Airbyte connectors", type: "ELT", note: "Ready-made source connections" }],
      commonProblems: ["Expired credentials stop the pipeline at 3 a.m.", "Firewall rules block the connector."],
    },
    {
      id: "extract", label: "Extract new data", shortLabel: "Extract", icon: "Filter",
      summary: "Read only what is new or changed since the last run.",
      whatHappens: "Instead of copying everything every time, the job asks for rows changed after its last bookmark. This keeps the run fast and the source database calm.",
      howItHappens: ["Load the saved bookmark (last updated_at).", "Query rows newer than the bookmark in pages.", "Save the new bookmark only after the load succeeds."],
      tools: [{ name: "Incremental sync", type: "Pattern", note: "Cursor column such as updated_at" }, { name: "Kafka Connect", type: "Streaming", note: "Continuous extraction" }],
      commonProblems: ["Rows updated without touching updated_at are missed.", "Deleted rows never show up."],
    },
    {
      id: "tag", label: "Add metadata", shortLabel: "Tag", icon: "Tags",
      summary: "Stamp each record with where and when it arrived.",
      whatHappens: "Each record gets technical fields such as source system, batch id and arrival time. The business data itself is untouched, but every row becomes traceable.",
      howItHappens: ["Attach _source and _batch_id.", "Add _ingested_at in UTC.", "Optionally store a hash of the row for later comparison."],
      tools: [{ name: "Airbyte / Fivetran", type: "ELT", note: "Add _airbyte_* / _fivetran_* columns automatically" }],
      commonProblems: ["Missing lineage makes it impossible to trace a bad row."],
    },
    {
      id: "deliver", label: "Deliver and retry", shortLabel: "Deliver", icon: "CloudUpload",
      summary: "Write to the platform, retrying safely on failure.",
      whatHappens: "The batch is written to the destination. If the network fails, the job retries, and idempotent writes make sure a retry never creates duplicates.",
      howItHappens: ["Write the batch to a staging location.", "Retry with exponential back-off on errors.", "Commit atomically so the batch is all-or-nothing."],
      tools: [{ name: "Idempotent upserts", type: "Pattern", note: "Same batch twice = same result" }, { name: "Amazon S3", type: "Object store", note: "Common landing zone" }],
      commonProblems: ["Retry without idempotency doubles the rows."],
    },
    {
      id: "audit", label: "Log and audit", shortLabel: "Audit", icon: "ClipboardList",
      summary: "Record how many rows moved so the run can be checked.",
      whatHappens: "The run writes a small receipt: rows read, rows written, duration and status. Comparing source and destination counts catches silent data loss early.",
      howItHappens: ["Count rows read and written.", "Compare the two numbers.", "Alert the owner if they differ or the run is late."],
      tools: [{ name: "Orchestrator run logs", type: "Logs", note: "Per-run history" }, { name: "Slack alerts", type: "Alerting", note: "Tell the owner quickly" }],
      commonProblems: ["Nobody reads the logs until a dashboard looks wrong."],
    },
  ],
  processing: [
    {
      id: "standardize", label: "Standardize formats", shortLabel: "Standardize", icon: "Wand2",
      summary: "Make dates, currencies and text look the same everywhere.",
      whatHappens: "Raw values arrive in many shapes. This step converts them into one agreed format, such as UTC timestamps, ISO currency codes and trimmed, consistently-cased text.",
      howItHappens: ["Cast text amounts to decimals.", "Convert local times to UTC.", "Trim and normalize names, cities and codes."],
      tools: [{ name: "Spark / pandas", type: "Compute", note: "Column-wise transformations" }, { name: "dbt", type: "SQL transforms", note: "Cleaning models in SQL" }],
      commonProblems: ["Time zone mistakes shift orders to the wrong day."],
    },
    {
      id: "dedupe", label: "Remove duplicates", shortLabel: "Dedupe", icon: "Eraser",
      summary: "Keep one clean row per real-world event.",
      whatHappens: "Retries and overlapping loads can create the same order several times. This step picks a business key and keeps only the latest version of each record.",
      howItHappens: ["Choose the key (order_id).", "Rank rows per key by arrival time.", "Keep rank 1 and drop the rest."],
      tools: [{ name: "ROW_NUMBER() window", type: "SQL", note: "Standard dedupe pattern" }],
      commonProblems: ["Picking the wrong key removes real orders."],
    },
    {
      id: "validate", label: "Validate and fix nulls", shortLabel: "Validate", icon: "ShieldCheck",
      summary: "Reject or repair rows that break the rules.",
      whatHappens: "Rules such as 'amount must be positive' and 'country is required' are checked. Bad rows are fixed with defaults where safe, or sent aside for review.",
      howItHappens: ["Apply not-null and range checks.", "Fill safe defaults.", "Route failing rows to a quarantine table."],
      tools: [{ name: "Great Expectations", type: "Data quality", note: "Declarative checks" }],
      commonProblems: ["Silent defaults hide real upstream bugs."],
    },
    {
      id: "enrich", label: "Join and enrich", shortLabel: "Enrich", icon: "Merge",
      summary: "Combine with customers, products and rates.",
      whatHappens: "The order is joined with reference data so it carries names, categories and converted amounts, ready for analysis without further lookups.",
      howItHappens: ["Join on customer_id and product_id.", "Convert the amount using the day's exchange rate.", "Add derived fields such as order_total_usd."],
      tools: [{ name: "Apache Spark", type: "Compute", note: "Large joins" }, { name: "dbt", type: "SQL transforms", note: "Joins as models" }],
      commonProblems: ["Join keys that do not match drop rows."],
    },
  ],
};
