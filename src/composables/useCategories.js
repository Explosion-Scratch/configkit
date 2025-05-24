import { ref, computed } from 'vue';
import { useLocalStorage } from './useLocalStorage.js';

export function useCategories(allSettings) {
  const selectedCategory = ref('Home');
  const searchTerm = ref('');
  const { value: lastSelectedCategory, update: saveLastCategory } = useLocalStorage('lastSelectedCategory', 'Home');

  // Initialize with last selected category
  selectedCategory.value = lastSelectedCategory.value;

  const selectCategory = (category) => {
    selectedCategory.value = category;
    saveLastCategory(category);
  };

  const updateSearchTerm = (term) => {
    searchTerm.value = term;
  };

  const categories = computed(() => {
    if (!allSettings.value || allSettings.value.length === 0) return [];
    const cats = [...new Set(allSettings.value.map(s => s.category))].sort();
    return cats.slice(0, 20); // MAX_COUNT_FOR_CATEGORY
  });

  const filteredSettings = computed(() => {
    if (!allSettings.value || allSettings.value.length === 0) return {};

    const filtered = {};
    const search = searchTerm.value.toLowerCase().trim();

    // Group settings by category
    allSettings.value.forEach(setting => {
      const category = setting.category;
      if (!filtered[category]) {
        filtered[category] = [];
      }

      // Apply search filter
      if (search === '' || 
          setting.title.toLowerCase().includes(search) ||
          setting.description?.toLowerCase().includes(search) ||
          setting.domain.toLowerCase().includes(search) ||
          setting.key.toLowerCase().includes(search)) {
        filtered[category].push(setting);
      }
    });

    // Remove empty categories
    Object.keys(filtered).forEach(category => {
      if (filtered[category].length === 0) {
        delete filtered[category];
      }
    });

    return filtered;
  });

  const filteredCategories = computed(() => {
    return Object.keys(filteredSettings.value).sort();
  });

  const currentCategorySettings = computed(() => {
    if (selectedCategory.value === 'Home') return [];
    return filteredSettings.value[selectedCategory.value] || [];
  });

  const groupedFilteredSettings = computed(() => {
    const settings = currentCategorySettings.value;
    if (!settings || settings.length === 0) return {};

    // Group by domain for better organization
    const grouped = {};
    settings.forEach(setting => {
      const domain = setting.domain;
      if (!grouped[domain]) {
        grouped[domain] = {
          domain,
          settings: []
        };
      }
      grouped[domain].settings.push(setting);
    });

    return grouped;
  });

  const getCategoryDescription = (category) => {
    const settingsInCategory = allSettings.value.filter(s => s.category === category);
    if (settingsInCategory.length === 0) return '';
    
    // Try to find a common description pattern or return a generic one
    const domains = [...new Set(settingsInCategory.map(s => s.domain))];
    if (domains.length === 1) {
      return `Configure ${category} settings for ${domains[0]}`;
    }
    return `Configure various ${category} settings and preferences`;
  };

  return {
    // State
    selectedCategory,
    searchTerm,
    
    // Computed
    categories,
    filteredSettings,
    filteredCategories,
    currentCategorySettings,
    groupedFilteredSettings,
    
    // Methods
    selectCategory,
    updateSearchTerm,
    getCategoryDescription
  };
}