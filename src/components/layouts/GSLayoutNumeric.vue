<script lang="ts">
import type { PropType } from 'vue'

import { computed, defineAsyncComponent, defineComponent } from 'vue'

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
    currentItemByPercent: {
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

    disableArrows: {
      type: Boolean,
      default: false,
    },

    disableCounter: {
      type: Boolean,
      default: false,
    },

    percentCounter: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const counter = computed(() => {
      return (props.percentCounter ? props.currentItemByPercent : props.currentItem) + 1
    })

    return {
      counter,
    }
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
      v-if="!(disableArrows && disableCounter)"
      class="gsl-numeric__contorls"
    >
      <GSArrow
        v-if="!disableArrows"
        :disabled="disabledSide === 'left'"
        side="left"
        class="gsl-numeric__arrow gsl-numeric__arrow--left"
        @click="onMove(-1)"
      />

      <div
        v-if="!disableCounter"
        class="gsl-numeric__contorls-text"
      >
        {{ counter }}
        <span>
          /
        </span>
        {{ items.length }}
      </div>

      <GSArrow
        v-if="!disableArrows"
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
    gap: 30px;

    &-text {
      display: flex;
      padding: 10px 0px;
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
