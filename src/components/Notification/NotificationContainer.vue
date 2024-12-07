<template>
  <div id="notification-container">
    <Notification
      v-for="(notification, index) in notifications"
      :key="index"
      :type="notification.type"
      :message="notification.message"
      :duration="notification.duration"
      @close="removeNotification(index)"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Notification from "./Notification.vue";

const notifications = ref([]);

const addNotification = (options) => {
  notifications.value.push(options);
};

const removeNotification = (index) => {
  notifications.value.splice(index, 1);
};

defineExpose({
  addNotification,
});
</script>

<style scoped>
#notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>
