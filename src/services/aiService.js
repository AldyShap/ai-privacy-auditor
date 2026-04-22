const API_KEY = "СЕНІҢ_API_КІЛТІҢ"; // Gemini немесе OpenAI кілті

export const getAIExplanation = async (serviceName, permissions) => {
    const prompt = `Explain in simple words why the app "${serviceName}" with permissions ${permissions.join(", ")} might be a privacy risk. Give a short, 2-sentence advice on whether to keep it.`;

    try {
        // Мұнда Gemini API-ге мысал (тегін және жылдам)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "AI is currently unavailable. Please check the permissions manually.";
    }
};

// src/services/aiService.js
export const getAIExplanationTest = async (name) => {
    // 1 секунд күту (имитация)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `${name} қосымшасы сіздің қаржылық деректеріңізге рұқсат сұрап тұр. Бұл деректер жарнама берушілерге сатылуы мүмкін. Рұқсатты шектеу ұсынылады.`;
};