require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Helper function to translate text using MyMemory
async function translateText(text, targetLanguage) {
  try {
    const response = await axios.get(
      "https://api.mymemory.translated.net/get",
      {
        params: {
          q: text,
          langpair: `en|${targetLanguage}`,
        },
      }
    );

    return response.data.responseData.translatedText;
  } catch (error) {
    console.error("Error translating text:", error.message);
    return "Sorry, I could not translate the text. Please try again later.";
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! To translate text, use the format: /translate [target language code] [text]. For example: /translate es Hello"
  );
});

bot.onText(/\/translate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1].split(" ");
  const targetLanguage = input[0];
  const textToTranslate = input.slice(1).join(" ");

  if (!targetLanguage || !textToTranslate) {
    bot.sendMessage(
      chatId,
      "Please provide a target language code and text to translate."
    );
    return;
  }

  const translatedText = await translateText(textToTranslate, targetLanguage);
  bot.sendMessage(chatId, translatedText);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text.startsWith("/translate") && !msg.text.startsWith("/start")) {
    bot.sendMessage(
      chatId,
      "To use the translate feature, type /translate [target language code] [text]."
    );
  }
});
