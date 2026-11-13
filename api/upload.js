import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { send, readBody, currentUser, sameOriginJson } from "./_lib/core.js";

const MAX_BYTES = 400 * 1024; // brauzer allaqachon kichraytirib yuboradi (~300x400)

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return send(res, 405, { error: "Method not allowed" });
    }
    const user = await currentUser(req);
    if (!user) return send(res, 401, { error: "Avval tizimga kiring" });
    if (!sameOriginJson(req)) return send(res, 403, { error: "Ruxsat etilmagan so'rov" });
    const body = await readBody(req);
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String((body && body.data) || ""));
    if (!m) return send(res, 400, { error: "Faqat JPEG rasm qabul qilinadi" });
    const buf = Buffer.from(m[1], "base64");
    if (buf.length < 100 || buf.length > MAX_BYTES) return send(res, 400, { error: "Rasm hajmi noto'g'ri (maks. 400 KB)" });
    if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) return send(res, 400, { error: "Rasm formati noto'g'ri" });
    const id = crypto.createHash("sha1").update(buf).digest("hex");
    await put(`photos/${id}.jpg`, buf, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/jpeg"
    });
    return send(res, 200, { ok: true, id, url: `/api/photo?k=${id}` });
  } catch (e) {
    console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : "Server xatosi" });
  }
}
