// utils.js
import { BOT_TOKEN, CHANNEL_ID } from './config.js';

// Fungsi untuk menghapus pesan
export async function deleteMessage(chatId, messageId) {
    if (!messageId) return;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
        });
    } catch (error) {
        console.error("Gagal menghapus pesan:", error);
    }
}

// Fungsi untuk mengirim pesan
export async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text }),
        });
        const jsonResponse = await response.json();
        return jsonResponse.result ? jsonResponse.result.message_id : null;
    } catch (error) {
        console.error("Gagal mengirim pesan:", error);
        return null;
    }
}

// Fungsi untuk mengirim video
export async function sendVideoWithSizeCheck(chatId, videoUrl, sourceLink, displayName) {
    console.log(`🔍 Mengecek ukuran video: ${videoUrl}`);

    try {
        // **1️⃣ Ambil informasi ukuran file video**
        const headResponse = await fetch(videoUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
            console.error("❌ Gagal mengambil metadata video");
            return;
        }
        
        const contentLength = headResponse.headers.get('content-length');
        const fileSizeMB = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;

        console.log(`📏 Ukuran file: ${fileSizeMB.toFixed(2)} MB`);

        // **2️⃣ Jika lebih kecil dari 50MB, gunakan sendVideo**
        if (fileSizeMB > 0 && fileSizeMB <= 50) {
            console.log("✅ Menggunakan sendVideo (batas <50MB)");
            return await sendVideo(chatId, videoUrl, sourceLink, displayName);
        }

        // **3️⃣ Jika lebih besar dari 50MB, gunakan sendLargeVideo**
        console.log("⚠️ File terlalu besar, menggunakan sendLargeVideo");
        return await sendLargeVideo(chatId, videoUrl, sourceLink, displayName);
        
    } catch (error) {
        console.error("❌ Terjadi kesalahan saat memproses video:", error);
    }
}

// 🔹 Fungsi untuk mengirim video (di bawah 50MB)
export async function sendVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
    
    console.log(`📤 Mengirim video ke ${chatId}: ${videoUrl}`);
    
    try {
        // Kirim ke user tanpa caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                video: videoUrl
            }),
        });

        // Kirim ke channel dengan caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                video: videoUrl,
                caption: `📤 Video dikirim dari ${displayName}\n🔗 ${sourceLink}`
            }),
        });

        console.log("✅ Video berhasil dikirim ke user dan channel");
        
    } catch (error) {
        console.error("❌ Gagal mengirim video:", error);
    }
}

// 🔹 Fungsi untuk mengirim video besar (di atas 50MB)
export async function sendLargeVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

    console.log(`📤 Mengirim video besar ke ${chatId}: ${videoUrl}`);

    try {
        // Kirim ke user tanpa caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                document: videoUrl
            }),
        });

        // Kirim ke channel dengan caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                document: videoUrl,
                caption: `📤 Video dikirim dari ${displayName}\n🔗 ${sourceLink}`
            }),
        });

        console.log("✅ Video besar berhasil dikirim ke user dan channel");

    } catch (error) {
        console.error("❌ Gagal mengirim video besar:", error);
    }
}

// Fungsi untuk mengirim gambar
export async function sendPhoto(chatId, photoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    try {
        // Kirim foto ke user tanpa caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                photo: photoUrl 
            }),
        });

        // Kirim foto ke channel dengan caption
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                photo: photoUrl,
                caption: `🖼️ Gambar dikirim dari ${displayName}\n🔗 ${sourceLink}`
            }),
        });

    } catch (error) {
        console.error("Gagal mengirim gambar:", error);
    }
}

// Fungsi untuk mengirim album
export async function sendMediaGroup(chatId, media, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`;
    const batchSize = 10; // Maksimal 10 media per batch

    for (let i = 0; i < media.length; i += batchSize) {
        const batch = media.slice(i, i + batchSize);
        
        try {
            // Kirim ke user tanpa caption
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    media: batch.map(item => ({ ...item, caption: '' }))
                }),
            });

            // Kirim ke channel dengan caption di media pertama
            const channelBatch = [...batch];
            if (channelBatch.length > 0) {
                channelBatch[0] = { 
                    ...channelBatch[0], 
                    caption: `📸 Album dikirim dari ${displayName}\n🔗 ${sourceLink}` 
                };
            }
            
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chat_id: CHANNEL_ID, 
                    media: channelBatch 
                }),
            });

            // Tunggu 1 detik untuk menghindari rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Gagal mengirim album batch:", error);
        }
    }
}

// Fungsi untuk mengirim log ke channel
export async function sendLogToChannel(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHANNEL_ID, text: text }),
        });
    } catch (error) {
        console.error("Gagal mengirim log:", error);
    }
}