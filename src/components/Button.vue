<template>
    <button
        :class="[
            'mac-btn',
            { 'mac-btn--primary': variant === 'primary' },
            {
                'mac-btn--large': size === 'large',
            },
            classes,
        ]"
        class="text-sm"
        role="button"
    >
        <slot>Button</slot>
    </button>
</template>
<style scoped>
@import "../style.css";
/* Added scoped for better practice */
.mac-btn {
    font-size: 0.8em;
    display: flex;
    cursor: pointer;
    flex-direction: row;
    align-items: center;
    padding: 3px 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Roboto", sans-serif;
    border-radius: 6px;
    /* Use var for color */
    color: rgb(var(--color-button-text-default));
    /* White background already standard, or keep as is */
    background: #fff;
    border: none;
    box-shadow: 0px 0.5px 3px rgba(0, 0, 0, 0.15);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
}

.mac-btn:focus {
    @apply ring-4 ring-accent-600/40 outline-none;
}

.mac-btn--primary {
    background: linear-gradient(
        var(--color-accent-300),
        var(--color-accent-450)
    );
    background-origin: border-box;
    /* box-shadow:
        0px 0.5px 1.5px var(--color-accent-450),
        inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2); */
    @apply shadow-md shadow-accent-450/20;
    color: #fff;
}

.mac-btn--large {
    padding: 8px 20px;
    font-size: 0.875rem;
}
</style>
<script>
export default {
    props: {
        variant: {
            type: String,
            default: "",
        },
        size: {
            type: String,
            default: "",
        },
        classes: {
            type: String,
            default: "",
        },
    },
};
</script>
