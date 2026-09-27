// Node schema:
// {
//   id, level, category, label, shortLabel, icon,
//   position,                // layout used at the first level the node appears
//   positionByLevel?,        // optional overrides: { medium: {x,y}, advanced: {x,y} } (falls back to the previous level)
//   details: { summary, whatHappens, howItHappens[], whyImportant, tools[{name,type,note}], commonProblems[] },
//   sampleKey
// }
// `level` is the FIRST level at which the node appears (levels are cumulative).

export const nodes = [
  // =====================================================================
  // BASIC
  // =====================================================================
  {
    id: "source",
    level: "basic",
    category: "source",
    label: "Data Sources",
    shortLabel: "Sources",
    icon: "Database",
    position: { x: 0, y: 170 },
    details: {
      summary: "Everything that produces data: apps, APIs, databases, IoT devices and logs.",
      whatHappens:
        "Data is born here. Every time a customer places an order, a payment is made, a sensor sends a reading or a server writes a log line, a record is created inside some system. These systems were built to run the business, not to answer analytical questions, so their data is often messy and in different formats.",
      howItHappens: [
        "A customer clicks 'Buy' in the mobile app.",
        "The application writes a row into its production database and may also call an internal API.",
        "The event is stored in the shape the app finds convenient: text amounts, local time zones, free-form city names.",
        "Other systems (payment gateway, CRM, web server logs, IoT sensors) produce their own records in parallel, each with its own format.",
      ],
      whyImportant:
        "Everything downstream depends on what the sources record. If a source forgets to capture a field or changes its format without telling anyone, every later stage is affected. Knowing your sources, who owns them and how reliable they are is the first job of a data engineer.",
      tools: [
        { name: "PostgreSQL / MySQL", type: "OLTP database", note: "Where the order is first saved by the application" },
        { name: "REST / GraphQL APIs", type: "API", note: "Partner and SaaS systems such as payments or shipping" },
        { name: "Web & server logs", type: "Logs", note: "Clickstream and application events written as text or JSON" },
        { name: "IoT devices", type: "Sensors", note: "Temperature, GPS or machine telemetry sent continuously" },
        { name: "SaaS apps (Salesforce, Stripe)", type: "Third party", note: "Business data that lives outside your own servers" },
      ],
      commonProblems: [
        "Schema changes: a developer renames a column and breaks every consumer without warning.",
        "Inconsistent formats: dates, currencies and spellings differ between systems.",
        "Missing or null values for fields the business assumed were always filled in.",
        "Production databases that cannot handle heavy analytical queries without slowing down the app.",
      ],
    },
    sampleKey: "source",
  },
  {
    id: "ingestion",
    level: "basic",
    category: "ingestion",
    label: "Ingestion",
    shortLabel: "Ingest",
    icon: "ArrowDownToLine",
    position: { x: 310, y: 170 },
    details: {
      summary: "Moves data out of the source systems into the data platform.",
      whatHappens:
        "Ingestion is the delivery truck of the pipeline. It connects to each source, copies the data out and delivers it to the platform, usually without changing it. Along the way it records when the data arrived and where it came from. Ingestion can run on a schedule (batch) or continuously.",
      howItHappens: [
        "A connector authenticates to the source (database, API or file location).",
        "It reads only what is new or changed since the last run, using timestamps or a bookmark.",
        "It adds metadata such as the arrival time and the source system name.",
        "It writes the records to the destination, retrying automatically if the network fails.",
        "It logs how many rows were moved so the run can be audited.",
      ],
      whyImportant:
        "If ingestion loses or duplicates records, nothing downstream can be trusted. A reliable ingestion layer means analysts do not have to ask developers for exports and the production database is not hammered by ad-hoc queries.",
      tools: [
        { name: "Airbyte", type: "Open-source ELT", note: "Hundreds of ready-made connectors for databases and SaaS tools" },
        { name: "Fivetran", type: "Managed ELT", note: "Fully managed, zero-maintenance pipelines" },
        { name: "Kafka Connect", type: "Streaming connector", note: "Moves data between Kafka and other systems at scale" },
        { name: "Custom Python scripts", type: "Code", note: "Flexible for unusual APIs, but you maintain the retries and logging" },
      ],
      commonProblems: [
        "Duplicate rows when a failed run is retried without idempotency.",
        "API rate limits and timeouts that silently drop pages of data.",
        "Full reloads that take hours because incremental loading was never set up.",
        "Credentials that expire and stop the pipeline overnight.",
      ],
    },
    sampleKey: "ingestion",
  },
  {
    id: "raw_storage",
    level: "basic",
    category: "storage",
    label: "Raw Storage",
    shortLabel: "Raw Store",
    icon: "HardDrive",
    position: { x: 620, y: 170 },
    details: {
      summary: "Cheap, durable object storage that keeps an untouched copy of everything.",
      whatHappens:
        "The raw storage layer, often called a data lake, holds data exactly as it arrived: JSON, CSV, Parquet or images. Nothing is cleaned or deleted. Because storage is cheap, you can keep years of history and replay it whenever your logic changes or a bug is found.",
      howItHappens: [
        "Ingestion writes files into a bucket, organized into folders by source and date (for example dt=2026-11-06).",
        "Files are stored in an open format such as JSON or Parquet, often compressed.",
        "Access is controlled by bucket policies and encryption is applied at rest.",
        "Lifecycle rules move old files to cheaper storage tiers automatically.",
      ],
      whyImportant:
        "Raw storage is your safety net. If a transformation is wrong you can fix the code and reprocess from the original data instead of asking the source to resend it. It is also the cheapest place to keep data you might need later.",
      tools: [
        { name: "Amazon S3", type: "Object storage", note: "The most widely used data lake foundation on AWS" },
        { name: "Google Cloud Storage", type: "Object storage", note: "GCS buckets for GCP-based platforms" },
        { name: "Azure Data Lake Storage (ADLS)", type: "Object storage", note: "Hierarchical storage built for analytics on Azure" },
      ],
      commonProblems: [
        "A 'data swamp': files dumped with no naming convention, so nobody can find anything.",
        "Thousands of tiny files that make reads slow and expensive.",
        "Sensitive data stored unmasked in a bucket that is too widely accessible.",
        "No retention policy, so storage costs grow forever.",
      ],
    },
    sampleKey: "raw_storage",
  },
  {
    id: "processing",
    level: "basic",
    category: "processing",
    label: "Processing / Transformation",
    shortLabel: "Transform",
    icon: "Cog",
    position: { x: 930, y: 170 },
    positionByLevel: { medium: { x: 1550, y: 340 } },
    details: {
      summary: "Cleans, reshapes and enriches raw data into something analysts can trust.",
      whatHappens:
        "Raw data is rarely usable as-is. The processing step fixes types, standardizes formats, removes duplicates, handles missing values and joins tables together. The output is a clean, consistent dataset that follows business definitions.",
      howItHappens: [
        "Read the raw files from storage.",
        "Cast data types, for example the text '1,499' becomes the number 1499.0.",
        "Standardize formats: timestamps to ISO-8601 UTC, city names to title case.",
        "Handle nulls with defaults or flags, and drop exact duplicates.",
        "Join with reference data and write the clean result to the next stage.",
      ],
      whyImportant:
        "This is where raw facts become trustworthy information. If two teams clean the data differently, they will report different revenue numbers. A single, tested transformation step gives the whole company one version of the truth.",
      tools: [
        { name: "Apache Spark", type: "Distributed engine", note: "Processes terabytes across a cluster in Python, SQL or Scala" },
        { name: "pandas", type: "Python library", note: "Great for small to medium datasets on a single machine" },
        { name: "dbt", type: "SQL transformation", note: "Version-controlled, tested SQL models" },
      ],
      commonProblems: [
        "Silent data loss from joins that drop rows with no match.",
        "Time zone mistakes that move orders onto the wrong day.",
        "Transformations that are not idempotent and double-count when rerun.",
        "One huge job that is slow and impossible to debug.",
      ],
    },
    sampleKey: "processing",
  },
  {
    id: "warehouse",
    level: "basic",
    category: "storage",
    label: "Data Warehouse",
    shortLabel: "Warehouse",
    icon: "Warehouse",
    position: { x: 1240, y: 170 },
    positionByLevel: { medium: { x: 1550, y: 510 } },
    details: {
      summary: "A fast, structured database built for analytical queries.",
      whatHappens:
        "The warehouse stores cleaned data in tables designed for analysis. Unlike the application database, which is optimized for single-row writes, a warehouse is optimized for scanning millions of rows and computing sums, averages and groupings in seconds. Analysts and BI tools query it with plain SQL.",
      howItHappens: [
        "Clean data from processing is loaded into staging tables.",
        "Tables are organized in a model, often a star schema with fact tables (orders) and dimension tables (customers, products).",
        "Data is stored in columns and compressed, so queries only read the columns they need.",
        "Compute scales up or down independently of storage.",
        "Access roles control who can read which schema.",
      ],
      whyImportant:
        "The warehouse is the single place the business goes for answers. A good warehouse turns a question like 'what was revenue by city yesterday?' into a one-second query instead of a week of spreadsheet work.",
      tools: [
        { name: "Google BigQuery", type: "Serverless warehouse", note: "Pay per query, no servers to manage" },
        { name: "Snowflake", type: "Cloud warehouse", note: "Separates storage and compute, works on every major cloud" },
        { name: "Amazon Redshift", type: "Cloud warehouse", note: "Deep integration with the AWS ecosystem" },
      ],
      commonProblems: [
        "Runaway query costs from unfiltered queries scanning whole tables.",
        "Duplicate or conflicting tables with names like orders_final_v2.",
        "Slow dashboards because tables were never partitioned or clustered.",
        "No documentation, so nobody knows which table is the right one.",
      ],
    },
    sampleKey: "warehouse",
  },
  {
    id: "bi",
    level: "basic",
    category: "serving",
    label: "BI & Dashboards",
    shortLabel: "BI",
    icon: "BarChart3",
    position: { x: 1550, y: 170 },
    positionByLevel: { medium: { x: 930, y: 510 } },
    details: {
      summary: "Charts and dashboards that turn tables into decisions.",
      whatHappens:
        "BI tools sit on top of the warehouse and present data to people who make decisions. They run queries behind the scenes and draw charts, tables and KPIs that refresh automatically. This is the part of the pipeline the business actually sees.",
      howItHappens: [
        "A dashboard connects to the warehouse with a read-only account.",
        "Each chart runs an aggregate query, such as daily revenue grouped by city.",
        "Results are cached so repeated views are instant.",
        "Filters, drill-downs and scheduled email reports let users explore without writing SQL.",
      ],
      whyImportant:
        "Data that nobody looks at has no value. Dashboards are how a marketing manager spots a drop in orders, or a finance team tracks revenue. If the number on the dashboard is wrong, trust in the whole data team is lost.",
      tools: [
        { name: "Metabase", type: "Open-source BI", note: "Easy self-serve questions for non-technical users" },
        { name: "Power BI", type: "Microsoft BI", note: "Common in organizations that use Microsoft 365" },
        { name: "Tableau", type: "Visual analytics", note: "Rich, interactive visualizations" },
        { name: "Looker", type: "Semantic-layer BI", note: "Central metric definitions through the LookML model" },
      ],
      commonProblems: [
        "Two dashboards show different revenue because each defines 'revenue' differently.",
        "Dashboards that take a minute to load.",
        "Stale data that nobody noticed because there is no freshness indicator.",
        "Too many dashboards, with no owner for any of them.",
      ],
    },
    sampleKey: "bi",
  },

  // =====================================================================
  // MEDIUM
  // =====================================================================
  {
    id: "orchestration",
    level: "medium",
    category: "orchestration",
    label: "Orchestration",
    shortLabel: "Orchestrate",
    icon: "Workflow",
    position: { x: 930, y: 0 },
    details: {
      summary: "The scheduler and conductor that runs every pipeline step in the right order.",
      whatHappens:
        "Orchestration tools decide what runs, when and in which order. You describe your pipeline as a graph of tasks (a DAG) with dependencies, and the orchestrator runs them on a schedule, retries failures, sends alerts and records the history of every run.",
      howItHappens: [
        "Pipelines are defined as code: tasks plus the dependencies between them.",
        "The scheduler starts a run at the configured time or when an upstream event arrives.",
        "Tasks run only after the tasks they depend on have succeeded.",
        "Failed tasks are retried with back-off and alert the team if they keep failing.",
        "A UI shows the status and duration of every run, and lets you rerun a single task or a past date.",
      ],
      whyImportant:
        "Without orchestration, pipelines are a pile of cron jobs that nobody can reason about. The orchestrator makes the whole system observable and recoverable: you always know what ran, what failed and what is safe to rerun.",
      tools: [
        { name: "Apache Airflow", type: "Workflow scheduler", note: "The industry standard, with a huge ecosystem of operators" },
        { name: "Dagster", type: "Asset-based orchestrator", note: "Models data assets rather than tasks, with strong testing" },
        { name: "Prefect", type: "Python orchestrator", note: "Turns ordinary Python functions into resilient flows" },
      ],
      commonProblems: [
        "Cron jobs that overlap or start before the previous step has finished.",
        "Backfills that re-run months of data and overload the warehouse.",
        "Giant DAGs where one failing task blocks everything.",
        "Alert fatigue: so many notifications that real failures are ignored.",
      ],
    },
    sampleKey: "orchestration",
  },
  {
    id: "streaming",
    level: "medium",
    category: "ingestion",
    label: "Streaming Layer",
    shortLabel: "Streaming",
    icon: "Radio",
    position: { x: 310, y: 340 },
    details: {
      summary: "A real-time pipe that carries events the moment they happen.",
      whatHappens:
        "Instead of waiting for a nightly batch, events are published to a streaming platform as soon as they occur. The platform stores them in an ordered, replayable log. Many consumers can read the same stream independently: one writes to storage, another updates a live dashboard.",
      howItHappens: [
        "The app publishes each event to a named topic, such as orders.v1.",
        "The broker splits the topic into partitions and appends the event to one, assigning it an offset.",
        "The event is replicated across brokers so it survives a server failure.",
        "Consumers read from their own position (offset) and can rewind to replay history.",
        "A sink connector writes the stream into raw storage in small micro-batches.",
      ],
      whyImportant:
        "Some questions cannot wait for tomorrow: fraud detection, live inventory, delivery tracking. A streaming layer also decouples producers from consumers, so adding a new consumer does not require changing the source app.",
      tools: [
        { name: "Apache Kafka", type: "Event streaming", note: "The de facto standard for high-throughput event logs" },
        { name: "Amazon Kinesis", type: "Managed streaming", note: "AWS-native alternative with no brokers to run" },
        { name: "Google Pub/Sub", type: "Managed messaging", note: "Serverless messaging on GCP with global scale" },
      ],
      commonProblems: [
        "Consumer lag: consumers fall behind producers and data arrives late.",
        "Out-of-order and duplicate events, because delivery is at-least-once.",
        "Poor partition keys that overload a single partition.",
        "Schema changes that break consumers, which is why a schema registry is used.",
      ],
    },
    sampleKey: "streaming",
  },
  {
    id: "quality",
    level: "medium",
    category: "quality",
    label: "Data Quality / Validation",
    shortLabel: "Quality",
    icon: "ShieldCheck",
    position: { x: 930, y: 170 },
    details: {
      summary: "Automated checks that catch bad data before it spreads.",
      whatHappens:
        "Quality checks test data against explicit expectations: this column is never null, amounts are positive, order ids are unique, row counts are within a normal range. Data that breaks the rules is flagged, quarantined or stops the pipeline.",
      howItHappens: [
        "Rules are written as code: not null, unique, accepted values, ranges, row counts, freshness.",
        "The checks run automatically on each new batch, between raw storage and transformation.",
        "Each rule has a severity: warn (flag and continue) or error (stop the pipeline).",
        "Failing rows are copied to a quarantine table for investigation.",
        "Results are saved and published as a data quality report.",
      ],
      whyImportant:
        "Bad data costs more the later it is found. A negative revenue figure caught at ingestion is a five-minute fix. The same figure discovered in a board report is a crisis. Automated checks move the discovery earlier and make trust measurable.",
      tools: [
        { name: "Great Expectations", type: "Validation framework", note: "Python 'expectations' with readable data docs" },
        { name: "Soda", type: "Data quality checks", note: "Simple YAML-based checks and monitoring" },
        { name: "dbt tests", type: "SQL tests", note: "not_null, unique and relationships tests next to your models" },
      ],
      commonProblems: [
        "Too many weak rules create noise, and too few miss real problems.",
        "Checks that only run in development, never in production.",
        "A failing check blocks the pipeline but nobody owns the fix.",
        "Rules that go stale when the business changes.",
      ],
    },
    sampleKey: "quality",
  },
  {
    id: "medallion",
    level: "medium",
    category: "storage",
    label: "Bronze / Silver / Gold Layers",
    shortLabel: "Medallion",
    icon: "Layers",
    position: { x: 1240, y: 170 },
    details: {
      summary: "A three-layer design that improves data quality step by step.",
      whatHappens:
        "The medallion architecture replaces the single 'raw to processed' jump with three clear layers. Bronze holds raw data as it arrived. Silver holds cleaned, deduplicated, correctly typed data. Gold holds business-ready tables such as daily revenue per city. Each layer has one job and one audience.",
      howItHappens: [
        "Bronze: validated raw records are appended as-is with load metadata (batch id, source).",
        "Silver: records are cleaned, deduplicated, typed and joined with reference data.",
        "Gold: silver data is aggregated into business-level tables and metrics.",
        "Each hop is a small, testable job, and every layer can be rebuilt from the one before it.",
      ],
      whyImportant:
        "Layers make problems easy to locate: if gold is wrong, check silver; if silver is wrong, check bronze. They also let different users take what they need: data scientists often use silver, executives use gold.",
      tools: [
        { name: "Databricks", type: "Lakehouse platform", note: "Popularized the medallion pattern" },
        { name: "Delta Lake", type: "Table format", note: "Stores each layer as reliable, versioned tables" },
        { name: "Apache Spark", type: "Processing engine", note: "Runs the bronze to silver to gold jobs" },
        { name: "dbt", type: "SQL transformation", note: "Models the silver and gold layers in SQL" },
      ],
      commonProblems: [
        "Too many layers or copies of the data make it costly and confusing.",
        "Business logic leaking into bronze, so raw data is no longer replayable.",
        "No clear owner for each layer.",
        "Gold tables rebuilt in full every night when an incremental update would do.",
      ],
    },
    sampleKey: "medallion",
  },
  {
    id: "dbt",
    level: "medium",
    category: "processing",
    label: "Transformation with dbt",
    shortLabel: "dbt",
    icon: "Braces",
    position: { x: 1240, y: 510 },
    details: {
      summary: "SQL models that transform data inside the warehouse (the ELT pattern).",
      whatHappens:
        "With ELT, raw data is loaded into the warehouse first and transformed there using SQL. dbt manages those transformations: each model is a SELECT statement in a file, and dbt runs them in dependency order, builds tables and views, runs tests and generates documentation and lineage.",
      howItHappens: [
        "Analysts write each model as a SQL SELECT in a version-controlled project.",
        "References such as ref('orders') tell dbt the order in which to build the models.",
        "dbt compiles the SQL and runs it in the warehouse, creating tables or views.",
        "Tests (unique, not null, relationships) run after each model.",
        "dbt generates a documentation site and a lineage graph automatically.",
      ],
      whyImportant:
        "dbt brings software engineering practices to analytics: version control, code review, tests and documentation. Business logic such as 'what counts as a first order' lives in one reviewed place rather than inside dozens of dashboards.",
      tools: [
        { name: "dbt Core", type: "Open-source CLI", note: "Free, runs anywhere you can run Python" },
        { name: "dbt Cloud", type: "Managed service", note: "Scheduling, a hosted IDE and CI for dbt projects" },
        { name: "SQLMesh", type: "Alternative framework", note: "Virtual environments and column-level lineage" },
      ],
      commonProblems: [
        "Hundreds of models with unclear naming and deep dependency chains.",
        "Every model rebuilt as a full refresh, which drives up warehouse cost.",
        "Missing tests, so a broken join goes unnoticed.",
        "Business logic duplicated across models.",
      ],
    },
    sampleKey: "dbt",
  },
  {
    id: "catalog",
    level: "medium",
    category: "governance",
    label: "Data Catalog",
    shortLabel: "Catalog",
    icon: "BookOpen",
    position: { x: 1240, y: 0 },
    details: {
      summary: "A searchable inventory of every dataset, who owns it and where it comes from.",
      whatHappens:
        "A data catalog is like a library index for your data. It automatically scans the lake, warehouse and pipelines and records each table, its columns, owner, description, tags and lineage. People can search for 'revenue' and find the right trusted table instead of asking around.",
      howItHappens: [
        "Crawlers connect to storage, warehouse and orchestrator and collect metadata.",
        "Lineage is built by reading query logs and pipeline definitions.",
        "Owners and stewards add descriptions, tags (for example 'pii') and glossary terms.",
        "Users search the catalog, preview schemas and see who else uses a table.",
      ],
      whyImportant:
        "As a company grows, finding and trusting data becomes the bottleneck. A catalog saves hours of searching, shows the impact of a change before you make it and is the foundation for governance and compliance.",
      tools: [
        { name: "DataHub", type: "Open-source catalog", note: "Metadata platform with search and lineage" },
        { name: "OpenMetadata", type: "Open-source catalog", note: "Discovery, lineage and quality in a single tool" },
        { name: "Atlan", type: "Managed catalog", note: "Collaboration-focused data workspace" },
      ],
      commonProblems: [
        "Descriptions never get written, so the catalog is full of empty entries.",
        "Metadata goes stale when scans are not automated.",
        "Nobody is accountable for an asset, so owner fields stay blank.",
        "Low adoption because search results are not trusted.",
      ],
    },
    sampleKey: "catalog",
  },

  // =====================================================================
  // ADVANCED
  // =====================================================================
  {
    id: "cdc",
    level: "advanced",
    category: "ingestion",
    label: "Change Data Capture (CDC)",
    shortLabel: "CDC",
    icon: "DatabaseZap",
    position: { x: 0, y: 340 },
    details: {
      summary: "Streams every insert, update and delete from a database as it happens.",
      whatHappens:
        "Instead of repeatedly copying whole tables, CDC reads the database's own transaction log and publishes each change as an event: which row changed, its old values and its new values. The source database barely notices, and the warehouse stays within seconds of the source.",
      howItHappens: [
        "The database writes every change to its transaction log (the WAL in Postgres, the binlog in MySQL).",
        "A CDC connector reads that log without querying the tables.",
        "Each change becomes an event with an operation (create, update or delete), before and after values and a log position.",
        "Events are published to the streaming layer, in order.",
        "Downstream jobs apply the changes to keep a mirror table in sync, including deletes.",
      ],
      whyImportant:
        "Batch extracts miss deletes, hide intermediate changes and put heavy load on production. CDC gives an accurate, low-latency history of how data changed, which is also invaluable for audits and for rebuilding state at any point in time.",
      tools: [
        { name: "Debezium", type: "Open-source CDC", note: "Kafka-based connectors for Postgres, MySQL, SQL Server and more" },
        { name: "AWS DMS", type: "Managed migration / CDC", note: "Replicates databases into AWS targets" },
        { name: "Fivetran / Airbyte CDC", type: "Managed connectors", note: "Log-based replication without running Kafka yourself" },
      ],
      commonProblems: [
        "The transaction log fills the disk if the connector falls behind or stops.",
        "Large initial snapshots that take a long time and lock tables.",
        "Schema changes in the source that break the change events.",
        "Applying updates and deletes out of order and corrupting the mirror table.",
      ],
    },
    sampleKey: "cdc",
  },
  {
    id: "stream_processing",
    level: "advanced",
    category: "processing",
    label: "Stream Processing",
    shortLabel: "Stream Proc",
    icon: "Zap",
    position: { x: 620, y: 340 },
    details: {
      summary: "Computes on events continuously, in seconds, while they are still in motion.",
      whatHappens:
        "A stream processor reads events from the streaming layer and applies transformations continuously: filtering, joining streams, counting events in time windows and detecting patterns. Results are updated within seconds, enabling live dashboards, alerts and real-time features.",
      howItHappens: [
        "The job subscribes to a topic and keeps its own state, such as running counts.",
        "Events are grouped into time windows (for example 5-minute tumbling windows) using event time, not arrival time.",
        "Watermarks decide how long to wait for late events before closing a window.",
        "State is checkpointed regularly so the job can recover exactly where it stopped.",
        "Results are written to a table, a topic or an operational store.",
      ],
      whyImportant:
        "Fraud must be blocked before the payment completes, and a delivery ETA is useless if it is an hour old. Stream processing delivers answers while they still matter, and makes data fresh for the rest of the platform.",
      tools: [
        { name: "Apache Flink", type: "Stream engine", note: "True event-at-a-time processing with strong state handling" },
        { name: "Spark Structured Streaming", type: "Micro-batch engine", note: "Reuse your Spark skills for streaming jobs" },
        { name: "ksqlDB", type: "Streaming SQL", note: "Write streaming queries in SQL on top of Kafka" },
      ],
      commonProblems: [
        "Late and out-of-order events producing wrong window results.",
        "State that grows without bound and exhausts memory.",
        "Hard-to-test jobs, because streams never 'finish'.",
        "Duplicate output after restarts unless the sink is idempotent.",
      ],
    },
    sampleKey: "stream_processing",
  },
  {
    id: "lakehouse",
    level: "advanced",
    category: "storage",
    label: "Lakehouse Table Format",
    shortLabel: "Lakehouse",
    icon: "Table2",
    position: { x: 1550, y: 170 },
    details: {
      summary: "Adds database features, like transactions and time travel, to files in a data lake.",
      whatHappens:
        "A lakehouse table format is a metadata layer on top of ordinary Parquet files in object storage. It tracks which files belong to a table version in a transaction log, so the lake behaves like a real database: ACID transactions, updates and deletes, schema evolution and time travel, while the data remains cheap and open.",
      howItHappens: [
        "Data is stored as Parquet files in object storage, as usual.",
        "A transaction log records every commit: which files were added or removed.",
        "Readers load the latest log snapshot, so they never see a half-written table.",
        "Writers use optimistic concurrency, and conflicting commits are retried.",
        "Old versions stay available, so you can query the table 'as of' yesterday or roll back a bad write.",
      ],
      whyImportant:
        "Plain files cannot be updated safely: a crashed job leaves a half-written folder, and GDPR deletions mean rewriting everything. Table formats solve this, and let several engines (Spark, Trino, Flink) share the same tables without copying data.",
      tools: [
        { name: "Delta Lake", type: "Table format", note: "Strong Spark integration, originally from Databricks" },
        { name: "Apache Iceberg", type: "Table format", note: "Engine-neutral, with hidden partitioning and wide support" },
        { name: "Apache Hudi", type: "Table format", note: "Optimized for fast upserts and incremental pulls" },
      ],
      commonProblems: [
        "Too many small files that need regular compaction.",
        "Old snapshots that are never vacuumed, so storage costs balloon.",
        "Choosing a format that your query engines do not fully support.",
        "Concurrent writers that conflict and retry endlessly.",
      ],
    },
    sampleKey: "lakehouse",
  },
  {
    id: "feature_store",
    level: "advanced",
    category: "ml",
    label: "Feature Store",
    shortLabel: "Features",
    icon: "Store",
    position: { x: 1240, y: 680 },
    details: {
      summary: "A shared library of ready-to-use ML inputs, called features.",
      whatHappens:
        "A feature is a measurable property used by a model, such as 'orders in the last 30 days'. A feature store computes each feature once, stores it centrally and serves it both to training jobs (as history) and to live applications (with milliseconds of latency), so the model sees exactly the same numbers in both places.",
      howItHappens: [
        "Engineers define features as code, with an entity (such as the user) and a data source.",
        "Batch jobs compute them from the warehouse, and streaming jobs keep them fresh.",
        "The offline store keeps full history for building training sets with point-in-time correctness.",
        "The online store (a key-value database) serves the latest value in milliseconds.",
        "Teams discover and reuse existing features instead of rebuilding them.",
      ],
      whyImportant:
        "The most common ML failure is training-serving skew: the model trains on one calculation and runs on another. A feature store removes that mismatch and stops every team from re-implementing 'average order value' differently.",
      tools: [
        { name: "Feast", type: "Open-source feature store", note: "Lightweight, plugs into your existing warehouse and Redis" },
        { name: "Tecton", type: "Managed feature platform", note: "Real-time features with production SLAs" },
        { name: "Databricks / Vertex feature stores", type: "Platform-native", note: "Built into the ML platform you may already use" },
      ],
      commonProblems: [
        "Data leakage: training on feature values that were not yet known at prediction time.",
        "Online and offline values drift apart.",
        "Features nobody owns, which silently go stale.",
        "Over-engineering: a feature store is overkill for one small model.",
      ],
    },
    sampleKey: "feature_store",
  },
  {
    id: "ml",
    level: "advanced",
    category: "ml",
    label: "ML Training & Serving",
    shortLabel: "ML",
    icon: "BrainCircuit",
    position: { x: 930, y: 680 },
    details: {
      summary: "Trains models on historical data and serves their predictions.",
      whatHappens:
        "Data scientists use features to train a model, for example one that predicts which customers will stop buying. Every training run is tracked, the best model is registered, and then it is deployed to answer predictions in batch (nightly scores for every customer) or in real time through an API.",
      howItHappens: [
        "Build a training set from the feature store with correct point-in-time values.",
        "Train and evaluate several models, logging parameters and metrics.",
        "Register the best model in a model registry with a version number.",
        "Deploy it as a batch job or a low-latency endpoint.",
        "Monitor accuracy and data drift, and retrain when quality drops.",
      ],
      whyImportant:
        "This is how the pipeline moves from describing the past to predicting the future: recommendations, fraud scores, demand forecasts. Reliable data pipelines are the biggest factor in whether a model works in production at all.",
      tools: [
        { name: "MLflow", type: "Experiment tracking", note: "Tracks runs, stores models and manages the registry" },
        { name: "Amazon SageMaker", type: "ML platform", note: "Managed training and hosting on AWS" },
        { name: "Google Vertex AI", type: "ML platform", note: "End-to-end training, pipelines and endpoints on GCP" },
      ],
      commonProblems: [
        "Model drift: the world changes and accuracy quietly degrades.",
        "Models that cannot be reproduced because data or code versions were not recorded.",
        "A great notebook model that never reaches production.",
        "Predictions served from stale features.",
      ],
    },
    sampleKey: "ml",
  },
  {
    id: "observability",
    level: "advanced",
    category: "quality",
    label: "Observability / Monitoring",
    shortLabel: "Observe",
    icon: "Activity",
    position: { x: 620, y: 0 },
    details: {
      summary: "Watches pipelines and data health so problems are found before users find them.",
      whatHappens:
        "Observability goes beyond pass/fail tests. It continuously monitors the freshness, volume and shape of your data, the health of your jobs and the lineage between tables. When something looks unusual it alerts the owner and shows which downstream dashboards are affected.",
      howItHappens: [
        "Collectors gather metrics from pipelines, infrastructure and the warehouse (run time, rows, last update).",
        "Lineage events (OpenLineage) connect each job to the datasets it reads and writes.",
        "Anomaly detection learns what 'normal' looks like for each table.",
        "Alerts are routed to the right owner, with the failing table and its blast radius.",
        "Incidents are tracked until resolved, so patterns can be fixed permanently.",
      ],
      whyImportant:
        "Data pipelines fail silently: the job succeeds but loads half the rows. Without monitoring, the first alert is a confused executive. Observability reduces the time to detect and fix issues from days to minutes.",
      tools: [
        { name: "Monte Carlo", type: "Data observability", note: "Automated anomaly detection for freshness, volume and schema" },
        { name: "Datadog", type: "Infrastructure monitoring", note: "Metrics, logs and alerts for pipelines and servers" },
        { name: "Prometheus + Grafana", type: "Open-source monitoring", note: "Time-series metrics and dashboards" },
        { name: "OpenLineage", type: "Lineage standard", note: "Open standard for collecting job and dataset lineage" },
      ],
      commonProblems: [
        "Alert fatigue from noisy, untuned thresholds.",
        "Monitoring only the jobs and not the data they produce.",
        "No clear owner for an alert, so it is ignored.",
        "Missing lineage, so nobody knows who is affected by an incident.",
      ],
    },
    sampleKey: "observability",
  },
  {
    id: "governance",
    level: "advanced",
    category: "governance",
    label: "Governance & Security",
    shortLabel: "Governance",
    icon: "Lock",
    position: { x: 1550, y: 0 },
    details: {
      summary: "Controls who can see which data, and proves the rules are followed.",
      whatHappens:
        "Governance defines and enforces the rules for data: who may access what, how sensitive fields are masked, how long data is kept and how access is audited. Policies are applied centrally so they hold everywhere the data is used: in the lake, the warehouse and BI tools.",
      howItHappens: [
        "Sensitive columns (emails, phone numbers) are tagged as PII in the catalog.",
        "Roles (RBAC) define which groups can read which tables, columns or rows.",
        "Policies mask or hash tagged columns at query time for users without clearance.",
        "Every access is written to an audit log.",
        "Retention and deletion rules handle legal requests such as 'delete my data'.",
      ],
      whyImportant:
        "A leak of customer data means legal penalties and lost trust. Regulations such as GDPR and India's DPDP Act require demonstrable control. Good governance also enables sharing: people can safely access more data when sensitive parts are protected automatically.",
      tools: [
        { name: "Apache Ranger", type: "Access policies", note: "Central policy management for Hadoop and lake engines" },
        { name: "AWS Lake Formation", type: "Lake permissions", note: "Table, column and row-level access on AWS" },
        { name: "Column masking / row-level security", type: "Warehouse feature", note: "Built into Snowflake, BigQuery and Redshift" },
        { name: "RBAC", type: "Access model", note: "Grant permissions to roles rather than to individuals" },
      ],
      commonProblems: [
        "Over-broad access granted 'just for now' and never removed.",
        "PII copied into side tables that bypass the masking rules.",
        "Policies configured separately in each tool and drifting apart.",
        "Security so strict that people export data to spreadsheets instead.",
      ],
    },
    sampleKey: "governance",
  },
  {
    id: "reverse_etl",
    level: "advanced",
    category: "serving",
    label: "Reverse ETL",
    shortLabel: "Reverse ETL",
    icon: "ArrowUpFromLine",
    position: { x: 620, y: 680 },
    details: {
      summary: "Pushes warehouse insights back into the tools business teams use every day.",
      whatHappens:
        "The warehouse holds the best view of each customer, but sales and marketing live in Salesforce, HubSpot and ad platforms. Reverse ETL reads modeled tables from the warehouse and syncs them into those tools, so churn risk or customer segment shows up right where people work.",
      howItHappens: [
        "A data team defines a model in the warehouse, such as 'customers with churn risk'.",
        "The reverse ETL tool maps its columns to fields in the destination (for example a CRM property).",
        "It detects only changed rows since the last sync.",
        "It calls the destination API in batches, handling rate limits and retries.",
        "Sync logs show which records succeeded or failed.",
      ],
      whyImportant:
        "Insights only create value when they trigger action. Instead of exporting CSVs by hand, teams get automatically updated customer data in their own tools: a rep sees 'low churn risk' on the account page, and marketing can build audiences from fresh segments.",
      tools: [
        { name: "Hightouch", type: "Reverse ETL", note: "SQL or model-based syncs to hundreds of destinations" },
        { name: "Census", type: "Reverse ETL", note: "Syncs warehouse data to CRM, ads and support tools" },
        { name: "Custom API jobs", type: "Code", note: "Direct scripts when only one destination is needed" },
      ],
      commonProblems: [
        "Destination API rate limits that make large syncs slow or fail.",
        "Mismatched identifiers, so records are not matched to the right contact.",
        "Overwriting data that sales reps edited manually.",
        "Syncing sensitive columns that the destination tool should never receive.",
      ],
    },
    sampleKey: "reverse_etl",
  },
];

// The path the "Play data flow" packet follows at each level (node ids, in order).
export const playPaths = {
  basic: ["source", "ingestion", "raw_storage", "processing", "warehouse", "bi"],
  medium: [
    "source",
    "ingestion",
    "raw_storage",
    "quality",
    "medallion",
    "processing",
    "warehouse",
    "dbt",
    "bi",
  ],
  advanced: [
    "source",
    "ingestion",
    "raw_storage",
    "quality",
    "medallion",
    "lakehouse",
    "processing",
    "warehouse",
    "dbt",
    "feature_store",
    "ml",
    "bi",
  ],
};
