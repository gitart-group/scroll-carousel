<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GSArrow',
  props: {
    side: {
      type: String,
      required: true,
      validator: (value: string) => ['left', 'right'].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    class="gsc-arrow"
    :class="[
      `gsc-arrow--side-${side}`,
      { 'gsc-arrow--disabled': disabled },
    ]"
  >
    <span />
  </div>
</template>

<style lang="scss">
.gsc-arrow {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--gsc-arrow-bg);
  transition: all 0.2s;

  &:hover {
    background: var(--gsc-arrow-bg-hover);
  }

  span {
    position: relative;
    z-index: 2;
    border-width: 0 2px 2px 0;
    border-style: solid;
    border-color: #fff;
    display: inline-block;
    padding: 5px;
    vertical-align: middle;
  }

  &--side-right {
    padding-right: 5px;

    span {
      transform: rotate(-45deg);
    }
  }

  &--side-left {
    padding-left: 5px;

    span {
      transform: rotate(135deg);
    }
  }

  &--disabled {
    cursor: unset;
    background: var(--gsc-arrow-bg-disabled) !important;
  }
}
</style>
