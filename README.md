

---

# 🚀 Deploy ke Cloudflare dengan Wrangler CLI (Termux & Ubuntu)

Tutorial ini menjelaskan cara **membuat project baru** dan **deploy ke Cloudflare** menggunakan `wrangler` CLI.  
Contoh project: **Tiktok-telegram-bot**

---

## 📌 Persiapan

### 1. Install Node.js & npm
#### Termux
```bash
pkg update && pkg upgrade
pkg install nodejs git
```


Ubuntu
```bash
sudo apt update && sudo apt upgrade
sudo apt install nodejs npm git -y
```

2. Install Wrangler CLI
```bash
npm install -g wrangler
```

3. Login ke Cloudflare

```bash
wrangler login
```

👉 Perintah ini akan membuka browser untuk autentikasi ke akun Cloudflare.


---

🛠 Membuat Project Baru

1. Buat folder project dengan wrangler init:
```bash
wrangler init Tiktok-telegram-bot
```


2. Masuk ke folder project:
```basg
cd Tiktok-telegram-bot
```

---

🌐 Deploy ke Cloudflare

1. Deploy dengan perintah:
```bash
wrangler deploy
```

2. Jika sukses, output akan menampilkan URL seperti:

https://tiktok-telegram-bot.<your-subdomain>.workers.dev




---
