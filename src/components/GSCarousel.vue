<script lang="ts">
import type { ComponentPublicInstance, PropType, ShallowUnwrapRef } from 'vue'

import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

import { useAnimateNumber } from '../composables/useAnimateNumber'

import GSIndicator from './GSIndicator.vue'

export default defineComponent({
  name: 'GSCarousel',
  components: {
    GSIndicator,
  },
  props: {
    currentItem: {
      type: Number,
      default: 0,
    },

    items: {
      type: Array as PropType<any[]>,
      required: true,
    },

    // How much items in the view
    itemsToShow: {
      type: Number,
      required: true,
    },

    // Key field name for :key in v-for
    // (using index by default)
    keyField: {
      type: String,
      default: null,
    },

    // Gap around each item.
    // Value '12' means 'padding: 6px;' for each item.
    // Value '12 20' means 'padding: 6px 10px;' for each item.
    itemGap: {
      type: [String, Number],
      default: '0',
      validator: (value: string | number) => {
        const gaps = value.toString().split(' ')
        return gaps.length <= 2 && gaps.every((gap: string) => !isNaN(parseInt(gap)))
      },
    },

    // The visible part of the next element in the carousel
    previewSize: {
      type: Number,
      default: 120,
    },

    // Enables sticking to the sides of the carousel
    sticky: {
      type: Boolean,
      default: false,
    },

    // layout component
    layout: {
      type: Object as PropType<ComponentPublicInstance | ShallowUnwrapRef<ComponentPublicInstance>>,
      required: true,
    },

    // layout specific props
    layoutProps: {
      type: Object as PropType<Object>,
      required: false,
      default: null,
    },

    /**
     * Item min-width on app startup when html is displayed,
     * but js is not loaded yet.
     * It correct's the item width in SSR mode.
     */
    ssrItemMinWidth: {
      type: [Number, String],
      default: null,
    },

    /**
     * Item max-width on app startup when html is displayed,
     * but js is not loaded yet.
     * It correct's the item width in SSR mode.
     */
    ssrItemMaxWidth: {
      type: [Number, String],
      default: null,
    },
  },

  emits: {
    'update:current-item': (value: number) => true,
  },

  setup(props, { emit, expose }) {
    const initialized = ref(false)
    const trackRef = ref<HTMLElement | null>()
    const disabledSide = ref<'left' | 'right' | 'none'>('left')
    const width = ref(0)

    const scopedCurrentItem = ref(props.currentItem || 0)
    watch(() => props.currentItem, (val) => {
      scopedCurrentItem.value = val
    })

    const indicatorOptions = reactive({
      isScrolling: false,
      barOffsetPercent: 0,
      barWidthPercent: 0,
    })

    const currentItemByPercent = computed(() => {
      const scrollPercent = (indicatorOptions.barOffsetPercent / (100 - indicatorOptions.barWidthPercent))
      const item = Math.floor(scrollPercent * (props.items.length - 1))
      return item
    })

    const {
      setImmediately,
      setSmoothly,
    } = useAnimateNumber((offset: number) =>
      trackRef.value?.scrollTo({
        left: offset,
      }),
    )

    const itemGap = computed(() => {
      const gapsArr = props.itemGap.toString().split(' ').map(g => parseInt(g))
      const y = gapsArr[0]
      const x = gapsArr.length === 1 ? y : gapsArr[1]

      return { y, x }
    })

    const itemWidth = computed(() => {
      return width.value ? (width.value - props.previewSize) / props.itemsToShow : 0
    })

    const setScrollLeft = (newScrollLeft: number, smooth = true) => {
      if (smooth) {
        const currentScrollLeft = trackRef.value!.scrollLeft
        setSmoothly(newScrollLeft, currentScrollLeft)
      }
      else {
        setImmediately(newScrollLeft)
      }
    }

    const getCurrentItem = () => {
      const scrollLeft = trackRef.value!.scrollLeft

      const rawDecimal = scrollLeft / itemWidth.value
      const absence = 1 - (rawDecimal - Math.floor(rawDecimal))

      let item
      if (absence < 0.09)
        item = Math.floor(rawDecimal) + 1
      else
        item = Math.floor(rawDecimal)

      // The item shouldn't be scrolled out
      if (item * itemWidth.value < scrollLeft)
        item += 1

      if (item > props.items.length - 1)
        item = props.items.length - 1

      return item
    }

    /**
     * Event handlers
     */

    const onMove = (move: number) => {
      const scrollLeft = trackRef.value!.scrollLeft
      const item = getCurrentItem()

      if (move === 1) {
        let itemToScroll = item + props.itemsToShow

        // to not scrolled out a partially visible item
        // we decrement the itemToScroll by 1
        // (should be before max item check)
        const isLastInvisible = ((item * itemWidth.value) - props.previewSize - 2) > (scrollLeft)
        if (isLastInvisible)
          itemToScroll -= 1

        // Last item to scroll
        const maxItem = props.items.length - props.itemsToShow
        if (itemToScroll > maxItem)
          itemToScroll = maxItem

        const newScrollLeft = itemWidth.value * itemToScroll
        setScrollLeft(newScrollLeft)
      }
      else if (move === -1) {
        if (item === 0)
          return

        let itemToScroll = item - props.itemsToShow
        if (itemToScroll < 0)
          itemToScroll = 0

        const newScrollLeft = (itemWidth.value * itemToScroll) - props.previewSize
        setScrollLeft(newScrollLeft)
      }
    }

    const onMoveTo = (index: number) => {
      if (!itemWidth.value) {
        setTimeout(() => {
          onMoveTo(index)
        }, 50)
        return
      }

      if (index > getCurrentItem()) {
        const newScrollLeft = itemWidth.value * index
        setScrollLeft(newScrollLeft)
        return
      }

      const newScrollLeft = (itemWidth.value * index) - props.previewSize
      setScrollLeft(newScrollLeft)
    }

    const onFinishScrollingThrottled = useThrottleFn(() => {
      const item = getCurrentItem()
      if (item !== scopedCurrentItem.value) {
        scopedCurrentItem.value = item
        emit('update:current-item', scopedCurrentItem.value)
      }
    }, 200)

    let prevScrollLeft = 0
    const onFinishScrollingDebounced = useDebounceFn((scrollLeft: number) => {
      setImmediately(scrollLeft)

      if (!props.sticky || indicatorOptions.isScrolling)
        return

      // move to right on any move
      if (prevScrollLeft < scrollLeft) {
        const newScrollLeft = (itemWidth.value * scopedCurrentItem.value)
        setScrollLeft(newScrollLeft)
      }
      // move to left if the carousel is scrolled more than previewSize
      else if (Math.abs((itemWidth.value * scopedCurrentItem.value) - scrollLeft) > (props.previewSize + 2)) {
        const newScrollLeft = (itemWidth.value * (scopedCurrentItem.value - 1)) - props.previewSize
        setScrollLeft(newScrollLeft)
      }

      prevScrollLeft = scrollLeft
    }, 300)

    const onTrackScroll = () => {
      const scrollLeft = trackRef.value!.scrollLeft

      if (scrollLeft < 2)
        disabledSide.value = 'left'

      else if (trackRef.value!.scrollWidth <= (scrollLeft + trackRef.value!.offsetWidth + 2))
        disabledSide.value = 'right'

      else
        disabledSide.value = 'none'

      indicatorOptions.barOffsetPercent = (scrollLeft / trackRef.value!.scrollWidth) * 100

      onFinishScrollingThrottled()
      onFinishScrollingDebounced(scrollLeft)
    }

    const onIndicatorScroll = ({ barOffsetPercent }: { barOffsetPercent: number }, smooth = false) => {
      const scrollLeft = trackRef.value!.scrollWidth * (barOffsetPercent / 100)
      setScrollLeft(scrollLeft, smooth)
    }

    const onSetIndicatorScrollStatus = (isScrolling: boolean) => {
      indicatorOptions.isScrolling = isScrolling
    }

    /**
     * Life Circles
     */

    let resizeObserver: ResizeObserver | null = null
    onMounted(() => {
      resizeObserver = new ResizeObserver(([entry]) => {
        window.requestAnimationFrame(() => {
          width.value = entry.contentRect.width
          nextTick(() => {
            indicatorOptions.barWidthPercent = (width.value / trackRef.value!.scrollWidth) * 100
          })
        })
      })

      resizeObserver.observe(trackRef.value as HTMLElement)

      initialized.value = true

      if (scopedCurrentItem.value !== 0)
        onMoveTo(scopedCurrentItem.value)
    })
    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
    })

    /**
     * Styles/Classes
     */

    const styles = computed(() => {
      return Object.entries({
        '--gsc-item-gap-y': itemGap.value.y,
        '--gsc-item-gap-x': itemGap.value.x,
        '--gsc-item-ssr-min-width': props.ssrItemMinWidth ? `${parseInt(props.ssrItemMinWidth.toString())}px` : '',
        '--gsc-item-ssr-max-width': props.ssrItemMaxWidth ? `${parseInt(props.ssrItemMaxWidth.toString())}px` : '',
      }).reduce((acc, [key, value]) => {
        return `${acc}${key}: ${value};`
      }, '')
    })

    const itemStyle = computed(() => ({
      width: `calc((100% - ${props.previewSize}px) / ${props.itemsToShow})`,
    }))

    expose({
      onMove,
      onMoveTo,
    })

    return {
      trackRef,

      styles,
      itemStyle,
      initialized,
      disabledSide,
      indicatorOptions,
      scopedCurrentItem,
      currentItemByPercent,
      onMove,
      onMoveTo,
      onTrackScroll,
      onIndicatorScroll,
      onSetIndicatorScrollStatus,
    }
  },
})
</script>

<template>
  <div
    class="gsc"
    :class="{
      'gsc--scrolling': indicatorOptions.isScrolling,
      'gsc--initialized': initialized,
    }"
    :style="styles"
  >
    <Component
      :is="(layout as any)"
      :on-move="onMove"
      :on-move-to="onMoveTo"
      :disabled-side="disabledSide"
      :current-item="scopedCurrentItem"
      :current-item-by-percent="currentItemByPercent"
      :items="items"
      :initialized="initialized"
      v-bind="layoutProps"
    >
      <template #track>
        <div
          ref="trackRef"
          class="gsc-track"
          @scroll.passive="onTrackScroll"
        >
          <div class="gsc-track__inner">
            <div
              v-for="(item, index) in items"
              :key="keyField ? item[keyField] : index"
              class="gsc-track__item"
              :style="itemStyle"
            >
              <slot
                name="item"
                :data="item"
                :index="index"
              />
            </div>
          </div>
        </div>
      </template>
      <template #indicator>
        <GSIndicator
          :bar-offset-percent="indicatorOptions.barOffsetPercent"
          :bar-width-percent="indicatorOptions.barWidthPercent"
          @smooth-scroll="onIndicatorScroll($event, true)"
          @scroll="onIndicatorScroll"
          @scroll:start="onSetIndicatorScrollStatus(true)"
          @scroll:end="onSetIndicatorScrollStatus(false)"
        />
      </template>
    </Component>
  </div>
</template>

<style lang="scss">
.gsc {
  --gsc-arrow-bg: var(--gsc-custom-arrow-bg, #000);
  --gsc-arrow-bg-hover: var(--gsc-custom-arrow-bg-hover, #222);
  --gsc-arrow-bg-disabled: var(--gsc-custom-arrow-bg-disabled, #d3d3d3);
  --gsc-arrow-color: var(--gsc-custom-arrow-color, #fff);
  --gsc-indicator-bar-color: var(--gsc-custom-indicator-bar-color, #212121);
  --gsc-indicator-track-color: var(--gsc-custom-indicator-track-color, #e0e0e0);

  &--scrolling {
    user-select: none;
  }

  &:not(.gsc--initialized) {
    .gsc-track__item {
      min-width: var(--gsc-item-ssr-min-width) !important;
      max-width: var(--gsc-item-ssr-max-width) !important;
    }
  }
}

.gsc-track {
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__inner {
    display: flex;
  }

  &__item {
    padding: calc(var(--gsc-item-gap-y) * 1px) calc(var(--gsc-item-gap-x) * 1px);
    flex-shrink: 0;
  }
}
</style>
