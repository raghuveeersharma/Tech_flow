// One example order event, with a before/after state for every pipeline stage.
// The viewer diffs `input` against `output` (top level keys) and highlights:
//   green = added, yellow = modified, red strike = removed.
// `note` explains the change in plain language.

// ---- the record as it moves downstream (kept as constants so stages stay consistent) ----
const rawEvent = {
  order_id: "A1001",
  user: "rahul@mail.com",
  amount: "1,499",
  ts: "06/11/2026 10:32",
  city: "indore",
  coupon: null,
};

const ingested = {
  ...rawEvent,
  _ingested_at: "2026-11-06T05:03:11Z",
  _source: "orders-api",
};

const landedRaw = {
  ...ingested,
  _raw_path: "s3://acme-raw/orders/dt=2026-11-06/part-0007.json",
};

const validated = {
  ...landedRaw,
  _dq_status: "warn",
  _dq_flags: ["amount_is_string", "city_not_normalized"],
};

const { _raw_path, ...withoutRawPath } = validated;
const bronze = {
  ...withoutRawPath,
  _layer: "bronze",
  _bronze_table: "bronze.orders",
  _batch_id: "2026-11-06-05",
};

const businessInput = {
  order_id: "A1001",
  user: "rahul@mail.com",
  amount: "1,499",
  ts: "06/11/2026 10:32",
  city: "indore",
  coupon: null,
  _ingested_at: "2026-11-06T05:03:11Z",
  _source: "orders-api",
};

const cleaned = {
  order_id: "A1001",
  user: "rahul@mail.com",
  amount: 1499.0,
  ts: "2026-11-06T05:02:00Z",
  city: "Indore",
  coupon: "NONE",
  _ingested_at: "2026-11-06T05:03:11Z",
  _source: "orders-api",
};

const loaded = {
  ...cleaned,
  order_date: "2026-11-06",
  _loaded_at: "2026-11-06T05:12:40Z",
};

// Fields that should always render with a decimal point (e.g. 1499 -> 1499.0)
export const floatFields = ["amount", "revenue", "avg_order_value_30d"];

export const sampleData = {
  source: {
    note: "A raw, messy event exactly as the app produced it: the amount is text with a comma, the timestamp is in local day/month/year format, the city is lower case and the coupon is missing.",
    input: null,
    output: rawEvent,
  },

  ingestion: {
    note: "The ingestion tool copies the event unchanged and stamps it with when it arrived and which system it came from. This metadata is what makes later debugging possible.",
    input: rawEvent,
    output: ingested,
  },

  raw_storage: {
    note: "The event is written as-is to a date-partitioned file in object storage. Nothing is cleaned, only a pointer to where the raw copy lives is added so it can be replayed later.",
    input: ingested,
    output: landedRaw,
  },

  streaming: {
    note: "On the streaming path the same event is published to a Kafka topic instead of waiting for a batch. The broker assigns it a partition and an offset, which is its permanent address in the log.",
    input: rawEvent,
    output: { ...rawEvent, _topic: "orders.v1", _partition: 3, _offset: 88231 },
  },

  quality: {
    note: "Validation rules run against the record. It passes the hard checks (id present, user present) but gets two warnings: the amount is still a string and the city is not normalized. Warnings are flagged for the next stage to fix.",
    input: landedRaw,
    output: validated,
  },

  medallion: {
    note: "The record lands in the Bronze layer: still raw and untouched, but now registered in a managed table with a layer tag and a batch id. The loose file path is replaced by a proper table reference.",
    input: validated,
    output: bronze,
  },

  processing: {
    note: "This is the cleaning step. The amount is cast from the text '1,499' to the number 1499.0, the timestamp is converted from local time to ISO-8601 UTC (10:32 IST is 05:02 UTC), the city is title-cased and the missing coupon becomes an explicit 'NONE'.",
    input: businessInput,
    output: cleaned,
  },

  warehouse: {
    note: "The clean row is loaded into the analytics table. A derived order_date column is added so analysts can group by day without parsing timestamps, plus a load timestamp for freshness checks.",
    input: cleaned,
    output: loaded,
  },

  dbt: {
    note: "A dbt model joins the order to the customer table and enriches it with business meaning: which customer segment the buyer belongs to, whether this is their first order and which price band the order falls in.",
    input: loaded,
    output: {
      ...loaded,
      user_segment: "Premium",
      is_first_order: false,
      order_value_band: "1000-2000",
    },
  },

  bi: {
    note: "A dashboard never shows single orders. It queries an aggregate: all orders for the day grouped by city. Our order disappears into the row 'Indore, 2026-11-06: 128 orders, 187,392 revenue'.",
    input: {
      order_id: "A1001",
      amount: 1499.0,
      city: "Indore",
      order_date: "2026-11-06",
    },
    output: {
      order_date: "2026-11-06",
      city: "Indore",
      orders: 128,
      revenue: 187392.0,
    },
  },

  orchestration: {
    note: "The orchestrator does not touch the order itself. It tracks the pipeline run that carries it. The daily DAG starts queued, runs its four tasks in order and ends successful.",
    input: {
      dag: "orders_daily",
      run_id: "scheduled__2026-11-06T05:00",
      state: "queued",
      tasks_done: 0,
      tasks_total: 4,
    },
    output: {
      dag: "orders_daily",
      run_id: "scheduled__2026-11-06T05:00",
      state: "success",
      tasks_done: 4,
      tasks_total: 4,
      duration_s: 412,
    },
  },

  catalog: {
    note: "The catalog stores information about the data, not the data itself. After a scan, the silver orders table gets an owner, a description, a PII tag and its lineage in both directions.",
    input: {
      table: "silver.orders",
      owner: null,
      description: null,
      tags: [],
    },
    output: {
      table: "silver.orders",
      owner: "data-platform",
      description: "One row per customer order, cleaned and typed",
      tags: ["pii", "orders"],
      upstream: ["bronze.orders"],
      downstream: ["analytics.daily_revenue"],
    },
  },

  cdc: {
    note: "The order row in the production database changes from PLACED to SHIPPED. CDC reads the database log and emits a change event that carries the before and after values instead of a full copy of the row.",
    input: {
      order_id: "A1001",
      status: "PLACED",
      amount: "1,499",
    },
    output: {
      order_id: "A1001",
      amount: "1,499",
      op: "u",
      status_before: "PLACED",
      status_after: "SHIPPED",
      _lsn: "0/16B3748",
    },
  },

  stream_processing: {
    note: "A streaming job groups events into 5-minute windows as they arrive. Our single order is folded into a running total: Indore had 14 orders and 20,986 in revenue between 05:00 and 05:05 UTC, available seconds after the order happened.",
    input: {
      order_id: "A1001",
      amount: "1,499",
      city: "indore",
      ts: "06/11/2026 10:32",
    },
    output: {
      window_start: "2026-11-06T05:00:00Z",
      window_end: "2026-11-06T05:05:00Z",
      city: "Indore",
      orders: 14,
      revenue: 20986.0,
    },
  },

  lakehouse: {
    note: "The bronze table is now stored in a lakehouse table format (Delta Lake). The record gets a real table address and the write is recorded as table version 42 in the transaction log, which is what gives you ACID guarantees and time travel.",
    input: bronze,
    output: (() => {
      const { _bronze_table, ...rest } = bronze;
      return {
        ...rest,
        _table: "delta://lake/bronze/orders",
        _table_version: 42,
        _txn: "committed",
      };
    })(),
  },

  feature_store: {
    note: "The ML team does not want single orders. They want facts about the customer. The feature store turns order history into reusable features keyed by user: how often they buy, how much they spend and how recently they bought.",
    input: {
      order_id: "A1001",
      user: "rahul@mail.com",
      amount: 1499.0,
      ts: "2026-11-06T05:02:00Z",
    },
    output: {
      user: "rahul@mail.com",
      orders_30d: 6,
      avg_order_value_30d: 1320.5,
      days_since_last_order: 4,
      feature_ts: "2026-11-06T05:02:00Z",
    },
  },

  ml: {
    note: "A trained churn model reads the customer's features and returns a prediction. A churn score of 0.12 means a low chance this customer will stop buying. The model version is recorded so every prediction can be traced.",
    input: {
      user: "rahul@mail.com",
      orders_30d: 6,
      avg_order_value_30d: 1320.5,
      days_since_last_order: 4,
    },
    output: {
      user: "rahul@mail.com",
      orders_30d: 6,
      avg_order_value_30d: 1320.5,
      days_since_last_order: 4,
      churn_score: 0.12,
      model_version: "churn-v7",
    },
  },

  observability: {
    note: "Monitoring watches the table that holds our order. It checks freshness (loaded 4 minutes ago), volume (4,821 rows is inside the expected range) and schema (no column changed). All green, so no alert is sent.",
    input: {
      table: "analytics.orders",
      last_loaded_at: "2026-11-06T05:12:40Z",
      rows_loaded: 4821,
      expected_rows: "4500-5500",
    },
    output: {
      table: "analytics.orders",
      last_loaded_at: "2026-11-06T05:12:40Z",
      rows_loaded: 4821,
      expected_rows: "4500-5500",
      freshness_min: 4,
      volume_check: "ok",
      schema_check: "ok",
      alert: null,
    },
  },

  governance: {
    note: "A data analyst without PII clearance queries the order. The governance layer applies a column masking policy at read time, so the email is partly hidden. The stored data is unchanged; only what this role can see changes.",
    input: {
      order_id: "A1001",
      user: "rahul@mail.com",
      amount: 1499.0,
      city: "Indore",
    },
    output: {
      order_id: "A1001",
      user: "r****@mail.com",
      amount: 1499.0,
      city: "Indore",
      _policy: "mask_email_for_analysts",
    },
  },

  reverse_etl: {
    note: "The insight goes back into the tools business teams use. The numeric churn score is translated into a simple label, matched to the customer's CRM contact and synced to Salesforce so a sales rep sees 'Low risk' on the customer page.",
    input: {
      user: "rahul@mail.com",
      user_segment: "Premium",
      churn_score: 0.12,
    },
    output: {
      user: "rahul@mail.com",
      user_segment: "Premium",
      churn_risk: "Low",
      crm_contact_id: "003Dn00000A1b2C",
      _synced_to: "Salesforce",
    },
  },
};
