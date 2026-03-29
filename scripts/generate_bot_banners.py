from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1280
HEIGHT = 720
OUTPUT_DIR = Path("app/bot/static")
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


@dataclass(frozen=True)
class BannerSpec:
    filename: str
    eyebrow: str
    title: str
    subtitle: str
    accent: tuple[int, int, int]
    glow: tuple[int, int, int]


BANNERS = (
    BannerSpec(
        filename="menu.jpg",
        eyebrow="NETRUNVPN",
        title="Безопасный доступ\nбез лишних шагов",
        subtitle="Тарифы, подключение, документы и поддержка\nв одном профессиональном Telegram-боте.",
        accent=(86, 214, 183),
        glow=(34, 111, 255),
    ),
    BannerSpec(
        filename="about.jpg",
        eyebrow="О СЕРВИСЕ",
        title="Защищенное соединение\nдля работы\nи личных задач",
        subtitle="Понятные условия, дистанционный доступ\nи прозрачная юридическая информация\nвнутри бота.",
        accent=(89, 173, 255),
        glow=(0, 210, 186),
    ),
    BannerSpec(
        filename="help.jpg",
        eyebrow="ПОДДЕРЖКА",
        title="Помогаем быстро\nи по делу",
        subtitle="Настройка клиента, доступ, подписка и возвраты.\nОдин канал поддержки без хаоса.",
        accent=(255, 175, 92),
        glow=(255, 111, 76),
    ),
    BannerSpec(
        filename="buy.jpg",
        eyebrow="ТАРИФЫ",
        title="Гибкие планы\nдля стабильного\nдоступа",
        subtitle="Оформление подписки, управление сроком\nи переход в Mini App\nбез разрыва сценария.",
        accent=(122, 203, 255),
        glow=(45, 110, 255),
    ),
    BannerSpec(
        filename="type_vpn.jpg",
        eyebrow="ПОДКЛЮЧЕНИЕ",
        title="Открой приложение,\nполучи конфиг\nи подключись",
        subtitle="Простая схема входа: оплата, конфигурация,\nклиент и защищенное соединение.",
        accent=(83, 229, 170),
        glow=(0, 146, 255),
    ),
    BannerSpec(
        filename="duration.jpg",
        eyebrow="ВЫБОР ПЕРИОДА",
        title="Подберите период\nпод ваш сценарий",
        subtitle="Короткие и длинные периоды доступа с понятной\nструктурой тарифа.",
        accent=(255, 197, 90),
        glow=(255, 123, 80),
    ),
    BannerSpec(
        filename="device_count.jpg",
        eyebrow="УСТРОЙСТВА",
        title="Один аккаунт,\nнесколько точек входа",
        subtitle="Подключайте нужное количество устройств в рамках\nвыбранного плана.",
        accent=(117, 222, 205),
        glow=(69, 132, 255),
    ),
)


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def fit_font(path: str, text: str, max_size: int, min_size: int, max_width: int) -> ImageFont.FreeTypeFont:
    size = max_size
    while size > min_size:
        font = load_font(path, size)
        bbox = font.getbbox(text)
        if (bbox[2] - bbox[0]) <= max_width:
            return font
        size -= 1
    return load_font(path, min_size)


def draw_fit_text(
    draw: ImageDraw.ImageDraw,
    position: tuple[int, int],
    text: str,
    path: str,
    max_size: int,
    min_size: int,
    max_width: int,
    fill: tuple[int, int, int],
) -> None:
    font = fit_font(path, text, max_size=max_size, min_size=min_size, max_width=max_width)
    draw.text(position, text, font=font, fill=fill)


def vertical_gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), top)
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        ratio = y / max(HEIGHT - 1, 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.line((0, y, WIDTH, y), fill=color)
    return image


def add_grid(draw: ImageDraw.ImageDraw) -> None:
    grid_color = (255, 255, 255, 20)
    step = 80
    for x in range(0, WIDTH, step):
        draw.line((x, 0, x, HEIGHT), fill=grid_color, width=1)
    for y in range(0, HEIGHT, step):
        draw.line((0, y, WIDTH, y), fill=grid_color, width=1)


def add_glow(base: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> None:
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=80))
    base.alpha_composite(overlay)


def draw_chip(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    accent: tuple[int, int, int],
    text_fill: tuple[int, int, int] = (242, 247, 255),
) -> None:
    bbox = draw.textbbox((x, y), text, font=font)
    padding_x = 24
    padding_y = 14
    rect = (
        bbox[0] - padding_x,
        bbox[1] - padding_y,
        bbox[2] + padding_x,
        bbox[3] + padding_y,
    )
    draw.rounded_rectangle(rect, radius=24, fill=(255, 255, 255, 24), outline=(*accent, 140), width=2)
    draw.text((x, y), text, font=font, fill=text_fill)


def draw_chip_row(
    draw: ImageDraw.ImageDraw,
    y: int,
    texts: tuple[str, ...],
    font: ImageFont.FreeTypeFont,
    accent: tuple[int, int, int],
    text_fill: tuple[int, int, int],
    left: int = 94,
    right: int = 780,
) -> None:
    padding_x = 24
    widths = []
    for text in texts:
        bbox = draw.textbbox((0, 0), text, font=font)
        widths.append((bbox[2] - bbox[0]) + padding_x * 2)

    total_width = sum(widths)
    if len(widths) > 1:
        gap = max(16, int((right - left - total_width) / (len(widths) - 1)))
    else:
        gap = 0

    current_left = left
    for text, chip_width in zip(texts, widths):
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_x = int(current_left + padding_x)
        draw_chip(draw, text_x, y, text, font, accent, text_fill=text_fill)
        current_left += chip_width + gap


def draw_about_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    title_font = load_font(FONT_BOLD, 20)
    body_font = load_font(FONT_REGULAR, 14)
    meta_font = load_font(FONT_BOLD, 15)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "NetRunVPN", font=title_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "О сервисе", font=body_font, fill=(150, 173, 210))

    info_top = y0 + 126
    card_specs = (
        ("Защита данных", ""),
        ("Удаленный доступ", ""),
        ("Поддержка", ""),
    )
    for index, (title, body) in enumerate(card_specs):
        top = info_top + index * 88
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 46, top + 14), title, FONT_BOLD, 15, 11, 150, (20, 30, 50))
        if body:
            draw_fit_text(draw, (x0 + 46, top + 39), body, FONT_REGULAR, 14, 10, 150, (76, 92, 118))


def draw_buy_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    label_font = load_font(FONT_BOLD, 14)
    price_font = load_font(FONT_BOLD, 28)
    meta_font = load_font(FONT_REGULAR, 13)
    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "Тарифы", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "NetRunVPN", font=meta_font, fill=(150, 173, 210))

    plan_cards = (
        ("1 месяц", "60 р", ""),
        ("3 месяца", "150 р", ""),
        ("12 месяцев", "540 р", ""),
    )
    for index, (label, price, meta) in enumerate(plan_cards):
        top = y0 + 124 + index * 88
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 42, top + 14), label, FONT_BOLD, 14, 11, 90, (20, 30, 50))
        draw_fit_text(draw, (x0 + 42, top + 32), price, FONT_BOLD, 28, 18, 60, (20, 30, 50))
        if meta:
            draw.text((x0 + 132, top + 42), meta, font=meta_font, fill=(76, 92, 118))


def draw_device_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    meta_font = load_font(FONT_REGULAR, 13)
    value_font = load_font(FONT_BOLD, 24)
    label_font = load_font(FONT_BOLD, 15)
    body_font = load_font(FONT_REGULAR, 13)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "Устройства", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "NetRunVPN", font=meta_font, fill=(150, 173, 210))

    stat_top = y0 + 132
    draw.rounded_rectangle((x0 + 28, stat_top, x1 - 28, stat_top + 96), radius=20, fill=(235, 241, 250))
    draw_fit_text(draw, (x0 + 42, stat_top + 20), "До 5 устройств", FONT_BOLD, 24, 15, 150, (20, 30, 50))
    rows = (
        ("Телефон", "Основной вход"),
        ("Ноутбук", "Рабочий доступ"),
    )
    for index, (title, body) in enumerate(rows):
        top = y0 + 254 + index * 72
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 56), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 42, top + 12), title, FONT_BOLD, 15, 11, 80, (20, 30, 50))
        draw_fit_text(draw, (x0 + 132, top + 14), body, FONT_REGULAR, 13, 10, 70, (76, 92, 118))


def draw_duration_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    meta_font = load_font(FONT_REGULAR, 13)
    label_font = load_font(FONT_BOLD, 15)
    price_font = load_font(FONT_BOLD, 26)
    body_font = load_font(FONT_REGULAR, 13)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "Период", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "NetRunVPN", font=meta_font, fill=(150, 173, 210))

    cards = (
        ("1 месяц", "Быстрый тест", "60 р"),
        ("3 месяца", "Оптимально", "150 р"),
        ("12 месяцев", "Надолго", "540 р"),
    )
    for index, (title, body, price) in enumerate(cards):
        top = y0 + 124 + index * 88
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 42, top + 12), title, FONT_BOLD, 15, 11, 90, (20, 30, 50))
        draw_fit_text(draw, (x0 + 42, top + 38), body, FONT_REGULAR, 13, 10, 90, (76, 92, 118))
        draw_fit_text(draw, (x1 - 104, top + 22), price, FONT_BOLD, 26, 16, 60, (20, 30, 50))


def draw_help_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    meta_font = load_font(FONT_REGULAR, 13)
    label_font = load_font(FONT_BOLD, 15)
    body_font = load_font(FONT_REGULAR, 13)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "Поддержка", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "NetRunVPN", font=meta_font, fill=(150, 173, 210))

    items = (
        ("Настройка", "Клиент и конфиг"),
        ("Подписка", "Оплата и продление"),
        ("Ответ", "Связь в Telegram"),
    )
    for index, (title, body) in enumerate(items):
        top = y0 + 126 + index * 88
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 42, top + 16), title, FONT_BOLD, 15, 11, 150, (20, 30, 50))
        draw_fit_text(draw, (x0 + 42, top + 42), body, FONT_REGULAR, 13, 10, 150, (76, 92, 118))


def draw_menu_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    meta_font = load_font(FONT_REGULAR, 13)
    label_font = load_font(FONT_BOLD, 15)
    body_font = load_font(FONT_REGULAR, 13)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "NetRunVPN", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "Главное меню", font=meta_font, fill=(150, 173, 210))

    items = (
        ("Тарифы", "Выбор и оплата"),
        ("Подключение", "Конфиг и инструкция"),
        ("Поддержка", "Помощь без хаоса"),
    )
    for index, (title, body) in enumerate(items):
        top = y0 + 126 + index * 88
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=18, fill=(235, 241, 250))
        draw_fit_text(draw, (x0 + 42, top + 16), title, FONT_BOLD, 15, 11, 150, (20, 30, 50))
        draw_fit_text(draw, (x0 + 42, top + 42), body, FONT_REGULAR, 13, 10, 150, (76, 92, 118))


def draw_type_phone_panel(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, accent: tuple[int, int, int]) -> None:
    header_font = load_font(FONT_BOLD, 20)
    meta_font = load_font(FONT_REGULAR, 13)

    draw.rounded_rectangle((x0, y0, x1, y1), radius=28, fill=(248, 250, 255), outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle((x0 + 22, y0 + 22, x1 - 22, y0 + 94), radius=22, fill=(18, 28, 51))
    draw.text((x0 + 44, y0 + 42), "Подключение", font=header_font, fill=(248, 250, 255))
    draw.text((x0 + 44, y0 + 72), "NetRunVPN", font=meta_font, fill=(150, 173, 210))

    steps = (
        ("1", "Открой Mini App"),
        ("2", "Скопируй конфиг"),
        ("3", "Вставь в клиент"),
    )
    for index, (number, text) in enumerate(steps):
        top = y0 + 146 + index * 96
        draw.rounded_rectangle((x0 + 28, top, x1 - 28, top + 72), radius=20, fill=(235, 241, 250))
        draw.rounded_rectangle((x0 + 42, top + 16, x0 + 86, top + 60), radius=15, fill=(*accent, 220))
        step_font = fit_font(FONT_BOLD, text, max_size=15, min_size=11, max_width=110)
        number_font = load_font(FONT_BOLD, 15)
        num_bbox = draw.textbbox((0, 0), number, font=number_font)
        num_x = x0 + 64 - (num_bbox[2] - num_bbox[0]) / 2
        draw.text((num_x, top + 25), number, font=number_font, fill=(13, 22, 38))
        draw.text((x0 + 100, top + 29), text, font=step_font, fill=(20, 30, 50))


def draw_banner(spec: BannerSpec) -> Image.Image:
    base = vertical_gradient((8, 15, 32), (17, 29, 56)).convert("RGBA")
    draw = ImageDraw.Draw(base, "RGBA")

    add_glow(base, (220, 140), 220, spec.glow, 150)
    add_glow(base, (980, 540), 240, spec.accent, 120)
    add_glow(base, (1100, 110), 160, (255, 255, 255), 40)

    add_grid(draw)

    draw.rounded_rectangle((48, 48, WIDTH - 48, HEIGHT - 48), radius=36, outline=(255, 255, 255, 28), width=2)
    draw.rounded_rectangle((66, 66, WIDTH - 66, HEIGHT - 66), radius=30, outline=(*spec.accent, 34), width=1)

    accent_bar = (92, 92, 420, 98)
    draw.rounded_rectangle(accent_bar, radius=3, fill=spec.accent)

    eyebrow_font = load_font(FONT_BOLD, 26)
    title_font_size = 74
    title_y = 170
    subtitle_y = 390
    title_fill = (248, 250, 255)
    chip_text_fill = (242, 247, 255)
    panel_x0 = 920
    panel_y0 = 140
    panel_x1 = 1160
    panel_y1 = 560

    if spec.filename == "about.jpg":
        title_font_size = 62
        title_y = 164
        subtitle_y = 444
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "menu.jpg":
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "buy.jpg":
        title_font_size = 60
        title_y = 164
        subtitle_y = 446
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "device_count.jpg":
        title_font_size = 58
        title_y = 166
        subtitle_y = 454
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "duration.jpg":
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "help.jpg":
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566
    elif spec.filename == "type_vpn.jpg":
        title_font_size = 58
        title_y = 164
        subtitle_y = 446
        chip_text_fill = (20, 26, 38)
        panel_x0 = 930
        panel_y0 = 142
        panel_x1 = 1176
        panel_y1 = 566

    title_font = load_font(FONT_BOLD, title_font_size)
    subtitle_font = load_font(FONT_REGULAR, 30)
    chip_font = load_font(FONT_BOLD, 24)

    draw.text((92, 120), spec.eyebrow, font=eyebrow_font, fill=(208, 224, 255))
    draw.multiline_text((92, title_y), spec.title, font=title_font, fill=title_fill, spacing=6)
    draw.multiline_text((92, subtitle_y), spec.subtitle, font=subtitle_font, fill=(201, 214, 235), spacing=10)

    draw_chip_row(
        draw,
        570,
        ("Telegram Bot", "Mini App Ready", "Secure Access"),
        chip_font,
        spec.accent,
        chip_text_fill,
    )

    if spec.filename == "about.jpg":
        draw_about_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "menu.jpg":
        draw_menu_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "buy.jpg":
        draw_buy_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "device_count.jpg":
        draw_device_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "duration.jpg":
        draw_duration_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "help.jpg":
        draw_help_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    elif spec.filename == "type_vpn.jpg":
        draw_type_phone_panel(draw, panel_x0, panel_y0, panel_x1, panel_y1, spec.accent)
    else:
        draw.rounded_rectangle((panel_x0, panel_y0, panel_x1, panel_y1), radius=28, fill=(255, 255, 255, 18), outline=(255, 255, 255, 28), width=2)
        for idx, width in enumerate((150, 180, 130, 165)):
            top = panel_y0 + 48 + idx * 86
            draw.rounded_rectangle((panel_x0 + 28, top, panel_x0 + 28 + width, top + 16), radius=8, fill=(255, 255, 255, 80))
            draw.rounded_rectangle((panel_x0 + 28, top + 28, panel_x1 - 28, top + 56), radius=14, fill=(255, 255, 255, 20))
        draw.rounded_rectangle((panel_x0 + 28, panel_y1 - 78, panel_x1 - 28, panel_y1 - 34), radius=18, fill=(*spec.accent, 220))

    return base.convert("RGB")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for spec in BANNERS:
        image = draw_banner(spec)
        image.save(OUTPUT_DIR / spec.filename, quality=92, subsampling=0)
        print(f"generated {spec.filename}")


if __name__ == "__main__":
    main()
