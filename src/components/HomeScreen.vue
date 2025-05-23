<template>
    <div
        ref="homeScreenRef"
        class="home-screen-wrapper flex flex-col items-center justify-center text-center p-8 overflow-hidden"
    >
        <div class="relative z-10 flex flex-col items-center">
            <div class="mb-6 w-36 h-36 relative">
                <div
                    class="absolute inset-0 bg-gray-400 rounded-full blur-2xl opacity-10 transform scale-125 translate-y-4"
                ></div>
                <div
                    class="logo-container w-36 h-36 relative z-10"
                    ref="logoContainerRef"
                >
                    <img src="../assets/icon.png" class="logo w-full h-full" />
                    <img
                        src="../assets/icon.png"
                        class="logobg w-full h-full"
                    />
                </div>
            </div>

            <h1
                class="text-4xl sm:text-5xl font-semibold mb-4 tracking-tight text-shadow-md animate"
            >
                macOS Defaults Generator
            </h1>
            <p
                class="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed animate"
            >
                Tune your mac experience! Change lots of options, then download
                a ~/.macos file to implement them all! This changes system
                settings through hidden defaults commands.
            </p>

            <div v-if="totalSettings > 0" class="mb-10">
                <p class="text-sm text-gray-500 animate">
                    Explore and configure
                    <span class="font-semibold text-accent-500 text-base">{{
                        totalSettings
                    }}</span>
                    available settings.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2">
                <button @click="$emit('exploreSettings')" class="btn-primary">
                    <Icon name="settings" size="md" class="mr-2 -ml-1" />
                    Start Customizing
                </button>
                <a
                    href="https://github.com/explosion-scratch/configkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-secondary group"
                >
                    <Icon
                        name="github"
                        size="md"
                        class="mr-2 -ml-1 group-hover:animate-pulse-fast"
                    />
                    View on GitHub
                </a>
            </div>

            <p class="text-xs text-gray-400 mt-16">
                Select a category from the sidebar or use the search to begin.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import Icon from "./Icon.vue"; // Assuming Icon.vue is in the same directory

defineProps({
    totalSettings: {
        type: Number,
        required: true,
    },
});
defineEmits(["exploreSettings"]);

const homeScreenRef = ref(null);
const logoContainerRef = ref(null);
const animatedLogoSvg = shallowRef("");

const cursorAssets = [
    "cursor.svg",
    "closedhand.svg",
    "pointinghand.svg",
    "openhand.svg",
    "help.svg",
    "notallowed.svg",
    "poof.svg",
];
const loadedCursorSVGs = {};

// --- Logo Animation ---
let logoPaths = [];
let logoAnimationTimeout;

async function loadAndAnimateLogo() {
    // No longer loading dynamically
}

// --- Particle System ---
const particles = ref([]);
let particleRAF = null;
const PARTICLE_THROTTLE_INTERVAL = 200; // ms, create particle max every ~30ms
let lastParticleTime = 0;

class Particle {
    constructor(x, y, svgString) {
        this.x = x;
        this.y = y;

        this.size = 40; // Fixed size for cursor SVG
        this.initialSize = this.size;

        this.vx = (Math.random() - 0.5) * 1.5; // Horizontal velocity
        this.vy = Math.random() * -1.5 - 0.5; // Initial upward velocity
        this.gravity = 0.06;
        this.drag = 0.98; // Air resistance for horizontal movement

        this.opacity = 0.7;
        this.initialOpacity = this.opacity;
        this.fadeRate = 0.01 + Math.random() * 0.01; // Fade out rate
        this.shrinkRate = 0; // No Shrinking

        this.element = document.createElement("div");
        this.element.classList.add("mouse-particle-new"); // Use new class
        this.element.innerHTML = svgString;

        const svgElement = this.element.querySelector("svg");
        if (svgElement) {
            svgElement.style.width = "24px";
            svgElement.style.height = "24px";
        }

        this.element.style.position = "fixed";
        this.element.style.left = `${x - this.size / 2}px`;
        this.element.style.top = `${y - this.size / 2}px`;
        this.element.style.opacity = this.opacity; // Apply initial opacity

        document.body.appendChild(this.element);
        this.updateElementStyle();
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.drag;

        this.x += this.vx;
        this.y += this.vy;

        this.opacity -= this.fadeRate;
        this.size -= this.shrinkRate;

        if (this.opacity <= 0 || this.size <= 0) {
            return false; // Mark as dead
        }
        this.updateElementStyle();
        return true; // Still alive
    }

    updateElementStyle() {
        this.element.style.left = `${this.x - this.size / 2}px`;
        this.element.style.top = `${this.y - this.size / 2}px`;
        this.element.style.width = `${Math.max(0, this.size)}px`;
        this.element.style.height = `${Math.max(0, this.size)}px`;
        this.element.style.opacity = this.opacity;
        this.element.style.zIndex = "10";
        this.element.style.pointerEvents = "none";
    }

    isOutOfBounds() {
        // Check against window bounds instead of container
        return (
            this.y > window.innerHeight + this.initialSize || // Off bottom
            this.y < -this.initialSize || // Off top
            this.x > window.innerWidth + this.initialSize || // Off right
            this.x < -this.initialSize // Off left
        );
    }

    remove() {
        this.element.remove();
    }
}

function animateParticles() {
    for (let i = particles.value.length - 1; i >= 0; i--) {
        const p = particles.value[i];
        if (!p.update() || p.isOutOfBounds()) {
            p.remove();
            particles.value.splice(i, 1);
        }
    }
    particleRAF = requestAnimationFrame(animateParticles);
}

// --- Mouse Particle Effect ---

async function preloadCursorSVGs() {
    for (const cursorName of cursorAssets) {
        try {
            const response = await fetch(`/cursors/${cursorName}`); // Adjusted path
            if (!response.ok) throw new Error(`Failed to load ${cursorName}`);
            loadedCursorSVGs[cursorName] = await response.text();
        } catch (e) {
            console.warn(`Could not load cursor: ${cursorName}`, e);
        }
    }
}

function handleMouseMove(event) {
    const now = Date.now();

    // New Particle generation (throttled)
    if (
        homeScreenRef.value &&
        now - lastParticleTime > PARTICLE_THROTTLE_INTERVAL
    ) {
        lastParticleTime = now;
        const x = event.clientX;
        const y = event.clientY;

        if (Object.keys(loadedCursorSVGs).length > 0) {
            const randomCursorName =
                cursorAssets[Math.floor(Math.random() * cursorAssets.length)];
            const svgString = loadedCursorSVGs[randomCursorName];
            if (svgString) {
                particles.value.push(new Particle(x, y, svgString));
            }
        }
    }
}

onMounted(async () => {
    await loadAndAnimateLogo();
    await preloadCursorSVGs();
    if (homeScreenRef.value) {
        homeScreenRef.value.addEventListener("mousemove", handleMouseMove);
        animateParticles(); // Start particle animation loop
    }
});

onUnmounted(() => {
    if (homeScreenRef.value) {
        homeScreenRef.value.removeEventListener("mousemove", handleMouseMove);
    }
    if (particleRAF) {
        cancelAnimationFrame(particleRAF);
    }
    clearTimeout(logoAnimationTimeout);
    // Clean up any remaining particles
    particles.value.forEach((p) => p.remove());
    particles.value = [];
});
</script>

<style scoped>
@import "../style.css";
.logo-container {
    display: grid;
    pointer-events: none;
}

.logo,
.logobg {
    grid-column: 1;
    grid-row: 1;
}

.logobg {
    transform: scale(1.1) translateY(10px) translateX(4px);
    z-index: -1;
    opacity: 0.4;
    filter: blur(10px);
}

.text-shadow-subtle {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@keyframes fadein {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate {
    animation: fadein 0.6s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.btn-primary {
    @apply flex items-center justify-center rounded-lg h-10 px-6 bg-gradient-to-b from-accent-600 to-accent-700 hover:bg-accent-500 text-white text-sm font-medium shadow-md transition-all duration-150 ease-in-out active:bg-accent-600 focus:outline-none focus:ring-3 focus:ring-accent-500/50;
}
.btn-secondary {
    @apply bg-white hover:bg-white flex items-center justify-center rounded-lg h-10 px-6 hover:bg-gray-300/80 text-gray-700 text-sm font-medium shadow-sm transition-all duration-150 ease-in-out active:bg-gray-300 focus:outline-none focus:ring-3 focus:ring-accent-500/50; /* Update ring offset */
}

/* New Mouse Particle Style */
.mouse-particle-new {
    position: absolute; /* Positioned relative to homeScreenRef */
    pointer-events: none;
    z-index: 10; /* Ensure they are above background but can be below other UI if needed */
    will-change: transform, opacity, width, height; /* Performance hint */
}

/* Dropped Cursor Styling */

@keyframes fallAndFade {
    0% {
        transform: translateY(-10px) scale(1.1);
        opacity: 0.7;
    }
    20% {
        transform: translateY(0px) scale(1);
        opacity: 0.6;
    }
    80% {
        transform: translateY(10px) scale(0.9);
        opacity: 0.3;
    }
    100% {
        transform: translateY(15px) scale(0.8);
        opacity: 0;
    }
}

[ref="logoContainerRef"] svg path:not([id^="logo-bg"]) {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
}

:global(button, button *) {
    z-index: 50 !important;
    cursor: pointer;
}
</style>
