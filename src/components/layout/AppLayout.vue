<template>
    <div class="app-layout">
        <!-- Mobile backdrop -->
        <div
            v-if="isMobileMenuOpen"
            class="fixed inset-0 z-40 bg-black/20 lg:hidden"
            @click="closeMobileMenu"
        ></div>

        <!-- Sidebar -->
        <aside
            :class="[
                'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
            ]"
        >
            <slot name="sidebar" />
        </aside>

        <!-- Main content -->
        <div class="flex flex-col lg:pl-0 app-layout-main-content">
            <!-- Mobile header -->
            <div
                class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden"
            >
                <button
                    type="button"
                    class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                    @click="toggleMobileMenu"
                >
                    <span class="sr-only">Open sidebar</span>
                    <Icon name="menu" size="md" />
                </button>
                <div class="flex flex-1 items-center justify-between">
                    <h1 class="text-lg font-semibold text-gray-900">
                        {{ pageTitle }}
                    </h1>
                    <slot name="header-actions" />
                </div>
            </div>

            <!-- Main content area -->
            <main class="flex-1">
                <slot name="main" />
            </main>
        </div>

        <!-- Floating action button for mobile script generation -->
        <div
            v-if="showFloatingAction"
            class="fixed bottom-6 right-6 z-40 lg:hidden"
        >
            <slot name="floating-action" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Icon from "../Icon.vue";

const props = defineProps({
    pageTitle: {
        type: String,
        default: "macOS Defaults",
    },
    showFloatingAction: {
        type: Boolean,
        default: false,
    },
});

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

const handleResize = () => {
    if (window.innerWidth >= 1024) {
        // lg breakpoint
        isMobileMenuOpen.value = false;
    }
};

const handleEscape = (event) => {
    if (event.key === "Escape" && isMobileMenuOpen.value) {
        closeMobileMenu();
    }
};

onMounted(() => {
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
@import "../../style.css";

.app-layout {
    @apply flex fixed lg:inset-20 lg:rounded-lg lg:shadow-lg overflow-hidden w-full lg:w-[unset];
}

/* Mobile menu animation */
@media (max-width: 1023px) {
    aside {
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
}

/* Ensure proper layout flow */
main {
    @apply min-h-[calc(100vh-4rem)] lg:min-h-screen;
}

/* Focus management */
button:focus {
    @apply outline-none ring-2 ring-accent-500/50;
}

.app-layout-main-content {
    @apply bg-white overflow-y-scroll h-full flex-1;
}
</style>
