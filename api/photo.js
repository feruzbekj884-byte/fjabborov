import { get } from "@vercel/blob";

// Rasmni ochiq ko'rsatish: /api/photo?k=<sha1>. Kalit tarkibi qat'iy tekshiriladi.
export default async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      res.statusCode = 405;
      return res.end();
    }
    const k = String((req.query && req.query.k) || "");
    if (!/^[a-f0-9]{40}$/.test(k)) {
      res.statusCode = 400;
      return res.end();
    }
    const r = await get(`photos/${k}.jpg`, { access: "private", useCache: false }).catch((e) => {
      if (e && e.name === "BlobNotFoundError") return null;
      throw e;
    });
    if (!r || r.statusCode !== 200) {
      res.statusCode = 404;
      return res.end();
    }
    const buf = Buffer.from(await new Response(r.stream).arrayBuffer());
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", buf.length);
    res.statusCode = 200;
    return res.end(req.method === "HEAD" ? undefined : buf);
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    return res.end();
  }
}
