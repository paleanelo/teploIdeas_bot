import { Bot, session } from "grammy";
import { config } from "dotenv";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";
import { ideasCommand, handleCategorySelection, handleRetry, handleBack } from "./commands/ideas.js";
import { errorHandler, unknownCommandHandler, textInputHandler } from "./middlewares/errorHandler.js";

config(); // Загружаем переменные из .env

const bot = new Bot(process.env.BOT_TOKEN);

// Устанавливаем список доступных команд
bot.api.setMyCommands([
    { command: "start", description: "Запустить бота" },
    { command: "help", description: "Помощь по командам" },
    { command: "ideas", description: "Получить идею для творчества" },
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



bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) {
        await unknownCommandHandler(ctx);
    } else {
        await textInputHandler(ctx);
    }
});



// Обработчик ошибок
bot.catch(errorHandler);

bot.start();
console.log("Бот запущен!");
