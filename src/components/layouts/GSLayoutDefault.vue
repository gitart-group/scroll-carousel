<script lang="ts">
import type { PropType } from 'vue'

import { defineAsyncComponent, defineComponent } from 'vue'

const GSArrow = defineAsyncComponent(() => import('../GSArrow.vue'))

export default defineComponent({
  name: 'GSLayoutDefault',
  components: {
    GSArrow,
  },
  props: {
    onMove: {
      type: Function as PropType<(to: number) => void>,
      required: true,
    },
    disabledSide: {
      type: String as PropType<'left' | 'right' | 'none'>,
      required: true,
    },

    /**
     * layout specific props
     */

    disableArrows: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div>
    <div class="gsl-default">
      <slot name="track" />

      <template v-if="!disableArrows">
        <Transition name="gsc-arrow-transition">
          <GSArrow
            v-if="disabledSide !== 'left'"
            side="left"
            class="gsl-default__arrow gsl-default__arrow--left"
            @click="onMove(-1)"
          />
        </Transition>

        <Transition name="gsc-arrow-transition">
          <GSArrow
            v-if="disabledSide !== 'right'"
            side="right"
            class="gsl-default__arrow gsl-default__arrow--right"
            @click="onMove(1)"
          />
        </Transition>
      </template>
    </div>

    <div class="gsl-default__indicator">
      <slot name="indicator" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gsl-default {
  position: relative;
  margin-left: calc(var(--gsc-item-gap-x) * -1px);
  margin-right: calc(var(--gsc-item-gap-x) * -1px);
  position: relative;

  &__arrow {
    top: 50%;
    position: absolute;
    transform: translate(0, -50%);

    &--left {
      left: calc((var(--gsc-item-gap-x) * -1px));
    }

    &--right {
      right: calc((var(--gsc-item-gap-x) * -1px));
    }
  }

  &__indicator {
    margin-top: 12px;
  }
}

.gsc-arrow-transition {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.15s ease-in;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
