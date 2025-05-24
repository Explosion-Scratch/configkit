<template>
    <div class="max-w-2xl mx-auto space-y-6">
        <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold text-text-primary">
                {{ categoryName }} Settings
            </h1>
            <p v-if="categoryDescription" class="text-xs text-gray-500">
                {{ categoryDescription }}
            </p>
        </div>
        <div class="space-y-5">
            <SettingItem
                v-for="setting in settings"
                :key="`${setting.domain}$${setting.key}`"
                :setting="setting"
                :initialValue="
                    /* Use initialValue prop */
                    selectedSettings[
                        buildSettingId(setting.domain, setting.key)
                    ]
                "
                :presets="presets"
                :preset-values="
                    getPresetValueFrequency(
                        buildSettingId(setting.domain, setting.key),
                    )
                "
                :setting-origins="
                    getSettingOrigins(
                        buildSettingId(setting.domain, setting.key),
                    )
                "
                @updateSetting="
                    /* Use updateSetting event */
                    updateSetting(
                        buildSettingId(setting.domain, setting.key),
                        $event,
                    )
                "
                @revertPreset="
                    /* Emit revert preset event */
                    $emit('revertPreset', $event)
                "
            />
        </div>
    </div>
</template>

<script setup>
import SettingItem from "./SettingItem.vue";
import { buildSettingId } from "../utils/settingId.js";

defineProps({
    categoryName: String,
    categoryDescription: String,
    settings: Array,
    selectedSettings: Object,
    presets: {
        type: Array,
        default: () => [],
    },
    getPresetValueFrequency: {
        type: Function,
        default: () => () => [],
    },
    getSettingOrigins: {
        type: Function,
        default: () => () => [],
    },
});
const emit = defineEmits([
    "updateSetting",
    "revertPreset",
]); /* Emits updateSetting and revertPreset */

function updateSetting(key, value) {
    /* Emit updateSetting with object payload */
    emit("updateSetting", { key, value });
}
</script>
