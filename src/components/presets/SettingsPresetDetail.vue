<template>
    <div
        v-if="hasPresetData"
        class="preset-detail-section mt-3 pt-3 border-t border-gray-200"
    >
        <!-- Current preset indicator -->
        <div
            v-if="currentPreset"
            class="flex items-center justify-between mb-2"
        >
            <div class="flex items-center text-xs text-green-600">
                <Icon name="check" size="xs" class="mr-1" />
                <span class="font-medium"
                    >Set by {{ currentPreset.title }}</span
                >
            </div>
            <button
                @click="expanded = !expanded"
                class="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                {{ expanded ? "Hide" : "Show" }}
                {{ presetValues.length }} preset options
            </button>
        </div>

        <!-- Toggle button when no current preset -->
        <div
            v-else-if="presetValues.length > 0"
            class="flex items-center justify-between mb-2"
        >
            <span class="text-xs text-gray-600"
                >{{ presetValues.length }} preset value{{
                    presetValues.length > 1 ? "s" : ""
                }}
                available</span
            >
            <button
                @click="expanded = !expanded"
                class="text-xs text-accent-600 hover:text-accent-700 focus:outline-none font-medium"
            >
                {{ expanded ? "Hide" : "Show" }}
                {{ presetValues.length }} preset options
            </button>
        </div>

        <!-- Expanded preset details -->
        <div v-if="expanded" class="space-y-2">
            <!-- Preset value options -->
            <div v-if="presetValues.length > 0" class="space-y-1">
                <p class="text-xs font-medium text-gray-700 mb-1">
                    Preset Values:
                </p>
                <div class="space-y-1">
                    <div
                        v-for="presetValue in presetValues"
                        :key="JSON.stringify(presetValue.value)"
                        class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                    >
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-gray-900">{{
                                    formatValue(presetValue.value)
                                }}</span>
                                <span class="text-gray-500">
                                    ({{ presetValue.count }} preset{{
                                        presetValue.count > 1 ? "s" : ""
                                    }})
                                </span>
                            </div>
                            <div class="flex flex-wrap gap-1 mt-1">
                                <span
                                    v-for="presetId in presetValue.presets.slice(
                                        0,
                                        3,
                                    )"
                                    :key="presetId"
                                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-700"
                                >
                                    {{ getPresetTitle(presetId) }}
                                </span>
                                <span
                                    v-if="presetValue.presets.length > 3"
                                    class="text-xs text-gray-500"
                                >
                                    +{{ presetValue.presets.length - 3 }} more
                                </span>
                            </div>
                        </div>
                        <button
                            v-if="!isCurrentValue(presetValue.value)"
                            @click="
                                $emit('apply-preset-value', presetValue.value)
                            "
                            class="ml-2 px-2 py-1 text-xs font-medium text-accent-600 hover:text-accent-700 bg-white hover:bg-accent-50 border border-accent-200 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
                        >
                            Apply
                        </button>
                        <span
                            v-else
                            class="ml-2 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded"
                        >
                            Current
                        </span>
                    </div>
                </div>
            </div>

            <!-- Origins of current value -->
            <div
                v-if="settingOrigins.length > 0"
                class="pt-2 border-t border-gray-100"
            >
                <p class="text-xs font-medium text-gray-700 mb-1">
                    Applied by:
                </p>
                <div class="space-y-1">
                    <div
                        v-for="origin in settingOrigins"
                        :key="origin.presetId"
                        class="flex items-center justify-between text-xs"
                    >
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-900">{{
                                getPresetTitle(origin.presetId)
                            }}</span>
                            <span class="text-gray-500">{{
                                formatDate(origin.appliedAt)
                            }}</span>
                        </div>
                        <button
                            @click="$emit('revert-preset', origin.presetId)"
                            class="text-gray-500 hover:text-red-600 focus:outline-none"
                            title="Revert this preset"
                        >
                            <Icon name="reset" size="xs" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick actions -->
            <div
                v-if="presetValues.length > 0"
                class="pt-2 border-t border-gray-100"
            >
                <div class="flex items-center gap-2">
                    <button
                        v-if="
                            mostCommonValue &&
                            !isCurrentValue(mostCommonValue.value)
                        "
                        @click="
                            $emit('apply-preset-value', mostCommonValue.value)
                        "
                        class="text-xs font-medium text-accent-600 hover:text-accent-700 focus:outline-none"
                    >
                        Use most common ({{
                            formatValue(mostCommonValue.value)
                        }})
                    </button>
                    <button
                        v-if="currentValue !== undefined"
                        @click="$emit('reset-setting')"
                        class="text-xs font-medium text-gray-600 hover:text-gray-700 focus:outline-none"
                    >
                        Reset to unset
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
    settingId: {
        type: String,
        required: true,
    },
    currentValue: {
        type: [String, Number, Boolean, Array, Object],
        default: undefined,
    },
    presetValues: {
        type: Array,
        default: () => [],
    },
    settingOrigins: {
        type: Array,
        default: () => [],
    },
    presets: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits([
    "apply-preset-value",
    "revert-preset",
    "reset-setting",
]);

const expanded = ref(false);

const hasPresetData = computed(() => {
    return props.presetValues.length > 0 || props.settingOrigins.length > 0;
});

const currentPreset = computed(() => {
    if (props.settingOrigins.length === 0) return null;

    // Get the most recent preset that set this value
    const sortedOrigins = [...props.settingOrigins].sort(
        (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt),
    );

    const latestOrigin = sortedOrigins[0];
    return props.presets.find((preset) => preset.id === latestOrigin.presetId);
});

const mostCommonValue = computed(() => {
    if (props.presetValues.length === 0) return null;
    return props.presetValues[0]; // Already sorted by frequency
});

const formatValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string") return `"${value}"`;
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === "object") return "{...}";
    return String(value);
};

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return "just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    } catch {
        return "recently";
    }
};

const getPresetTitle = (presetId) => {
    const preset = props.presets.find((p) => p.id === presetId);
    return preset ? preset.title : presetId;
};

const isCurrentValue = (value) => {
    return JSON.stringify(props.currentValue) === JSON.stringify(value);
};
</script>

<style scoped>
/* Transition for expand/collapse */
.preset-detail-section {
    transition: all 0.2s ease-in-out;
}

/* Hover effects for interactive elements */
button:focus {
    outline: none;
}

/* Subtle animations */
.space-y-1 > * {
    transition: all 0.15s ease-in-out;
}

.space-y-1 > *:hover {
    transform: translateX(1px);
}
</style>
