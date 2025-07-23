import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function parseKhanBuzMenu() {
    const url = "https://khan-buz.ru/";
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    await page.waitForSelector(".category_head");

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const dishes = [];

    $(".category_head").each((i, el) => {
        const category = $(el).text().trim();
        const $categoryGrid = $(el).next(".category_grid");
        $categoryGrid.find(".product").each((j, prod) => {
            const $imgDiv = $(prod).children("div").first();
            const img = $imgDiv.find("img").attr("src") || "";
            let name = "";
            $(prod)
                .find('.product_content [class*="h-"]')
                .each((_, hdiv) => {
                    const t = $(hdiv).find(".title").text().trim();
                    if (t) name = t;
                });
            const price = $(prod)
                .find(".product_content .action .price_box .price")
                .text()
                .replace(/[^\d]/g, "");
            if (name && price) {
                dishes.push({
                    category,
                    name,
                    price: Number(price),
                    img,
                });
            }
        });
    });

    return dishes;
}
