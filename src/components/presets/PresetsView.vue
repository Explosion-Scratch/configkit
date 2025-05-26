<template>
    <div class="presets-view">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-6">
            <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 class="text-2xl font-semibold text-text-primary">
                        Presets
                    </h1>
                    <p class="text-sm text-gray-600 mt-1">
                        Curated configurations to quickly apply common settings
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <div class="text-xs text-gray-500">
                        {{ availablePresets.length }} presets available
                        <template v-if="appliedPresetsCount > 0">
                            • {{ appliedPresetsCount }} applied
                        </template>
                    </div>
                </div>
            </div>

            <!-- Search and filters -->
            <div class="flex flex-col sm:flex-row gap-4 mt-6">
                <MacInput
                    v-model="searchTerm"
                    type="search"
                    placeholder="Search presets..."
                    class="w-full"
                />

                <div class="flex items-center gap-2">
                    <select v-model="selectedTag" class="macos-select">
                        <option value="">All categories</option>
                        <option
                            v-for="tag in availableTags"
                            :key="tag"
                            :value="tag"
                        >
                            {{ tag }}
                        </option>
                    </select>

                    <select v-model="sortBy" class="macos-select">
                        <option value="name">Sort by name</option>
                        <option value="date">Sort by date</option>
                        <option value="settings">Sort by settings count</option>
                        <option value="applied">Applied first</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 p-6">
            <LoadingState
                v-if="isLoading"
                variant="skeleton"
                message="Loading presets..."
                :skeleton-count="6"
                :show-header="false"
            />

            <ErrorState
                v-else-if="error"
                title="Failed to load presets"
                message="There was a problem loading the preset configurations. Please try again."
                :error="error"
                @retry="$emit('retry')"
            />

            <EmptyState
                v-else-if="filteredPresets.length === 0"
                variant="presets"
                :title="
                    searchTerm || selectedTag
                        ? 'No presets found'
                        : 'No presets available'
                "
                :description="
                    searchTerm || selectedTag
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Presets will appear here when available.'
                "
                :primary-action="
                    searchTerm || selectedTag ? 'Clear filters' : ''
                "
                @primary-action="clearFilters"
            />

            <div v-else>
                <!-- Applied presets section -->
                <div v-if="appliedPresets.length > 0" class="mb-8">
                    <h2
                        class="text-lg font-medium text-gray-900 mb-4 flex items-center"
                    >
                        <Icon
                            name="check"
                            size="sm"
                            class="text-green-600 mr-2"
                        />
                        Applied Presets ({{ appliedPresets.length }})
                    </h2>
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <PresetCard
                            v-for="preset in appliedPresets"
                            :key="`applied-${preset.id}`"
                            :preset="preset"
                            :is-applied="true"
                            @apply-preset="handleApplyPreset"
                            @revert-preset="handleRevertPreset"
                            @view-preset="handleViewPreset(preset)"
                            @visit-url="handleVisitUrl"
                        />
                    </div>
                    <hr class="my-8 border-gray-200" />
                </div>

                <!-- Available presets section -->
                <div>
                    <h2
                        v-if="appliedPresets.length > 0"
                        class="text-lg font-medium text-gray-900 mb-4"
                    >
                        Available Presets ({{ unappliedPresets.length }})
                    </h2>
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <PresetCard
                            v-for="preset in unappliedPresets"
                            :key="preset.id"
                            :preset="preset"
                            :is-applied="false"
                            @apply-preset="handleApplyPreset"
                            @revert-preset="handleRevertPreset"
                            @view-preset="handleViewPreset(preset)"
                            @visit-url="handleVisitUrl"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import PresetCard from "./PresetCard.vue";
import MacInput from "../MacInput.vue";
import LoadingState from "../layout/LoadingState.vue";
import ErrorState from "../layout/ErrorState.vue";
import EmptyState from "../layout/EmptyState.vue";
import Icon from "../Icon.vue";

const props = defineProps({
    presets: {
        type: Array,
        default: () => [],
    },
    appliedPresetIds: {
        type: Array,
        default: () => [],
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
    error: {
        type: [Error, String],
        default: null,
    },
});

const emit = defineEmits([
    "apply-preset",
    "revert-preset",
    "view-preset",
    "visit-url",
    "retry",
]);

// Local state
const searchTerm = ref("");
const selectedTag = ref("");
const sortBy = ref("name");

// Computed properties
const availableTags = computed(() => {
    const tags = new Set();
    props.presets.forEach((preset) => {
        if (preset.tags) {
            preset.tags.forEach((tag) => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
});

const filteredPresets = computed(() => {
    let filtered = props.presets;

    // Apply search filter
    if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase();
        filtered = filtered.filter(
            (preset) =>
                preset.title.toLowerCase().includes(search) ||
                preset.description.toLowerCase().includes(search) ||
                preset.author?.toLowerCase().includes(search) ||
                preset.tags?.some((tag) => tag.toLowerCase().includes(search)),
        );
    }

    // Apply tag filter
    if (selectedTag.value) {
        filtered = filtered.filter((preset) =>
            preset.tags?.includes(selectedTag.value),
        );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
        switch (sortBy.value) {
            case "date":
                return (
                    new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
                );
            case "settings":
                return (b.settingsCount || 0) - (a.settingsCount || 0);
            case "applied":
                const aApplied = props.appliedPresetIds.includes(a.id);
                const bApplied = props.appliedPresetIds.includes(b.id);
                if (aApplied && !bApplied) return -1;
                if (!aApplied && bApplied) return 1;
                return a.title.localeCompare(b.title);
            default: // name
                return a.title.localeCompare(b.title);
        }
    });
});

const appliedPresets = computed(() => {
    return filteredPresets.value.filter((preset) =>
        props.appliedPresetIds.includes(preset.id),
    );
});

const unappliedPresets = computed(() => {
    return filteredPresets.value.filter(
        (preset) => !props.appliedPresetIds.includes(preset.id),
    );
});

const availablePresets = computed(() => {
    return props.presets.filter((preset) => preset.settingsCount > 0);
});

const appliedPresetsCount = computed(() => {
    return props.appliedPresetIds.length;
});

// Methods
const clearFilters = () => {
    searchTerm.value = "";
    selectedTag.value = "";
};

const handleApplyPreset = (presetId) => {
    emit("apply-preset", presetId);
};

const handleRevertPreset = (presetId) => {
    emit("revert-preset", presetId);
};

const handleViewPreset = (preset) => {
    emit("view-preset", preset);
};

const handleVisitUrl = (url) => {
    emit("visit-url", url);
};
</script>

<style scoped>
.presets-view {
    @apply h-full flex flex-col;
}

/* Focus styles */
input:focus,
select:focus {
    @apply outline-none;
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
    .grid {
        @apply grid-cols-1;
    }
}

@media (min-width: 1024px) {
    .grid {
        @apply grid-cols-3;
    }
}
</style>
