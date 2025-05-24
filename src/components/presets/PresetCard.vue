<template>
    <div class="preset-card bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group">
        <div class="p-6">
            <!-- Header with title and status -->
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-medium text-gray-900 group-hover:text-accent-600 transition-colors cursor-pointer"
                        @click="$emit('view-preset')">
                        {{ preset.title }}
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span v-if="preset.author" class="text-xs text-gray-500">
                            by {{ preset.author }}
                        </span>
                        <div v-if="preset.tags && preset.tags.length > 0" class="flex gap-1">
                            <span
                                v-for="tag in preset.tags.slice(0, 2)"
                                :key="tag"
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                {{ tag }}
                            </span>
                            <span v-if="preset.tags.length > 2" class="text-xs text-gray-400">
                                +{{ preset.tags.length - 2 }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 ml-4">
                    <!-- Applied indicator -->
                    <div v-if="isApplied" class="flex items-center text-green-600">
                        <Icon name="check" size="sm" />
                        <span class="text-xs font-medium ml-1">Applied</span>
                    </div>
                    
                    <!-- Settings count -->
                    <div class="flex items-center text-gray-500">
                        <Icon name="settings" size="xs" />
                        <span class="text-xs font-medium ml-1">{{ preset.settingsCount || 0 }}</span>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 mb-4 line-clamp-2 cursor-pointer"
               @click="$emit('view-preset')">
                {{ preset.description }}
            </p>

            <!-- Last updated -->
            <div v-if="preset.lastUpdated" class="text-xs text-gray-400 mb-4">
                Updated {{ formatDate(preset.lastUpdated) }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                    <button
                        v-if="!isApplied"
                        @click="handleApply"
                        :disabled="isProcessing"
                        class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg v-if="isProcessing" class="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {{ isProcessing ? 'Applying...' : 'Apply' }}
                    </button>
                    
                    <button
                        v-else
                        @click="handleRevert"
                        class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                    >
                        <Icon name="reset" size="xs" class="mr-1" />
                        Revert
                    </button>
                </div>

                <div class="flex items-center gap-1">
                    <button
                        @click="$emit('view-preset')"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md transition-colors"
                        title="View details"
                    >
                        <Icon name="settings" size="xs" />
                        <span class="sr-only">View details</span>
                    </button>
                    
                    <button
                        v-if="preset.url"
                        @click="handleVisitUrl"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md transition-colors"
                        title="Visit repository"
                    >
                        <Icon name="github" size="xs" />
                        <span class="sr-only">Visit repository</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Hover effect overlay -->
        <div class="absolute inset-0 bg-accent-50 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-200 pointer-events-none"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps({
    preset: {
        type: Object,
        required: true
    },
    isApplied: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['apply-preset', 'revert-preset', 'view-preset', 'visit-url']);

const isProcessing = ref(false);

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'today';
        if (diffInDays === 1) return 'yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        
        return date.toLocaleDateString();
    } catch {
        return 'recently';
    }
};

const handleApply = async () => {
    isProcessing.value = true;
    try {
        emit('apply-preset', props.preset.id);
    } finally {
        // Reset processing state after a brief delay for UX
        setTimeout(() => {
            isProcessing.value = false;
        }, 500);
    }
};

const handleRevert = () => {
    emit('revert-preset', props.preset.id);
};

const handleVisitUrl = () => {
    if (props.preset.url) {
        emit('visit-url', props.preset.url);
        window.open(props.preset.url, '_blank', 'noopener,noreferrer');
    }
};
</script>

<style scoped>
.preset-card {
    position: relative;
    overflow: hidden;
}

/* Line clamp for description */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Focus styles */
button:focus {
    outline: none;
}

/* Hover animation for the entire card */
.preset-card:hover {
    transform: translateY(-1px);
}

/* Spinner animation */
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