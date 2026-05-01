import { API_URL } from './config.js';

export const getAIExplanation = async (serviceName, permissions) => {
    try {
        const response = await fetch(`${API_URL}/api/analyze-privacy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serviceName: serviceName,
                permissions: permissions
            })
        });

        const data = await response.json();

        if (data.error) {
            return `Ошибка AI: ${data.error}`;
        }

        return data.explanation;

    } catch (error) {
        console.error("Backend error:", error);
        return "Сервис временно недоступен.";
    }
};

