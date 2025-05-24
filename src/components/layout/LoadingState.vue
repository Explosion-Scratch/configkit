<template>
    <div :class="containerClass">
        <div
            v-if="variant === 'spinner'"
            class="flex items-center justify-center"
        >
            <div class="flex items-center space-x-3">
                <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"
                ></div>
                <span v-if="message" class="text-sm text-gray-600">{{
                    message
                }}</span>
            </div>
        </div>

        <div v-else-if="variant === 'skeleton'" class="space-y-4">
            <div v-if="showHeader" class="space-y-3">
                <div
                    class="h-8 bg-gray-200 rounded-md animate-pulse w-1/3"
                ></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>

            <div class="space-y-3">
                <div v-for="i in skeletonCount" :key="i" class="skeleton-item">
                    <div class="flex items-start space-x-4">
                        <div
                            class="h-4 w-4 bg-gray-200 rounded animate-pulse flex-shrink-0 mt-1"
                        ></div>
                        <div class="flex-1 space-y-2">
                            <div
                                class="h-4 bg-gray-200 rounded animate-pulse w-3/4"
                            ></div>
                            <div
                                class="h-3 bg-gray-200 rounded animate-pulse w-1/2"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else-if="variant === 'dots'"
            class="flex items-center justify-center"
        >
            <div class="flex items-center space-x-2">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                    :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
                ></div>
                <span v-if="message" class="ml-3 text-sm text-gray-600">{{
                    message
                }}</span>
            </div>
        </div>

        <div
            v-else-if="variant === 'pulse'"
            class="flex items-center justify-center"
        >
            <div class="flex items-center space-x-3">
                <div
                    class="w-6 h-6 bg-accent-500 rounded-full animate-pulse"
                ></div>
                <span v-if="message" class="text-sm text-gray-600">{{
                    message
                }}</span>
            </div>
        </div>

        <div v-else class="flex items-center justify-center">
            <div class="text-center space-y-3">
                <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"
                ></div>
                <p v-if="message" class="text-sm text-gray-600">
                    {{ message }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    variant: {
        type: String,
        default: "spinner",
        validator: (value) =>
            ["spinner", "skeleton", "dots", "pulse"].includes(value),
    },
    message: {
        type: String,
        default: "",
    },
    skeletonCount: {
        type: Number,
        default: 5,
    },
    showHeader: {
        type: Boolean,
        default: true,
    },
    size: {
        type: String,
        default: "medium",
        validator: (value) =>
            ["small", "medium", "large", "fullscreen"].includes(value),
    },
});

const containerClass = computed(() => {
    const baseClasses = "loading-state";

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
</script>

<style scoped>
@import "../../style.css";

.loading-state {
    @apply w-full;
}

.skeleton-item {
    @apply p-4 bg-gray-50 rounded-lg border border-gray-100;
}

/* Custom animation delays for bouncing dots */
@keyframes bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

.animate-bounce {
    animation: bounce 1.4s infinite ease-in-out both;
}

/* Pulse animation for skeleton loading */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spinner animation */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
