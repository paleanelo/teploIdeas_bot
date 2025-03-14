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




// Часть кода для развёртывания на сервере (при необходимости можно удалить)
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

