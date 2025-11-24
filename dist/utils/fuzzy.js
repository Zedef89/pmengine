export function fuzzyFind(list, term, key) {
    if (!term || !list?.length)
        return null;
    const normalize = (str) => (str || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const needle = normalize(term);
    const needleTokens = needle.split(" ");
    const scored = list.map((item) => {
        const hay = normalize(item[key]);
        const hayTokens = hay.split(" ");
        let score = 0;
        // Token-based partial match
        for (const t of needleTokens) {
            const match = hayTokens.some((w) => w.startsWith(t));
            if (match)
                score += 1;
        }
        return { item, score };
    });
    // Ordina per score (numero di token trovati)
    scored.sort((a, b) => b.score - a.score);
    // Nessun token match → niente risultato
    if (scored[0].score === 0)
        return null;
    return scored[0].item;
}
