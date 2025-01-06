<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
</script>

<template>
  <el-container>
    <el-header>
      <el-text type="primary" size="large">
        <el-icon><Document /></el-icon>
        PDF方向检测
      </el-text>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped></style>
