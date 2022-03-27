<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export interface ISlide {
  id: number
}

const items = ref(new Array(12).fill(null).map(_ => ({ id: (Math.random() * 10000).toFixed(0) })))

const breakpoints = useBreakpoints(breakpointsTailwind)

const itemsToShow = computed(() => {
  switch (true) {
    case breakpoints.xl.value:
      return 5
    case breakpoints.lg.value:
      return 4
    case breakpoints.md.value:
      return 3
  }

  return 2
})

</script>

<template>
  <div class="container max-w- px-4 mx-auto py-10 my-8">
    <h1 class="text-xl font-bold">
      Playground...
    </h1>
    <hr class="mb-6">

    <GSCarousel
      :items="items"
      item-gap="16 10"
      :items-to-show="itemsToShow"
    >
      <template #item="{ index, data }">
        <div class="slide h-full border-1 rounded-lg overflow-hidden">
          <img
            :src="`https://picsum.photos/200/150?random=${index}`"
            class="w-full h-60 object-cover"
          >
          <div class="text-lg p-3 min-h-24">
            {{ index + 1 }} Lorem, ipsum dolor.
            <hr>
            id: {{ (data as ISlide).id }}
          </div>
        </div>
      </template>
    </GSCarousel>

    <hr class="my-8">

    <GSCarousel
      :items="items"
      :items-to-show="2"
    >
      <template #item="{ index }">
        <div class="border-1">
          <img
            :src="`https://picsum.photos/200/150?random=${index}`"
            class="w-full h-60 object-cover"
          >
        </div>
      </template>

      <template #arrow="{ side, move, active }">
        <Transition name="slide-transition">
          <div
            v-if="active"
            class="w-12 h-12 rounded-full bg-red-500 absolute top-1/2 transform -translate-y-1/2 flex justify-center items-center cursor-pointer select-none text-white text-xl font-bold"
            :class="side === 'left' ? '-left-3' : '-right-3'"
            @click="move"
          >
            <span>
              {{ side === 'left' ? '<' : '>' }}
            </span>
          </div>
        </transition>
      </template>
    </GSCarousel>
  </div>
</template>

<style lang="scss" scoped>
.slide {
  box-shadow: 0 10px 15px -5px rgb(0 0 0/0.2);
}

.slide-transition {
  &-enter-active,
  &-leave-active {
    transition: all 0.15s ease-in;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    --tw-rotate: 180deg;
  }
}

</style>
