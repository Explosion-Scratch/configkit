<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        @click.self="handleCancel"
    >
        <div
            class="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="messageId"
        >
            <div class="p-6">
                <!-- Icon -->
                <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
                     :class="iconBgClass">
                    <svg v-if="variant === 'danger'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <svg v-else-if="variant === 'warning'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <svg v-else-if="variant === 'info'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <!-- Title -->
                <h3 :id="titleId" class="text-lg font-medium text-gray-900 text-center mb-2">
                    {{ title }}
                </h3>

                <!-- Message -->
                <p :id="messageId" class="text-sm text-gray-600 text-center mb-6">
                    {{ message }}
                </p>

                <!-- Details slot -->
                <div v-if="$slots.details" class="mb-6 p-3 bg-gray-50 rounded-md text-sm">
                    <slot name="details" />
                </div>

                <!-- Actions -->
                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        @click="handleCancel"
                        :disabled="isProcessing"
                        class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {{ cancelText }}
                    </button>
                    <button
                        @click="handleConfirm"
                        :disabled="isProcessing"
                        class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        :class="confirmButtonClass"
                    >
                        <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {{ isProcessing ? processingText : confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Confirm Action'
    },
    message: {
        type: String,
        default: 'Are you sure you want to proceed?'
    },
    confirmText: {
        type: String,
        default: 'Confirm'
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    processingText: {
        type: String,
        default: 'Processing...'
    },
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'danger', 'warning', 'info'].includes(value)
    },
    isProcessing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const titleId = `confirm-title-${Math.random().toString(36).substr(2, 9)}`;
const messageId = `confirm-message-${Math.random().toString(36).substr(2, 9)}`;

const iconBgClass = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'bg-red-100';
        case 'warning':
            return 'bg-yellow-100';
        case 'info':
            return 'bg-blue-100';
        default:
            return 'bg-green-100';
    }
});

const iconClass = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'text-red-600';
        case 'warning':
            return 'text-yellow-600';
        case 'info':
            return 'text-blue-600';
        default:
            return 'text-green-600';
    }
});

const confirmButtonClass = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
        case 'warning':
            return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
        case 'info':
            return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        default:
            return 'bg-accent-600 hover:bg-accent-700 focus:ring-accent-500';
    }
});

const handleConfirm = () => {
    emit('confirm');
};

const handleCancel = () => {
    emit('cancel');
    emit('close');
};

const handleEscape = (event) => {
    if (event.key === 'Escape' && props.show && !props.isProcessing) {
        handleCancel();
    }
};

let removeEscapeListener = null;

watch(() => props.show, (newShow) => {
    if (newShow) {
        document.addEventListener('keydown', handleEscape);
        removeEscapeListener = () => {
            document.removeEventListener('keydown', handleEscape);
        };
        
        // Focus management - focus the confirm button when modal opens
        setTimeout(() => {
            const confirmButton = document.querySelector('[data-confirm-button]');
            if (confirmButton) {
                confirmButton.focus();
            }
        }, 100);
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
/* Modal backdrop animation */
.fixed {
    animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Modal content animation */
.transform {
    animation: scaleIn 0.15s ease-out;
}

@keyframes scaleIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Focus styles */
button:focus {
    outline: none;
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