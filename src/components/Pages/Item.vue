<script setup lang="ts">
import { ref, type PropType, watch, onMounted } from 'vue'
import { round } from 'lodash-es'
import { type DetectData } from 'tesseract.js'

const { canvas, result, pageIndex } = defineProps({
  canvas: {
    type: HTMLElement,
    required: true,
  },
  result: {
    type: Object as PropType<DetectData>,
    required: true,
  },
  pageIndex: {
    type: Number,
    required: true,
  },
})

const view = ref<HTMLDivElement>()
function setCanvasEl(el: HTMLCanvasElement) {
  if (view.value) {
    view.value.innerHTML = ''
    view.value.appendChild(el)
  }
}

watch(() => canvas, setCanvasEl)

onMounted(() => {
  setCanvasEl(canvas)
})
</script>
<template>
  <div class="item">
    <div class="meta">
      <div class="title">第{{ pageIndex + 1 }}页</div>
      <div :class="{ lang: true, reasonable: result.script_confidence >= 15 }">
        <strong>{{ result.script }}</strong>
        {{ round(result.script_confidence!, 2) }}
      </div>
      <div :class="{ dir: true, reasonable: result.orientation_confidence >= 15 }">
        <strong>{{ result.orientation_degrees }}度</strong>
        {{ round(result.orientation_confidence!, 2) }}
      </div>
    </div>
    <div class="view" ref="view"></div>
  </div>
</template>

<style lang="less" scoped>
.item {
  position: relative;

  :deep(canvas) {
    height: 300px;
  }
}

.meta {
  position: absolute;
  top: 0;
  left: 0;
  color: #333;
  background: #e2e2e2a1;
  padding: 4px;
  backdrop-filter: blur(4px);
}

.reasonable {
  color: red;
}
</style>
