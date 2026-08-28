import fs from "node:fs/promises";

function parseEnv(text) {
  return Object.fromEntries(
    text.split(/\r?\n/).flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return [];
      const splitAt = trimmed.indexOf("=");
      if (splitAt < 1) return [];
      const key = trimmed.slice(0, splitAt).trim();
      let value = trimmed.slice(splitAt + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      return [[key, value]];
    }),
  );
}

const env = parseEnv(await fs.readFile(".env.local", "utf8"));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error("Supabase environment values are missing.");

const select = "id,part_number,part_number_normalized,name,publication_status,primary_image_url,product_images(storage_path)";
const response = await fetch(`${url}/rest/v1/products?select=${encodeURIComponent(select)}&order=part_number_normalized.asc`, {
  headers: {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    Range: "0-1999",
  },
});
if (!response.ok) throw new Error(`Database audit failed with status ${response.status}.`);
const records = await response.json();
await fs.writeFile("tmp/series1-update/database-products.json", JSON.stringify(records, null, 2));
console.log(JSON.stringify({ products: records.length, withImages: records.filter((item) => item.primary_image_url || item.product_images?.length).length }, null, 2));
