import { parseKhanBuzMenu } from "./parsers/khanbuz.js";
import { parseSunnyDayCategories } from "./parsers/sunnyday.js";

async function main() {
    // const dishes = await parseKhanBuzMenu();
    // console.log(dishes);

    const categories = await parseSunnyDayCategories();
    console.log(categories);
}

main();
