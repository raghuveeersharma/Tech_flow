// Node schema:
// {
//   id, level, category, label, shortLabel, icon,
//   position,                // layout used at the first level the node appears
//   positionByLevel?,        // optional overrides: { medium: {x,y}, advanced: {x,y} } (falls back to the previous level)
//   details: { summary, whatHappens, howItHappens[], whyImportant, tools[{name,type,note}], commonProblems[] },
//   sampleKey
// }
// `level` is the FIRST level at which the node appears (levels are cumulative).
//
// Layout: BASIC is one row (row 1, cols 0-5). MEDIUM and ADVANCED share one 2D layout (cols 0-4, rows 0-4):
//   row 0: semantic layer
//   row 1: question -> KPIs -> extract -> clean -> explore
//   row 2: decision <- story <- insight <- analyze <- segments   (the flow turns down at "explore")
//   row 3: automation, alerts, dashboard, A/B test, root cause
//   row 4: forecast, experiments platform
import { g } from "../../grid";

export const nodes = [
  // =====================================================================
  // BASIC
  // =====================================================================
  {
    id: "business_question",
    level: "basic",
    category: "framing",
    label: "Business Question",
    shortLabel: "Question",
    icon: "CircleHelp",
    position: g(0, 1),
    details: {
      summary: "Turns a vague request from a stakeholder into a precise, answerable question.",
      whatHappens:
        "Every analysis starts with a person, not a dataset. A manager asks something like 'Why did revenue drop in Indore?' and the analyst's first job is to make that question precise: which revenue, which weeks, compared with what, and what will the answer be used for? Ten minutes of clarifying up front saves days of analysing the wrong thing.",
      howItHappens: [
        "Listen to the request and write it down in the stakeholder's own words.",
        "Ask what decision the answer will support, such as fixing a problem or pausing ad spend.",
        "Pin down the metric, the time window and the comparison, for example revenue in ISO week 44 versus week 43.",
        "Check whether the data needed to answer it exists and who owns it.",
        "Write a short brief and get the requester to confirm it before any querying starts.",
      ],
      whyImportant:
        "A vague question produces a confident answer to the wrong problem. Agreeing on scope and on the decision up front is the cheapest quality check an analyst has, and it prevents the 'that is not what I meant' conversation at the end.",
      tools: [
        { name: "Analysis brief template", type: "Document", note: "One page listing the question, metric, time window, decision and owner" },
        { name: "Jira / Asana", type: "Request tracking", note: "Keeps data requests visible, prioritised and linked to the outcome" },
        { name: "Notion / Confluence", type: "Documentation", note: "Stores briefs so the same question is not investigated twice" },
        { name: "Metric (driver) trees", type: "Technique", note: "Splits revenue into orders x average order value to show where to look first" },
        { name: "The 5 Whys", type: "Technique", note: "Keeps asking why until the real problem behind the request appears" },
      ],
      commonProblems: [
        "Starting to query before the question is clear, then redoing the work when the stakeholder says it is not what they meant.",
        "Questions with no decision attached, so the analysis is interesting but changes nothing.",
        "Hidden assumptions, such as two teams meaning different things by 'revenue' or 'last week'.",
        "Scope creep: the one-off question grows into five extra requests halfway through.",
      ],
    },
    sampleKey: "business_question",
  },
  {
    id: "data_extraction",
    level: "basic",
    category: "data",
    label: "Data Extraction (SQL)",
    shortLabel: "Extract",
    icon: "Terminal",
    position: g(1, 1),
    positionByLevel: { medium: g(2, 1) },
    details: {
      summary: "Pulls exactly the rows and columns the question needs from the company's data systems.",
      whatHappens:
        "The analyst finds where the data lives, usually a cloud data warehouse, and writes a SQL query to pull only what is needed. SQL (Structured Query Language) is the standard language for asking databases questions. For our question the query selects Indore orders for ISO weeks 43 and 44 with the order id, platform, status and amount. Pulling a focused slice keeps queries fast and cheap.",
      howItHappens: [
        "Find the right table through the data catalog or by asking the data team, and read its documentation.",
        "Write a SELECT with only the columns needed, a WHERE filter on city and dates, and a LIMIT while testing.",
        "Join to other tables only when needed, for example a sessions table for traffic.",
        "Check the row count and a few sample rows against what you expect before going further.",
        "Save the query in version control or a notebook so the extract can be rerun next week.",
      ],
      whyImportant:
        "Everything later rests on this pull. A wrong filter or an accidental duplicate in a join silently changes every number downstream. Writing the query clearly and checking its row count is the analyst's first line of defence.",
      tools: [
        { name: "SQL", type: "Query language", note: "The core skill: SELECT, WHERE, JOIN and GROUP BY against warehouse tables" },
        { name: "Google BigQuery", type: "Cloud data warehouse", note: "Serverless warehouse where analysts run SQL directly on large tables" },
        { name: "Snowflake", type: "Cloud data warehouse", note: "Popular warehouse with worksheets for writing and sharing queries" },
        { name: "DBeaver", type: "SQL client", note: "Free desktop tool for saving and running queries on many database types" },
        { name: "Mode", type: "SQL editor + notebooks", note: "Runs a query and passes the result to Python or a chart in one place" },
      ],
      commonProblems: [
        "Fan-out joins: joining on a column that is not unique multiplies rows and inflates revenue.",
        "Filtering on a text city name that has several spellings, so some rows are silently missed.",
        "Forgetting that timestamps are stored in UTC, which cuts days and weeks at the wrong time.",
        "SELECT * on a huge table, which is slow and can cost real money in pay-per-query warehouses.",
      ],
    },
    sampleKey: "data_extraction",
  },
  {
    id: "data_cleaning",
    level: "basic",
    category: "data",
    label: "Cleaning & Preparation",
    shortLabel: "Clean",
    icon: "Eraser",
    position: g(2, 1),
    positionByLevel: { medium: g(3, 1) },
    details: {
      summary: "Fixes duplicates, wrong types, spelling variants and gaps so the numbers can be trusted.",
      whatHappens:
        "Raw extracts are rarely ready to analyse. Cleaning removes duplicate rows and test records, converts text such as '₹1,550' into real numbers, makes city and platform spellings consistent and decides what to do with missing values. It is often the biggest share of a project's time, and every rule should be written down so someone else can repeat it.",
      howItHappens: [
        "Profile the data: row counts, data types, nulls per column, and the minimum and maximum of every number.",
        "Remove exact duplicates and obvious test or internal orders.",
        "Fix types and formats, for example turn the text '1,550' into the number 1550 and standardise city names.",
        "Handle missing values deliberately by filling them from another table, flagging them or dropping the rows, and note which you chose.",
        "Re-check the row count and totals, and keep a log of how many rows each rule removed.",
      ],
      whyImportant:
        "Cleaning decisions change the answer: dropping the wrong rows can hide the very problem you are looking for. Recording how many rows each rule removes makes the work auditable and builds the stakeholder's trust in the final number.",
      tools: [
        { name: "pandas", type: "Python library", note: "drop_duplicates, to_numeric and string methods clean tables of any size that fits in memory" },
        { name: "OpenRefine", type: "Data cleaning tool", note: "Clusters near-identical spellings such as indore, Indore and INDORE for one-click fixes" },
        { name: "Excel Power Query", type: "Spreadsheet ETL", note: "Records every cleaning step so the same steps can be refreshed with new data" },
        { name: "SQL (COALESCE, ROW_NUMBER)", type: "Query technique", note: "Fills gaps and keeps one row per order directly in the warehouse" },
      ],
      commonProblems: [
        "Dropping rows with nulls without checking: you may be deleting exactly the customers that matter.",
        "Cleaning steps done by hand in a spreadsheet that nobody can reproduce next week.",
        "Treating outliers as errors when they are real, such as a legitimate bulk order.",
        "Near-duplicates with different timestamps that survive a simple drop_duplicates() call.",
      ],
    },
    sampleKey: "data_cleaning",
  },
  {
    id: "exploration",
    level: "basic",
    category: "analysis",
    label: "Exploratory Analysis",
    shortLabel: "Explore",
    icon: "ScanSearch",
    position: g(3, 1),
    positionByLevel: { medium: g(4, 1) },
    details: {
      summary: "Looks at the data from many angles to spot patterns, oddities and hypotheses worth testing.",
      whatHappens:
        "Before running formal tests, the analyst gets a feel for the data. Exploratory data analysis (EDA) means summary statistics, quick charts and simple comparisons. Here it shows that weekly orders fell 20% while the average order value stayed at ₹155, and that the drop began on Tuesday 27 October. That narrows 'revenue is down' to 'orders fell from a specific date'.",
      howItHappens: [
        "Compute summary statistics: counts, averages, medians, minimums and maximums for each column.",
        "Plot distributions and trends over time, such as orders per day, to see when a change started.",
        "Break the headline number into parts, for example revenue = orders x average order value.",
        "Compare with other cities and earlier weeks to rule out seasonality or a company-wide issue.",
        "Write down hypotheses, ranked by how likely they are and how cheap they are to check.",
      ],
      whyImportant:
        "Exploration stops you from testing the wrong idea. It reveals data problems missed during cleaning and points to where the real signal is, which saves hours of fruitless work later. It is also where most good follow-up questions come from.",
      tools: [
        { name: "Jupyter Notebook", type: "Interactive notebook", note: "Mixes code, charts and notes so the exploration can be replayed and shared" },
        { name: "pandas", type: "Python library", note: "describe(), groupby() and resample() give quick summaries by group and by day" },
        { name: "seaborn / matplotlib", type: "Plotting libraries", note: "Histograms, box plots and line charts in a few lines of code" },
        { name: "Excel / Google Sheets pivot tables", type: "Spreadsheet", note: "Drag-and-drop summaries for quick looks without writing code" },
        { name: "ydata-profiling", type: "Automated EDA", note: "Generates a full report of distributions, missing values and correlations" },
      ],
      commonProblems: [
        "Seeing patterns in noise: with enough charts something always looks interesting by chance.",
        "Confirmation bias: only checking the cut that supports the stakeholder's favourite theory.",
        "Mixing up correlation and cause, for example blaming the weather because both moved.",
        "Averages that hide the story when a median or a full distribution would show skew and outliers.",
      ],
    },
    sampleKey: "exploration",
  },
  {
    id: "analysis",
    level: "basic",
    category: "analysis",
    label: "Analysis & Metrics",
    shortLabel: "Analyze",
    icon: "Sigma",
    position: g(4, 1),
    positionByLevel: { medium: g(3, 2) },
    details: {
      summary: "Quantifies what changed, by how much and how sure we can be.",
      whatHappens:
        "Where exploration suggests ideas, analysis puts numbers and tests on them. The analyst computes the exact change (revenue down ₹2,48,000, or 20.0%), splits it into effects (all of it from fewer orders, none from smaller baskets), checks that it is bigger than the normal week-to-week swing of about 4%, and attributes it to a platform. The output is a small set of defensible figures that anyone can recompute.",
      howItHappens: [
        "Calculate the headline change in absolute and percentage terms against the comparison week.",
        "Decompose it: revenue = orders x average order value, so the volume effect is the change in orders times the old average order value.",
        "Compare the change with normal variation, for example the typical weekly swing over the last six months.",
        "Attribute the change to groups by computing each group's share of the total difference.",
        "Run a significance test or build a confidence interval where a sample is involved, and write down the assumptions.",
      ],
      whyImportant:
        "Stakeholders act on numbers, so the numbers must hold up. Separating a real change from ordinary noise stops the team reacting to random swings, and the decomposition tells them whether to look at volume or at price.",
      tools: [
        { name: "SQL aggregates and window functions", type: "Query technique", note: "Weekly totals, week-over-week change and shares of total calculated in the warehouse" },
        { name: "pandas and NumPy", type: "Python libraries", note: "Pivot tables, percentage change and decomposition for medium-sized data" },
        { name: "SciPy", type: "Statistics library", note: "t-tests, chi-square tests and confidence intervals" },
        { name: "statsmodels", type: "Statistics library", note: "Regression and tests with full summary tables for reporting" },
        { name: "Excel / Google Sheets", type: "Spreadsheet", note: "Pivot tables and formulas that stakeholders can inspect themselves" },
      ],
      commonProblems: [
        "Comparing weeks that are not comparable, such as a week with a public holiday against a normal one.",
        "Reporting a percentage without its base: a 50% fall of 10 orders is not the same as 50% of 10,000.",
        "Treating 'statistically significant' as 'important': a tiny change can be significant yet not matter.",
        "Double counting when a join duplicates orders, which makes a total larger than the real figure.",
      ],
    },
    sampleKey: "analysis",
  },
  {
    id: "visualization",
    level: "basic",
    category: "communication",
    label: "Visualization & Insight",
    shortLabel: "Insight",
    icon: "BarChart3",
    position: g(5, 1),
    positionByLevel: { medium: g(2, 2) },
    details: {
      summary: "Turns the result into a clear chart and one sentence that says what it means.",
      whatHappens:
        "A good chart answers one question at a glance. The analyst picks the chart type that fits the message, here a line chart of daily orders by platform, removes clutter, highlights Android and marks the day app version 5.2 was released. The insight is not the chart but the sentence above it: 'All of the ₹2.48 lakh weekly drop comes from Android orders.'",
      howItHappens: [
        "Decide the single message the chart must carry before opening any tool.",
        "Choose a fitting chart: lines for trends over time, bars for comparisons, tables for exact lookups.",
        "Remove clutter and use colour sparingly: grey for context and one strong colour for the point.",
        "Add an annotation for the event that explains the change, here the 27 October release.",
        "Write a title that states the conclusion, and check that the axes and units are honest.",
      ],
      whyImportant:
        "People rarely read a table of numbers, but they remember a clear chart with one highlighted line. Clear visuals make an insight easy to understand and to repeat in the next meeting, while misleading ones such as truncated axes destroy trust quickly.",
      tools: [
        { name: "Tableau", type: "BI / visualization", note: "Drag-and-drop charts with strong annotation and formatting control" },
        { name: "Power BI", type: "BI / visualization", note: "Common in Microsoft shops, with tight Excel and Teams integration" },
        { name: "Looker Studio", type: "BI / visualization", note: "Free, browser-based charts that connect to BigQuery and Google Sheets" },
        { name: "Excel / Google Sheets charts", type: "Spreadsheet", note: "Fast charts for small data that anyone on the team can edit" },
        { name: "Plotly / matplotlib", type: "Python libraries", note: "Code-based charts that are reproducible and easy to parameterise" },
      ],
      commonProblems: [
        "Pie charts with many slices or 3D effects that make values hard to compare.",
        "Truncated or dual axes that exaggerate a change and mislead the reader.",
        "Charts with no conclusion in the title and no annotation, leaving viewers to guess what to notice.",
        "Too many colours, so that nothing stands out.",
      ],
    },
    sampleKey: "visualization",
  },

  // =====================================================================
  // MEDIUM
  // =====================================================================
  {
    id: "kpi_definitions",
    level: "medium",
    category: "framing",
    label: "KPI & Metric Definitions",
    shortLabel: "KPIs",
    icon: "Target",
    position: g(1, 1),
    details: {
      summary: "Agrees on one exact, written definition for every number used in the analysis.",
      whatHappens:
        "A metric like 'revenue' sounds obvious until two reports disagree. This step writes down exactly how each number is calculated: what is counted, what is excluded, which time zone and which week boundaries. A KPI (key performance indicator) is a number the business uses to judge how it is doing. Here the analyst fixes 'net revenue' as the sum of delivered order amounts, Monday to Sunday in IST.",
      howItHappens: [
        "List the metrics the question needs (revenue, orders, average order value) and the dimensions to slice them by (city, platform, week).",
        "Write each formula in plain language and then as SQL, including filters such as status = 'delivered'.",
        "Decide the edge cases: refunds, cancelled orders, test orders, taxes, currency and the first day of the week.",
        "Name an owner, usually finance or the product team, who signs off on the definition.",
        "Store it in a shared metric dictionary so every dashboard and query uses the same wording.",
      ],
      whyImportant:
        "If each analyst defines revenue differently, meetings turn into arguments about whose number is right instead of what to do. A written definition makes results reproducible and lets a new colleague get the same answer you did.",
      tools: [
        { name: "Notion / Confluence glossary", type: "Documentation", note: "A simple shared page listing every KPI, its formula and its owner" },
        { name: "Excel / Google Sheets", type: "Spreadsheet", note: "Prototype a formula on a small sample to sanity-check it before coding it" },
        { name: "Atlan / DataHub", type: "Data catalog", note: "Attach business definitions and owners to the tables and columns that hold the data" },
        { name: "dbt model docs", type: "Documentation as code", note: "Column and model descriptions live in YAML files next to the SQL" },
      ],
      commonProblems: [
        "Two dashboards use different filters (with and without refunds), so the same metric shows two values.",
        "Definitions kept only in someone's head or an old email thread, so they drift and get lost.",
        "Week boundaries and time zones ignored, so orders near midnight or on Sunday land in the wrong week.",
        "Redefining a metric mid-quarter without a version note, which silently breaks trend lines.",
      ],
    },
    sampleKey: "kpi_definitions",
  },
  {
    id: "segmentation",
    level: "medium",
    category: "analysis",
    label: "Segmentation & Cohorts",
    shortLabel: "Segments",
    icon: "Split",
    position: g(4, 2),
    details: {
      summary: "Splits customers and orders into meaningful groups to find where a number really changes.",
      whatHappens:
        "An overall number can hide very different stories underneath. Segmentation splits the data into groups such as platform, app version or new versus returning customers, and compares them. A cohort is a group of customers who share a starting point, like everyone who installed the app in the same week. Here iOS and web are flat, while Android users on app version 5.2 turn 2.0% of sessions into orders against 10.0% on version 5.1.",
      howItHappens: [
        "Choose dimensions that could plausibly matter: platform, app version, acquisition channel, new versus returning, neighbourhood.",
        "Group the data by each dimension and compute the same metric for every group.",
        "Compare groups across the two weeks and look for one group that moved far more than the rest.",
        "Check group sizes, so a tiny segment is not mistaken for a trend.",
        "Define cohorts, for example by install week, and follow them over time with a retention table.",
      ],
      whyImportant:
        "Averages mix winners and losers, so one broken segment can look like a small overall dip or cancel out against a growing one. Segmentation is the fastest route from 'revenue is down' to 'these particular users have a problem', which is where action becomes possible.",
      tools: [
        { name: "SQL (GROUP BY, CASE WHEN)", type: "Query technique", note: "Builds segment tables directly in the warehouse with one metric per group" },
        { name: "pandas", type: "Python library", note: "groupby() and pivot_table() compare many segments at once" },
        { name: "Amplitude", type: "Product analytics", note: "Point-and-click cohorts, funnels and retention curves on event data" },
        { name: "Mixpanel", type: "Product analytics", note: "Segment users by behaviour and properties without writing SQL" },
      ],
      commonProblems: [
        "Slicing so many ways that some segment looks special by chance (the multiple comparisons problem).",
        "Segments so small that a handful of orders swings the percentage.",
        "Simpson's paradox: a trend that appears in every group reverses once the groups are combined, because group sizes differ.",
        "Defining segments after seeing the result, which makes the finding look stronger than it is.",
      ],
    },
    sampleKey: "segmentation",
  },
  {
    id: "ab_testing",
    level: "medium",
    category: "experiment",
    label: "A/B Testing",
    shortLabel: "A/B Test",
    icon: "GitCompare",
    position: g(3, 3),
    details: {
      summary: "Tests a proposed change on a random half of users to prove whether it really works.",
      whatHappens:
        "Analysis explains the past; an A/B test tells you whether a fix will work. Users are randomly split into a control group (no change) and a variant group (the change). Here the variant gets app version 5.2.1 with a repaired UPI (India's instant bank payment system) checkout. Because assignment is random, a difference in conversion is very likely caused by the change and not by who happened to be in each group.",
      howItHappens: [
        "Write the hypothesis and pick one primary metric, here checkout conversion, plus guardrail metrics such as crash rate.",
        "Calculate the sample size needed from the baseline rate and the smallest effect worth detecting.",
        "Randomly assign users to control or variant and keep each user in the same group for the whole test.",
        "Run for the planned time without peeking and stopping early because the numbers look good.",
        "Compare the groups with a significance test, report the lift with a confidence interval and recommend ship, stop or iterate.",
      ],
      whyImportant:
        "Without a test, a team ships a fix and takes credit for whatever happens next, even if traffic changed for another reason. A proper experiment gives a clean, defensible estimate of the real impact before the change reaches everyone.",
      tools: [
        { name: "Statsig", type: "Experimentation platform", note: "Assignment, metrics and significance calculations in one product" },
        { name: "Optimizely", type: "Experimentation platform", note: "Long-established tool for web and app experiments" },
        { name: "GrowthBook", type: "Open-source experimentation", note: "Reads results straight from your warehouse and can be self-hosted" },
        { name: "VWO", type: "Experimentation platform", note: "Visual editor for website tests aimed at marketing teams" },
        { name: "statsmodels (proportions_ztest)", type: "Python library", note: "Compare two conversion rates and get a p-value in code" },
      ],
      commonProblems: [
        "Peeking: checking results daily and stopping the moment p drops below 0.05 inflates false positives.",
        "A sample too small to detect a real improvement (an underpowered test).",
        "Sample ratio mismatch: the 50/50 split is not really 50/50, a sign the assignment is broken.",
        "Running several tests on the same users, so their effects get mixed up.",
      ],
    },
    sampleKey: "ab_testing",
  },
  {
    id: "dashboard_automation",
    level: "medium",
    category: "communication",
    label: "Dashboard Automation",
    shortLabel: "Dashboard",
    icon: "LayoutDashboard",
    position: g(2, 3),
    details: {
      summary: "Replaces repeated manual reports with a dashboard that refreshes itself from trusted data.",
      whatHappens:
        "If a question gets asked every week, answering it by hand every week is wasteful. The analyst builds a dashboard connected directly to a modelled table, so the charts update on a schedule and anyone can filter by city, platform or app version. Refresh, access and sharing are automated, which leaves the analyst free to investigate new questions.",
      howItHappens: [
        "Connect the BI tool to a clean, modelled table instead of a raw export.",
        "Build the key charts and add filters for city, platform, app version and date range.",
        "Schedule the data refresh, for example daily at 06:00 IST, and show a 'last updated' time on the page.",
        "Set permissions so each team sees only the data it should.",
        "Add email or Slack subscriptions and review which charts are actually used after a month.",
      ],
      whyImportant:
        "Automated dashboards turn a one-off analysis into a lasting asset. The manager can answer follow-up questions without waiting for the analyst, and everyone looks at the same numbers. Manual reports break whenever the person who builds them is away.",
      tools: [
        { name: "Looker Studio", type: "BI tool", note: "Free dashboards with scheduled email delivery and a BigQuery connector" },
        { name: "Power BI", type: "BI tool", note: "Scheduled refresh and row-level security for large organisations" },
        { name: "Tableau", type: "BI tool", note: "Interactive dashboards published to a server with extract refresh schedules" },
        { name: "Metabase", type: "Open-source BI", note: "Simple dashboards, filters and Slack subscriptions for non-technical users" },
        { name: "Mode", type: "BI + SQL", note: "Reports built from SQL and Python that refresh on a schedule" },
      ],
      commonProblems: [
        "Dashboard sprawl: dozens of near-duplicate dashboards and nobody knows which one is right.",
        "Slow dashboards that query huge raw tables, so people stop using them.",
        "A refresh that fails silently, leaving people to decide on out-of-date numbers.",
        "Too many charts: a screen with 25 widgets answers no question clearly.",
      ],
    },
    sampleKey: "dashboard_automation",
  },
  {
    id: "storytelling",
    level: "medium",
    category: "communication",
    label: "Data Storytelling",
    shortLabel: "Story",
    icon: "Presentation",
    position: g(1, 2),
    details: {
      summary: "Wraps the findings in a short narrative that ends with a clear recommendation.",
      whatHappens:
        "Charts alone do not persuade; people need context, a point and a next step. Data storytelling arranges the findings as a simple narrative: what we expected, what actually happened, why it matters and what to do about it. For our question it becomes a short readout whose title is an action: 'Fix the Android checkout bug to win back ₹2.48 lakh a week.'",
      howItHappens: [
        "Identify the audience and what they must decide, then start with the answer.",
        "Outline the story: context, the finding, the evidence, the impact in money and the recommendation.",
        "Use one chart per slide, each with a headline that states its conclusion.",
        "Quantify the impact in business terms such as revenue per week, not only percentages.",
        "End with a specific ask, an owner and a date, and prepare backup slides for likely questions.",
      ],
      whyImportant:
        "Many correct analyses are ignored because they arrive as a pile of charts. A clear narrative makes the finding memorable and the ask hard to misunderstand, which is how analysis actually changes decisions.",
      tools: [
        { name: "Google Slides / PowerPoint", type: "Presentation", note: "The standard format for a readout to managers and executives" },
        { name: "Tableau Story Points", type: "BI storytelling", note: "Sequences of dashboards with captions that walk a viewer through a finding" },
        { name: "Quarto", type: "Reproducible reports", note: "Turns notebooks into slides or documents that update when the data does" },
        { name: "Flourish", type: "Interactive charts", note: "Animated, shareable charts and scrollable stories for non-technical readers" },
        { name: "Notion / Google Docs", type: "Written memo", note: "A one-page summary people can read before the meeting" },
      ],
      commonProblems: [
        "Burying the answer on slide 20; executives stop reading before they reach it.",
        "Walking through the analyst's journey instead of the audience's decision.",
        "Jargon such as 'p-value' or 'confidence interval' with no plain-language translation.",
        "Ending without a clear ask, owner or deadline, so nothing happens.",
      ],
    },
    sampleKey: "storytelling",
  },
  {
    id: "decision_review",
    level: "medium",
    category: "decision",
    label: "Stakeholder Review & Decision",
    shortLabel: "Decision",
    icon: "Handshake",
    position: g(0, 2),
    details: {
      summary: "Presents the findings, records the decision and tracks whether it worked.",
      whatHappens:
        "Analysis only matters once someone acts on it. In a review meeting the analyst presents the recommendation, answers challenges and leaves with a recorded decision: what will be done, who owns it, by when and how success will be measured. A follow-up date is booked so the result is checked, which closes the loop between analysis and outcome.",
      howItHappens: [
        "Share the story and a one-page summary before the meeting so people can come prepared.",
        "Walk through the recommendation, assumptions and risks, and answer challenges with evidence.",
        "Record the decision, the owner, the deadline and the success metric in a decision log.",
        "Agree what result would show that the decision worked or failed.",
        "Schedule a follow-up and compare the actual outcome with the prediction.",
      ],
      whyImportant:
        "Without follow-up, analytics is a cost with no visible return. A decision log shows which analyses led to which actions and results, helps people learn from misses and builds the credibility that gets analysts invited to the next discussion.",
      tools: [
        { name: "Decision log (Notion / Confluence)", type: "Documentation", note: "One table of decisions with owner, date, success metric and outcome" },
        { name: "Jira", type: "Task tracker", note: "Turns the decision into tickets with owners and due dates" },
        { name: "Linear", type: "Task tracker", note: "Lightweight tracking for product and engineering follow-ups" },
        { name: "Slack", type: "Messaging", note: "Posts the summary and the decision where the whole team can see it" },
        { name: "Metabase", type: "BI tool", note: "A small outcome dashboard to check the success metric after the review date" },
      ],
      commonProblems: [
        "Decisions made verbally and never written down, so nobody remembers what was agreed.",
        "No success metric, so months later nobody can say whether it worked.",
        "The analyst is dropped after the readout and never learns the outcome.",
        "The decision goes to the loudest voice in the room instead of the evidence.",
      ],
    },
    sampleKey: "decision_review",
  },

  // =====================================================================
  // ADVANCED
  // =====================================================================
  {
    id: "semantic_layer",
    level: "advanced",
    category: "data",
    label: "Semantic Layer (Self-Serve Metrics)",
    shortLabel: "Semantic",
    icon: "Library",
    position: g(2, 0),
    details: {
      summary: "Defines each metric once in code so every tool and every person gets the same answer.",
      whatHappens:
        "A semantic layer sits between the warehouse and every tool that reads it. It stores business definitions, such as 'net revenue is the sum of delivered order amounts', plus the dimensions each metric can be sliced by. A dashboard, a notebook or an AI assistant asks for 'net_revenue_inr by city and week' and the layer writes the correct SQL. That is what makes self-serve analytics safe.",
      howItHappens: [
        "Model the core tables as semantic models with entities (order, customer) and dimensions (city, platform, week).",
        "Define each metric in code (YAML or LookML) with its formula, filters and an owner.",
        "Publish through an API or a BI connector so tools ask for a metric by name instead of writing their own SQL.",
        "The layer translates each request into SQL, applies access rules and caches common results.",
        "Review changes in pull requests and version the metrics so a redefinition is visible and reversible.",
      ],
      whyImportant:
        "Without a shared layer, each dashboard recalculates revenue slightly differently and trust erodes. Defining it once means a new chart, a spreadsheet pull and a chat bot all show ₹9,92,000 for week 44, and analysts spend less time answering 'which number is right?'",
      tools: [
        { name: "dbt Semantic Layer (MetricFlow)", type: "Metrics as code", note: "Metrics defined in YAML next to dbt models and served to BI tools through an API" },
        { name: "Cube", type: "Semantic layer / API", note: "Headless layer with caching and pre-aggregations in front of the warehouse" },
        { name: "Looker (LookML)", type: "BI modelling language", note: "Dimensions and measures defined once and reused by every Looker report" },
        { name: "AtScale", type: "Semantic layer", note: "Enterprise layer that presents one metric model to Excel, Tableau and Power BI" },
      ],
      commonProblems: [
        "The layer exists but analysts bypass it with raw SQL, so competing definitions come back.",
        "Modelling every column up front, which makes the layer slow to maintain and hard to trust.",
        "Metric changes shipped without versioning, which silently shifts historical trend lines.",
        "Slow queries because heavy metrics run without caching or pre-aggregation.",
      ],
    },
    sampleKey: "semantic_layer",
  },
  {
    id: "forecasting",
    level: "advanced",
    category: "monitoring",
    label: "Forecasting",
    shortLabel: "Forecast",
    icon: "TrendingUp",
    position: g(2, 4),
    details: {
      summary: "Projects future values and compares scenarios such as 'with the fix' and 'without it'.",
      whatHappens:
        "Forecasting uses past patterns such as trend, weekly seasonality and holidays to estimate what a metric will do next. Here a model trained on two years of weekly revenue projects week 45 at about ₹9.9 lakh if nothing changes and about ₹12.25 lakh if the Android fix ships, using the lift from the A/B test. A forecast always comes with an uncertainty range, because the future is never exact.",
      howItHappens: [
        "Pull a clean time series, for example weekly net revenue for the last two years.",
        "Plot it and identify trend, seasonality (weekly or yearly) and known events such as festivals or outages.",
        "Fit a model such as Prophet or ARIMA and hold back the last few weeks to test how accurate it is.",
        "Build scenarios by adjusting inputs, for example adding the conversion lift measured in the experiment.",
        "Publish the forecast with its uncertainty range and track the forecast error every week.",
      ],
      whyImportant:
        "Teams plan budgets, stock and staffing against forecasts. Showing 'what happens if we do nothing' next to 'what happens if we fix it' turns an analysis into a business case, and tracking forecast error shows how far to trust the next one.",
      tools: [
        { name: "Prophet", type: "Forecasting library", note: "Handles trend, weekly and yearly seasonality and holidays with little tuning" },
        { name: "statsmodels (ARIMA, ETS)", type: "Time-series library", note: "Classic statistical models with confidence intervals" },
        { name: "BigQuery ML (ARIMA_PLUS)", type: "In-warehouse forecasting", note: "Trains and runs a forecast with SQL, right where the data lives" },
        { name: "Excel FORECAST.ETS", type: "Spreadsheet function", note: "Quick seasonal forecast for small series without code" },
      ],
      commonProblems: [
        "Forecasting from too little history, so seasonality such as festivals or month-end cycles is missed.",
        "Not accounting for one-off events like the app bug, which the model may treat as a new normal.",
        "Reporting a single number with no range, which implies false precision.",
        "Never tracking forecast error, so nobody knows whether the model is any good.",
      ],
    },
    sampleKey: "forecasting",
  },
  {
    id: "root_cause",
    level: "advanced",
    category: "analysis",
    label: "Root-Cause (Causal) Analysis",
    shortLabel: "Root Cause",
    icon: "Crosshair",
    position: g(4, 3),
    details: {
      summary: "Digs past 'where' to 'why', testing which cause actually explains the change.",
      whatHappens:
        "Segmentation shows where the drop is; root-cause analysis tests why. The analyst walks the user journey as a funnel (open app, add to cart, pay, order placed), finds the step where version 5.2 users fall away and checks the alternatives: traffic, price, outages. Here payment success is 95.0% on version 5.1 but 19.0% on version 5.2, pointing to a broken UPI (India's instant bank payment system) screen.",
      howItHappens: [
        "List candidate causes: traffic, pricing, a product bug, a competitor, an outage, a tracking error.",
        "Build a funnel and find the step where the affected group drops off compared with the unaffected group.",
        "Compare affected and unaffected users over the same days (a difference-in-differences view) so seasonality hits both equally.",
        "Rule out the alternatives one by one with data, for example sessions flat, prices flat, no outage.",
        "Confirm with an engineer or the logs and, where possible, with an A/B test or a rollback.",
      ],
      whyImportant:
        "Fixing a symptom wastes money: if the team had cut ad spend, Indore revenue would still be broken. Showing the mechanism turns a correlation into an actionable cause and gives engineers a precise bug to reproduce.",
      tools: [
        { name: "Amplitude / Mixpanel funnels", type: "Product analytics", note: "Show step-by-step drop-off for any user group" },
        { name: "statsmodels", type: "Python library", note: "Regression and difference-in-differences to separate the effect of one factor" },
        { name: "DoWhy", type: "Causal inference library", note: "Makes assumptions explicit and tests whether a causal estimate is robust" },
        { name: "CausalImpact", type: "Time-series causal tool", note: "Estimates what a metric would have done without an event, from comparable series" },
        { name: "Sentry", type: "Error tracking", note: "Shows app crashes and payment-screen errors per release" },
      ],
      commonProblems: [
        "Stopping at the first plausible cause and never testing the alternatives.",
        "Confusing correlation with cause, such as blaming a promotion that merely ran the same week.",
        "Confounders: a hidden factor, like a festival, moves both the suspected cause and the metric.",
        "No access to logs or engineers, so the mechanism is never confirmed.",
      ],
    },
    sampleKey: "root_cause",
  },
  {
    id: "anomaly_alerts",
    level: "advanced",
    category: "monitoring",
    label: "Anomaly Detection & Alerts",
    shortLabel: "Alerts",
    icon: "Siren",
    position: g(1, 3),
    details: {
      summary: "Watches key metrics automatically and raises an alert when a value is far from normal.",
      whatHappens:
        "Instead of waiting for a manager to notice and ask, the team monitors important metrics continuously. A model learns the normal level for each hour, including daily and weekly rhythms, and flags values outside the expected band. Replaying 27 October shows that 31 Android orders in an hour, against an expected 52, would have triggered an alert that evening, about ten days before the question arrived.",
      howItHappens: [
        "Choose a short list of metrics that matter (orders, conversion, payment success) and the groups to watch.",
        "Compute an expected value and an acceptable band for every period from history, seasonality or a forecast.",
        "Score each new data point, for example with a z-score, which counts how many standard deviations it sits from expected.",
        "Send an alert to Slack or on-call tooling when a threshold is crossed several periods in a row.",
        "Review false alarms weekly, tune the thresholds and attach context such as the segment and the likely cause.",
      ],
      whyImportant:
        "Speed matters: a 40% drop in orders costs money for every hour it goes unnoticed. Monitoring turns analytics from a look back into an early warning system, but only if alerts are precise enough for people to keep trusting them.",
      tools: [
        { name: "Grafana Alerting", type: "Monitoring", note: "Rules on any time series with notifications to Slack, email or on-call tools" },
        { name: "Datadog anomaly monitors", type: "Monitoring", note: "Learns seasonal patterns and alerts when a metric leaves its usual band" },
        { name: "Metabase alerts", type: "BI alerts", note: "Sends a message when a saved question crosses a simple threshold" },
        { name: "Anomalo", type: "Data quality / anomaly detection", note: "Automatically monitors tables and metrics for unexpected shifts" },
        { name: "Prophet (prediction intervals)", type: "Forecasting library", note: "Produces the expected range that actual values are compared against" },
      ],
      commonProblems: [
        "Alert fatigue: too many noisy alerts, so people mute the channel and miss the real one.",
        "Ignoring seasonality, so every dinner-time peak or festival looks like an anomaly.",
        "Alerts that say what happened but not where, leaving someone to dig for an hour.",
        "A model trained on data that already contains the incident, so it learns the broken level as normal.",
      ],
    },
    sampleKey: "anomaly_alerts",
  },
  {
    id: "experimentation_platform",
    level: "advanced",
    category: "experiment",
    label: "Experimentation Platform",
    shortLabel: "Experiments",
    icon: "FlaskConical",
    position: g(3, 4),
    details: {
      summary: "Runs many experiments safely and consistently, with automatic assignment and guardrail checks.",
      whatHappens:
        "When a company runs dozens of tests at once, doing each by hand does not scale. An experimentation platform provides feature flags (switches that turn a feature on for chosen users without a new release), consistent random assignment, automatic metric calculation and safety checks. For the UPI fix it assigns Android 5.2 users by a hash of their user id, verifies the split and watches guardrails such as crash rate.",
      howItHappens: [
        "The analyst registers the experiment: audience, split, primary metric, guardrail metrics and sample size.",
        "The platform assigns users by hashing the user id with the experiment name, so a user always sees the same variant.",
        "Exposure events and outcomes flow into the warehouse and metrics are computed automatically on a schedule.",
        "Automated checks run: sample ratio mismatch, guardrail metrics and conflicts with other experiments.",
        "Results appear in a standard report, and a winning variant can be rolled out to everyone by changing a flag.",
      ],
      whyImportant:
        "A shared platform makes experiments trustworthy and cheap: everyone uses the same assignment, metrics and statistics. It stops teams from inventing their own methods, catches broken tests early and lets good ideas ship, and bad ones stop, within days.",
      tools: [
        { name: "Statsig", type: "Experimentation platform", note: "Feature gates, experiments and automatic guardrail monitoring in one tool" },
        { name: "Optimizely Feature Experimentation", type: "Experimentation platform", note: "Server-side and app experiments with built-in statistics" },
        { name: "LaunchDarkly", type: "Feature flags", note: "Flag management with experimentation add-ons and gradual rollouts" },
        { name: "GrowthBook", type: "Open-source experimentation", note: "Warehouse-native analysis and feature flags that you can self-host" },
      ],
      commonProblems: [
        "Sample ratio mismatch from logging bugs or bots, which invalidates the whole result.",
        "Users in several overlapping experiments, so effects interfere and results blur.",
        "Metrics defined separately in the platform and the warehouse, producing different answers.",
        "Too many variants with small samples, so nothing is conclusive.",
      ],
    },
    sampleKey: "experimentation_platform",
  },
  {
    id: "decision_automation",
    level: "advanced",
    category: "decision",
    label: "Decision Automation",
    shortLabel: "Automate",
    icon: "Zap",
    position: g(0, 3),
    details: {
      summary: "Feeds insights straight into the tools and rules that act on them, without waiting for a meeting.",
      whatHappens:
        "Some decisions are repetitive and urgent enough to hand to rules. Decision automation connects an analytics signal to an action: when Android orders show an anomaly two hours in a row, the system pages the on-call engineer, opens a ticket and pauses the Indore app ads. Embedded analytics goes further and puts the numbers inside the tools people already use, such as an ops console or a CRM. A human still owns the rules and reviews the exceptions.",
      howItHappens: [
        "Pick a decision that is frequent, clearly defined and low-risk enough to automate, such as pausing ads or opening a ticket.",
        "Write the rule explicitly: the signal, the threshold, the action and the maximum impact allowed.",
        "Connect the metric to the action through webhooks, a workflow tool or reverse ETL into business apps.",
        "Add safeguards: spend caps, a manual override, an audit log and human approval for high-impact actions.",
        "Review how often the rule fired and whether the outcomes were good, then tune or retire it.",
      ],
      whyImportant:
        "Analysis is only worth something if it changes what happens. Automating routine reactions cuts response time from days to minutes, while embedding insights in daily tools means more people use data without opening a dashboard. Guardrails keep automation from making expensive mistakes at machine speed.",
      tools: [
        { name: "Zapier", type: "Workflow automation", note: "Connects an alert to actions such as creating a ticket or posting a message" },
        { name: "Hightouch", type: "Reverse ETL", note: "Syncs warehouse metrics into CRM, ad and support tools so teams act on them there" },
        { name: "PagerDuty", type: "On-call alerting", note: "Pages the right engineer and tracks acknowledgement and escalation" },
        { name: "Looker embedded analytics", type: "Embedded analytics", note: "Puts governed charts inside another product or internal portal" },
        { name: "Metabase embedding", type: "Embedded analytics", note: "Embeds dashboards and questions in apps with signed, permissioned links" },
      ],
      commonProblems: [
        "Automating a bad rule at scale: a faulty threshold pauses ads in every city at once.",
        "No kill switch or audit log, so nobody can see why an action fired or stop it.",
        "Rules that go stale as the business changes and nobody owns them.",
        "Embedded numbers that differ from the official dashboard because they bypass the shared metric definitions.",
      ],
    },
    sampleKey: "decision_automation",
  },
];

// One question followed through the main path at each level. Consecutive nodes always share an edge.
export const playPaths = {
  basic: ["business_question", "data_extraction", "data_cleaning", "exploration", "analysis", "visualization"],
  medium: [
    "business_question",
    "kpi_definitions",
    "data_extraction",
    "data_cleaning",
    "exploration",
    "segmentation",
    "analysis",
    "visualization",
    "storytelling",
    "decision_review",
  ],
  advanced: [
    "business_question",
    "kpi_definitions",
    "semantic_layer",
    "data_extraction",
    "data_cleaning",
    "exploration",
    "segmentation",
    "analysis",
    "visualization",
    "storytelling",
    "decision_review",
    "decision_automation",
  ],
};
