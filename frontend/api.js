const API = {
    async call(action, payload = {}) {
        if (!CONFIG.GAS_WEB_APP_URL || CONFIG.GAS_WEB_APP_URL === "YOUR_GAS_WEB_APP_URL_HERE") {
            throw new Error("Backend URL not configured. Please setup config.js.");
        }

        const requestId = this.generateUUID();
        const sessionToken = sessionStorage.getItem("sessionToken");

        const requestBody = {
            action: action,
            requestId: requestId,
            sessionToken: sessionToken,
            payload: payload
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(requestBody),
                redirect: "follow",
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.ok) {
                // Check if unauthorized, trigger logout
                if (data.code === "UNAUTHORIZED") {
                    if (window.app && typeof window.app.handleUnauthorized === 'function') {
                        window.app.handleUnauthorized();
                    }
                }
                throw new Error(data.message || "เกิดข้อผิดพลาดจากระบบ");
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error("การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
            }
            throw error;
        }
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};
