<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import { type DetectData } from 'tesseract.js'
import { SuccessFilled, WarningFilled, Failed } from '@element-plus/icons-vue'
import { compact } from 'lodash-es'
import { CheckStatus } from './common'
import { checkPdf } from './check'
import Pages from './Pages/Index.vue'

const status = ref(CheckStatus.Waiting)
const result = shallowRef<DetectData[]>([])
const error = shallowRef<Error | undefined>(undefined)
const progress = ref(0)
const isReady = computed(() => {
  return status.value === CheckStatus.Success || status.value === CheckStatus.Fail
})

const { file } = defineProps({
  file: {
    type: File,
    required: true,
  },
})

const invalidResults = computed(() => {
  return compact(
    result.value.map((r, i) => {
      if (r.orientation_degrees !== 0 && r.orientation_confidence! >= 1) {
        return { ...r, pageIndex: i }
      }
    }),
  )
})

const briefTip = computed(() => {
  if (!invalidResults.value.length) {
    return `共${result.value.length}页，无异常`
  }
  const pages = invalidResults.value.map((r) => r.pageIndex)
  return `共${result.value.length}页，第${pages.join('、')}页异常`
})

async function start() {
  status.value = CheckStatus.Processing
  try {
    result.value = await checkPdf(file, (p) => (progress.value = p))
    status.value = CheckStatus.Success
  } catch (e: any) {
    status.value = CheckStatus.Fail
    error.value = e
  }
}

defineExpose({
  start,
})
</script>

<template>
  <el-collapse-item :name="file.name" :disabled="!isReady">
    <template #title>
      <div class="title">
        <strong>{{ file.name }}</strong>
        <span v-if="status === CheckStatus.Waiting">
          <el-tag type="info">等待中</el-tag>
        </span>
        <span v-else-if="status === CheckStatus.Processing">
          <el-progress class="progress" :percentage="Math.floor(progress * 100)" />
        </span>
        <span v-else-if="status === CheckStatus.Success">
          <template v-if="invalidResults.length">
            <el-icon class="warning"><WarningFilled /></el-icon>
          </template>
          <template v-else>
            <el-icon class="success"><SuccessFilled /></el-icon>
          </template>
          {{ briefTip }}
        </span>
        <span v-else-if="status === CheckStatus.Fail">
          <el-icon class="failed"><Failed /></el-icon>
          <el-tag type="danger">解析失败</el-tag>
        </span>
      </div>
    </template>
    <template #default>
      <div v-if="error">
        <el-alert type="error" :closable="false">
          {{ error.message }}
        </el-alert>
      </div>
      <div v-if="status === CheckStatus.Success">
        <el-alert v-if="invalidResults.length" type="warning" :closable="false">
          {{
            invalidResults
              .map(
                ({ pageIndex, orientation_degrees }) =>
                  `第${pageIndex + 1}页 旋转了${orientation_degrees}度`,
              )
              .join('，')
          }}
        </el-alert>
        <Pages :file="file" :result="result" :visible="true" />
      </div>
    </template>
  </el-collapse-item>
</template>

<style lang="less" scoped>
.title {
  display: flex;
  align-items: center;
  gap: 1em;
}

.progress {
  width: 200px;
}
.success {
  color: green;
}
.warning {
  color: orange;
}
.failed {
  color: red;
}
</style>
