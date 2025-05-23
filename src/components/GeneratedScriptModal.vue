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
                    aria-label="Close modal"
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
                        aria-label="Copy script to clipboard"
                    >
                        <Icon :name="copyButtonIcon" size="sm" />
                    </button>
                </div>
            </div>

            <div class="mb-4">
                <h3 class="text-xs font-semibold mb-1 text-gray-600">
                    How to Run:
                </h3>
                <div class="text-xs text-gray-700">
                    <p class="mb-1">
                        1. Save the script to a file, for example
                        <code class="font-mono bg-gray-100 px-1 rounded"
                            >~/.macos</code
                        >.
                    </p>
                    <p class="mb-1">
                        2. Make the script executable by opening Terminal and
                        running:
                    </p>
                    <p
                        class="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-800"
                    >
                        <code class="text-gray-800">chmod +x ~/.macos</code>
                    </p>
                    <p class="mb-1 mt-1">3. Execute the script:</p>
                    <p
                        class="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-800"
                    >
                        <code class="text-gray-800">~/.macos</code>
                    </p>
                    <p class="mt-1">
                        You may need to enter your password to run some
                        commands.
                    </p>
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

            <div class="flex justify-end space-x-2">
                <Button @click="downloadScript">Download Script</Button>
                <Button @click="$emit('close')">Close</Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import Button from "./Button.vue";
import Icon from "./Icon.vue";

const props = defineProps({
    show: Boolean,
    scriptContent: String,
    restartActions: Array,
});
const emit = defineEmits(["close"]);

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

function downloadScript() {
    if (!props.scriptContent) return;

    const blob = new Blob([props.scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "macos.sh";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

let removeEscapeListener = null;

watch(
    () => props.show,
    (newShow) => {
        if (newShow) {
            const handleEscape = (event) => {
                if (event.key === "Escape") {
                    emit("close");
                }
            };
            document.addEventListener("keydown", handleEscape);
            removeEscapeListener = () => {
                document.removeEventListener("keydown", handleEscape);
            };
        } else {
            if (removeEscapeListener) {
                removeEscapeListener();
                removeEscapeListener = null;
            }
        }
    },
);

onUnmounted(() => {
    if (removeEscapeListener) {
        removeEscapeListener();
    }
});
</script>

<style scoped>
code {
    font-size: 0.75rem;
}
</style>
