import { Readable } from "node:stream";
import csvParser from "csv-parser";
import { createHyogenError } from "../errors/createError.js";
import type { HyogenError } from "../types.js";

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

function rowValues(row: Record<string, string>): string[] {
  return Object.keys(row)
    .sort((left, right) => Number(left) - Number(right))
    .map((key) => row[key] ?? "");
}

function isBlankRow(values: string[]): boolean {
  return values.every((value) => value === "");
}

async function readCsvRows(source: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const rows: string[][] = [];

    Readable.from([source])
      .pipe(csvParser({ headers: false }))
      .on("data", (row: Record<string, string>) => {
        const values = rowValues(row);
        if (!isBlankRow(values)) {
          rows.push(values);
        }
      })
      .on("end", () => resolve(rows))
      .on("error", (error) => reject(error));
  });
}

export async function parseCsvFromString(
  source: string,
  filePath?: string,
): Promise<Record<string, string>[]> {
  if (source.length === 0 || source.trim().length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: filePath,
      details: { message: "empty CSV" },
    });
  }

  let rawRows: string[][];
  try {
    rawRows = await readCsvRows(source);
  } catch (error) {
    if (isHyogenError(error)) {
      throw error;
    }
    throw createHyogenError({
      code: "parse_error",
      path: filePath,
      details: {
        message: error instanceof Error ? error.message : "invalid CSV",
      },
    });
  }

  if (rawRows.length === 0) {
    throw createHyogenError({
      code: "parse_error",
      path: filePath,
      details: { message: "empty CSV" },
    });
  }

  const [headers, ...dataRows] = rawRows;
  const headerCount = headers.length;

  for (const row of dataRows) {
    if (row.length !== headerCount) {
      throw createHyogenError({
        code: "parse_error",
        path: filePath,
        details: { message: "CSV row column count mismatch" },
      });
    }
  }

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    for (let index = 0; index < headers.length; index++) {
      record[headers[index]!] = row[index] ?? "";
    }
    return record;
  });
}
