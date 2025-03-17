import { Bot, session } from "grammy";
import { config } from "dotenv";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";
import { ideasCommand, handleCategorySelection, handleRetry, handleBack } from "./commands/ideas.js";
import { errorHandler, unknownCommandHandler, textInputHandler } from "./middlewares/errorHandler.js";

config();

const bot = new Bot(process.env.BOT_TOKEN);

// Список доступных команд
bot.api.setMyCommands([
    { command: "start", description: "Запустить бота" },
    { command: "help", description: "Помощь по командам" },
    { command: "ideas", description: "Получить идею для творчества" }
]);

// Добавляем поддержку сессий
bot.use(session({ initial: () => ({ selectedCategory: null }) }));

// Регистрируем команды
bot.command("start", startCommand);
bot.command("help", helpCommand);
bot.command("ideas", ideasCommand);

// Обработчики нажатий кнопок
bot.callbackQuery(/category:.+/, handleCategorySelection);
bot.callbackQuery("retry", handleRetry);
bot.callbackQuery("back", handleBack);

// Обработчик текстовых сообщений
bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) {
        await unknownCommandHandler(ctx);
    } else {
        await textInputHandler(ctx);
    }
});

// Обработчик получения фото (выводит file_id)
bot.on("message:photo", async (ctx) => {
    const fileId = ctx.message.photo.pop().file_id;
    await ctx.reply(`📸 File ID: \`${fileId}\``, { parse_mode: "Markdown" });
});

// Обработчик ошибок
bot.catch(errorHandler);

bot.start();
console.log("Бот запущен!");
