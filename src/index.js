import { BOT_TOKEN, CHANNEL_ID } from './config.js';
import { sendMessage, sendVideo, sendPhoto, sendMediaGroup, deleteMessage, sendLogToChannel } from './utils.js';
import { sendMessageWithButtons, getStartButtons } from './tombol.js';

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
    const request = event.request;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
        body = await request.json();
    } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!body.message || !body.message.chat || !body.message.text) {
        return new Response('Invalid message format', { status: 400 });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();
    const chatType = body.message.chat.type;
    const messageId = body.message.message_id;

    const from = body.message.from;
    const firstName = from.first_name || "";
    const lastName = from.last_name ? " " + from.last_name : "";
    const username = from.username ? `(@${from.username})` : "";
    const displayName = `${firstName}${lastName} ${username}`.trim();

    console.log(`Message from ${displayName} (chatId: ${chatId}), type: ${chatType}, text: ${text}`);

    if (chatType !== 'private' && chatType !== 'group' && chatType !== 'supergroup') {
        console.log('Pesan bukan dari grup atau chat pribadi, diabaikan.');
        return new Response('Ignored', { status: 200 });
    }

    if (text === '/start') {
        const welcomeMessage = 'Selamat datang di Bot TikTok Downloader! 🤖\n\nKirim link TikTok untuk mendownload video, gambar, album dan bulk support\n\nBerikut bot yg semuanya 🟢Online bisa di gunakan😁🥱\n';
        await sendMessageWithButtons(chatId, welcomeMessage, getStartButtons());
        return new Response('OK', { status: 200 });
    }

    // Cek apakah ada link TikTok dalam pesan
    const links = text.split('\n')
        .map(link => link.trim())
        .filter(link => link.includes('tiktok.com'));

    if (links.length === 0) {
        console.log('Tidak ada link TikTok yang valid.');
        return new Response('Ignored', { status: 200 });
    }

    const isBulk = links.length > 1;
    const processingMessageId = isBulk ? await sendMessage(chatId, '🔄 Memproses beberapa link...') : null;

    for (const link of links) {
        try {
            const media = await getTikTokMedia(link);

            if (media.type === 'video') {
                await sendVideo(chatId, media.videoUrl, link, displayName);
            } else if (media.type === 'image') {
                await sendPhoto(chatId, media.imageUrl, link, displayName);
            } else if (media.type === 'album') {
                await sendMediaGroup(chatId, media.images, link, displayName);
            } else {
                throw new Error('Format tidak didukung.');
            }
        } catch (error) {
            console.error(`❌ Gagal memproses: ${link}`, error);
            await sendMessage(chatId, `⚠️ Gagal memproses link:\n${link}`);
        }

        // Delay opsional untuk menghindari rate limit (2 detik)
        if (isBulk) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (processingMessageId) await deleteMessage(chatId, processingMessageId);
    await deleteMessage(chatId, messageId);

    return new Response('OK', { status: 200 });
}

// Fungsi untuk mengambil media dari TikTok
async function getTikTokMedia(url) {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.data) {
        throw new Error('Struktur respons TikTok tidak valid');
    }

    const mediaData = data.data;

    if (mediaData.images && mediaData.images.length > 0) {
        return { type: 'album', images: mediaData.images.map(img => ({ type: 'photo', media: img })) };
    } else if (mediaData.play) {
        return { type: 'video', videoUrl: mediaData.play };
    } else if (mediaData.cover) {
        return { type: 'image', imageUrl: mediaData.cover };
    }

    throw new Error('Format tidak dikenali');
}