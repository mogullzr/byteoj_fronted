<template>
  <MdPreview
      class="custom-font"
      :marked-heading-id="generateId"
      :editorId="id"
      :modelValue="processedData"
      previewTheme="github"
  />
</template>

<script>
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";

const id = "preview-only";
const generateId = (_text, _level, index) => `heading-${index}`;

export default {
  name: "problem_content",
  components: { MdPreview },
  props: {
    generateData: {
      type: String,
      required: true,
    },
  },
  computed: {
    processedData() {
      if (!this.generateData) return "";
      return this.generateData;
    },
  },
  data() {
    return {
      id,
      generateId,
    };
  },
};
</script>

<style scoped>
/* 方法：使用 :deep() 穿透到组件内部 */

/* 1. 设置整体容器的字体大小 */
.custom-font :deep(.md-editor-preview) {
  font-size: 18px; /* 这里调整为你想要的大小，默认通常是 16px */
  line-height: 1.9;
}

/* 2. 如果你只想调整段落，也可以更精确地选择 */
.custom-font :deep(.md-editor-preview p) {
  font-size: 18px;
  line-height: 1.9;
}

/* 3. 如果标题太小，也可以单独调整标题大小 (可选) */
.custom-font :deep(.md-editor-preview h1),
.custom-font :deep(.md-editor-preview h2),
.custom-font :deep(.md-editor-preview h3) {
  /* 标题通常有独立的大小，如果需要统一放大可在此设置 */
  /* font-size: 1.5em; */
}
</style>