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
    box-shadow: 0px 0.5px 3px rgba(0, 0, 0, 0.1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
}

.mac-btn:focus {
    box-shadow:
        0px 0.5px 1px rgba(0, 0, 0, 0.1),
        0px 0px 0px 3.5px rgba(var(--color-accent-focus) / 0.5);
    outline: 0;
}

.mac-btn--primary {
    background: linear-gradient(
        180deg,
        rgb(var(--color-accent-300)) 0%,
        rgb(var(--color-accent-450)) 100%
    );
    background-origin: border-box;
    box-shadow:
        0px 0.5px 1.5px rgba(var(--color-accent-450) / 0.25),
        inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2);

    color: #fff;
}
</style>
<script>
export default {
    props: {
        variant: {
            type: String,
            default: "",
        },
    },
};
</script>
