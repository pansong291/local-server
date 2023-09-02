<template>
  <el-form-item :show-message="false" :validate-status="validateState">
    <el-input class="mono-textarea" :style="varStyle" type="textarea"
              spellcheck="false" autosize v-model="value" />
  </el-form-item>
</template>

<script setup lang="ts">
import { Ref } from 'vue'
import { getMimeFunction, mimeFuncPrefix, mimeFuncSuffix } from '@/utils'

export type FunctionValidateInfo = {
  func?: Function
  errMsg?: string
}

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:validate', v: FunctionValidateInfo): void
}>()
const varStyle: Ref<string> = ref(`--mono-before-content: '${mimeFuncPrefix}';--mono-after-content: '${mimeFuncSuffix}';`)

const validateState: Ref<string> = ref()
const value = computed!({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

watchEffect!(() => {
  try {
    const func: Function = getMimeFunction(value.value)
    func.call(func, '', '')
    validateState.value = 'success'
    emit('update:validate', { func })
  } catch (e) {
    validateState.value = 'error'
    emit('update:validate', { errMsg: String(e) })
  }
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

  &::before, &::after {
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
