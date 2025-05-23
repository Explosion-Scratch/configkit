<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50"
        @click.self="$emit('close')"
    >
        <div
            class="bg-white rounded-lg shadow-lg px-5 py-6 w-full max-w-2xl macos-scrollbar overflow-y-auto max-h-[80vh] relative hover:shadow-sm"
        >
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-sm font-medium">Generated macOS Script</h2>
                <button
                    @click="$emit('close')"
                    class="cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <Icon name="close" size="md" />
                </button>
            </div>
            <div class="mb-4">
                <h3 class="text-xs font-semibold mb-1 text-gray-600">
                    Script:
                </h3>
                <div class="relative">
                    <textarea
                        readonly
                        ref="scriptTextarea"
                        @click="$event.target.select()"
                        class="w-full text-gray-700 h-48 p-2 border border-gray-200 rounded-md text-xs font-mono bg-gray-50 macos-scrollbar focus:outline-none"
                        :value="scriptContent"
                    ></textarea>
                    <button
                        @click="copyScript"
                        class="absolute top-2 right-2 border-gray-700 rounded border cursor-pointer px-2 py-1 text-xs hover:bg-gray-100 focus:outline-none"
                    >
                        <Icon :name="copyButtonIcon" size="sm" />
                    </button>
                </div>
            </div>
            <div v-if="restartActions.length > 0" class="mb-4">
                <h3 class="text-xs font-semibold mb-1 text-gray-600">
                    Restart/Logout Actions Required:
                </h3>
                <ul class="list-disc list-inside text-xs text-gray-700">
                    <li v-for="action in restartActions" :key="action">
                        {{ action }}
                    </li>
                </ul>
            </div>
            <div class="flex justify-end">
                <Button variant="primary" @click="$emit('close')">Close</Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import Button from "./Button.vue";
import Icon from "./Icon.vue";
const props = defineProps({
    show: Boolean,
    scriptContent: String,
    restartActions: Array,
});
defineEmits(["close"]);

const copyButtonIcon = ref("copy");
const scriptTextarea = ref(null);

async function copyScript() {
    try {
        await navigator.clipboard.writeText(props.scriptContent);
        copyButtonIcon.value = "check";
        setTimeout(() => (copyButtonIcon.value = "copy"), 500);
    } catch (err) {
        console.error("Failed to copy script: ", err);
        copyButtonIcon.value = "copy";
    }
}
</script>

<style scoped>
.select-all-on-click {
    user-select: all;
}
/* Removed inline style, replaced with border utility class */
/* style="border: 1px solid rgba(0, 0, 0, 0.1)" */
</style>
