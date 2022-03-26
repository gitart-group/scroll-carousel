<script lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue'

import { useAnimateNumber } from '../composables/useAnimateNumber'

import GScrollCarouselArrow from './GScrollCarouselArrow.vue'
import GScrollCarouselIndicator from './GScrollCarouselIndicator.vue'

export default defineComponent({
  name: 'GScrollCarousel',
  components: {
    GScrollCarouselArrow,
    GScrollCarouselIndicator,
  },

  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },

    // how much items in the view
    itemsToShow: {
      type: Number,
      required: true,
    },

    // key field name for :key in v-for
    // (use index by default)
    keyField: {
      type: String,
      default: null,
    },

    // gap around each item.
    // value '12' means 'padding: 6px;' for each item.
    // value '12 20' means 'padding: 6px 10px;' for each item.
    itemGap: {
      type: [String, Number],
      default: '0',
      validator: (value: string | number) => {
        const gaps = value.toString().split(' ')
        return gaps.length <= 2 && gaps.every((gap: string) => !isNaN(parseInt(gap)))
      },
    },

    // visible part of next item in carousel
    previewSize: {
      type: Number,
      default: 120,
    },

    // if false, arrow will not be shown
    showArrows: {
      type: Boolean,
      default: true,
    },

    // transition name for arrow
    arrowTransition: {
      type: String,
      default: 'gsc-arrow-transition',
    },
  },
  setup(props) {
    const initialized = ref(false)
    const trackRef = ref<HTMLElement | null>(null)
    const onEdge = ref<'left' | 'right' | null>('left')
    const width = ref(0)

    const indicatorOptions = reactive({
      isScrolling: false,
      barOffsetPercent: 0,
      barWidthPercent: 0,
    })

    let scrollListenerTimerId: ReturnType<typeof setTimeout>

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

    const slideWidth = computed(() => {
      return (width.value - props.previewSize) / props.itemsToShow
    })

    const setScrollLeft = (newScrollLeft: number, smooth = true) => {
      // Clear timer. It would break the carousel if the timer is waiting to be executed.
      clearTimeout(scrollListenerTimerId)

      if (smooth) {
        const currentScrollLeft = trackRef.value!.scrollLeft
        setSmoothly(newScrollLeft, currentScrollLeft)
      }
      else {
        setImmediately(newScrollLeft)
      }
    }

    /**
     * Event handlers
     */

    const onMove = (move: number) => {
      const scrollLeft = trackRef.value!.scrollLeft

      // offset to the left or right edge of the visible view of the carousel
      const offsetToLeft = (scrollLeft + (itemGap.value.x / 2))
      const offsetToRight = (scrollLeft - (itemGap.value.x / 2) + width.value)

      // how much pixels of the next and prev slide we see
      const prevSlideInView = slideWidth.value - (offsetToLeft % slideWidth.value)
      const nextSlideInView = offsetToRight % slideWidth.value

      const prevSlideIndex = Math.floor(offsetToLeft / slideWidth.value)

      if (move === 1) {
        let slide: number = prevSlideIndex + move * props.itemsToShow
        if (slideWidth.value - nextSlideInView < itemGap.value.x)
          slide += 1

        const maxSlide = props.items.length - props.itemsToShow
        if (slide > maxSlide)
          slide = maxSlide

        const newScrollLeft = slideWidth.value * slide
        setScrollLeft(newScrollLeft)
      }
      else if (move === -1) {
        let slide: number = prevSlideIndex + move * props.itemsToShow
        if (slideWidth.value - prevSlideInView < itemGap.value.x)
          slide -= 1

        if (slide < 0)
          slide = 0

        else
          slide += 1

        const newScrollLeft = (slideWidth.value * slide) - props.previewSize
        setScrollLeft(newScrollLeft)
      }
    }

    const onTrackScroll = () => {
      const scrollLeft = trackRef.value!.scrollLeft
      if (scrollLeft === 0)
        onEdge.value = 'left'

      else if (scrollLeft + trackRef.value!.offsetWidth === trackRef.value!.scrollWidth)
        onEdge.value = 'right'

      else
        onEdge.value = null

      indicatorOptions.barOffsetPercent = (scrollLeft / trackRef.value!.scrollWidth) * 100

      clearTimeout(scrollListenerTimerId)
      scrollListenerTimerId = setTimeout(() => {
        setImmediately(scrollLeft)
      }, 100)
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

    onMounted(() => {
      const resizeObserver = new ResizeObserver(([entry]) => {
        window.requestAnimationFrame(() => {
          width.value = entry.contentRect.width
          nextTick(() => {
            indicatorOptions.barWidthPercent = (width.value / trackRef.value!.scrollWidth) * 100
          })
        })
      })

      resizeObserver.observe(trackRef.value as HTMLElement)

      initialized.value = true
    })

    /**
     * Styles/Classes
     */

    const styles = computed(() => {
      return Object.entries({
        '--gsc-slide-gap-y': itemGap.value.y,
        '--gsc-slide-gap-x': itemGap.value.x,
      }).reduce((acc, [key, value]) => {
        return `${acc}${key}: ${value};`
      }, '')
    })

    const slideStyle = computed(() => ({
      width: `calc((100% - ${props.previewSize}px) / ${props.itemsToShow})`,
    }))

    return {
      trackRef,

      styles,
      slideStyle,
      initialized,
      onEdge,
      indicatorOptions,
      onMove,
      onTrackScroll,
      onIndicatorScroll,
      onSetIndicatorScrollStatus,
    }
  },
})
</script>

<template>
  <div class="gsc" :style="styles">
    <div
      class="gsc-content"
      :class="{
        'gsc-content--scrolling': indicatorOptions.isScrolling,
      }"
    >
      <div
        ref="trackRef"
        class="gsc-content__track"
        @scroll.passive="onTrackScroll"
      >
        <div class="gsc-content__track-inner">
          <div
            v-for="(item, index) in items"
            :key="keyField ? item[keyField] : index"
            class="gsc-content__slide"
            :style="slideStyle"
          >
            <slot
              name="item"
              :data="item"
              :index="index"
            />
          </div>
        </div>
      </div>

      <slot
        v-if="initialized && showArrows"
        name="arrow"
        :side="'left' as ('left' | 'right')"
        :active="onEdge !== 'left'"
        :move="() => onMove(-1)"
      >
        <Transition :name="arrowTransition">
          <GScrollCarouselArrow
            v-if="onEdge !== 'left'"
            side="left"
            class="gsc-content__arrow gsc-content__arrow--left"
            @click="onMove(-1)"
          />
        </Transition>
      </slot>

      <slot
        v-if="initialized && showArrows"
        name="arrow"
        :side="'right' as ('left' | 'right')"
        :active="onEdge !== 'right'"
        :move="() => onMove(1)"
      >
        <Transition :name="arrowTransition">
          <GScrollCarouselArrow
            v-if="onEdge !== 'right'"
            side="right"
            class="gsc-content__arrow gsc-content__arrow--right"
            @click="onMove(1)"
          />
        </Transition>
      </slot>
    </div>

    <GScrollCarouselIndicator
      class="gsc-content__indicator"
      :bar-offset-percent="indicatorOptions.barOffsetPercent"
      :bar-width-percent="indicatorOptions.barWidthPercent"
      @smooth-scroll="onIndicatorScroll($event, true)"
      @scroll="onIndicatorScroll"
      @scroll:start="onSetIndicatorScrollStatus(true)"
      @scroll:end="onSetIndicatorScrollStatus(false)"
    />
  </div>
</template>

<style lang="scss" scoped>
.gsc {
  --gsc-arrow-color: var(--gsc-custom-arrow-color, #000);
  --gsc-indicator-bar-color: var(--gsc-custom-indicator-bar-color, #212121);
  --gsc-indicator-track-color: var(--gsc-custom-indicator-track-color, #e0e0e0);
}

.gsc-content {
  margin-left: calc(var(--gsc-slide-gap-x) * -1px);
  margin-right: calc(var(--gsc-slide-gap-x) * -1px);
  position: relative;

  &--scrolling {
    user-select: none;
  }

  &__track {
    overflow-x: auto;
    overflow-y: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__track-inner {
    display: flex;
  }

  &__slide {
    padding: calc(var(--gsc-slide-gap-y) * 1px) calc(var(--gsc-slide-gap-x) * 1px);
    flex-shrink: 0;
  }

  &__arrow {
    top: 50%;
    position: absolute;
    transform: translate(0, -50%);

    &--left {
      left: calc((var(--gsc-slide-gap-x) * -1px));
    }

    &--right {
      right: calc((var(--gsc-slide-gap-x) * -1px));
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
