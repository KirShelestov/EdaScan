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
    "Салаты",
    "Супы",
    "Горячие блюда",
    "Гарниры",
    "Грузинская кухня",
    "Бизнес ланч",
];

export function parseOcrMenuText(text) {
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const result = [];
    let currentCategory = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (
            CATEGORIES.some((cat) =>
                line.toLowerCase().includes(cat.toLowerCase())
            )
        ) {
            currentCategory = line;
            if (line.toLowerCase().includes("бизнес ланч")) {
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

        const match = line.match(/^(.+?)\s+(\d+)\s*гр\s+(\d+[,.]?\d*)/i);
        if (match) {
            const name = match[1].trim();
            const weight = match[2];
            const price = Number(match[3].replace(",", "."));

            if (name.includes("(") && name.includes(")")) continue;

            result.push({
                category: currentCategory,
                name,
                price,
            });
            continue;
        }

        const altMatch = line.match(/^(.+?)\s+(\d+[,.]?\d*)\s*р\.?$/i);
        if (altMatch) {
            const name = altMatch[1].trim();
            const price = Number(altMatch[2].replace(",", "."));

            if (name.includes("(") && name.includes(")")) continue;

            result.push({
                category: currentCategory,
                name,
                price,
            });
            continue;
        }

        const weightMatch = line.match(/^(.+?)\s+(\d+)\s*гр$/i);
        if (weightMatch) {
            const name = weightMatch[1].trim();

            if (name.includes("(") && name.includes(")")) continue;

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                const priceMatch = nextLine.match(/^(\d+[,.]?\d*)/);
                if (priceMatch) {
                    const price = Number(priceMatch[1].replace(",", "."));
                    result.push({
                        category: currentCategory,
                        name,
                        price,
                        weight: weightMatch[2] + "гр",
                    });
                    i++;
                    continue;
                }
            }
        }
    }

    return result;
}
