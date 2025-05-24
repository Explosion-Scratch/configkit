import { ref, computed } from "vue";
import { useLocalStorage } from "./useLocalStorage.js";
import {
  parseDefaultsScript,
  countSettings,
  filterValidSettings,
} from "../utils/presetParser.js";

export function usePresets() {
  const presets = ref([]);
  const { value: appliedPresets, update: updateAppliedPresets } =
    useLocalStorage("appliedPresets", []);
  const { value: settingOrigins, update: updateSettingOrigins } =
    useLocalStorage("settingOrigins", {});
  const isLoading = ref(false);
  const error = ref(null);

  const loadPresets = async () => {
    if (presets.value.length > 0) return; // Already loaded

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/configkit/presets.json");
      if (!response.ok) {
        throw new Error(
          `Failed to load presets: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();

      // Parse settings for each preset
      const parsedPresets = data.map((preset) => ({
        ...preset,
        settings: parseDefaultsScript(preset.content),
        settingsCount: countSettings(parseDefaultsScript(preset.content)),
      }));

      presets.value = parsedPresets;
    } catch (err) {
      console.error("Error loading presets:", err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  const getPreset = (presetId) => {
    return presets.value.find((preset) => preset.id === presetId);
  };

  const isPresetApplied = (presetId) => {
    return appliedPresets.value.includes(presetId);
  };

  const applyPreset = async (presetId, allSettings) => {
    const preset = getPreset(presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }

    try {
      // Filter settings to only include valid ones
      const validSettings = filterValidSettings(preset.settings, allSettings);
      const settingsCount = Object.keys(validSettings).length;

      if (settingsCount === 0) {
        throw new Error("No valid settings found in preset");
      }

      // Track origins for each setting
      const newOrigins = { ...settingOrigins.value };
      const appliedAt = new Date().toISOString();

      Object.entries(validSettings).forEach(([settingId, value]) => {
        if (!newOrigins[settingId]) {
          newOrigins[settingId] = [];
        }

        // Remove any existing entry for this preset
        newOrigins[settingId] = newOrigins[settingId].filter(
          (origin) => origin.presetId !== presetId,
        );

        // Add new entry
        newOrigins[settingId].push({
          presetId,
          value,
          appliedAt,
        });
      });

      // Update applied presets list
      const newAppliedPresets = [...appliedPresets.value];
      if (!newAppliedPresets.includes(presetId)) {
        newAppliedPresets.push(presetId);
      }

      // Save changes
      updateSettingOrigins(newOrigins);
      updateAppliedPresets(newAppliedPresets);

      return {
        settingsApplied: settingsCount,
        validSettings,
      };
    } catch (err) {
      console.error("Error applying preset:", err);
      throw err;
    }
  };

  const revertPreset = (presetId) => {
    try {
      // Remove from applied presets
      const newAppliedPresets = appliedPresets.value.filter(
        (id) => id !== presetId,
      );
      updateAppliedPresets(newAppliedPresets);

      // Remove origins for this preset
      const newOrigins = { ...settingOrigins.value };
      Object.keys(newOrigins).forEach((settingId) => {
        newOrigins[settingId] = newOrigins[settingId].filter(
          (origin) => origin.presetId !== presetId,
        );

        // Remove empty arrays
        if (newOrigins[settingId].length === 0) {
          delete newOrigins[settingId];
        }
      });

      updateSettingOrigins(newOrigins);

      return true;
    } catch (err) {
      console.error("Error reverting preset:", err);
      return false;
    }
  };

  const getSettingOrigins = (settingId) => {
    return settingOrigins.value[settingId] || [];
  };

  const getPresetValueFrequency = (settingId) => {
    const frequencies = {};

    presets.value.forEach((preset) => {
      if (preset.settings && preset.settings[settingId] !== undefined) {
        const value = preset.settings[settingId];
        const key = JSON.stringify(value);
        frequencies[key] = frequencies[key] || { value, count: 0, presets: [] };
        frequencies[key].count++;
        frequencies[key].presets.push(preset.id);
      }
    });

    return Object.values(frequencies).sort((a, b) => b.count - a.count);
  };

  const getConflictingSettings = (presetId, currentSettings) => {
    const preset = getPreset(presetId);
    if (!preset) return [];

    const conflicts = [];

    Object.entries(preset.settings).forEach(([settingId, presetValue]) => {
      const currentValue = currentSettings[settingId];
      if (currentValue !== undefined && currentValue !== presetValue) {
        conflicts.push({
          settingId,
          currentValue,
          presetValue,
        });
      }
    });

    return conflicts;
  };

  const getPresetStats = () => {
    const totalPresets = presets.value.length;
    const appliedCount = appliedPresets.value.length;
    const totalSettings = presets.value.reduce(
      (sum, preset) => sum + preset.settingsCount,
      0,
    );

    return {
      totalPresets,
      appliedCount,
      totalSettings,
      averageSettingsPerPreset:
        totalPresets > 0 ? Math.round(totalSettings / totalPresets) : 0,
    };
  };

  // Computed properties
  const availablePresets = computed(() => {
    return presets.value.filter((preset) => preset.settingsCount > 0);
  });

  const appliedPresetsList = computed(() => {
    return appliedPresets.value.map((id) => getPreset(id)).filter(Boolean);
  });

  return {
    // State
    presets,
    appliedPresets,
    settingOrigins,
    isLoading,
    error,

    // Computed
    availablePresets,
    appliedPresetsList,

    // Methods
    loadPresets,
    getPreset,
    isPresetApplied,
    applyPreset,
    revertPreset,
    getSettingOrigins,
    getPresetValueFrequency,
    getConflictingSettings,
    getPresetStats,
  };
}
