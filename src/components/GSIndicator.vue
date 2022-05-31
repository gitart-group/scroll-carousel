<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'GSIndicator',
  props: {
    barWidthPercent: {
      type: Number,
      required: true,
    },

    barOffsetPercent: {
      type: Number,
      required: true,
    },
  },

  emits: {
    'smooth-scroll': (_: { barOffsetPercent: number }) => true,
    'scroll': (_: { barOffsetPercent: number }) => true,
    'scroll:start': () => true,
    'scroll:end': () => true,
  },

  setup(props, { emit }) {
    const indicatorRef = ref<HTMLDivElement | null>()
    const startBarX = ref(0)
    const startBarOffsetPercent = ref(0)
    const isScrolling = ref(false)

    const mouseMoveHandler = (event: MouseEvent) => {
      const barX = event.clientX

      const difference = barX - startBarX.value

      const width = indicatorRef.value!.offsetWidth

      const differencePercent = (difference / width) * 100

      const minOffset = 0
      const maxOffset = 100 - props.barWidthPercent

      let barOffsetPercent = startBarOffsetPercent.value + differencePercent
      if (barOffsetPercent < minOffset)
        barOffsetPercent = minOffset

      else if (barOffsetPercent > maxOffset)
        barOffsetPercent = maxOffset

      emit('scroll', {
        barOffsetPercent,
      })
    }

    const mouseUpHandler = () => {
      document.removeEventListener('mouseup', mouseUpHandler)
      document.removeEventListener('mousemove', mouseMoveHandler)
      isScrolling.value = false
      emit('scroll:end')
    }

    const onMouseDown = (event: MouseEvent) => {
      isScrolling.value = true
      emit('scroll:start')

      document.addEventListener('mouseup', mouseUpHandler)
      document.addEventListener('mousemove', mouseMoveHandler)

      startBarX.value = event.clientX
      startBarOffsetPercent.value = props.barOffsetPercent
    }

    const onTrackClick = (event: MouseEvent) => {
      const x = event.clientX

      const indicatorEl = indicatorRef.value!
      const indicatorX = indicatorEl.getBoundingClientRect().left
      const relativeX = x - indicatorX

      const relativePosition = relativeX / indicatorEl.offsetWidth

      const barOffsetPercent = (relativePosition - (props.barWidthPercent / 100 / 2)) * 100
      emit('smooth-scroll', {
        barOffsetPercent,
      })
    }

    const barStyle = computed(() => {
      return {
        width: `${props.barWidthPercent}%`,
        left: `${props.barOffsetPercent}%`,
      }
    })

    return {
      indicatorRef,

      barStyle,
      startBarX,
      startBarOffsetPercent,
      moving: isScrolling,
      onTrackClick,
      onMouseDown,
    }
  },
})
</script>

<template>
  <div
    ref="indicatorRef"
    class="gsc-indicator"
    :class="{
      'gsc-indicator--scrolling': moving,
    }"
  >
    <div class="gsc-indicator__track" @click="onTrackClick" />
    <div
      class="gsc-indicator__bar"
      :style="barStyle"
      @mousedown="onMouseDown"
    />
  </div>
</template>

<style lang="scss" scoped>
.gsc-indicator {
  --indicator-height: 26px;

  height: var(--indicator-height);
  display: flex;
  align-items: center;
  position: relative;

  &__track {
    height: 4px;
    background: var(--gsc-indicator-track-color);
    border-radius: 5px;
    width: 100%;
    transition: height 0.15s;
    position: relative;

    &::after {
      content: " ";
      position: absolute;
      top: calc(-1 * (var(--indicator-height) / 2));
      bottom: calc(-1 * (var(--indicator-height) / 2));
      left: 0;
      right: 0;
      display: block;
    }
  }

  &__bar {
    position: absolute;
    z-index: 2;
    left: 0;
    top: 50%;
    transform: translate(0, -50%);
    background: var(--gsc-indicator-bar-color);
    cursor: grab;
    height: 4px;
    width: 0; // 0 by default
    border-radius: 4px;
    transition: height 0.15s;

    &::after {
      content: " ";
      position: absolute;
      top: calc(-1 * (var(--indicator-height) / 2));
      bottom: calc(-1 * (var(--indicator-height) / 2));
      left: 0;
      right: 0;
      display: block;
    }
  }

  &:hover,
  &--scrolling {
    .gsc-indicator__track {
      height: 6px;
    }

    .gsc-indicator__bar {
      height: 8px;
    }
  }

  &--scrolling {
    .gsc-indicator__bar {
      height: 10px !important;
    }
  }
}
</style>
