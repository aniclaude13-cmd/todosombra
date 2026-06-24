const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8325937395:AAEAE0F3mk04jqftX1n0qZfya80tFvXgCls';
const OWNER_CHAT_ID = process.env.TELEGRAM_OWNER_CHAT_ID || '10711943';

export async function pingTelegramOwner(text: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: OWNER_CHAT_ID,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error('Telegram ping fallo:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram ping error:', err);
    return false;
  }
}
