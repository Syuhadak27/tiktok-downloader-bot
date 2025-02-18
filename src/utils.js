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
export async function sendVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
    try {
        // Kirim video ke bot
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, video: videoUrl }),
        });

        // Kirim video ke channel
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                video: videoUrl,
                caption: `📤 Video dikirim dari ${displayName}\n🔗 ${sourceLink}`
            }),
        });

    } catch (error) {
        console.error("Gagal mengirim video:", error);
    }
}

// Fungsi untuk mengirim gambar
export async function sendPhoto(chatId, photoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    try {
        // Kirim foto ke bot
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, photo: photoUrl }),
        });

        // Kirim foto ke channel
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
        const batch = media.slice(i, i + batchSize).map((item, index) =>
            index === 0 ? { ...item, caption: `📸 Album dikirim dari ${displayName}\n🔗 ${sourceLink}` } : item
        );

        try {
            // Kirim ke user tanpa caption
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    media: batch.map(({ caption, ...rest }) => rest) // Hapus caption dari media lainnya
                }),
            });

            // Kirim ke channel dengan caption di media pertama
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHANNEL_ID, media: batch }),
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