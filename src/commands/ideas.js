import fs from "fs";
import { InlineKeyboard } from "grammy";

// Загружаем идеи
const ideas = JSON.parse(fs.readFileSync("src/data/ideas.json", "utf-8"));
console.log("Loaded ideas:", ideas);

// Создаём кнопки с направлениями
const categories = Object.keys(ideas);
const categoryKeyboard = new InlineKeyboard();
categories.forEach((category, index) => {
    categoryKeyboard.text(category, `category:${encodeURIComponent(category)}`);
    if ((index + 1) % 2 === 0) categoryKeyboard.row();
});

// Функция обработки команды /ideas
export function ideasCommand(ctx) {
    ctx.reply(
        "🎨 Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для выбранного направления.\n\nВыбери одно из направлений ниже:",
        { reply_markup: categoryKeyboard }
    );
}

// Удаляем кнопки у старого сообщения
async function removeOldButtons(ctx) {
    if (ctx.session.lastIdeaMessageId) {
        try {
            await ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.lastIdeaMessageId, {
                reply_markup: undefined,
            });
        } catch (error) {
            console.error("Ошибка при удалении кнопок у предыдущего сообщения:", error);
        }
    }
}

// Обработчик выбора категории
export async function handleCategorySelection(ctx, categoryFromRetry = null) {
    console.log("ctx.match:", ctx.match);
    console.log("Session category before selection:", ctx.session.selectedCategory);

    // Исправленный парсинг категории
    const categoryRaw = categoryFromRetry || ctx.match?.input?.split(":")[1] || ctx.session.selectedCategory;
    console.log("Raw category value:", categoryRaw);
    const category = typeof categoryRaw === "string" ? decodeURIComponent(categoryRaw) : null;
    console.log("Decoded category:", category);

    if (!category || !ideas[category]) {
        return ctx.reply("❌ Ошибка: категория не выбрана или не существует.");
    }

    ctx.session.selectedCategory = category;

    // Выбираем случайный элемент (идея или file_id)
    const randomItem = ideas[category][Math.floor(Math.random() * ideas[category].length)];
    console.log("Randomly selected item:", randomItem);

    let newMsg;
    if (/^[A-Za-z0-9_-]{30,}$/.test(randomItem)) {
        await removeOldButtons(ctx);
        newMsg = await ctx.replyWithPhoto(randomItem, {
            caption: "Вот фото для вдохновения, попробуй повторить эту идею! 📸",
        });
    } else {
        const actionKeyboard = new InlineKeyboard()
            .text("🔄 Попробовать ещё", "retry")
            .text("Назад", "back");

        await removeOldButtons(ctx);
        newMsg = await ctx.reply(`✨ *Направление:* ${category}\n💡 *Идея:* ${randomItem}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
    }

    ctx.session.lastIdeaMessageId = newMsg.message_id;
}

// Обработчик кнопки "Попробовать ещё раз"
export async function handleRetry(ctx) {
    if (!ctx.session.selectedCategory) {
        return ctx.answerCallbackQuery("Сначала выберите направление!");
    }

    await handleCategorySelection(ctx, ctx.session.selectedCategory);
}

// Обработчик кнопки "Назад"
export async function handleBack(ctx) {
    ctx.session.selectedCategory = null;

    await removeOldButtons(ctx);

    const newMsg = await ctx.reply("🎨 Выбери одно из направлений ниже:", { 
        reply_markup: categoryKeyboard 
    });

    ctx.session.lastIdeaMessageId = newMsg.message_id;
}