// notification.js
import { createApp } from "vue";
import NotificationContainer from "../components/Notification/NotificationContainer.vue";

let notificationContainerInstance: any = null;

const createNotificationContainer = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const app = createApp(NotificationContainer);
  notificationContainerInstance = app.mount(container);
};

export const Notification = (options: any) => {
  if (!notificationContainerInstance) {
    createNotificationContainer();
  }

  notificationContainerInstance.addNotification(options);
};
