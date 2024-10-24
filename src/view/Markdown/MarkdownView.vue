<template>
  <MdPreview
    :marked-heading-id="generateId"
    :editorId="id"
    :modelValue="generateData"
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
