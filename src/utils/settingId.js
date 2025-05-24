/**
 * Utility functions for handling setting IDs
 */

import { SETTINGS_DELIMITER } from './constants.js';

/**
 * Build a setting ID from domain and key
 * @param {string} domain - The setting domain
 * @param {string} key - The setting key
 * @returns {string} - The setting ID
 */
export function buildSettingId(domain, key) {
  if (!domain || !key) {
    throw new Error('Both domain and key are required to build setting ID');
  }
  return `${domain}${SETTINGS_DELIMITER}${key}`;
}

/**
 * Parse a setting ID back into domain and key
 * @param {string} settingId - The setting ID to parse
 * @returns {Object} - Object with domain and key properties
 */
export function parseSettingId(settingId) {
  if (!settingId || typeof settingId !== 'string') {
    throw new Error('Valid setting ID is required');
  }
  
  const delimiterIndex = settingId.indexOf(SETTINGS_DELIMITER);
  if (delimiterIndex === -1) {
    throw new Error(`Invalid setting ID format: ${settingId}`);
  }
  
  const domain = settingId.substring(0, delimiterIndex);
  const key = settingId.substring(delimiterIndex + 1);
  
  if (!domain || !key) {
    throw new Error(`Invalid setting ID format: ${settingId}`);
  }
  
  return { domain, key };
}

/**
 * Get the domain from a setting ID
 * @param {string} settingId - The setting ID
 * @returns {string} - The domain
 */
export function getDomainFromSettingId(settingId) {
  const { domain } = parseSettingId(settingId);
  return domain;
}

/**
 * Get the key from a setting ID
 * @param {string} settingId - The setting ID
 * @returns {string} - The key
 */
export function getKeyFromSettingId(settingId) {
  const { key } = parseSettingId(settingId);
  return key;
}

/**
 * Check if a string is a valid setting ID format
 * @param {string} settingId - The string to check
 * @returns {boolean} - Whether it's a valid setting ID
 */
export function isValidSettingId(settingId) {
  try {
    parseSettingId(settingId);
    return true;
  } catch {
    return false;
  }
}

