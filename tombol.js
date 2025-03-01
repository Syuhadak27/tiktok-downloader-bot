// tombol.js
import { BOT_TOKEN } from './config.js';

export function createInlineKeyboard(buttons) {
  return {
    inline_keyboard: buttons
  };
}

export function createUrlButton(text, url) {
  return {
    text: text,
    url: url
  };
}


export function createCallbackButton(text, callbackData) {
  return {
    text: text,
    callback_data: callbackData
  };
}

export function getStartButtons() {
  return createInlineKeyboard([
    [createUrlButton('👨‍💻 Owner', 'https://t.me/hidestream_bot'), createUrlButton('🌟 Group', 'https://t.me/syd_download')],
    [createUrlButton('🤖 Source', 'https://ouo.io/i274dj'), createUrlButton('📧 WA Link', 'https://t.me/wa_direct_link_bot')],
    [createUrlButton('📎 Shortlink', 'https://t.me/short_link_url_bot'), createUrlButton('📎📎 SL URL', 'https://t.me/direct_shorturl_bot')],
    [createUrlButton('📣 Update', 'https://t.me/Syuhadak_Cloud')],
  ]);
}


export async function sendMessageWithButtons(chatId, text, replyMarkup) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    const jsonResponse = await response.json();
    return jsonResponse.result ? jsonResponse.result.message_id : null;
  } catch (error) {
    console.error("Gagal mengirim pesan dengan tombol:", error);
    return null;
  }
}