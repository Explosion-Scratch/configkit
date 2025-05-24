<template>
    <div :class="containerClass">
        <div class="text-center space-y-6">
            <!-- Icon/Illustration -->
            <div class="flex justify-center">
                <div
                    v-if="variant === 'search'"
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                <div
                    v-else-if="variant === 'category'"
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>

                <div
                    v-else-if="variant === 'settings'"
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"
                >
                    <Icon name="settings" size="lg" class="text-gray-400" />
                </div>

                <div
                    v-else-if="variant === 'presets'"
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>
                </div>

                <div
                    v-else
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
            </div>

            <!-- Title -->
            <div class="space-y-2">
                <h3 class="text-lg font-medium text-gray-900">
                    {{ title }}
                </h3>
                <p
                    class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed"
                >
                    {{ description }}
                </p>
            </div>

            <!-- Actions -->
            <div
                v-if="showActions"
                class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
            >
                <button
                    v-if="primaryAction"
                    @click="handlePrimaryAction"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md transition-colors"
                >
                    <Icon
                        v-if="primaryActionIcon"
                        :name="primaryActionIcon"
                        size="sm"
                        class="mr-2"
                    />
                    {{ primaryAction }}
                </button>

                <button
                    v-if="secondaryAction"
                    @click="handleSecondaryAction"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                >
                    <Icon
                        v-if="secondaryActionIcon"
                        :name="secondaryActionIcon"
                        size="sm"
                        class="mr-2"
                    />
                    {{ secondaryAction }}
                </button>
            </div>

            <!-- Custom Actions Slot -->
            <div v-if="$slots.actions" class="pt-2">
                <slot name="actions" />
            </div>

            <!-- Tips or additional info -->
            <div v-if="tip" class="pt-4 border-t border-gray-100">
                <p class="text-xs text-gray-500">💡 {{ tip }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
    variant: {
        type: String,
        default: "default",
        validator: (value) =>
            [
                "default",
                "search",
                "category",
                "settings",
                "presets",
                "custom",
            ].includes(value),
    },
    title: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    primaryAction: {
        type: String,
        default: "",
    },
    primaryActionIcon: {
        type: String,
        default: "",
    },
    secondaryAction: {
        type: String,
        default: "",
    },
    secondaryActionIcon: {
        type: String,
        default: "",
    },
    tip: {
        type: String,
        default: "",
    },
    size: {
        type: String,
        default: "medium",
        validator: (value) => ["small", "medium", "large"].includes(value),
    },
    showActions: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["primary-action", "secondary-action"]);

const containerClass = computed(() => {
    const baseClasses = "empty-state";

    switch (props.size) {
        case "small":
            return `${baseClasses} py-8 px-4`;
        case "medium":
            return `${baseClasses} py-12 px-6`;
        case "large":
            return `${baseClasses} py-16 px-8`;
        default:
            return `${baseClasses} py-12 px-6`;
    }
});

// Provide default content based on variant
const title = computed(() => {
    if (props.title) return props.title;

    switch (props.variant) {
        case "search":
            return "No results found";
        case "category":
            return "No settings in this category";
        case "settings":
            return "No settings available";
        case "presets":
            return "No presets available";
        default:
            return "Nothing here yet";
    }
});

const description = computed(() => {
    if (props.description) return props.description;

    switch (props.variant) {
        case "search":
            return "Try adjusting your search terms or browse categories to find what you're looking for.";
        case "category":
            return "This category doesn't contain any settings that match your current filters.";
        case "settings":
            return "Settings are still loading or there was an issue fetching them.";
        case "presets":
            return "Presets help you quickly apply common configurations. Check back later for curated presets.";
        default:
            return "There's nothing to display right now.";
    }
});

const handlePrimaryAction = () => {
    emit("primary-action");
};

const handleSecondaryAction = () => {
    emit("secondary-action");
};
</script>

<style scoped>
@import "../../style.css";

.empty-state {
    @apply w-full flex items-center justify-center min-h-[300px];
}

/* Focus styles for accessibility */
button:focus {
    @apply outline-none;
}

/* Subtle animation for the icon */
.empty-state svg {
    transition: transform 0.2s ease-in-out;
}

.empty-state:hover svg {
    transform: scale(1.05);
}
</style>
