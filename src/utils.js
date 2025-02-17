// utils.js
import { BOT_TOKEN, CHANNEL_ID } from './config.js';

// Fungsi untuk menghapus pesan
export async function deleteMessage(chatId, messageId) {
    if (!messageId) return;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    });
}

// Fungsi untuk mengirim pesan
export async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text }),
    });
    const jsonResponse = await response.json();
    return jsonResponse.result ? jsonResponse.result.message_id : null;
}

// Fungsi untuk mengirim video
export async function sendVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, video: videoUrl }) });
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHANNEL_ID, video: videoUrl, caption: `📤 Video dikirim dari ${displayName}\n🔗 ${sourceLink}` }) });
}

// Fungsi untuk mengirim gambar
export async function sendPhoto(chatId, photoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, photo: photoUrl }) });
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHANNEL_ID, photo: photoUrl, caption: `🖼️ Gambar dikirim dari ${displayName}\n🔗 ${sourceLink}` }) });
}

// Fungsi untuk mengirim album
export async function sendMediaGroup(chatId, media, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`;
    const batchSize = 10;

    for (let i = 0; i < media.length; i += batchSize) {
        const batch = media.slice(i, i + batchSize).map((item, index) => {
            if (index === 0) {
                return { ...item, caption: `📸 Album dikirim dari ${displayName}\n🔗 ${sourceLink}` };
            }
            return { ...item };
        });

        try {
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, media: batch.map(item => ({ ...item, caption: undefined })) }) });
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHANNEL_ID, media: batch }) });
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Gagal mengirim album batch:", error);
        }
    }
}

// Fungsi untuk mengirim log ke channel
export async function sendLogToChannel(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHANNEL_ID, text: text }) });
}