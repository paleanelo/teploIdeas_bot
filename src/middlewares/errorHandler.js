export const errorHandler = async (err) => {
    console.error("Произошла ошибка:", err);

    try {
        await err.ctx.reply("⚠️ Произошла ошибка. Попробуйте позже.");
    } catch (replyError) {
        console.error("Ошибка при отправке сообщения об ошибке:", replyError);
    }
};

// Обработчик неизвестных команд (если начинается с "/")
export const unknownCommandHandler = async (ctx) => {
    if (ctx.message.text.startsWith("/")) {
        await ctx.reply("❌ Неизвестная команда. Используйте /help для списка доступных команд.");
    }
};

// Обработчик любых вводимых пользователем символов (не команд)
export const textInputHandler = async (ctx) => {
    await ctx.reply("🤖 Я пока не понимаю обычные сообщения. Используйте команды или кнопки.");
};
