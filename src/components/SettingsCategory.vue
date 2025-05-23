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
                :key="`${setting.domain}-${setting.key}`"
                :setting="setting"
                :initialValue="
                    /* Use initialValue prop */
                    selectedSettings[`${setting.domain}.${setting.key}`]
                "
                @updateSetting="
                    /* Use updateSetting event */
                    updateSetting(`${setting.domain}.${setting.key}`, $event)
                "
            />
        </div>
    </div>
</template>

<script setup>
import SettingItem from "./SettingItem.vue";

defineProps({
    categoryName: String,
    categoryDescription: String,
    settings: Array,
    selectedSettings: Object,
});
const emit = defineEmits(["updateSetting"]); /* Emits updateSetting */

function updateSetting(key, value) {
    /* Emit updateSetting with object payload */
    emit("updateSetting", { key, value });
}
</script>
