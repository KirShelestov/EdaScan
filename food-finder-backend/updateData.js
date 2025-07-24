import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseKhanBuzMenu } from "./parsers/khanbuz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeData(rawDishes) {
    return [
        {
            id: 1,
            name: "Хан-буз",
            dishes: rawDishes.map((dish, idx) => ({
                id: idx + 1,
                name: dish.name,
                price: dish.price,
                category: dish.category,
            })),
        },
    ];
}

async function updateRestaurants() {
    const khanbuzData = await parseKhanBuzMenu();
    const restaurantsData = normalizeData(khanbuzData);

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

    const fileContent =
        "export const restaurants = " +
        JSON.stringify(restaurantsData, null, 2) +
        ";\n\nexport const allDishes = " +
        JSON.stringify(allDishes, null, 2) +
        ";\n";

    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
        path.join(dataDir, "restaurants.js"),
        fileContent,
        "utf-8"
    );
    console.log("Данные сохранены в формате JS-модуля:", new Date());
}

updateRestaurants();
