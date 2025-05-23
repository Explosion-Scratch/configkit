<template>
    <div :class="wrapperClass">
        <!-- Checkbox -->
        <template v-if="type === 'checkbox'">
            <label
                :for="inputId"
                class="flex items-center gap-x-2 cursor-pointer group"
            >
                <input
                    :id="inputId"
                    type="checkbox"
                    :checked="modelValue"
                    @change="$emit('update:modelValue', $event.target.checked)"
                    :disabled="disabled"
                    class="macos-checkbox size-3.5 rounded border-gray-400 bg-transparent text-accent-500 checked:bg-accent-500 checked:border-accent-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{
                        backgroundImage: modelValue
                            ? `var(--checkbox-tick-svg)`
                            : 'none',
                    }"
                />
                <span
                    v-if="label"
                    class="text-xs font-medium text-gray-700 group-hover:text-gray-900 select-none"
                >
                    {{ label }}
                </span>
            </label>
        </template>

        <!-- Radio -->
        <template v-else-if="type === 'radio'">
            <label
                :for="inputId"
                class="flex items-center gap-x-2 cursor-pointer group"
            >
                <input
                    :id="inputId"
                    type="radio"
                    :name="name"
                    :value="value"
                    :checked="modelValue == value"
                    @change="
                        $emit(
                            'update:modelValue',
                            convertToOriginalType(
                                radioValueType || 'string',
                                $event.target.value,
                            ),
                        )
                    "
                    :disabled="disabled"
                    class="macos-radio size-3.5 border-gray-400 text-accent-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span
                    v-if="label"
                    class="text-xs font-medium text-gray-700 group-hover:text-gray-900 select-none"
                >
                    {{ label }}
                </span>
            </label>
        </template>

        <!-- Text Input (text, number, float, search etc.) -->
        <template
            v-else-if="
                [
                    'string',
                    'text',
                    'number',
                    'int',
                    'float',
                    'search',
                    'password',
                    'email',
                    'url',
                ].includes(type)
            "
        >
            <label
                v-if="label && showInputLabel"
                :for="inputId"
                class="block text-xs font-medium text-gray-700 mb-1"
                >{{ label }}</label
            >
            <div class="relative">
                <div
                    v-if="type === 'search' && !noSearchIcon"
                    class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none"
                >
                    <Icon name="search" size="xs" class="text-gray-400" />
                </div>
                <input
                    :id="inputId"
                    :type="inputType"
                    :step="
                        type === 'float'
                            ? '0.01'
                            : ['number', 'int'].includes(type)
                              ? '1'
                              : undefined
                    "
                    class="w-full bg-white px-3 py-1.5 text-xs rounded-md outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-3 focus:ring-accent-500/50"
                    :class="{
                        'pl-8 pr-3': type === 'search' && !noSearchIcon,
                        'px-2.5': type !== 'search' || noSearchIcon,
                        'focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50': true,
                    }"
                    :value="modelValue"
                    @input="
                        $emit(
                            'update:modelValue',
                            convertToOriginalType(type, $event.target.value),
                        )
                    "
                    :placeholder="placeholder"
                    :disabled="disabled"
                />
            </div>
        </template>

        <template v-else>
            <p class="text-xs text-red-500">
                Unsupported input type: {{ type }}
            </p>
        </template>
    </div>
</template>

<script setup>
import { computed } from "vue";
import Icon from "./Icon.vue"; // Assuming Icon.vue is in the same directory

const props = defineProps({
    modelValue: [String, Number, Boolean, Array],
    type: {
        type: String,
        required: true,
    },
    label: String,
    id: String,
    name: String,
    value: [String, Number, Boolean],
    placeholder: String,
    disabled: {
        type: Boolean,
        default: false,
    },
    wrapperClass: String,
    noSearchIcon: Boolean,
    showInputLabel: {
        // New prop to control visibility of label for text inputs
        type: Boolean,
        default: true,
    },
    radioValueType: String, // 'string', 'number', 'boolean' for radio values
});

defineEmits(["update:modelValue"]);

const inputId = computed(
    () => props.id || `mac-input-${Math.random().toString(36).substr(2, 9)}`,
);

const inputType = computed(() => {
    if (props.type === "string") {
        return "text";
    }
    if (
        props.type === "float" ||
        props.type === "number" ||
        props.type === "int"
    )
        return "number";
    return props.type;
});

const convertToOriginalType = (originalType, inputValue) => {
    if (
        originalType === "number" ||
        (props.type === "radio" && props.radioValueType === "number")
    ) {
        const num = parseInt(inputValue, 10);
        return isNaN(num) ? null : num; // Return null or original inputValue if NaN?
    }
    if (
        originalType === "float" ||
        (props.type === "radio" && props.radioValueType === "float")
    ) {
        const num = parseFloat(inputValue);
        return isNaN(num) ? null : num;
    }
    if (
        originalType === "boolean" ||
        (props.type === "radio" && props.radioValueType === "boolean")
    ) {
        if (inputValue === "true") return true;
        if (inputValue === "false") return false;
    }
    return inputValue;
};
</script>

<style scoped>
/* Removed the redundant :root var definition */
/* :root { --checkbox-tick-svg: url("data:image/svg+xml,..."); } */
/* Removed the redundant checked styles already in style.css */
/* .macos-checkbox:checked { background-image: var(--checkbox-tick-svg); } */

input {
    cursor: pointer;
}
input:focus {
    outline: none !important;
}

input[type="radio"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 1.25em;
    height: 1.25em;
    border-radius: 50%;
    border: 1px solid #ddd;
    background-color: #fff;
    cursor: pointer;
}
input[type="radio"]:checked {
    background-color: var(--color-accent-500);
    border-color: var(--color-accent-500);
}
</style>
