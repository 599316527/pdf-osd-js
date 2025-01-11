<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
</script>

<template>
  <el-container>
    <el-header>
      <div>
        <el-text type="primary" size="large">
          <el-icon><Document /></el-icon>
          PDF方向检测
        </el-text>
      </div>
      <div>
        <el-text size="small">所有处理均在本地执行，不会上传任何数据。</el-text>
      </div>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped></style>
