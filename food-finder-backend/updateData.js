import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseKhanBuzMenu } from "./parsers/khanbuz.js";
import { parseSunnyDayCategories } from "./parsers/sunnyday.js";
import { recognizeImageText, parseOcrMenuText } from "./parsers/ocr.js";
import { getLatestPostImage } from "./parsers/vkapi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeData(rawDishes, id, name) {
    return {
        id,
        name,
        dishes: rawDishes.map((dish, idx) => ({
            id: idx + 1,
            name: dish.name,
            price: dish.price,
            category: dish.category,
        })),
    };
}

async function updateRestaurants() {
    const khanbuzData = await parseKhanBuzMenu();
    const khanbuz = normalizeData(khanbuzData, 1, "Хан-буз");

    const sunnydayData = await parseSunnyDayCategories();
    const sunnyday = normalizeData(sunnydayData, 2, "Солнечный день");

    let stolovaya = null;
    const vkImg = await getLatestPostImage();
    if (vkImg) {
        const text = await recognizeImageText(vkImg);
        const ocrData = parseOcrMenuText(text);
        stolovaya = normalizeData(ocrData, 3, "Солянка");
    }

    const restaurantsData = [khanbuz, sunnyday];
    if (stolovaya) restaurantsData.push(stolovaya);

    const categorySet = new Set();
    restaurantsData.forEach((rest) => {
        rest.dishes.forEach((dish) => {
            if (dish.category) {
                categorySet.add(dish.category);
            }
        });
    });
    const allDishes = Array.from(categorySet).map((cat, idx) => ({
        id: idx + 1,
        name: cat,
    }));

    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
        path.join(dataDir, "restaurants.json"),
        JSON.stringify({ restaurants: restaurantsData, allDishes }, null, 2),
        "utf-8"
    );
    console.log("Данные сохранены в формате JSON:", new Date());
}

updateRestaurants();
