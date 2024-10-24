<script setup lang="ts">
import { ref, Ref } from "vue";
import router from "@/router";

const path = router.currentRoute.value.fullPath;
const status: Ref<string> = ref(path.split("/")[5]);
</script>

<template>
  <ul class="timeline mx-auto">
    <li>
      <div class="timeline-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-if="status == 'select' || status == 'show' || status == 'success'"
        >
          <path
            fill="#3B82F6"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002H7.971L6.072 5.385v1.271l1.834-1.318h.065V12h1.312z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else-if="status == 'info'"
        >
          <path
            fill="#3B82F6"
            d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else
        >
          <path
            fill="#a8a8a8"
            d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383z"
          />
        </svg>
      </div>
      <div
        :class="
          'timeline-end timeline-box mx-14 ' +
          (status == 'info' ||
          status == 'select' ||
          status == 'show' ||
          status == 'success'
            ? 'text-blue-500 font-bold'
            : '')
        "
      >
        比赛设置
      </div>
      <hr
        :class="
          status == 'select' || status == 'show' || status == 'success'
            ? 'bg-blue-500'
            : ''
        "
      />
    </li>
    <li>
      <hr
        :class="
          status == 'select' || status == 'show' || status == 'success'
            ? 'bg-blue-500'
            : ''
        "
      />
      <div class="timeline-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-if="status == 'show' || status == 'success'"
        >
          <path
            fill="#3B82F6"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24c0-.691.493-1.306 1.336-1.306c.756 0 1.313.492 1.313 1.236c0 .697-.469 1.23-.902 1.705l-2.971 3.293V12h5.344v-1.107H7.268v-.077l1.974-2.22l.096-.107c.688-.763 1.287-1.428 1.287-2.43c0-1.266-1.031-2.215-2.613-2.215c-1.758 0-2.637 1.19-2.637 2.402v.065h1.271v-.07Z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else-if="status == 'select'"
        >
          <path
            fill="#3B82F6"
            d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24v.07H5.375v-.064c0-1.213.879-2.402 2.637-2.402c1.582 0 2.613.949 2.613 2.215c0 1.002-.6 1.667-1.287 2.43l-.096.107l-1.974 2.22v.077h3.498V12H5.422v-.832l2.97-3.293c.434-.475.903-1.008.903-1.705c0-.744-.557-1.236-1.313-1.236c-.843 0-1.336.615-1.336 1.306"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else
        >
          <path
            fill="#a8a8a8"
            d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24v.07H5.375v-.064c0-1.213.879-2.402 2.637-2.402c1.582 0 2.613.949 2.613 2.215c0 1.002-.6 1.667-1.287 2.43l-.096.107l-1.974 2.22v.077h3.498V12H5.422v-.832l2.97-3.293c.434-.475.903-1.008.903-1.705c0-.744-.557-1.236-1.313-1.236c-.843 0-1.336.615-1.336 1.306"
          />
        </svg>
      </div>
      <div
        :class="
          'timeline-end timeline-box mx-14 ' +
          (status == 'select' || status == 'show' || status == 'success'
            ? 'text-blue-500 font-bold'
            : '')
        "
      >
        题目选择
      </div>
      <hr
        :class="status == 'show' || status == 'success' ? 'bg-blue-500' : ''"
      />
    </li>

    <li>
      <hr
        :class="status == 'show' || status == 'success' ? 'bg-blue-500' : ''"
      />
      <div class="timeline-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-if="status == 'success'"
        >
          <path
            fill="#3B82F6"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8.082.414c.92 0 1.535.54 1.541 1.318c.012.791-.615 1.36-1.588 1.354c-.861-.006-1.482-.469-1.54-1.066H5.104c.047 1.177 1.05 2.144 2.754 2.144c1.653 0 2.954-.937 2.93-2.396c-.023-1.278-1.031-1.846-1.734-1.916v-.07c.597-.1 1.505-.739 1.482-1.876c-.03-1.177-1.043-2.074-2.637-2.062c-1.675.006-2.59.984-2.625 2.12h1.248c.036-.556.557-1.054 1.348-1.054c.785 0 1.348.486 1.348 1.195c.006.715-.563 1.237-1.342 1.237h-.838v1.072h.879Z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else-if="status == 'show'"
        >
          <g fill="#3B82F6">
            <path
              d="M7.918 8.414h-.879V7.342h.838c.78 0 1.348-.522 1.342-1.237c0-.709-.563-1.195-1.348-1.195c-.79 0-1.312.498-1.348 1.055H5.275c.036-1.137.95-2.115 2.625-2.121c1.594-.012 2.608.885 2.637 2.062c.023 1.137-.885 1.776-1.482 1.875v.07c.703.07 1.71.64 1.734 1.917c.024 1.459-1.277 2.396-2.93 2.396c-1.705 0-2.707-.967-2.754-2.144H6.33c.059.597.68 1.06 1.541 1.066c.973.006 1.6-.563 1.588-1.354c-.006-.779-.621-1.318-1.541-1.318"
            />
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"
            />
          </g>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else
        >
          <g fill="#a8a8a8">
            <path
              d="M7.918 8.414h-.879V7.342h.838c.78 0 1.348-.522 1.342-1.237c0-.709-.563-1.195-1.348-1.195c-.79 0-1.312.498-1.348 1.055H5.275c.036-1.137.95-2.115 2.625-2.121c1.594-.012 2.608.885 2.637 2.062c.023 1.137-.885 1.776-1.482 1.875v.07c.703.07 1.71.64 1.734 1.917c.024 1.459-1.277 2.396-2.93 2.396c-1.705 0-2.707-.967-2.754-2.144H6.33c.059.597.68 1.06 1.541 1.066c.973.006 1.6-.563 1.588-1.354c-.006-.779-.621-1.318-1.541-1.318"
            />
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"
            />
          </g>
        </svg>
      </div>
      <div
        :class="
          'timeline-end timeline-box mx-14 ' +
          (status == 'show' || status == 'success'
            ? 'text-blue-500 font-bold'
            : '')
        "
      >
        题目预览
      </div>
      <hr :class="status == 'success' ? 'bg-blue-500' : ''" />
    </li>
    <li>
      <hr :class="status == 'success' ? 'bg-blue-500' : ''" />
      <div class="timeline-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-if="status == 'success'"
        >
          <g fill="#3B82F6">
            <path
              d="M7.519 5.057q.33-.527.657-1.055h1.933v5.332h1.008v1.107H10.11V12H8.85v-1.559H4.978V9.322c.77-1.427 1.656-2.847 2.542-4.265ZM6.225 9.281v.053H8.85V5.063h-.065c-.867 1.33-1.787 2.806-2.56 4.218"
            />
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"
            />
          </g>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          v-else
        >
          <g fill="#a8a8a8">
            <path
              d="M7.519 5.057q.33-.527.657-1.055h1.933v5.332h1.008v1.107H10.11V12H8.85v-1.559H4.978V9.322c.77-1.427 1.656-2.847 2.542-4.265ZM6.225 9.281v.053H8.85V5.063h-.065c-.867 1.33-1.787 2.806-2.56 4.218"
            />
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"
            />
          </g>
        </svg>
      </div>
      <div
        :class="
          'timeline-end timeline-box mx-14 ' +
          (status == 'success' ? 'text-blue-500 font-bold' : '')
        "
      >
        比赛创建成功
      </div>
    </li>
  </ul>
</template>

<style scoped></style>
