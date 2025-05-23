<template>
    <div
        class="app-container relative flex flex-col text-text-primary group/design-root overflow-x-hidden"
    >
        <div class="layout-container flex h-full grow flex-col">
            <main class="flex-1 flex h-full">
                <Sidebar
                    :categories="filteredCategories"
                    :selectedCategory="selectedCategory"
                    :filteredSettings="shownGrouped"
                    v-model:searchTerm="searchTerm"
                    @selectCategory="selectCategory"
                />
                <div
                    class="bg-page-bg flex-1 pl-6 p-4 macos-scrollbar overflow-y-auto shadow-sm"
                >
                    <div class="max-w-2xl min-h-full mx-auto">
                        <template
                            v-if="
                                (!selectedCategory && !searchTerm) ||
                                selectedCategory === 'Home'
                            "
                        >
                            <HomeScreen
                                @exploreSettings="
                                    () => (selectedCategory = 'Desktop')
                                "
                                :totalSettings="allSettings.length"
                            />
                        </template>
                        <div
                            v-else-if="
                                currentCategorySettings.length > 0 ||
                                (searchTerm && filteredSettings.length > 0)
                            "
                        >
                            <div class="flex flex-col gap-1 mb-6">
                                <h1
                                    class="text-lg font-semibold text-text-primary"
                                >
                                    {{
                                        selectedCategory
                                            ? `${selectedCategory} Settings`
                                            : searchTerm
                                              ? `Search Results for "${searchTerm}"`
                                              : "All Settings"
                                    }}
                                </h1>
                                <p
                                    v-if="
                                        selectedCategory &&
                                        getCategoryDescription(selectedCategory)
                                    "
                                    class="text-xs text-gray-500"
                                >
                                    {{
                                        getCategoryDescription(selectedCategory)
                                    }}
                                </p>
                                <p
                                    v-else-if="searchTerm"
                                    class="text-xs text-gray-500"
                                >
                                    {{ filteredSettings.length }} setting(s)
                                    found.
                                </p>
                            </div>

                            <div class="mb-6 flex items-center gap-2">
                                <Button
                                    @click="applyAllSuggested"
                                    title="Apply all suggested values for visible settings"
                                    class="gap-2"
                                >
                                    <Icon name="wand" size="xs" />
                                    Use {{ filteredApplyCount }} suggested
                                </Button>
                                <Button
                                    @click="resetAllToUnset"
                                    title="Reset all visible settings to unset"
                                    class="gap-2"
                                >
                                    <Icon name="reset" size="xs" />
                                    Reset
                                    {{ filteredChangedCount }}
                                    settings
                                </Button>
                            </div>

                            <div class="space-y-5">
                                <template
                                    v-if="searchTerm && !selectedCategory"
                                >
                                    <div
                                        v-for="(
                                            group, categoryName
                                        ) in groupedFilteredSettings"
                                        :key="categoryName"
                                        class="mb-8"
                                    >
                                        <h2
                                            class="text-lg font-medium text-gray-800 mb-3 sticky -top-6 bg-gradient-to-b from-page-bg from-70% to-transparent py-3 r-0 l-0 z-10 -mx-3"
                                        >
                                            {{ categoryName }}
                                        </h2>
                                        <div class="space-y-5">
                                            <SettingItem
                                                v-for="setting in group"
                                                :key="`${setting.domain}-${setting.key}`"
                                                :setting="setting"
                                                :initialValue="
                                                    selectedSettings[
                                                        `${setting.domain}.${setting.key}`
                                                    ]
                                                "
                                                @updateSetting="
                                                    handleUpdateSetting
                                                "
                                            />
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <SettingItem
                                        v-for="setting in currentCategorySettings"
                                        :key="`${setting.domain}-${setting.key}`"
                                        :setting="setting"
                                        :initialValue="
                                            selectedSettings[
                                                `${setting.domain}.${setting.key}`
                                            ]
                                        "
                                        @updateSetting="handleUpdateSetting"
                                    />
                                </template>
                            </div>
                        </div>
                        <div
                            v-else-if="isLoading"
                            class="flex items-center justify-center h-full"
                        >
                            <p>Loading settings...</p>
                        </div>
                        <div
                            v-else-if="
                                searchTerm &&
                                filteredSettings.length === 0 &&
                                !selectedCategory
                            "
                            class="flex justify-center items-center h-full text-xs text-text-primary/80"
                        >
                            <p>
                                No settings found for "{{ searchTerm }}". Try a
                                different search?
                            </p>
                        </div>
                        <div
                            v-else-if="
                                selectedCategory &&
                                currentCategorySettings.length === 0
                            "
                            class="flex items-center justify-center h-full"
                        >
                            <p>
                                No settings available in the "{{
                                    selectedCategory
                                }}" category for your current search/filters.
                            </p>
                        </div>

                        <div
                            v-if="showButton"
                            class="flex justify-end py-4 sticky -bottom-6 px-5 -mx-3 bg-gradient-to-b to-page-bg to-75% from-transparent z-10"
                        >
                            <Button class="gap-1" @click="generateScript">
                                <Icon name="wand" />
                                Generate with
                                {{ changedSettingsCount }} settings
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <GeneratedScriptModal
            :show="showScriptModal"
            :scriptContent="generatedScriptContent"
            :restartActions="generatedRestartActions"
            @close="showScriptModal = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Sidebar from "./components/Sidebar.vue";
import HomeScreen from "./components/HomeScreen.vue";
import Button from "./components/Button.vue";
import SettingsCategory from "./components/SettingsCategory.vue";
import SettingItem from "./components/SettingItem.vue";
import GeneratedScriptModal from "./components/GeneratedScriptModal.vue";
import Icon from "./components/Icon.vue"; // Import Icon component

const MAX_COUNT_FOR_CATEGORY = 5;
const LOCAL_STORAGE_KEY = "macos-config-settings"; // Key for localStorage

const allSettings = ref([]);
const categories = ref([]);
const selectedCategory = ref("Home");
const searchTerm = ref("");
const selectedSettings = ref({}); // This will hold the state to save/restore
const isLoading = ref(true);

const showScriptModal = ref(false);
const generatedScriptContent = ref("");
const generatedRestartActions = ref([]);

const showButton = computed(() => {
    return (
        // Some settings have been changed and settings exist
        changedSettingsCount.value > 0 &&
        allSettings.value.length > 0 &&
        // If we're searching or not on home
        (selectedCategory.value || searchTerm.value) &&
        selectedCategory.value !== "Home" &&
        !(
            // No search results
            (
                searchTerm.value &&
                filteredSettings.value.length === 0 &&
                !selectedCategory.value
            )
        )
    );
});

onMounted(async () => {
    try {
        const response = await fetch("/flags.json");
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Count settings per category
        const categoryCount = {};
        data.forEach((setting) => {
            categoryCount[setting.category] =
                (categoryCount[setting.category] || 0) + 1;
        });

        // Process settings and move small categories to "Others"
        const processedData = data.map((setting) => {
            const clone = { ...setting };
            // If category has fewer than MAX_COUNT_FOR_CATEGORY items, move to "Others"
            if (categoryCount[setting.category] < MAX_COUNT_FOR_CATEGORY) {
                // Prepend category to title
                clone.title = `${setting.category}: ${setting.title}`;
                // Change category to "Others"
                clone.category = "Others";
                // Store original domain if different for script generation
                if (setting.category !== "Others") {
                    clone.originalDomain = setting.domain;
                }
            } else {
                // Ensure originalDomain is not present if not moved
                delete clone.originalDomain;
            }

            return clone;
        });

        allSettings.value = processedData;

        const uniqueCategories = new Set(processedData.map((s) => s.category));
        categories.value = Array.from(uniqueCategories).sort();

        // Restore settings from localStorage
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSettings) {
            try {
                selectedSettings.value = JSON.parse(savedSettings);
            } catch (e) {
                console.error("Failed to parse settings from localStorage:", e);
                // Clear invalid data if parsing fails
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        }
        // If no saved settings, selectedSettings remains the initial empty object.
    } catch (error) {
        console.error("Failed to load settings:", error);
    } finally {
        isLoading.value = false;
    }
});

// Watch for changes in selectedSettings and save to localStorage
watch(
    selectedSettings,
    (newValue) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
        } catch (e) {
            console.error("Failed to save settings to localStorage:", e);
        }
    },
    { deep: true },
); // Use deep: true to watch for changes inside the object

const activeViewSettings = computed(() => {
    // If a category is selected (and it's not the Home screen), show settings for that category (already filtered by search if search is also active)
    if (selectedCategory.value && selectedCategory.value !== "Home") {
        return currentCategorySettings.value;
    }
    // If a search term is active AND no category is selected, show all filtered settings
    else if (!selectedCategory.value && searchTerm.value.trim()) {
        return filteredSettings.value;
    }
    // Otherwise (Home screen, or no search/category selected), the list is empty for these counts/buttons
    else {
        return [];
    }
});

const shownGrouped = computed(() => {
    if (searchTerm.value && !selectedCategory.value) {
        return groupedFilteredSettings.value;
    }
    const grouped = {};
    for (let i of allSettings.value) {
        grouped[i.category] = grouped[i.category] || [];
        grouped[i.category].push(i);
    }
    return grouped;
});

// Count of visible settings that have a suggestedValue
const filteredApplyCount = computed(() => {
    return activeViewSettings.value.filter(
        (setting) => setting.suggestedValue !== null,
    ).length;
});

// Count of visible settings that the user has changed (present in selectedSettings)
const filteredChangedCount = computed(() => {
    return activeViewSettings.value.filter((setting) => {
        const settingId = `${setting.originalDomain || setting.domain}.${setting.key}`;
        // Check if the setting ID exists in the selectedSettings object.
        // If it exists, it means the user has interacted with it,
        // either by setting a value or explicitly resetting it to undefined.
        return selectedSettings.value.hasOwnProperty(settingId);
    }).length;
});

const filteredSettings = computed(() => {
    if (!searchTerm.value.trim()) return allSettings.value;
    const lower = searchTerm.value.toLowerCase();
    return allSettings.value.filter(
        (s) =>
            s.title.toLowerCase().includes(lower) ||
            s.description?.toLowerCase().includes(lower) ||
            s.key.toLowerCase().includes(lower) ||
            s.domain.toLowerCase().includes(lower) ||
            s.category.toLowerCase().includes(lower),
    );
});

const filteredCategories = computed(() => {
    if (!searchTerm.value.trim()) return categories.value;
    const relevant = new Set(filteredSettings.value.map((s) => s.category));
    return categories.value.filter((cat) => relevant.has(cat));
});

const currentCategorySettings = computed(() => {
    if (searchTerm.value.trim() && !selectedCategory.value) {
        return []; // Show grouped search results instead
    }
    if (!selectedCategory.value) return [];
    return filteredSettings.value.filter(
        (s) => s.category === selectedCategory.value,
    );
});

const groupedFilteredSettings = computed(() => {
    if (!searchTerm.value.trim() || selectedCategory.value) {
        return {};
    }
    const grouped = {};
    // Sort filteredSettings alphabetically by category before grouping
    const sortedFilteredSettings = [...filteredSettings.value].sort((a, b) => {
        const categoryA = a.category.toLowerCase();
        const categoryB = b.category.toLowerCase();
        if (categoryA < categoryB) return -1;
        if (categoryA > categoryB) return 1;
        // Optional: secondary sort within category if needed
        // return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        return 0;
    });

    sortedFilteredSettings.forEach((setting) => {
        if (!grouped[setting.category]) {
            grouped[setting.category] = [];
        }
        grouped[setting.category].push(setting);
    });
    return grouped;
});

watch(searchTerm, (val) => {
    // If search term is active and the current category is no longer in the filtered list,
    // or if a category was selected and the search term is cleared, reset the category.
    if (
        (val.trim() &&
            selectedCategory.value &&
            !filteredCategories.value.includes(selectedCategory.value)) ||
        (!val.trim() && selectedCategory.value)
    ) {
        selectedCategory.value = null;
    }
});

function selectCategory(category) {
    selectedCategory.value = category;
    searchTerm.value = ""; // Clear search term when selecting a category
}

function getCategoryDescription(categoryName) {
    // Attempt to find a description in the data, or provide a default
    // This requires the flags.json to contain category descriptions or mapping
    // For now, keep the placeholder or fetch from a different source if available
    return `Settings related to ${categoryName}.`; // Placeholder
}

function handleUpdateSetting({ key, value }) {
    if (value === undefined) {
        // If undefined, it means "unset"
        delete selectedSettings.value[key];
    } else {
        selectedSettings.value[key] = value;
    }
    // The watch handler will save to localStorage
}

function applyAllSuggested() {
    // Determine which settings are currently visible/relevant based on category/search
    let settingsToUpdate = [];
    if (searchTerm.value.trim()) {
        settingsToUpdate = filteredSettings.value;
    } else if (selectedCategory.value) {
        settingsToUpdate = currentCategorySettings.value;
    } else {
        // If neither search nor category is selected, this button shouldn't typically be shown
        // or it would apply to ALL settings, which might be undesirable.
        // For now, handle this case by doing nothing or applying to all if needed.
        // Applying to visible is more intuitive. If home screen is shown, maybe only apply
        // to settings visible on the home screen, but none are currently.
        console.warn(
            "Apply All Suggested called without category or search context.",
        );
        return; // Do nothing if no category or search is active
    }

    settingsToUpdate.forEach((setting) => {
        // Only apply if a suggestedValue exists for the setting
        if (setting.suggestedValue !== null) {
            const settingId = `${setting.domain}.${setting.key}`;
            // Ensure the setting ID exists in allSettings before attempting to update
            const foundSetting = allSettings.value.find(
                (s) =>
                    `${s.domain}.${s.key}` === settingId ||
                    `${s.originalDomain || s.domain}.${s.key}` === settingId,
            );
            if (foundSetting) {
                handleUpdateSetting({
                    key: `${foundSetting.domain}.${foundSetting.key}`, // Use original domain/key for consistency if others was used
                    value: foundSetting.suggestedValue,
                });
            }
        }
    });
}

function resetAllToUnset() {
    // Determine which settings are currently visible/relevant based on category/search
    let settingsToUpdate = [];
    if (searchTerm.value.trim()) {
        settingsToUpdate = filteredSettings.value;
    } else if (selectedCategory.value) {
        settingsToUpdate = currentCategorySettings.value;
    } else {
        // If neither search nor category is selected, this button shouldn't typically be shown
        // or it would reset ALL settings, which might be undesirable.
        console.warn(
            "Reset All To Unset called without category or search context.",
        );
        return; // Do nothing if no category or search is active
    }

    settingsToUpdate.forEach((setting) => {
        const settingId = `${setting.domain}.${setting.key}`;
        // Ensure the setting ID exists in allSettings before attempting to update
        const foundSetting = allSettings.value.find(
            (s) =>
                `${s.domain}.${s.key}` === settingId ||
                `${s.originalDomain || s.domain}.${s.key}` === settingId,
        );
        if (foundSetting) {
            handleUpdateSetting({
                key: `${foundSetting.domain}.${foundSetting.key}`, // Use original domain/key for consistency if others was used
                value: undefined, // undefined signals unset
            });
        }
    });
}

const changedSettingsCount = computed(() => {
    return Object.keys(selectedSettings.value).length;
});

function generateScript() {
    let script = "#!/usr/bin/env bash\n\n";
    script +=
        "# macOS Configuration Script Generated by macOS Config Generator\n\n";
    script += "osascript -e 'tell application \"System Settings\" to quit'\n";
    script +=
        "osascript -e 'tell application \"System Preferences\" to quit' # Old name\n\n";
    script += "sudo -v\n";
    script +=
        'while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &\n\n';

    const commands = [];
    const restartActions = new Set();

    // Iterate over allSettings to maintain original order if desired,
    // but only write if the setting exists in selectedSettings
    allSettings.value.forEach((setting) => {
        const settingId = `${setting.domain}.${setting.key}`;
        // Check if the setting (using its potential original domain/key) exists in selectedSettings
        const userValue =
            selectedSettings.value[
                `${setting.originalDomain || setting.domain}.${setting.key}`
            ];

        if (userValue !== undefined) {
            // Check if value is explicitly set (not undefined)
            let valueToWrite = userValue;
            let typeFlag = `-${setting.parameterType}`;

            // Special handling for boolean types in defaults command
            if (setting.parameterType === "bool") {
                valueToWrite = userValue ? "true" : "false";
            } else if (setting.parameterType === "string") {
                // Escape double quotes in string values
                valueToWrite = `"${String(valueToWrite).replace(/"/g, '\\"')}"`;
            } else if (
                setting.parameterType === "array" ||
                setting.parameterType === "dict"
            ) {
                // Note: Generating defaults commands for complex types like array/dict
                // is complicated and often requires manual handling or specific flags
                // like -array-add, -dict-add etc. which are not universally applicable.
                // A simple `defaults write ... -array "item1" "item2"` might overwrite the whole array.
                // For this basic generator, we'll skip complex types and note them.
                commands.push(
                    `# SKIPPING COMPLEX TYPE (manual handling needed): ${setting.originalDomain || setting.domain} "${setting.key}" - Current Value: ${JSON.stringify(userValue)}`,
                );
                if (setting.requiresRestart)
                    // Still note restart action even if command is skipped
                    restartActions.add(setting.requiresRestart);
                return; // Skip generating the command for this setting
            }
            // For number/float, valueToWrite is already a number

            // Use originalDomain if exists (for "Others" category items moved from another domain)
            const domainToUse = setting.originalDomain || setting.domain;
            let command = `defaults write ${domainToUse} "${setting.key}" ${typeFlag} ${valueToWrite}`;
            if (setting.requiresSudo) {
                command = `sudo ${command}`;
            }
            commands.push(
                `# [${setting.category}] ${setting.title} - ${setting.description}`,
            );
            commands.push(command);
            commands.push(""); // Add a blank line after each command block
            if (setting.requiresRestart) {
                restartActions.add(setting.requiresRestart);
            }
        } else {
            // If the setting key exists in selectedSettings but its value is undefined,
            // it means it was explicitly reset to unset. We should generate a 'delete' command.
            const selectedSettingId = `${setting.originalDomain || setting.domain}.${setting.key}`;
            if (
                selectedSettings.value.hasOwnProperty(selectedSettingId) &&
                selectedSettings.value[selectedSettingId] === undefined
            ) {
                const domainToUse = setting.originalDomain || setting.domain;
                let command = `defaults delete ${domainToUse} "${setting.key}"`;
                if (setting.requiresSudo) {
                    command = `sudo ${command}`;
                }
                commands.push(
                    `# [${setting.category}] ${setting.title} - Resetting to Unset`,
                );
                commands.push(command);
                commands.push("");
                if (setting.requiresRestart) {
                    // Deleting might also require restart
                    restartActions.add(setting.requiresRestart);
                }
            }
            // If the key is not in selectedSettings at all, it was never touched or loaded initially,
            // so we do nothing, implying it remains at its system default.
        }
    });

    script += commands.join("\n") + "\n\n";

    if (restartActions.size > 0) {
        script += "# Restart affected applications/services\n";
        const killApps = new Set();
        const otherActions = [];
        restartActions.forEach((action) => {
            if (
                action &&
                (action.toLowerCase() === "mac" ||
                    action.toLowerCase() === "logout")
            ) {
                otherActions.push(action);
            } else if (action) {
                killApps.add(action);
            }
        });

        if (killApps.size > 0) {
            script += `for app in "${Array.from(killApps).join('" "')}"; do\n`;
            script += '  echo "Attempting to quit ${app}..."\n';
            script +=
                '  killall "${app}" >/dev/null 2>&1 || echo "  ${app} not running or could not be quit."\n';
            script += "done\n";
        }
        if (otherActions.length > 0) {
            script += "\n# The following manual actions are required:\n";
            otherActions.forEach((action) => {
                script += `# - Perform a ${action}\n`;
            });
        }
        script += "\n"; // Add blank line after restart actions
    }
    script += '\necho "macOS configuration script generated."\n';
    script +=
        'echo "Review the script before running. Some changes may require a logout, restart, or application relaunch to take full effect."\n';

    generatedScriptContent.value = script;
    generatedRestartActions.value = Array.from(restartActions).filter(Boolean);
    showScriptModal.value = true;
}
</script>

<style>
@import "./style.css";

html,
body,
#app {
    height: 100%;
    margin: 0;
}
.layout-container {
    display: flex;
    flex-direction: column;
}
main {
    display: flex;
    overflow: hidden;
}

body {
    @apply bg-gradient-to-bl from-accent-300 to-accent-700 overflow-hidden;
}

.app-container {
    @apply max-w-7xl mx-auto;
    @apply fixed inset-10 rounded-lg shadow-lg;
}
</style>
