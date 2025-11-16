// src/utils/userMessage.js

export function userMessage(options = {}) {
    // 👇 把你之前完整的 userMessage 函数代码粘贴在这里（略去注释版）
    const config = {
        title: '提示',
        content: '你确定要继续吗？',
        showCancel: true,
        confirmText: '确定',
        cancelText: '取消',
        closeOnOverlay: true,
        onConfirm: () => {},
        onCancel: () => {}
    };

    Object.assign(config, options);

    const overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

    const modal = document.createElement('div');
    modal.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 90vw;
    width: 400px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

    const header = document.createElement('div');
    header.innerHTML = `<strong style="padding: 16px 20px; display: block; font-size: 18px;">${config.title}</strong>`;

    const body = document.createElement('div');
    body.innerHTML = `<div style="padding: 0 20px 16px; color: #333; line-height: 1.5;">${config.content}</div>`;

    const footer = document.createElement('div');
    footer.style.cssText = `padding: 0 20px 20px; text-align: right;`;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = config.confirmText;
    confirmBtn.style.cssText = `
    padding: 6px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 8px;
  `;
    confirmBtn.onclick = () => {
        config.onConfirm();
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
    };

    footer.appendChild(confirmBtn);

    if (config.showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = config.cancelText;
        cancelBtn.style.cssText = `
      padding: 6px 16px;
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    `;
        cancelBtn.onclick = () => {
            config.onCancel();
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        };
        footer.insertBefore(cancelBtn, confirmBtn);
    }

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    if (config.closeOnOverlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                config.onCancel();
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
            }
        });
    }

    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    return {
        close: () => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
            }
        }
    };
}