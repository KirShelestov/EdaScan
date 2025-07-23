import { parseKhanBuzMenu } from "./parsers/khanbuz.js";

async function main() {
    const dishes = await parseKhanBuzMenu();
    console.log(dishes);
}

main();
