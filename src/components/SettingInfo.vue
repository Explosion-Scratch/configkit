<template>
    <div v-if="setting">
        <!-- Long Description -->
        <p
            v-if="setting.longDescription || setting.description"
            class="small-text text-gray-500 mt-1 mb-3"
            v-html="
                renderMarkdown(setting.longDescription || setting.description)
            "
        ></p>

        <!-- Separator before details if description is present -->
        <hr
            v-if="
                setting.longDescription &&
                (setting.requiresRestart ||
                    setting.requiresSudo ||
                    (setting.dependencies && setting.dependencies.length) ||
                    (setting.notes && setting.notes.length))
            "
            class="h-[1px] my-3 ring-0 border-0 mx-auto block bg-black/10 w-full"
        />

        <!-- Details section (Requires Restart/Sudo/Dependencies) -->
        <div
            v-if="
                setting.requiresRestart ||
                setting.requiresSudo ||
                (setting.dependencies && setting.dependencies.length)
            "
            class="mt-3 space-y-1 pt-2 border-t border-gray-200/70"
        >
            <div
                v-if="setting.requiresRestart"
                class="flex items-center gap-1.5 p-1.5 small-text text-red-600 bg-red-50 border border-red-200 rounded-md"
            >
                <Icon name="reset" size="xs" />
                <span>{{ setting.requiresRestart }} Restart Required</span>
            </div>
            <div
                v-if="setting.requiresSudo"
                class="flex items-center gap-1.5 p-1.5 small-text text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md"
            >
                <svg
                    class="h-3.5 w-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        clip-rule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        fill-rule="evenodd"
                    ></path>
                </svg>
                <span>Requires Sudo (Administrator) Privileges</span>
            </div>
            <div
                v-if="setting.dependencies && setting.dependencies.length"
                class="flex items-center gap-1.5 p-1.5 small-text text-blue-700 bg-blue-50 border border-blue-200 rounded-md"
            >
                <svg
                    class="h-3.5 w-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        clip-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        fill-rule="evenodd"
                    ></path>
                </svg>
                <span
                    >Dependencies:
                    {{
                        setting.dependencies.map((d) => d.settingId).join(", ")
                    }}</span
                >
            </div>
        </div>

        <!-- Notes section -->
        <div
            v-if="setting.notes && setting.notes.length"
            class="mt-2 pt-2 border-t border-gray-200/70 space-y-1"
        >
            <p
                v-for="(note, idx) in setting.notes"
                :key="idx"
                class="small-text text-gray-500 italic"
            >
                Note: {{ note }}
            </p>
        </div>
    </div>
</template>
<script setup>
import { marked } from "marked";
import Icon from "./Icon.vue"; // Assuming Icon component is in the same directory

const props = defineProps({
    setting: {
        type: Object,
        required: true,
    },
});

const renderMarkdown = (mdString) => {
    if (!mdString) return "";
    // Disable specific features for basic markdown rendering
    return marked(mdString, { mangle: false, headerIds: false });
};
</script>
<style scoped>
@import "../style.css";

.small-text {
    @apply text-xs;
}
</style>
