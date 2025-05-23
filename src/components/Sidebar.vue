<template>
    <div
        class="w-64 bg-sidebar-bg border-r border-gray-300/70 py-4 px-2 pl-4 space-y-4 macos-scrollbar overflow-y-auto macos-scrollbar"
    >
        <div class="relative">
            <input
                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-md outline-none transition-colors bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-3 focus:ring-accent-500/50"
                placeholder="Search options..."
                type="search"
                :value="searchTerm"
                @input="$emit('update:searchTerm', $event.target.value)"
            />
            <div
                class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none"
            >
                <svg
                    aria-hidden="true"
                    class="h-3.5 w-3.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        clip-rule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        fill-rule="evenodd"
                    ></path>
                </svg>
            </div>
        </div>
        <nav class="space-y-1">
            <a
                v-for="category in ['Home', ...categories]"
                :key="category"
                href="#"
                class="group block px-2.5 py-1.5 text-xs font-medium text-gray-700 rounded-md transition-colors duration-75 ease-in-out focus:outline-none active:opacity-90"
                :class="{
                    'text-accent-500 hover:bg-accent-600 bg-accent-600 text-white':
                        selectedCategory === category,
                }"
                @click.prevent="$emit('selectCategory', category)"
            >
                <div class="flex justify-between items-center w-full">
                    <span>{{ category }}</span>
                    <span
                        v-if="filteredSettings?.[category]?.length"
                        :class="
                            selectedCategory === category
                                ? 'text-white'
                                : 'text-text-primary/50'
                        "
                        class="ml-2 flex-shrink-0"
                    >
                        {{ filteredSettings[category]?.length }}
                    </span>
                </div>
            </a>
        </nav>
    </div>
</template>

<script setup>
defineProps({
    categories: Array,
    filteredSettings: Object,
    selectedCategory: String,
    searchTerm: String,
});
defineEmits(["selectCategory", "update:searchTerm"]);
</script>
