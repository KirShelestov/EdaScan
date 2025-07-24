import Tesseract from "tesseract.js";

export async function recognizeImageText(imageUrl) {
    const {
        data: { text },
    } = await Tesseract.recognize(imageUrl, "rus+eng", {
        logger: (m) => console.log(m.status, m.progress),
    });
    return text;
}

const CATEGORIES = [
    "салаты",
    "супы",
    "горячие блюда",
    "гарниры",
    "грузинская кухня",
    "бизнес ланч",
];

export function parseOcrMenuText(text) {
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const result = [];
    let currentCategory = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();

        if (CATEGORIES.includes(line)) {
            currentCategory = line;
            if (line === "бизнес ланч") {
                result.push({
                    category: "бизнес ланч",
                    name: "бизнес ланч",
                    price: 250,
                });
                break;
            }
            continue;
        }

        if (!currentCategory) continue;

        const match = lines[i].match(/^(.+?)\s+\d+\s*гр\s+(\d{2,4}[,.]\d{2})/i);
        if (match) {
            const name = match[1].trim();
            const price = Number(match[2].replace(",", "."));
            result.push({ category: currentCategory, name, price });
            continue;
        }

        const altMatch = lines[i].match(/^(.+?)\s+\d+\s*гр\s+(\d{2,4})/i);
        if (altMatch) {
            const name = altMatch[1].trim();
            const price = Number(altMatch[2]);
            result.push({ category: currentCategory, name, price });
            continue;
        }
    }

    return result;
}
