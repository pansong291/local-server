<template>
  <el-form-item :show-message="false" :validate-status="validateState">
    <el-input class="mono-textarea" :style="varStyle" type="textarea" spellcheck="false" autosize v-model="value" />
  </el-form-item>
</template>

<script setup lang="ts">
import { Ref } from 'vue'

const props = defineProps<{
  funcPrefix: string
  funcSuffix: string
  modelValue: string
  validator: () => boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
const varStyle: Ref<string> = ref(`--mono-before-content: '${props.funcPrefix}';--mono-after-content: '${props.funcSuffix}';`)

const validateState: Ref<'' | 'success' | 'error'> = ref('')
const value = computed!({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

watchEffect!(() => {
  validateState.value = props.validator() ? 'success' : 'error'
})
</script>

<style scoped lang="scss">
.mono-textarea {
  font-family: var(--font-family-mono);

  &::before {
    content: var(--mono-before-content);
    top: 5px;
  }

  &::after {
    content: var(--mono-after-content);
    bottom: 5px;
  }

  &::before,
  &::after {
    display: block;
    position: absolute;
    pointer-events: none;
    font-style: italic;
    color: var(--el-input-text-color, var(--el-text-color-regular));
    background: transparent;
    line-height: 1.5em;
    left: 11px;
    z-index: 1;
  }

  :deep(textarea) {
    line-height: 1.5em;
    padding: calc(5px + 1.5em) calc(11px + 2em);
    z-index: 0;
  }
}
</style>
