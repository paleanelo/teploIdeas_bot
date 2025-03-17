import fs from "fs";
import path from "path";
import { InlineKeyboard } from "grammy";

// Загружаем идеи из JSON
const ideas = JSON.parse(fs.readFileSync("src/data/ideas.json", "utf-8"));

const IMAGE_FOLDER = path.join(process.cwd(), "images");

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

// Функция для удаления кнопок у предыдущего сообщения
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

// Функция отправки сообщения с идеей (или картинки, если есть)
async function sendIdea(ctx, category) {
    const randomIdea = ideas[category][Math.floor(Math.random() * ideas[category].length)];
    const actionKeyboard = new InlineKeyboard()
        .text("🔄 Попробовать ещё", "retry")
        .text("Назад", "back");

    // Проверяем, является ли идея изображением
    const imagePath = path.resolve("images", randomIdea);
    if (fs.existsSync(imagePath)) {
        try {
            // Отправляем изображение
            const newMsg = await ctx.replyWithPhoto(
                { source: imagePath },
                {
                    caption: "Вот фото для вдохновения, попробуй повторить идею",
                    reply_markup: actionKeyboard,
                }
            );
            ctx.session.lastIdeaMessageId = newMsg.message_id;
        } catch (error) {
            console.error("Ошибка при отправке фото:", error);
            await ctx.reply("Не удалось отправить изображение. Попробуйте снова.", {
                reply_markup: actionKeyboard,
            });
        }
    } else {
        // Отправляем текстовую идею
        const newMsg = await ctx.reply(`✨ *Направление:* ${category}\n💡 *Идея:* ${randomIdea}`, {
            reply_markup: actionKeyboard,
            parse_mode: "Markdown",
        });
        ctx.session.lastIdeaMessageId = newMsg.message_id;
    }
}


// Обработчик выбора категории
export async function handleCategorySelection(ctx) {
    const category = ctx.match.input.split(":")[1];
    ctx.session.selectedCategory = category;

    await removeOldButtons(ctx);
    await sendIdea(ctx, category);
}

// Обработчик кнопки "Попробовать ещё раз"
export async function handleRetry(ctx) {
    const category = ctx.session.selectedCategory;
    if (!category) {
        return ctx.answerCallbackQuery("Сначала выберите направление!");
    }

    await removeOldButtons(ctx);
    await sendIdea(ctx, category);
}

// Обработчик кнопки "Назад"
export async function handleBack(ctx) {
    ctx.session.selectedCategory = null;

    await removeOldButtons(ctx);

    const newMsg = await ctx.reply("🎨 Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для выбранного направления.\n\nВыбери одно из направлений ниже:", { 
        reply_markup: categoryKeyboard 
    });

    ctx.session.lastIdeaMessageId = newMsg.message_id;
}
