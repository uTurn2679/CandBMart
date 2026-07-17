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
      const telegramBotToken = "8790672203:AAESKrieWtqUf22QevTM9ARLai5qyLXbc5M";
      const telegramChatId = "7020994515";
      if (telegramBotToken && telegramChatId) {
        const textMessage = encodeURIComponent(`❓ New Customer Question!\n\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}`);
        const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${textMessage}`;
        await fetch(url).catch(err => console.error("Telegram Fetch Error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger Telegram notification:", e);
    }

    // Send WhatsApp Notification via CallMeBot
    try {
      const waPhone = process.env.WHATSAPP_PHONE || "8801743690402";
      const waApiKey = process.env.WHATSAPP_CALLMEBOT_APIKEY || "";
      if (waPhone && waApiKey) {
        const waMsg = encodeURIComponent(`❓ নতুন গ্রাহকের প্রশ্ন!\n\nনাম: ${name}\nফোন: ${phone}\n\nবার্তা:\n${message}`);
        const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${waMsg}&apikey=${waApiKey}`;
        await fetch(waUrl).catch(err => console.error("WhatsApp Fetch Error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger WhatsApp notification:", e);
    }

    return NextResponse.json({ success: true, message: "Question sent successfully." });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 400 });
  }
}
