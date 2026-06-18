import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone, and message are required." }, { status: 400 });
    }

    // Send Telegram Notification
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "8840968249:AAGE8XO-01fC7A9EL62g5tnJOfZw37XkqG8";
      const telegramChatId = process.env.TELEGRAM_CHAT_ID || "6445871174";
      if (telegramBotToken && telegramChatId) {
        const textMessage = encodeURIComponent(`❓ *New Customer Question!*\n\n*Name:* ${name}\n*Phone:* ${phone}\n\n*Message:*\n${message}`);
        const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${textMessage}&parse_mode=Markdown`;
        
        // Await the fetch so Vercel does not terminate the lambda early
        await fetch(url).catch(err => console.error("Telegram Fetch Error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger Telegram notification:", e);
    }

    return NextResponse.json({ success: true, message: "Question sent successfully." });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 400 });
  }
}
