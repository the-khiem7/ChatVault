import { describe, expect, it } from "vitest";
import type { ConversationDraft } from "../domain/conversation";
import { writeMarkdown } from "./markdownWriter";

describe("writeMarkdown", () => {
  it("writes frontmatter and ordered H1 role sections", () => {
    const draft: ConversationDraft = {
      title: "Data Analysis - ChatGPT",
      sourceUrl: "https://chatgpt.com/c/abc",
      extractedAt: "2026-04-30T13:00:00.000Z",
      assetCandidates: [],
      warnings: [],
      messages: [
        {
            id: "message-1",
            index: 0,
            role: "user",
            confidence: "high",
            warnings: [],
            blocks: [{ id: "message-1-block-1", kind: "paragraph", text: "# User supplied heading" }]
        },
        {
          id: "message-2",
          index: 1,
          role: "assistant",
          confidence: "high",
          warnings: [],
          blocks: [{ id: "message-2-block-1", kind: "paragraph", text: "Hi user" }]
        }
      ]
    };

    expect(writeMarkdown(draft)).toBe(`---
title: "Data Analysis - ChatGPT"
source: "chatgpt"
sourceUrl: "https://chatgpt.com/c/abc"
exportedAt: "2026-04-30T13:00:00.000Z"
---

## Data Analysis - ChatGPT

# User

## User supplied heading

# Assistant

Hi user
`);
  });

  it("writes fenced code blocks with language tags", () => {
    const draft: ConversationDraft = {
      title: "SQL Help",
      sourceUrl: "https://chatgpt.com/c/sql",
      extractedAt: "2026-04-30T13:00:00.000Z",
      assetCandidates: [],
      warnings: [],
      messages: [
        {
          id: "message-1",
          index: 0,
          role: "assistant",
          confidence: "high",
          warnings: [],
          blocks: [
            { id: "message-1-block-1", kind: "paragraph", text: "Run this:" },
            {
              id: "message-1-block-2",
              kind: "code",
              language: "sql",
              text: "SELECT *\nFROM taxi_raw.table_2025\nLIMIT 10;"
            }
          ]
        }
      ]
    };

    expect(writeMarkdown(draft)).toContain(`Run this:

\`\`\`sql
SELECT *
FROM taxi_raw.table_2025
LIMIT 10;
\`\`\``);
  });

  it("converts SQL-like paragraph lines into fenced SQL blocks without rewriting SQL text", () => {
    const draft: ConversationDraft = {
      title: "SQL Inline",
      sourceUrl: "https://chatgpt.com/c/sql-inline",
      extractedAt: "2026-04-30T13:00:00.000Z",
      assetCandidates: [],
      warnings: [],
      messages: [
        {
          id: "message-1",
          index: 0,
          role: "assistant",
          confidence: "high",
          warnings: [],
          blocks: [
            {
              id: "message-1-block-1",
              kind: "paragraph",
              text: "Query thử:\n\nSELECT *FROM taxi_raw.table_2025WHERE month = '01'LIMIT 20;\n\nSau đó xem rows."
            }
          ]
        }
      ]
    };

    expect(writeMarkdown(draft)).toContain(`Query thử:

\`\`\`sql
SELECT *FROM taxi_raw.table_2025WHERE month = '01'LIMIT 20;
\`\`\`

Sau đó xem rows.`);
  });

  it("detects SQL inside unlabeled code blocks without rewriting SQL identifiers", () => {
    const draft: ConversationDraft = {
      title: "SQL Code",
      sourceUrl: "https://chatgpt.com/c/sql-code",
      extractedAt: "2026-04-30T13:00:00.000Z",
      assetCandidates: [],
      warnings: [],
      messages: [
        {
          id: "message-1",
          index: 0,
          role: "assistant",
          confidence: "high",
          warnings: [],
          blocks: [
            {
              id: "message-1-block-1",
              kind: "code",
              text: "CREATE EXTERNAL TABLE taxi_data_schema.yellow_taxi_trips (...)STORED AS PARQUETLOCATION 's3://processed-yellow-taxi-trip-data/year=2025/month=01/';"
            }
          ]
        }
      ]
    };

    expect(writeMarkdown(draft)).toContain(`\`\`\`sql
CREATE EXTERNAL TABLE taxi_data_schema.yellow_taxi_trips (...)STORED AS PARQUETLOCATION 's3://processed-yellow-taxi-trip-data/year=2025/month=01/';
\`\`\``);
    expect(writeMarkdown(draft)).not.toContain("LOCATI\nON");
  });
});
