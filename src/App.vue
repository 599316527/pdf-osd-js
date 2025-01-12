<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
</script>

<template>
  <el-container>
    <el-header>
      <div class="title-row">
        <div>
          <el-text type="primary" size="large">
            <el-icon><Document /></el-icon>
            PDF方向检测
          </el-text>
          <sup>Beta</sup>
        </div>
        <el-text type="info" size="small">所有处理均在本地执行，不会上传任何数据。</el-text>
      </div>
      <div class="desc">
        <el-text>本工具可以找出PDF文件中页面方向异常的页面。</el-text>
      </div>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.desc {
  margin-top: 10px;
}
</style>
