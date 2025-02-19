// tombol.js
import { BOT_TOKEN } from './config.js';

/**
 * Membuat tombol inline keyboard
 * @param {Array} buttons - Array of button objects
 * @returns {Object} - Inline keyboard markup object
 */
export function createInlineKeyboard(buttons) {
  return {
    inline_keyboard: buttons
  };
}

/**
 * Membuat tombol URL
 * @param {String} text - Text yang akan ditampilkan pada tombol
 * @param {String} url - URL yang akan dibuka ketika tombol ditekan
 * @returns {Object} - Button object
 */
export function createUrlButton(text, url) {
  return {
    text: text,
    url: url
  };
}

/**
 * Membuat tombol callback
 * @param {String} text - Text yang akan ditampilkan pada tombol
 * @param {String} callbackData - Data yang akan dikirim ketika tombol ditekan
 * @returns {Object} - Button object
 */
export function createCallbackButton(text, callbackData) {
  return {
    text: text,
    callback_data: callbackData
  };
}

/**
 * Mendapatkan tombol utama untuk command /start
 * @returns {Object} - Inline keyboard markup object
 */
export function getStartButtons() {
  return createInlineKeyboard([
    [createUrlButton('👨‍💻 Owner', 'https://t.me/hidestream_bot')],
    [createUrlButton('🤖 Source Code Bot', 'https://ouo.io/i274dj')],
    [createUrlButton('🌟 Mirror Group', 'https://t.me/syd_download')],
    [createUrlButton('📧 Direct Link Wa', 'https://t.me/wa_direct_link_bot')],
    [createUrlButton('📎 Shortlink URL', 'https://t.me/short_link_url_bot')],
    [createUrlButton('📎📎 Shortlink URL', 'https://t.me/direct_shorturl_bot')],
    [createUrlButton('📣 Update', 'https://t.me/Syuhadak_Cloud')],
  ]);
}

/**
 * Mengirim pesan dengan tombol
 * @param {Number|String} chatId - ID chat tujuan
 * @param {String} text - Pesan yang akan dikirim
 * @param {Object} replyMarkup - Markup tombol
 * @returns {Promise} - Promise hasil pengiriman pesan
 */
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