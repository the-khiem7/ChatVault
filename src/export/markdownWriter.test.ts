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

  it("converts SQL-like paragraph lines into fenced SQL blocks", () => {
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
SELECT *
FROM taxi_raw.table_2025
WHERE month = '01'
LIMIT 20;
\`\`\`

Sau đó xem rows.`);
  });

  it("detects and normalizes SQL inside unlabeled code blocks", () => {
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
              text: "DROP SCHEMA taxi_processed CASCADE;CREATE EXTERNAL SCHEMA taxi_processedFROM DATA CATALOGDATABASE 'redshift_database'IAM_ROLE defaultREGION 'us-east-2';"
            }
          ]
        }
      ]
    };

    expect(writeMarkdown(draft)).toContain(`\`\`\`sql
DROP SCHEMA taxi_processed CASCADE;
CREATE EXTERNAL SCHEMA taxi_processed
FROM DATA CATALOG
DATABASE 'redshift_database'
IAM_ROLE default
REGION 'us-east-2';
\`\`\``);
  });
});
