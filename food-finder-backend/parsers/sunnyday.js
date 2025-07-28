import axios from "axios";
import * as cheerio from "cheerio";

export async function parseSunnyDayCategories() {
    const url = "https://xn--80aaahie3bcsbhg5aip8e4g.xn--p1ai/?city=1";
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });

    const $ = cheerio.load(res.data);
    const skip = ["Условия доставки", "Все наши адреса:"];
    const dishes = [];

    $(".cat-name").each((i, el) => {
        let category = $(el).text().trim();
        if (!category || skip.includes(category)) return;

        if (category.toLowerCase() === "горячее") {
            category = "Горячие блюда";
        }

        let $next = $(el).next();
        while ($next.length && !$next.hasClass("cat-name")) {
            if ($next.attr("id") && $next.attr("id").startsWith("good-")) {
                const style = $next.find(".ava").attr("style") || "";
                const imgMatch = style.match(/url\(['"]?([^'")]+)['"]?\)/);
                const img =
                    "https://xn--80aaahie3bcsbhg5aip8e4g.xn--p1ai/" +
                    (imgMatch ? imgMatch[1] : "");

                const name = $next.find(".names h2").text().trim();

                const price = $next
                    .find(".names h3.prize_gramm em")
                    .text()
                    .replace(/[^\d]/g, "");

                if (name && price) {
                    dishes.push({
                        category:
                            category.charAt(0).toUpperCase() +
                            category.slice(1).toLowerCase(),
                        name,
                        price: Number(price),
                        img,
                    });
                }
            }
            $next = $next.next();
        }
    });

    return dishes;
}
