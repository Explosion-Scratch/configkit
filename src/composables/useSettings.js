import { ref, computed } from 'vue';
import { useLocalStorage } from './useLocalStorage.js';

const MAX_COUNT_FOR_CATEGORY = 20;
const LOCAL_STORAGE_KEY = 'macosdefaults-settings';

export function useSettings() {
  const allSettings = ref([]);
  const { value: selectedSettings, update: updateSelectedSettings } = useLocalStorage(LOCAL_STORAGE_KEY, {});
  const isLoading = ref(false);
  const error = ref(null);

  const loadSettings = async () => {
    if (allSettings.value.length > 0) return; // Already loaded

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch('/configkit/flags.json');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      allSettings.value = data;
    } catch (err) {
      console.error('Error loading settings:', err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateSetting = (key, event) => {
    // Handle bulk updates (when key is an object)
    if (typeof key === 'object' && key !== null) {
      updateSelectedSettings(key);
      return;
    }
    
    // Handle single setting updates
    const newValue = event.value !== undefined ? event.value : event;
    const currentSettings = { ...selectedSettings.value };
    
    if (newValue === undefined) {
      delete currentSettings[key];
    } else {
      currentSettings[key] = newValue;
    }
    
    updateSelectedSettings(currentSettings);
  };

  const resetSetting = (key) => {
    const currentSettings = { ...selectedSettings.value };
    delete currentSettings[key];
    updateSelectedSettings(currentSettings);
  };

  const resetAllSettings = () => {
    updateSelectedSettings({});
  };

  const applyAllSuggested = () => {
    const newSettings = { ...selectedSettings.value };
    let changedCount = 0;

    allSettings.value.forEach(setting => {
      if (setting.suggestedValue !== null && setting.suggestedValue !== undefined) {
        const settingId = `${setting.domain}.${setting.key}`;
        const currentValue = selectedSettings.value[settingId];
        
        if (currentValue !== setting.suggestedValue) {
          newSettings[settingId] = setting.suggestedValue;
          changedCount++;
        }
      }
    });

    if (changedCount > 0) {
      updateSelectedSettings(newSettings);
    }

    return changedCount;
  };

  const changedSettingsCount = computed(() => {
    return Object.keys(selectedSettings.value).length;
  });

  const filteredApplyCount = computed(() => {
    return allSettings.value.filter(setting => 
      setting.suggestedValue !== null && 
      setting.suggestedValue !== undefined &&
      selectedSettings.value[`${setting.domain}.${setting.key}`] !== setting.suggestedValue
    ).length;
  });

  const filteredChangedCount = computed(() => {
    return allSettings.value.filter(setting => {
      const settingId = `${setting.domain}.${setting.key}`;
      return selectedSettings.value[settingId] !== undefined;
    }).length;
  });

  // Get settings for a specific category
  const getSettingsForCategory = (category) => {
    if (category === 'Home') return [];
    return allSettings.value.filter(setting => setting.category === category);
  };

  // Get all unique categories
  const categories = computed(() => {
    const cats = [...new Set(allSettings.value.map(s => s.category))].sort();
    return cats.slice(0, MAX_COUNT_FOR_CATEGORY);
  });

  return {
    // State
    allSettings,
    selectedSettings,
    isLoading,
    error,
    
    // Computed
    changedSettingsCount,
    filteredApplyCount,
    filteredChangedCount,
    categories,
    
    // Methods
    loadSettings,
    updateSetting,
    resetSetting,
    resetAllSettings,
    applyAllSuggested,
    getSettingsForCategory
  };
}