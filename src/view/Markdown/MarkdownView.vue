<template>
  <MdPreview
    class="custom-font"
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
      required: true, // 确保 generateData 是必传的
    },
  },
  computed: {
    // 将 generateData 转换为自定义字符
    // transformedData() {
    //   const generateCustomText = (text) => {
    //     const codePoints = [
    //       0xe800, 0xe801, 0xe802, 0xe803, 0xe804, 0xe805, 0xe806, 0xe807,
    //       0xe808, 0xe809,
    //     ];
    //     let result = "";
    //     for (let i = 0; i < text.length; i++) {
    //       const char = text[i];
    //       if (/\d/.test(char)) {
    //         // 如果是数字，转换为对应的字符
    //         const codePoint = codePoints[parseInt(char)];
    //         result += `&#x${codePoint.toString(16)};`;
    //       } else {
    //         result += char; // 如果不是数字，保留原字符
    //       }
    //     }
    //     return result;
    //   };
    //
    //   return generateCustomText(this.generateData);
    // },
  },
  data() {
    return {
      id,
      generateId,
    };
  },
};
</script>

<style scoped></style>

//@font-face { // font-family: "CustomFont"; // src:
url("/public/fontello.woff"), url("/public/fontello.eot"); /* 字体文件路径 */
//} // ///* 应用自定义字体 */ //.custom-font { // font-family: "CustomFont",
sans-serif; // font-size: 24px; //}
