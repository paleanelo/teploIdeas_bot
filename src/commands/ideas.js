import fs from "fs";
import { InlineKeyboard } from "grammy";

// Загружаем идеи из JSON
const ideas = JSON.parse(fs.readFileSync("src/data/ideas.json", "utf-8"));

// Создаём кнопки с направлениями
const categories = Object.keys(ideas);
const categoryKeyboard = new InlineKeyboard();
categories.forEach((category, index) => {
    categoryKeyboard.text(category, `category:${category}`);
    if ((index + 1) % 2 === 0) categoryKeyboard.row();
});

// Функция обработки команды /ideas
export function ideasCommand(ctx) {
    ctx.reply(
        "🎨 Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для выбранного направления.\n\nВыбери одно из направлений ниже:",
        { reply_markup: categoryKeyboard }
    );
}

// Обработчик выбора категории
export async function handleCategorySelection(ctx) {
    const category = ctx.match[0].split(":")[1];
    ctx.session.selectedCategory = category;

    const randomIdea = ideas[category][Math.floor(Math.random() * ideas[category].length)];
    const actionKeyboard = new InlineKeyboard()
        .text("🔄 Попробовать ещё", "retry")
        .text("Назад", "back");

    try {
        const message = await ctx.editMessageText(`✨ *Направление:* ${category}\n💡 *Идея:* ${randomIdea}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
        ctx.session.lastMessageId = message.message_id; // Сохраняем ID сообщения
    } catch {
        const newMsg = await ctx.reply(`✨ *Направление:* ${category}\n💡 *Идея:* ${randomIdea}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
        ctx.session.lastMessageId = newMsg.message_id; // Сохраняем ID нового сообщения
    }
}

// Обработчик кнопки "Попробовать ещё раз"
export async function handleRetry(ctx) {
    const category = ctx.session.selectedCategory;
    if (!category) {
        return ctx.answerCallbackQuery("Сначала выберите направление!");
    }

    const randomIdea = ideas[category][Math.floor(Math.random() * ideas[category].length)];
    const actionKeyboard = new InlineKeyboard()
        .text("🔄 Попробовать ещё", "retry")
        .text("Назад", "back");

    // Проверяем, есть ли сохранённый lastMessageId
    const messageId = ctx.session.lastMessageId || ctx.callbackQuery.message.message_id;

    try {
        await ctx.api.editMessageText(ctx.chat.id, messageId, `✨ *Направление:* ${category}\n💡 *Идея:* ${randomIdea}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
    } catch {
        const newMsg = await ctx.reply(`✨ *Направление:* ${category}\n💡 *Идея:* ${randomIdea}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
        ctx.session.lastMessageId = newMsg.message_id; // Обновляем ID сообщения
    }
}

// Обработчик кнопки "Назад"
export async function handleBack(ctx) {
    ctx.session.selectedCategory = null;

    const messageId = ctx.session.lastMessageId || ctx.callbackQuery.message.message_id;

    try {
        await ctx.api.editMessageText(ctx.chat.id, messageId, 
            "🎨 Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для выбранного направления.\n\nВыбери одно из направлений ниже:", { 
            reply_markup: categoryKeyboard 
        });
    } catch {
        const newMsg = await ctx.reply("🎨 Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для выбранного направления.\n\nВыбери одно из направлений ниже:", { 
            reply_markup: categoryKeyboard 
        });
        ctx.session.lastMessageId = newMsg.message_id; // Сохраняем ID нового сообщения
    }
}
