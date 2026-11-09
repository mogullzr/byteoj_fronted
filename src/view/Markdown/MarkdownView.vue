<template>
  <div
      ref="lazyRoot"
      :style="{ minHeight: !isActive && placeholderHeight > 0 ? placeholderHeight + 'px' : null }"
  >
    <MdPreview
        v-if="isActive"
        v-bind="$attrs"
        class="custom-font"
        :marked-heading-id="generateId"
        :editorId="id"
        :modelValue="processedData"
        previewTheme="github"
    />
  </div>
</template>

<script>
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";

let nextMarkdownPreviewId = 0;
const markdownPreviewInstances = new Map();
let markdownIntersectionObserver;
let markdownResizeObserver;

const estimateMarkdownHeight = (text) => {
  if (!text) return 32;
  const estimatedLines = text.split("\n").reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / 64)),
    0,
  );
  return Math.max(32, estimatedLines * 34);
};

const getMarkdownIntersectionObserver = () => {
  if (!markdownIntersectionObserver && typeof IntersectionObserver !== "undefined") {
    markdownIntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const instance = markdownPreviewInstances.get(entry.target);
        if (!instance) return;

        if (entry.isIntersecting) {
          instance.isActive = true;
        } else if (instance.isActive) {
          instance.placeholderHeight = Math.ceil(entry.target.getBoundingClientRect().height);
          instance.isActive = false;
        }
      });
    }, { rootMargin: "800px 0px" });
  }
  return markdownIntersectionObserver;
};

const getMarkdownResizeObserver = () => {
  if (!markdownResizeObserver && typeof ResizeObserver !== "undefined") {
    markdownResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const instance = markdownPreviewInstances.get(entry.target);
        if (instance?.isActive) {
          instance.placeholderHeight = Math.ceil(entry.contentRect.height);
        }
      });
    });
  }
  return markdownResizeObserver;
};

export default {
  name: "problem_content",
  inheritAttrs: false,
  components: { MdPreview },
  props: {
    generateData: {
      type: String,
      required: true,
    },
  },
  data() {
    const id = `markdown-preview-${++nextMarkdownPreviewId}`;
    return {
      id,
      isActive: false,
      placeholderHeight: estimateMarkdownHeight(this.generateData),
      generateId: (_text, _level, index) => `${id}-heading-${index}`,
    };
  },
  mounted() {
    const root = this.$refs.lazyRoot;
    markdownPreviewInstances.set(root, this);

    const intersectionObserver = getMarkdownIntersectionObserver();
    if (!intersectionObserver) {
      this.isActive = true;
      return;
    }

    intersectionObserver.observe(root);
    getMarkdownResizeObserver()?.observe(root);
  },
  beforeUnmount() {
    const root = this.$refs.lazyRoot;
    markdownPreviewInstances.delete(root);
    markdownIntersectionObserver?.unobserve(root);
    markdownResizeObserver?.unobserve(root);
  },
  computed: {
    processedData() {
      if (!this.generateData) return "";
      return this.generateData;
    },
  },
  watch: {
    generateData(value) {
      if (!this.isActive) {
        this.placeholderHeight = estimateMarkdownHeight(value);
      }
    },
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
