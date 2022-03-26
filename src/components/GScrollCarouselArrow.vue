<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GScrollCarouselArrow',
  props: {
    side: {
      type: String,
      required: true,
      validator: (value: string) => ['left', 'right'].includes(value),
    },
  },
})
</script>

<template>
  <div class="gsc-arrow" :class="`gsc-arrow--side-${side}`">
    <span />
  </div>
</template>

<style lang="scss">
.gsc-arrow {
  width: 48px;
  height: 48px;
  border: 1px solid #000;
  border-radius: 50%;
  background: var(--gsc-arrow-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  span {
    order: solid black;
    border-width: 0 2px 2px 0;
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
}
</style>
