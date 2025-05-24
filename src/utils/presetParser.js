/**
 * Utility functions for parsing macOS defaults scripts and extracting settings
 */

import { buildSettingId, getDomainFromSettingId } from './settingId.js';

/**
 * Parse a defaults script content and extract settings
 * @param {string} content - Raw shell script content
 * @returns {Object} - Object with settingId keys and values
 */
export function parseDefaultsScript(content) {
  if (!content || typeof content !== 'string') {
    return {};
  }

  const commands = extractDefaultsCommands(content);
  const settings = {};

  commands.forEach(command => {
    try {
      const parsed = parseDefaultsCommand(command);
      if (parsed && parsed.domain && parsed.key) {
        const settingId = buildSettingId(parsed.domain, parsed.key);
        settings[settingId] = parsed.value;
      }
    } catch (error) {
      console.warn('Failed to parse defaults command:', command, error);
    }
  });

  return settings;
}

/**
 * Extract defaults commands from shell script content
 * @param {string} content - Shell script content
 * @returns {string[]} - Array of defaults commands
 */
export function extractDefaultsCommands(content) {
  const lines = content.split('\n');
  const commands = [];
  
  // Regex patterns for different defaults command formats
  const patterns = [
    // Basic: defaults write domain key value
    /^\s*(?:sudo\s+)?defaults\s+write\s+([^\s]+)\s+([^\s]+)\s+(.+)$/,
    // With type flag: defaults write domain key -type value
    /^\s*(?:sudo\s+)?defaults\s+write\s+([^\s]+)\s+([^\s]+)\s+(-\w+)\s+(.+)$/,
    // Delete: defaults delete domain key
    /^\s*(?:sudo\s+)?defaults\s+delete\s+([^\s]+)\s+([^\s]+)$/
  ];

  lines.forEach(line => {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      return;
    }

    // Check if line contains a defaults command
    if (trimmed.includes('defaults write') || trimmed.includes('defaults delete')) {
      commands.push(trimmed);
    }
  });

  return commands;
}

/**
 * Parse a single defaults command
 * @param {string} command - Single defaults command
 * @returns {Object|null} - Parsed command object
 */
export function parseDefaultsCommand(command) {
  if (!command || typeof command !== 'string') {
    return null;
  }

  const trimmed = command.trim();
  
  // Handle delete commands
  if (trimmed.includes('defaults delete')) {
    const deleteMatch = trimmed.match(/^\s*(?:sudo\s+)?defaults\s+delete\s+([^\s]+)\s+([^\s]+)/);
    if (deleteMatch) {
      return {
        domain: deleteMatch[1],
        key: deleteMatch[2],
        value: undefined,
        type: 'delete'
      };
    }
  }

  // Handle write commands with type flags
  const typeMatch = trimmed.match(/^\s*(?:sudo\s+)?defaults\s+write\s+([^\s]+)\s+([^\s]+)\s+(-\w+)\s+(.+)$/);
  if (typeMatch) {
    const [, domain, key, typeFlag, valueStr] = typeMatch;
    const type = typeFlag.substring(1); // Remove the '-' prefix
    const value = convertValueByType(valueStr, type);
    
    return {
      domain: cleanDomain(domain),
      key: cleanKey(key),
      value,
      type
    };
  }

  // Handle basic write commands (no type flag)
  const basicMatch = trimmed.match(/^\s*(?:sudo\s+)?defaults\s+write\s+([^\s]+)\s+([^\s]+)\s+(.+)$/);
  if (basicMatch) {
    const [, domain, key, valueStr] = basicMatch;
    const value = inferValueType(valueStr);
    
    return {
      domain: cleanDomain(domain),
      key: cleanKey(key),
      value,
      type: typeof value
    };
  }

  return null;
}

/**
 * Convert value string to appropriate JavaScript type based on defaults type flag
 * @param {string} valueStr - Value string from command
 * @param {string} type - Type flag (bool, int, float, string, array, dict)
 * @returns {any} - Converted value
 */
export function convertValueByType(valueStr, type) {
  if (!valueStr) return null;

  const trimmed = valueStr.trim();

  switch (type) {
    case 'bool':
    case 'boolean':
      return trimmed === 'true' || trimmed === 'TRUE' || trimmed === '1';

    case 'int':
    case 'integer':
      const intVal = parseInt(trimmed, 10);
      return isNaN(intVal) ? 0 : intVal;

    case 'float':
    case 'real':
      const floatVal = parseFloat(trimmed);
      return isNaN(floatVal) ? 0.0 : floatVal;

    case 'string':
      return unquoteString(trimmed);

    case 'array':
      return parseArrayValue(trimmed);

    case 'dict':
    case 'dictionary':
      return parseDictValue(trimmed);

    default:
      return inferValueType(trimmed);
  }
}

/**
 * Infer the type of a value when no type flag is provided
 * @param {string} valueStr - Value string
 * @returns {any} - Inferred value
 */
export function inferValueType(valueStr) {
  if (!valueStr) return null;

  const trimmed = valueStr.trim();

  // Boolean values
  if (trimmed === 'true' || trimmed === 'TRUE') return true;
  if (trimmed === 'false' || trimmed === 'FALSE') return false;

  // Numeric values
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  if (/^-?\d*\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Quoted strings
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return unquoteString(trimmed);
  }

  // Array-like values
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return parseArrayValue(trimmed);
  }

  // Dictionary-like values
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return parseDictValue(trimmed);
  }

  // Default to string
  return trimmed;
}

/**
 * Remove quotes from a string value
 * @param {string} str - Quoted string
 * @returns {string} - Unquoted string
 */
function unquoteString(str) {
  if (!str) return '';
  
  let result = str.trim();
  
  // Remove outer quotes
  if ((result.startsWith('"') && result.endsWith('"')) ||
      (result.startsWith("'") && result.endsWith("'"))) {
    result = result.slice(1, -1);
  }
  
  // Unescape common escape sequences
  result = result
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  
  return result;
}

/**
 * Parse array value from defaults command
 * @param {string} arrayStr - Array string representation
 * @returns {Array} - Parsed array
 */
function parseArrayValue(arrayStr) {
  try {
    // Handle plist-style arrays: (item1, item2, item3)
    if (arrayStr.startsWith('(') && arrayStr.endsWith(')')) {
      const inner = arrayStr.slice(1, -1).trim();
      if (!inner) return [];
      
      // Simple comma-separated values
      return inner.split(',').map(item => {
        const trimmed = item.trim();
        return inferValueType(trimmed);
      });
    }
    
    // Handle space-separated values (common in defaults)
    const items = arrayStr.trim().split(/\s+/);
    return items.map(item => inferValueType(item));
    
  } catch (error) {
    console.warn('Failed to parse array value:', arrayStr, error);
    return [arrayStr];
  }
}

/**
 * Parse dictionary value from defaults command
 * @param {string} dictStr - Dictionary string representation
 * @returns {Object} - Parsed dictionary
 */
function parseDictValue(dictStr) {
  try {
    // Try to parse as JSON first
    if (dictStr.startsWith('{') && dictStr.endsWith('}')) {
      return JSON.parse(dictStr);
    }
    
    // For complex dictionary parsing, return as string for now
    // Full plist dictionary parsing would require more complex logic
    return dictStr;
    
  } catch (error) {
    console.warn('Failed to parse dictionary value:', dictStr, error);
    return dictStr;
  }
}

/**
 * Clean domain name (remove quotes, handle special cases)
 * @param {string} domain - Raw domain string
 * @returns {string} - Cleaned domain
 */
function cleanDomain(domain) {
  if (!domain) return '';
  return unquoteString(domain.trim());
}

/**
 * Clean key name (remove quotes, handle special cases)
 * @param {string} key - Raw key string
 * @returns {string} - Cleaned key
 */
function cleanKey(key) {
  if (!key) return '';
  return unquoteString(key.trim());
}

/**
 * Count the number of settings in a parsed script
 * @param {Object} settings - Parsed settings object
 * @returns {number} - Number of settings
 */
export function countSettings(settings) {
  if (!settings || typeof settings !== 'object') return 0;
  return Object.keys(settings).length;
}

/**
 * Get unique domains from parsed settings
 * @param {Object} settings - Parsed settings object
 * @returns {string[]} - Array of unique domains
 */
export function getUniqueDomains(settings) {
  if (!settings || typeof settings !== 'object') return [];
  
  const domains = new Set();
  Object.keys(settings).forEach(settingId => {
    try {
      const domain = getDomainFromSettingId(settingId);
      if (domain) domains.add(domain);
    } catch (error) {
      // Skip invalid setting IDs
      console.warn('Invalid setting ID format:', settingId);
    }
  });
  
  return Array.from(domains).sort();
}

/**
 * Validate that a parsed setting exists in the available settings
 * @param {string} settingId - Setting ID (domain.key)
 * @param {Array} allSettings - Array of all available settings
 * @returns {boolean} - Whether the setting is valid
 */
export function validateSetting(settingId, allSettings) {
  if (!settingId || !allSettings || !Array.isArray(allSettings)) {
    return false;
  }
  
  return allSettings.some(setting => 
    buildSettingId(setting.domain, setting.key) === settingId
  );
}

/**
 * Filter parsed settings to only include valid ones
 * @param {Object} parsedSettings - Parsed settings object
 * @param {Array} allSettings - Array of all available settings
 * @returns {Object} - Filtered settings object
 */
export function filterValidSettings(parsedSettings, allSettings) {
  if (!parsedSettings || !allSettings) return {};
  
  const filtered = {};
  
  Object.entries(parsedSettings).forEach(([settingId, value]) => {
    if (validateSetting(settingId, allSettings)) {
      filtered[settingId] = value;
    }
  });
  
  return filtered;
}