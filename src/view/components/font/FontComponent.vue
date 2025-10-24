<template>
  <div class="lightning-container">
    <div class="lightning-text">
      <span
          v-for="(char, index) in text"
          :key="index"
          :style="{ animationDelay: `${index * 0.1}s` }"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, Ref} from "vue";

const props = defineProps<{
  text: string
}>()
const text:Ref<string> = ref(props.text);
</script>

<style scoped>
.lightning-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  overflow: hidden;
}

.lightning-text {
  font-family: 'Arial', sans-serif;
  font-size: 5rem;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
}

.lightning-text span {
  display: inline-block;
  animation: lightning 1.5s infinite;
}

@keyframes lightning {
  0%, 100% {
    color: #fff;
    text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
  }
  50% {
    color: #00ffff;
    text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff, 0 0 80px #00ffff;
  }
}
</style>