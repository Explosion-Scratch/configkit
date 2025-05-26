#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "fs";
import path from "path";

const filePath = path.join(__dirname, "public", "flags.json");

async function removeDuplicateFlags() {
  try {
    // Read the file using Bun's API
    const file = Bun.file(filePath);
    const flags = await file.json();

    const uniqueFlags = [];
    const seenKeys = new Set();

    for (const flag of flags) {
      const key = `${flag.domain}:${flag.key}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueFlags.push(flag);
      }
    }

    // Stringify the unique flags array with pretty printing
    const uniqueFlagsJson = JSON.stringify(uniqueFlags, null, 2);

    // Write the unique flags back to the file
    await Bun.write(filePath, uniqueFlagsJson);

    console.log(
      `Successfully removed duplicates. Original count: ${flags.length}, Unique count: ${uniqueFlags.length}`,
    );
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

removeDuplicateFlags();
