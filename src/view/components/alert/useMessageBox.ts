import { createApp, h } from 'vue';
import MessageBox from './MessageBox.vue';

export const useMessageBox = () => {
    const showMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 3000) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const app = createApp({
            render() {
                return h(MessageBox, {
                    message,
                    type,
                    duration,
                    onClose: () => {
                        app.unmount();
                        document.body.removeChild(container);
                    },
                });
            },
        });

        app.mount(container);
    };

    return {
        success: (message: string, duration?: number) => showMessage(message, 'success', duration),
        error: (message: string, duration?: number) => showMessage(message, 'error', duration),
        warning: (message: string, duration?: number) => showMessage(message, 'warning', duration),
    };
};