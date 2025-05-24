<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        @click.self="$emit('close')"
    >
        <div
            class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
        >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <div class="flex-1 min-w-0">
                    <h2 class="text-xl font-semibold text-gray-900">{{ preset?.title }}</h2>
                    <div class="flex items-center gap-3 mt-2">
                        <span v-if="preset?.author" class="text-sm text-gray-600">
                            by {{ preset.author }}
                        </span>
                        <div v-if="preset?.tags?.length" class="flex gap-1">
                            <span
                                v-for="tag in preset.tags"
                                :key="tag"
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                {{ tag }}
                            </span>
                        </div>
                        <div v-if="isApplied" class="flex items-center text-green-600">
                            <Icon name="check" size="sm" />
                            <span class="text-sm font-medium ml-1">Applied</span>
                        </div>
                    </div>
                </div>
                <button
                    @click="$emit('close')"
                    class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-md p-1"
                >
                    <Icon name="close" size="md" />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
                <div class="p-6 space-y-6">
                    <!-- Description -->
                    <div>
                        <h3 class="text-sm font-medium text-gray-900 mb-2">Description</h3>
                        <p class="text-sm text-gray-600">{{ preset?.description }}</p>
                    </div>

                    <!-- Statistics -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center">
                                <Icon name="settings" size="sm" class="text-gray-400" />
                                <span class="ml-2 text-sm font-medium text-gray-900">Settings</span>
                            </div>
                            <p class="mt-1 text-2xl font-semibold text-gray-900">{{ preset?.settingsCount || 0 }}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="ml-2 text-sm font-medium text-gray-900">Updated</span>
                            </div>
                            <p class="mt-1 text-sm text-gray-600">{{ formatDate(preset?.lastUpdated) }}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span class="ml-2 text-sm font-medium text-gray-900">Domains</span>
                            </div>
                            <p class="mt-1 text-sm text-gray-600">{{ uniqueDomains.length }} apps</p>
                        </div>
                    </div>

                    <!-- Conflicts Warning -->
                    <div v-if="conflicts.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div class="ml-3">
                                <h4 class="text-sm font-medium text-yellow-800">Setting Conflicts</h4>
                                <p class="text-sm text-yellow-700 mt-1">
                                    This preset will override {{ conflicts.length }} of your current settings.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Breakdown -->
                    <div v-if="groupedSettings && Object.keys(groupedSettings).length > 0">
                        <h3 class="text-sm font-medium text-gray-900 mb-3">Settings Breakdown</h3>
                        <div class="space-y-4">
                            <div v-for="(domainSettings, domain) in groupedSettings" :key="domain" class="border border-gray-200 rounded-lg overflow-hidden">
                                <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                    <h4 class="text-sm font-medium text-gray-900">{{ domain }}</h4>
                                    <p class="text-xs text-gray-600">{{ domainSettings.length }} settings</p>
                                </div>
                                <div class="divide-y divide-gray-200">
                                    <div
                                        v-for="setting in domainSettings.slice(0, showAllSettings[domain] ? undefined : 3)"
                                        :key="setting.key"
                                        class="px-4 py-3"
                                    >
                                        <div class="flex items-center justify-between">
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium text-gray-900">{{ setting.key }}</p>
                                                <p class="text-xs text-gray-600">{{ formatValue(setting.value) }}</p>
                                            </div>
                                            <div v-if="conflicts.find(c => c.settingId === `${domain}.${setting.key}`)" class="ml-2">
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Conflict
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="domainSettings.length > 3" class="bg-gray-50 px-4 py-2">
                                    <button
                                        @click="toggleShowAll(domain)"
                                        class="text-xs text-accent-600 hover:text-accent-700 font-medium"
                                    >
                                        {{ showAllSettings[domain] ? 'Show less' : `Show ${domainSettings.length - 3} more` }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Raw Content -->
                    <div>
                        <h3 class="text-sm font-medium text-gray-900 mb-3">Raw Script Content</h3>
                        <div class="relative">
                            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono">{{ preset?.content || 'No content available' }}</pre>
                            <button
                                @click="copyContent"
                                class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded"
                                title="Copy to clipboard"
                            >
                                <Icon :name="copyButtonIcon" size="sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center gap-3">
                    <button
                        v-if="preset?.url"
                        @click="visitRepository"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                    >
                        <Icon name="github" size="sm" class="mr-2" />
                        View Repository
                    </button>
                </div>
                
                <div class="flex items-center gap-3">
                    <button
                        @click="$emit('close')"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                    >
                        Close
                    </button>
                    
                    <button
                        v-if="!isApplied"
                        @click="handleApply"
                        :disabled="isProcessing"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {{ isProcessing ? 'Applying...' : 'Apply Preset' }}
                    </button>
                    
                    <button
                        v-else
                        @click="handleRevert"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md transition-colors"
                    >
                        <Icon name="reset" size="sm" class="mr-2" />
                        Revert Preset
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    preset: {
        type: Object,
        default: null
    },
    isApplied: {
        type: Boolean,
        default: false
    },
    conflicts: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'apply-preset', 'revert-preset']);

const isProcessing = ref(false);
const copyButtonIcon = ref('copy');
const showAllSettings = ref({});

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch {
        return 'Unknown';
    }
};

const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const uniqueDomains = computed(() => {
    if (!props.preset?.settings) return [];
    const domains = new Set();
    Object.keys(props.preset.settings).forEach(settingId => {
        const domain = settingId.split('.')[0];
        if (domain) domains.add(domain);
    });
    return Array.from(domains);
});

const groupedSettings = computed(() => {
    if (!props.preset?.settings) return {};
    
    const grouped = {};
    Object.entries(props.preset.settings).forEach(([settingId, value]) => {
        const [domain, ...keyParts] = settingId.split('.');
        const key = keyParts.join('.');
        
        if (!grouped[domain]) {
            grouped[domain] = [];
        }
        
        grouped[domain].push({ key, value });
    });
    
    return grouped;
});

const toggleShowAll = (domain) => {
    showAllSettings.value[domain] = !showAllSettings.value[domain];
};

const copyContent = async () => {
    if (!props.preset?.content) return;
    
    try {
        await navigator.clipboard.writeText(props.preset.content);
        copyButtonIcon.value = 'check';
        setTimeout(() => {
            copyButtonIcon.value = 'copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy content:', err);
    }
};

const visitRepository = () => {
    if (props.preset?.url) {
        window.open(props.preset.url, '_blank', 'noopener,noreferrer');
    }
};

const handleApply = async () => {
    isProcessing.value = true;
    try {
        emit('apply-preset', props.preset.id);
    } finally {
        setTimeout(() => {
            isProcessing.value = false;
        }, 500);
    }
};

const handleRevert = () => {
    emit('revert-preset', props.preset.id);
};

const handleEscape = (event) => {
    if (event.key === 'Escape' && props.show && !isProcessing.value) {
        emit('close');
    }
};

let removeEscapeListener = null;

watch(() => props.show, (newShow) => {
    if (newShow) {
        document.addEventListener('keydown', handleEscape);
        removeEscapeListener = () => {
            document.removeEventListener('keydown', handleEscape);
        };
    } else {
        if (removeEscapeListener) {
            removeEscapeListener();
            removeEscapeListener = null;
        }
    }
});

onUnmounted(() => {
    if (removeEscapeListener) {
        removeEscapeListener();
    }
});
</script>

<style scoped>
/* Modal animations */
.fixed {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.bg-white {
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Spinner animation */
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Scrollbar styling */
pre::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

pre::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
</style>