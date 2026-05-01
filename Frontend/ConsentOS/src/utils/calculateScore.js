export function calculateScore(services) {
    // Егер сервистер жоқ болса, идеалды ұпай — 100
    if (!services || services.length === 0) return 100;

    // Әр риск деңгейіне "айып ұпайын" (Penalty Points) береміз
    // 100 - ең қауіпті, 0 - қауіпсіз
    const weights = {
        'high': 80,   // Жоғары қауіп
        'medium': 40, // Орташа қауіп
        'low': 10     // Төмен қауіп
    };

    let totalPenalty = 0;

    services.forEach(s => {
        const riskLevel = s.risk ? s.risk.toLowerCase() : 'low';
        // Егер тізімде мүлдем бейтаныс риск болса, 0 азайтамыз
        totalPenalty += weights[riskLevel] || 0;
    });

    // Орташа айып ұпайын табамыз: (Барлық айыптардың қосындысы / Сервистер саны)
    // Бұл сан әрқашан 0 мен 100-дің арасында болады
    const averagePenalty = totalPenalty / services.length;

    // Қорытынды ұпай: 100 - орташа айып
    let finalScore = 100 - averagePenalty;

    // Math.round — бүтін сан шығару үшін, Math.max — 0-ден төмен кетпеу үшін
    return Math.round(Math.max(finalScore, 0));
}