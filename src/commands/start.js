export function startCommand(ctx) {
    ctx.reply(
        "Привет! Я помогу тебе избавиться от боязни белого листа и сгенерирую идею для творчества.\n\n" +
        "🛠 Доступные команды:\n" +
        "/start – Перезапустить бота\n" +
        "/help – Справка по боту\n" +
        "/ideas – Получить творческую идею\n\n" +
        "Выбери команду или просто введи /ideas, чтобы начать!\n\n" +
        "🧡 А воплотить понравившуюся идею всегда можно в центре \"Тепло\"! Переходи в нашу группу [ВК](https://vk.com/mp_teplo) или [Телеграм](https://t.me/teplo_mc), выбирай удобное время и записывайся!"
        , { parse_mode: "Markdown" }
    );
}
