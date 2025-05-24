<template>
    <AppLayout
        :page-title="pageTitle"
        :show-floating-action="showFloatingAction"
    >
        <template #sidebar>
            <Sidebar
                :categories="categories"
                :filtered-settings="filteredSettings"
                :selected-category="selectedCategory"
                :search-term="searchTerm"
                :applied-presets-count="appliedPresets.length"
                @select-category="selectCategory"
                @update:search-term="updateSearchTerm"
            />
        </template>

        <template #main>
            <LoadingState
                v-if="isLoading"
                variant="skeleton"
                size="fullscreen"
                message="Loading settings..."
                :skeleton-count="8"
            />

            <ErrorState
                v-else-if="error"
                title="Failed to load settings"
                message="There was a problem loading the configuration settings. Please check your connection and try again."
                :error="error"
                size="fullscreen"
                @retry="loadSettings"
            />

            <HomeScreen
                v-else-if="selectedCategory === 'Home'"
                :total-settings="allSettings.length"
                @explore-settings="selectCategory('Activity Monitor')"
            />

            <PresetsView
                v-else-if="selectedCategory === 'Presets'"
                :presets="availablePresets"
                :applied-preset-ids="appliedPresets"
                :is-loading="presetsLoading"
                :error="presetsError"
                @apply-preset="handleApplyPreset"
                @revert-preset="handleRevertPreset"
                @view-preset="handleViewPreset"
                @visit-url="handleVisitUrl"
                @retry="loadPresets"
            />

            <div
                v-else-if="currentCategorySettings.length === 0"
                class="flex-1"
            >
                <EmptyState
                    variant="category"
                    :title="`No settings found in ${selectedCategory}`"
                    description="This category might be empty or no settings match your current search term."
                    primary-action="Clear Search"
                    secondary-action="Browse All Categories"
                    @primary-action="updateSearchTerm('')"
                    @secondary-action="selectCategory('Home')"
                />
            </div>

            <div v-else class="flex-1">
                <!-- Settings Toolbar -->
                <div class="bg-white border-b border-gray-200 px-6 py-4">
                    <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div>
                            <h1
                                class="text-2xl font-semibold text-text-primary"
                            >
                                {{ selectedCategory }} Settings
                            </h1>
                            <p
                                v-if="categoryDescription"
                                class="text-xs text-gray-500 mt-1"
                            >
                                {{ categoryDescription }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">
                                {{ currentCategorySettings.length }} settings
                                <template v-if="filteredChangedCount > 0">
                                    • {{ filteredChangedCount }} configured
                                </template>
                            </span>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex flex-wrap items-center gap-2 mt-4">
                        <Button
                            v-if="filteredApplyCount > 0"
                            variant="primary"
                            @click="handleApplyAllSuggested"
                        >
                            Apply {{ filteredApplyCount }} Suggested
                        </Button>

                        <Button
                            v-if="changedSettingsCount > 0"
                            @click="handleGenerateScript"
                        >
                            Generate Script ({{ changedSettingsCount }})
                        </Button>

                        <Button
                            v-if="changedSettingsCount > 0"
                            @click="handleResetAll"
                        >
                            Reset All
                        </Button>
                    </div>
                </div>

                <!-- Settings List -->
                <div class="p-6">
                    <SettingsCategory
                        :category-name="selectedCategory"
                        :category-description="categoryDescription"
                        :settings="currentCategorySettings"
                        :selected-settings="selectedSettings"
                        :presets="availablePresets"
                        :get-preset-value-frequency="getPresetValueFrequency"
                        :get-setting-origins="getSettingOrigins"
                        @update-setting="updateSetting"
                        @revert-preset="handleRevertPreset"
                    />
                </div>
            </div>
        </template>

        <template #floating-action>
            <Button
                v-if="changedSettingsCount > 0"
                variant="primary"
                size="large"
                @click="handleGenerateScript"
                class="shadow-lg"
            >
                Generate ({{ changedSettingsCount }})
            </Button>
        </template>
    </AppLayout>

    <!-- Script Generation Modal -->
    <GeneratedScriptModal
        :show="showScriptModal"
        :script-content="generatedScript"
        :restart-actions="restartActions"
        @close="showScriptModal = false"
    />

    <!-- Preset Detail Modal -->
    <PresetDetail
        :show="showPresetDetail"
        :preset="selectedPreset"
        :is-applied="
            selectedPreset ? appliedPresets.includes(selectedPreset.id) : false
        "
        :conflicts="
            selectedPreset
                ? getConflictingSettings(selectedPreset.id, selectedSettings)
                : []
        "
        @close="showPresetDetail = false"
        @apply-preset="handleApplyPreset"
        @revert-preset="handleRevertPreset"
    />

    <!-- Confirmation Modal -->
    <ConfirmModal
        :show="showConfirmModal"
        :title="
            selectedPreset && appliedPresets.includes(selectedPreset.id)
                ? 'Revert Preset'
                : 'Apply Preset'
        "
        :message="
            selectedPreset && appliedPresets.includes(selectedPreset.id)
                ? `Are you sure you want to revert the '${selectedPreset?.title}' preset? This will remove its applied settings.`
                : `Are you sure you want to apply the '${selectedPreset?.title}' preset? This will modify ${selectedPreset?.settingsCount || 0} settings.`
        "
        :variant="
            selectedPreset && appliedPresets.includes(selectedPreset.id)
                ? 'warning'
                : 'primary'
        "
        :confirm-text="
            selectedPreset && appliedPresets.includes(selectedPreset.id)
                ? 'Revert'
                : 'Apply'
        "
        @confirm="handleConfirmAction"
        @cancel="closeConfirmModal"
    >
        <template
            #details
            v-if="selectedPreset && !appliedPresets.includes(selectedPreset.id)"
        >
            <div
                v-if="
                    getConflictingSettings(selectedPreset.id, selectedSettings)
                        .length > 0
                "
            >
                <p class="text-sm font-medium text-gray-900 mb-2">
                    Settings that will be overridden:
                </p>
                <ul class="text-sm text-gray-600 space-y-1">
                    <li
                        v-for="conflict in getConflictingSettings(
                            selectedPreset.id,
                            selectedSettings,
                        ).slice(0, 3)"
                        :key="conflict.settingId"
                    >
                        • {{ conflict.settingId }}
                    </li>
                    <li
                        v-if="
                            getConflictingSettings(
                                selectedPreset.id,
                                selectedSettings,
                            ).length > 3
                        "
                        class="text-gray-500"
                    >
                        ... and
                        {{
                            getConflictingSettings(
                                selectedPreset.id,
                                selectedSettings,
                            ).length - 3
                        }}
                        more
                    </li>
                </ul>
            </div>
        </template>
    </ConfirmModal>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Components
import AppLayout from "./components/layout/AppLayout.vue";
import LoadingState from "./components/layout/LoadingState.vue";
import ErrorState from "./components/layout/ErrorState.vue";
import EmptyState from "./components/layout/EmptyState.vue";
import Sidebar from "./components/Sidebar.vue";
import HomeScreen from "./components/HomeScreen.vue";
import SettingsCategory from "./components/SettingsCategory.vue";
import Button from "./components/Button.vue";
import GeneratedScriptModal from "./components/GeneratedScriptModal.vue";
import PresetsView from "./components/presets/PresetsView.vue";
import PresetDetail from "./components/presets/PresetDetail.vue";
import ConfirmModal from "./components/presets/ConfirmModal.vue";

// Composables
import { useSettings } from "./composables/useSettings.js";
import { useCategories } from "./composables/useCategories.js";
import { useScriptGeneration } from "./composables/useScriptGeneration.js";
import { usePresets } from "./composables/usePresets.js";

// Settings management
const {
    allSettings,
    selectedSettings,
    isLoading,
    error,
    changedSettingsCount,
    filteredApplyCount,
    filteredChangedCount,
    loadSettings,
    updateSetting,
    resetAllSettings,
    applyAllSuggested,
} = useSettings();

// Category and filtering
const {
    selectedCategory,
    searchTerm,
    categories,
    filteredSettings,
    currentCategorySettings,
    selectCategory,
    updateSearchTerm,
    getCategoryDescription,
} = useCategories(allSettings);

// Script generation
const { isGenerating, generatedScript, restartActions, generateScript } =
    useScriptGeneration();

// Presets management
const {
    presets,
    appliedPresets,
    availablePresets,
    isLoading: presetsLoading,
    error: presetsError,
    loadPresets,
    applyPreset,
    revertPreset,
    getConflictingSettings,
    getSettingOrigins,
    getPresetValueFrequency,
} = usePresets();

// UI state
const showScriptModal = ref(false);
const showPresetDetail = ref(false);
const showConfirmModal = ref(false);
const selectedPreset = ref(null);
const confirmAction = ref(null);

// Computed properties
const pageTitle = computed(() => {
    if (selectedCategory.value === "Home") return "macOS Defaults";
    return `${selectedCategory.value} Settings`;
});

const showFloatingAction = computed(() => {
    return changedSettingsCount.value > 0 && selectedCategory.value !== "Home";
});

const categoryDescription = computed(() => {
    if (selectedCategory.value === "Home") return "";
    return getCategoryDescription(selectedCategory.value);
});

// Event handlers
const handleApplyAllSuggested = async () => {
    const count = applyAllSuggested();
    if (count > 0) {
        // Could add a toast notification here
        console.log(`Applied ${count} suggested settings`);
    }
};

const handleGenerateScript = async () => {
    await generateScript(selectedSettings.value, allSettings.value);
    if (generatedScript.value) {
        showScriptModal.value = true;
    }
};

const handleResetAll = () => {
    if (
        confirm(`Reset all ${changedSettingsCount.value} configured settings?`)
    ) {
        resetAllSettings();
    }
};

// Preset event handlers
const handleApplyPreset = async (presetId) => {
    const preset = availablePresets.value.find((p) => p.id === presetId);
    if (!preset) return;

    const conflicts = getConflictingSettings(presetId, selectedSettings.value);

    if (conflicts.length > 0) {
        selectedPreset.value = preset;
        confirmAction.value = () => applyPresetConfirmed(presetId);
        showConfirmModal.value = true;
    } else {
        await applyPresetConfirmed(presetId);
    }
};

const applyPresetConfirmed = async (presetId) => {
    try {
        const result = await applyPreset(presetId, allSettings.value);

        // Update selected settings with preset values
        const newSettings = {
            ...selectedSettings.value,
            ...result.validSettings,
        };
        updateSetting(newSettings);

        console.log(`Applied preset with ${result.settingsApplied} settings`);
    } catch (err) {
        console.error("Failed to apply preset:", err);
    }
};

const handleRevertPreset = (presetId) => {
    selectedPreset.value = availablePresets.value.find(
        (p) => p.id === presetId,
    );
    confirmAction.value = () => revertPresetConfirmed(presetId);
    showConfirmModal.value = true;
};

const revertPresetConfirmed = (presetId) => {
    const success = revertPreset(presetId);
    if (success) {
        console.log(`Reverted preset: ${presetId}`);
    }
};

const handleViewPreset = (preset) => {
    selectedPreset.value = preset;
    showPresetDetail.value = true;
};

const handleVisitUrl = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
};

const closeConfirmModal = () => {
    showConfirmModal.value = false;
    selectedPreset.value = null;
    confirmAction.value = null;
};

const handleConfirmAction = () => {
    if (confirmAction.value) {
        confirmAction.value();
        closeConfirmModal();
    }
};

// Initialize app
onMounted(async () => {
    await Promise.all([loadSettings(), loadPresets()]);
});
</script>

<style>
@import "./style.css";

html,
body,
#app {
    height: 100%;
    margin: 0;
    padding: 0;
}

body {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    @apply lg:bg-gradient-to-bl lg:from-accent-300 lg:to-accent-700 lg:overflow-hidden;
}

#app {
    height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
