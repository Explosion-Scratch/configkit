<template>
    <div :class="containerClass">
        <div class="text-center space-y-4">
            <!-- Error Icon -->
            <div class="flex justify-center">
                <div
                    class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
            </div>

            <!-- Error Title -->
            <h3 class="text-lg font-medium text-gray-900">
                {{ title }}
            </h3>

            <!-- Error Message -->
            <div class="space-y-2">
                <p class="text-sm text-gray-600">
                    {{ message }}
                </p>

                <!-- Technical Details (collapsible) -->
                <div v-if="error && showDetails" class="mt-4">
                    <button
                        @click="showTechnicalDetails = !showTechnicalDetails"
                        class="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none"
                    >
                        {{ showTechnicalDetails ? "Hide" : "Show" }} technical
                        details
                    </button>

                    <div
                        v-if="showTechnicalDetails"
                        class="mt-2 p-3 bg-gray-50 rounded-md text-left"
                    >
                        <pre
                            class="text-xs text-gray-700 whitespace-pre-wrap"
                            >{{ errorDetails }}</pre
                        >
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div
                class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
            >
                <button
                    v-if="showRetry"
                    @click="handleRetry"
                    :disabled="isRetrying"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg
                        v-if="isRetrying"
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <Icon v-else name="reset" size="sm" class="mr-2" />
                    {{ isRetrying ? "Retrying..." : retryText }}
                </button>

                <button
                    v-if="showHome"
                    @click="handleGoHome"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                >
                    Go to Home
                </button>

                <button
                    v-if="showReload"
                    @click="handleReload"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                >
                    Reload Page
                </button>
            </div>

            <!-- Additional Actions Slot -->
            <div v-if="$slots.actions" class="pt-2">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
    title: {
        type: String,
        default: "Something went wrong",
    },
    message: {
        type: String,
        default: "An unexpected error occurred. Please try again.",
    },
    error: {
        type: [Error, String, Object],
        default: null,
    },
    showRetry: {
        type: Boolean,
        default: true,
    },
    showHome: {
        type: Boolean,
        default: false,
    },
    showReload: {
        type: Boolean,
        default: false,
    },
    showDetails: {
        type: Boolean,
        default: true,
    },
    retryText: {
        type: String,
        default: "Try Again",
    },
    size: {
        type: String,
        default: "medium",
        validator: (value) =>
            ["small", "medium", "large", "fullscreen"].includes(value),
    },
});

const emit = defineEmits(["retry", "go-home", "reload"]);

const isRetrying = ref(false);
const showTechnicalDetails = ref(false);

const containerClass = computed(() => {
    const baseClasses = "error-state";

    switch (props.size) {
        case "small":
            return `${baseClasses} p-4`;
        case "medium":
            return `${baseClasses} p-8`;
        case "large":
            return `${baseClasses} p-12`;
        case "fullscreen":
            return `${baseClasses} min-h-[50vh] flex items-center justify-center p-8`;
        default:
            return `${baseClasses} p-8`;
    }
});

const errorDetails = computed(() => {
    if (!props.error) return "";

    if (props.error instanceof Error) {
        return `${props.error.name}: ${props.error.message}\n\nStack trace:\n${props.error.stack}`;
    }

    if (typeof props.error === "string") {
        return props.error;
    }

    try {
        return JSON.stringify(props.error, null, 2);
    } catch {
        return String(props.error);
    }
});

const handleRetry = async () => {
    isRetrying.value = true;
    try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX
        emit("retry");
    } finally {
        isRetrying.value = false;
    }
};

const handleGoHome = () => {
    emit("go-home");
};

const handleReload = () => {
    window.location.reload();
};
</script>

<style scoped>
@import "../../style.css";

.error-state {
    @apply w-full;
}

/* Focus styles for accessibility */
button:focus {
    @apply outline-none;
}

/* Animation for retry button */
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
