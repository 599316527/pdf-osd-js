<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import File from '../components/File.vue'
import { osdCheckerPromise } from './check'

const files = shallowRef<File[]>([])
const fileRefs = shallowRef<InstanceType<typeof File>[]>()

const isModelLoading = ref(true)
osdCheckerPromise.then(() => {
  isModelLoading.value = false
})

const isProcessing = ref(false)

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const fileList = Array.from(input.files).filter((file) => file.name.endsWith('.pdf'))
    files.value = fileList
    input.value = ''
  }
  nextTick(async () => {
    const comps = fileRefs.value ?? []
    isProcessing.value = true
    for (const comp of comps) {
      await comp.start()
    }
    isProcessing.value = false
    ElMessage({
      message: '处理完成',
      type: 'success',
    })
  })
}
</script>

<template>
  <div v-if="!isProcessing" class="pick-files">
    <span>
      选择PDF
      <input type="file" accept="application/pdf" multiple @change="handleFileChange" />
    </span>

    <template v-if="isModelLoading">
      <el-divider direction="vertical" />
      <span>模型加载中...</span>
    </template>
  </div>

  <el-collapse v-if="files.length">
    <File v-for="file in files" :key="file.name" :file="file" ref="fileRefs" />
  </el-collapse>
</template>

<style scoped>
.pick-files {
  margin-bottom: 1em;
}
</style>
