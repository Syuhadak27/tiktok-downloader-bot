

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
        // Gunakan fungsi untuk mengirim pesan dengan tombol
        const welcomeMessage = 'Selamat datang di Bot TikTok Downloader! 🤖\n\nKirim link TikTok untuk mendownload video, gambar, atau album.\n\nBerikut bot yg semuanya 🟢Online bisa di gunakan😁🥱';
        await sendMessageWithButtons(chatId, welcomeMessage, getStartButtons());
        return new Response('OK', { status: 200 });
    }

    if (!text.includes('tiktok.com')) {
        console.log('Pesan bukan link TikTok, diabaikan.');
        return new Response('Ignored', { status: 200 });
    }

    try {
        const processingMessageId = await sendMessage(chatId, 'Sedang memproses...');

        const media = await getTikTokMedia(text);

        if (media.type === 'video') {
            await sendVideo(chatId, media.videoUrl, text, displayName);
        } else if (media.type === 'image') {
            await sendPhoto(chatId, media.imageUrl, text, displayName);
        } else if (media.type === 'album') {
            await sendMediaGroup(chatId, media.images, text, displayName);
        } else {
            throw new Error('Format tidak didukung.');
        }

        await deleteMessage(chatId, messageId);
        if (processingMessageId) await deleteMessage(chatId, processingMessageId);

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error(error);
        await sendMessage(chatId, 'Terjadi kesalahan saat memproses link TikTok.');
        return new Response('Error', { status: 500 });
    }
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