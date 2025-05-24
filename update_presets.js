#!/usr/bin/env bun

const fs = require("fs").promises;
const https = require("https");
const path = require("path");

const presetsFilePath = path.join(__dirname, "public", "presets.json");

async function fetchUrlContent(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP status code ${res.statusCode}`));
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function updatePresets() {
  try {
    // Read the presets file
    const data = await fs.readFile(presetsFilePath, "utf8");
    const presets = JSON.parse(data);

    // Fetch content for each preset and add it
    const updatedPresets = await Promise.all(
      presets
        .map(async (preset) => {
          if (preset && preset.rawURL) {
            try {
              console.log(`Fetching content for ${preset.rawURL}...`);
              const content = await fetchUrlContent(preset.rawURL);
              return { ...preset, content: content.trim() }; // Add content and trim whitespace
            } catch (fetchError) {
              console.error(
                `Error fetching content for ${preset.rawURL}: ${fetchError.message}`,
              );
              // Decide how to handle fetch errors: skip, add error flag, or keep existing object
              // For now, we'll log the error and return the original preset without content
              return preset;
            }
          }
          return preset; // Return original if no rawURL or preset is null/undefined
        })
        .filter(Boolean),
    ); // Filter out any potential null/undefined entries if they occur

    // Write the updated presets back to the file
    const updatedData = JSON.stringify(updatedPresets, null, 2);
    await fs.writeFile(presetsFilePath, updatedData, "utf8");

    console.log("Successfully updated presets.json with fetched content.");
  } catch (error) {
    console.error("Error updating presets:", error.message);
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}

// Run the update process
updatePresets();
