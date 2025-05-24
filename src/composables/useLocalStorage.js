import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
  const storedValue = ref(defaultValue);
  const error = ref(null);

  const load = () => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        storedValue.value = parsed;
        return parsed;
      }
      return defaultValue;
    } catch (err) {
      console.warn(`Failed to load from localStorage (${key}):`, err);
      error.value = err;
      return defaultValue;
    }
  };

  const save = (value) => {
    try {
      const valueToStore = value !== undefined ? value : storedValue.value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      storedValue.value = valueToStore;
      error.value = null;
      return true;
    } catch (err) {
      console.error(`Failed to save to localStorage (${key}):`, err);
      error.value = err;
      return false;
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(key);
      storedValue.value = defaultValue;
      error.value = null;
      return true;
    } catch (err) {
      console.error(`Failed to clear localStorage (${key}):`, err);
      error.value = err;
      return false;
    }
  };

  const update = (newValue) => {
    storedValue.value = newValue;
    return save(newValue);
  };

  // Initialize with stored value
  load();

  // Watch for changes and auto-save
  watch(
    storedValue,
    (newValue) => {
      save(newValue);
    },
    { deep: true }
  );

  return {
    value: storedValue,
    error,
    save,
    load,
    clear,
    update
  };
}

export function usePersistedRef(key, defaultValue) {
  const { value, error, update } = useLocalStorage(key, defaultValue);
  
  return {
    value,
    error,
    update
  };
}