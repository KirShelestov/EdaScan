import { parseKhanBuzMenu } from "./parsers/khanbuz.js";
import { parseSunnyDayCategories } from "./parsers/sunnyday.js";
import { getLatestPostImage } from "./parsers/vkapi.js";

async function main() {
    // const dishes = await parseKhanBuzMenu();
    // console.log(dishes);

    // const categories = await parseSunnyDayCategories();
    // console.log(categories);

    const vkImg = await getLatestPostImage();
    console.log("VK first post image:", vkImg);
}

main();
