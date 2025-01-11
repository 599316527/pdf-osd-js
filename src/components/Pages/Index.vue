<script setup lang="ts">
import { ref, type PropType, watch } from 'vue'
import {type OsdDetectResult} from '../osd'
import { renderPdfPages } from '../pdf'
import PageItem from './Item.vue'

type PageItemProps = InstanceType<typeof PageItem>['$props']

const { file, result, visible } = defineProps({
  file: {
    type: File,
    required: true,
  },
  result: {
    type: Array as PropType<OsdDetectResult[]>,
    required: true,
  },
  visible: Boolean,
})

const canvases = ref<HTMLCanvasElement[]>([])

watch(
  () => visible,
  async (val) => {
    if (val) {
      const els = await renderPdfPages(file)
      canvases.value = els
    }
  },
  { immediate: true },
)

const showDialog = ref(false)
const showItemProps = ref<PageItemProps | undefined>()
function handleClick(i: number) {
  showDialog.value = true
  const img = new Image()
  img.src = canvases.value[i].toDataURL()
  showItemProps.value = {
    pageIndex: i,
    result: result[i],
    canvas: img,
  }
}
</script>
<template>
  <div class="pages-view" v-if="visible && canvases.length">
    <PageItem
      :class="{
        page: true,
        abnormal: r.orientation_degrees !== 0,
      }"
      v-for="(r, i) in result"
      :key="i"
      :page-index="i"
      :result="r"
      :canvas="canvases[i]"
      @click="handleClick(i)"
    />

    <el-dialog v-model="showDialog" width="80%" center v-if="showItemProps">
      <PageItem class="dialog-item" v-bind="showItemProps" />
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.pages-view {
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 8px;
}
.page {
  border: 1px solid yellow;

  &.abnormal {
    border-color: red;
  }
}

.dialog-item {
  :deep(img) {
    max-width: 100%;
  }
}
</style>
