import "dotenv/config";
import axios from "axios";

const GROUP_DOMAIN = "stolovaya54";
const ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN;
const API_VERSION = "5.199";

export async function getLatestPostImage() {
    const url = `https://api.vk.com/method/wall.get?domain=${GROUP_DOMAIN}&count=1&access_token=${ACCESS_TOKEN}&v=${API_VERSION}`;
    const res = await axios.get(url);
    if (res.data.error) {
        console.error("VK API error:", res.data.error);
        return null;
    }
    const post = res.data.response?.items?.[0];
    if (!post) return null;
    const photo = post.attachments?.find((att) => att.type === "photo");
    if (photo) {
        const sizes = photo.photo.sizes;
        const img = sizes[sizes.length - 1].url;
        return img;
    }
    return null;
}
