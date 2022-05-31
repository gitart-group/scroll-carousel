<script lang="ts">
import type { PropType } from 'vue'
import { defineAsyncComponent, defineComponent } from 'vue'

const GSArrow = defineAsyncComponent(() => import('../GSArrow.vue'))

export default defineComponent({
  name: 'GSLayoutNumeric',
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
    currentItem: {
      type: Number,
      required: true,
    },
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },

    /**
     * layout specific props
     */

    disableControls: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div>
    <div class="gsl-numeric">
      <slot name="track" />
    </div>

    <div class="gsl-numeric__indicator">
      <slot name="indicator" />
    </div>

    <div
      v-if="!disableControls"
      class="gsl-numeric__contorls"
    >
      <GSArrow
        :disabled="disabledSide === 'left'"
        side="left"
        class="gsl-numeric__arrow gsl-numeric__arrow--left"
        @click="onMove(-1)"
      />

      <div
        class="gsl-numeric__contorls-text"
      >
        {{ currentItem + 1 }}
        <span>
          /
        </span>
        {{ items.length }}
      </div>

      <GSArrow
        :disabled="disabledSide === 'right'"
        side="right"
        class="gsl-numeric__arrow gsl-numeric__arrow--right"
        @click="onMove(1)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gsl-numeric {
  position: relative;
  margin-left: calc(var(--gsc-item-gap-x) * -1px);
  margin-right: calc(var(--gsc-item-gap-x) * -1px);
  position: relative;

  &__contorls {
    display: flex;
    align-items: center;
    justify-content: center;

    &-text {
      display: flex;
      padding: 10px 30px;
      color: #878787;

      span {
        margin: 0 2px;
      }
    }
  }

  &__indicator {
    margin-top: 12px;
  }
}
</style>
