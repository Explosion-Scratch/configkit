<template>
    <section
        class="text-xs bg-gray-700/5 rounded-sm border border-gray-800/5 relative group"
    >
        <div
            class="absolute top-2 right-2 flex items-center space-x-1 opacity-50 group-hover:opacity-100 transition-opacity duration-150 z-10"
        >
            <button
                v-if="
                    setting.suggestedValue !== null &&
                    currentValue !== setting.suggestedValue
                "
                @click="applySuggestedValue"
                title="Use suggested value"
                class="cursor-pointer p-1 rounded text-text-primary/80 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
            >
                <Icon name="wand" size="xs" />
            </button>
            <button
                v-if="isSet"
                @click="resetToUnset"
                title="Reset to unset (won't be included in script)"
                class="cursor-pointer p-1 rounded text-text-primary/80 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
            >
                <Icon name="reset" size="xs" />
            </button>
        </div>

        <div class="p-4 space-y-2">
            <h3 class="text-text-primary">
                {{ setting.title }}
            </h3>

            <SettingInfo :setting="setting" />

            <div class="mt-3">
                <MacInput
                    v-if="setting.parameterType === 'bool'"
                    type="checkbox"
                    :id="settingId + '-bool-check'"
                    :label="labelForBoolean"
                    :model-value="currentValue ?? false"
                    @update:modelValue="updateValue($event)"
                ></MacInput>

                <!-- String/Int/Float with acceptedParameterValues (Radio) -->
                <div
                    v-if="
                        setting.acceptedParameterValues &&
                        setting.acceptedParameterValues.length > 0 &&
                        ['string', 'int', 'float', 'bool'].includes(
                            setting.parameterType,
                        )
                    "
                    class="pt-2"
                >
                    <template
                        v-for="(
                            option, index
                        ) in setting.acceptedParameterValues"
                        :key="index"
                    >
                        <MacInput
                            type="radio"
                            :id="`${settingId}-${option.value}`"
                            :name="settingId"
                            :label="option.description || String(option.value)"
                            :value="option.value"
                            :model-value="currentValue"
                            @update:modelValue="updateValue($event)"
                            wrapper-class="py-0.5 mb-1"
                            :radio-value-type="setting.parameterType"
                        ></MacInput>
                    </template>
                </div>

                <!-- String/Int/Float without acceptedParameterValues (Text Input) -->
                <MacInput
                    v-else-if="
                        ['text', 'number', 'int', 'float', 'string'].includes(
                            setting.parameterType,
                        )
                    "
                    :type="setting.parameterType"
                    :id="settingId"
                    :model-value="currentValue ?? ''"
                    @update:modelValue="updateValue($event)"
                    :placeholder="inputPlaceholder"
                    :show-input-label="false"
                ></MacInput>

                <!-- Array/Dict (Informational for now) -->
                <div
                    v-else-if="
                        ['array', 'dict'].includes(setting.parameterType)
                    "
                >
                    <p class="small-text text-gray-500">
                        Configuration for type '{{ setting.parameterType }}' is
                        complex.
                        <span v-if="isSet"
                            >Current value: <code>{{ currentValue }}</code
                            >.</span
                        >
                        <span v-else class="italic text-gray-400"
                            >Currently unset.</span
                        >
                        <span v-if="setting.suggestedValue !== null">
                            Suggested:
                            <code>{{ setting.suggestedValue }}</code></span
                        >
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import MacInput from "./MacInput.vue";
import Icon from "./Icon.vue";
import SettingInfo from "./SettingInfo.vue"; // Import the new component

const props = defineProps({
    setting: Object,
    initialValue: [String, Number, Boolean, Array, undefined],
});
const emit = defineEmits(["updateSetting"]);

const settingId = computed(
    () => `${props.setting.domain}.${props.setting.key}`,
);

const currentValue = ref(props.initialValue);
// isSet determines if the value will be included in the script.
// It's true if initialValue was defined, or if the user interacts with the input.
const isSet = ref(props.initialValue !== undefined);

watch(
    () => props.initialValue,
    (newValue) => {
        currentValue.value = newValue;
        isSet.value = newValue !== undefined;
    },
);

function updateValue(newValue) {
    console.log("newValue, currentValue.value:", newValue, currentValue.value);
    isSet.value = true; // Any direct input interaction means the user wants to set this value
    currentValue.value = newValue;
    emit("updateSetting", {
        key: `${props.setting.domain}.${props.setting.key}`,
        value: newValue,
    });
    console.log(
        "2: newValue, currentValue.value:",
        newValue,
        currentValue.value,
    );
}

function resetToUnset() {
    isSet.value = false;
    // currentValue.value can remain to show the last state, but it's effectively "unset" for the script
    emit("updateSetting", {
        key: `${props.setting.domain}.${props.setting.key}`,
        value: undefined,
    });
}

function applySuggestedValue() {
    if (props.setting.suggestedValue !== null) {
        updateValue(props.setting.suggestedValue);
    }
}

const labelForBoolean = computed(() => {
    // Construct a more descriptive label if the main one is just the key
    if (props.setting.title.toLowerCase() === props.setting.key.toLowerCase()) {
        return `Enable this setting`;
    }
    return `Enable ${props.setting.title.toLowerCase()}`;
});

const inputPlaceholder = computed(() => {
    let placeholder = `${props.setting.parameterType} value`;
    if (![undefined, null, NaN].includes(props.setting.suggestedValue)) {
        placeholder += ` (Suggested: ${formatSuggestedValue(props.setting.suggestedValue, props.setting.parameterType)})`;
    } else if (props.initialValue !== undefined && !isSet.value) {
        // If not set, but there was an initial (e.g. from a previous load or global apply)
        placeholder += ` (Currently: ${formatSuggestedValue(props.initialValue, props.setting.parameterType)})`;
    } else {
        placeholder += ` (Currently unset)`;
    }
    return placeholder;
});

const formatSuggestedValue = (value, type) => {
    if (value === undefined || value === null) return "N/A";
    if (type === "bool") return value ? "Enabled" : "Disabled";
    if (type === "string" && value === "") return "Empty String";
    return String(value);
};
</script>
<style scoped>
@import "../style.css";

.small-text {
    @apply text-xs;
}

h3 {
    font-weight: 450;
    font-size: 1.1em;
    @apply text-text-primary mb-0.5;
}
</style>
