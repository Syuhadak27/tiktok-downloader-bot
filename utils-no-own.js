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
        const headResponse = await fetch(videoUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
            console.error("❌ Gagal mengambil metadata video");
            return;
        }
        const contentLength = headResponse.headers.get('content-length');
        const fileSizeMB = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;

        console.log(`📏 Ukuran file: ${fileSizeMB.toFixed(2)} MB`);
        if (fileSizeMB > 0 && fileSizeMB <= 50) {
            return await sendVideo(chatId, videoUrl, sourceLink, displayName);
        }
        return await sendLargeVideo(chatId, videoUrl, sourceLink, displayName);
    } catch (error) {
        console.error("❌ Terjadi kesalahan saat memproses video:", error);
    }
}

export async function sendVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                video: videoUrl,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                video: videoUrl,
                caption: `📤 Video dikirim dari ${displayName}`,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
    } catch (error) {
        console.error("❌ Gagal mengirim video:", error);
    }
}

export async function sendLargeVideo(chatId, videoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                document: videoUrl,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                document: videoUrl,
                caption: `📤 Video dikirim dari ${displayName}`,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
    } catch (error) {
        console.error("❌ Gagal mengirim video besar:", error);
    }
}

export async function sendPhoto(chatId, photoUrl, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                photo: photoUrl,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                photo: photoUrl,
                caption: `🖼️ Gambar dikirim dari ${displayName}`,
                reply_markup: {
                    inline_keyboard: [[{ text: "🔗 Source Link", url: sourceLink }]]
                }
            }),
        });
    } catch (error) {
        console.error("Gagal mengirim gambar:", error);
    }
}

// Fungsi untuk mengirim album
export async function sendMediaGroup(chatId, media, sourceLink, displayName) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`;
    const messageUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const batchSize = 10; // Maksimal 10 media per batch

    for (let i = 0; i < media.length; i += batchSize) {
        const batch = media.slice(i, i + batchSize);
        try {
            // Kirim ke user tanpa caption
            const userResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    media: batch.map(item => ({ ...item, caption: '' }))
                }),
            });

            // Kirim tombol sumber ke user
            if (userResponse.ok) {
                await fetch(messageUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: "⚡ Sumber Album:",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "🔗 Source Link", url: sourceLink }]
                            ]
                        }
                    }),
                });
            }

            // Kirim ke channel dengan tombol

            const ownerIds = [1980888203, 7050828191]; // Ganti dengan ID owner yang benar
            const channelBatch = [...batch];

            if (channelBatch.length > 0) {
                if (!ownerIds.includes(chatId)) { // Jika user BUKAN owner, tambahkan caption
                    channelBatch[0] = {
                        ...channelBatch[0],
                        caption: `📸 Album dikirim dari ${displayName}\n\n--------<a href="${sourceLink}">🔗 Source Link</a>----------`,
                        parse_mode: 'HTML'
                    };
                } else {
                    // Jika user adalah owner, hapus caption
                    channelBatch[0] = {
                        ...channelBatch[0],
                        caption: `📸 Album dikirim dari \n-------<a href="${sourceLink}">🔗 Source Link</a>----------`,
                        parse_mode: 'HTML'
                    };
                    //delete channelBatch[0].caption;
                }
            }

            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHANNEL_ID,
                    media: channelBatch
                }),
            });            
        } catch (error) {
            console.error("❌ Gagal mengirim album:", error);
        }
    }
}


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
