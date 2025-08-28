
---

# 🤖 Tiktok Telegram Bot (Cloudflare Workers)

Bot ini berfungsi untuk **download video, gambar, album TikTok** melalui Telegram, dan berjalan di **Cloudflare Workers** menggunakan `wrangler`.

---

## 🚀 Deploy ke Cloudflare

### 1. Buat project
```bash
wrangler init Tiktok-telegram-bot
```
```bash
cd Tiktok-telegram-bot
```
2. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

3. Deploy ke Cloudflare
```bash
wrangler deploy
```

Jika berhasil, akan keluar URL Worker seperti:

https://tiktok-telegram-bot.<your-subdomain>.workers.dev


---

---

🔗 Set Webhook Telegram

🔹 Opsi 1: Via Endpoint /SetWebhook

Setelah deploy, cukup buka di browser:

https://tiktok-telegram-bot.<your-subdomain>.workers.dev/SetWebhook

Jika sukses, browser akan menampilkan JSON:

{
  "message": "SetWebhook called",
  "result": {
    "ok": true,
    "result": true,
    "description": "Webhook was set"
  }
}
