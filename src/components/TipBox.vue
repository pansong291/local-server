<template>
<div class="tip-box" :class="type">
  <slot></slot>
</div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'success' | 'error' | 'warning' | 'info'
}>()
</script>

<style scoped>
.tip-box {
  padding: 8px 16px;
  border-radius: 4px;
  margin: 20px 0;
  font-size: var(--el-font-size-base);
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background-color: rgba(var(--el-color-primary-rgb), .2);
  border-left: 5px solid var(--el-color-primary);
}
.tip-box.success {
  background-color: rgba(var(--el-color-success-rgb), .2);
  border-left: 5px solid var(--el-color-success);
}
.tip-box.error {
  background-color: rgba(var(--el-color-danger-rgb), .2);
  border-left: 5px solid var(--el-color-danger);
}
.tip-box.warning {
  background-color: rgba(var(--el-color-warning-rgb), .2);
  border-left: 5px solid var(--el-color-warning);
}
.tip-box.info {
  background-color: rgba(var(--el-color-info-rgb), .2);
  border-left: 5px solid var(--el-color-info);
}
</style>
