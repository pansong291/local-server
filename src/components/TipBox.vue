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

<style scoped lang="scss">
.tip-box {
  padding: 8px 16px;
  border-radius: 4px;
  margin: 20px 0;
  font-size: var(--el-font-size-base);
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background-color: rgba(var(--el-color-primary-rgb), 0.2);
  border-left: 5px solid var(--el-color-primary);

  &.success {
    background-color: rgba(var(--el-color-success-rgb), 0.2);
    border-left: 5px solid var(--el-color-success);
  }

  &.error {
    background-color: rgba(var(--el-color-danger-rgb), 0.2);
    border-left: 5px solid var(--el-color-danger);
  }

  &.warning {
    background-color: rgba(var(--el-color-warning-rgb), 0.2);
    border-left: 5px solid var(--el-color-warning);
  }

  &.info {
    background-color: rgba(var(--el-color-info-rgb), 0.2);
    border-left: 5px solid var(--el-color-info);
  }
}
</style>
