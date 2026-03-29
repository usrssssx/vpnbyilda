from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont


WIDTH = 1280
HEIGHT = 720
EXPORT_WIDTH = 640
EXPORT_HEIGHT = 360
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
DEFAULT_OUTPUT = Path("app/bot/static/description_picture.png")


def cover_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = image.size
    scale = max(target_w / src_w, target_h / src_h)
    resized = image.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, font: ImageFont.FreeTypeFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    padding_x = 20
    padding_y = 12
    rect = (x, y, x + width + padding_x * 2, y + height + padding_y * 2)
    draw.rounded_rectangle(rect, radius=18, fill=(247, 248, 251), outline=(255, 79, 79), width=2)
    draw.text((x + padding_x, y + padding_y - 2), text, font=font, fill=(20, 24, 30))
    return rect[2]


def boost_red_glow(base: Image.Image) -> Image.Image:
    r, g, b = base.split()
    boosted_r = ImageEnhance.Contrast(r).enhance(1.22)
    boosted_r = ImageEnhance.Brightness(boosted_r).enhance(1.08)
    merged = Image.merge("RGB", (boosted_r, g, b))

    glow_mask = ImageChops.subtract(boosted_r, g).filter(ImageFilter.GaussianBlur(12))
    glow = Image.new("RGB", base.size, (255, 58, 58))
    glow_layer = Image.composite(glow, Image.new("RGB", base.size, (0, 0, 0)), glow_mask)
    return Image.blend(merged, glow_layer, 0.14)


def build_description_picture(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path).convert("RGB")

    bg = cover_resize(source, (WIDTH, HEIGHT))
    bg = bg.filter(ImageFilter.GaussianBlur(18))
    bg = ImageEnhance.Brightness(bg).enhance(0.34)
    bg = ImageEnhance.Contrast(bg).enhance(1.12)
    canvas = bg.convert("RGBA")

    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((780, 240, 1260, 720), fill=(255, 60, 60, 38))
    glow_draw.ellipse((120, 20, 620, 520), fill=(255, 60, 60, 22))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas.alpha_composite(glow)

    fg = source.resize((520, 520), Image.Resampling.LANCZOS)
    fg = ImageEnhance.Contrast(fg).enhance(1.15)
    fg = ImageEnhance.Sharpness(fg).enhance(1.28)
    fg = boost_red_glow(fg)

    fg_rgba = fg.convert("RGBA")
    mask = rounded_mask(fg_rgba.size, 44)
    framed = Image.new("RGBA", fg_rgba.size, (0, 0, 0, 0))
    framed.paste(fg_rgba, (0, 0), mask)

    shadow = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((24, 24, 536, 536), radius=48, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))

    panel = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
    panel.alpha_composite(shadow)
    panel.alpha_composite(framed, dest=(20, 20))
    panel = panel.rotate(-7, resample=Image.Resampling.BICUBIC, expand=True)
    canvas.alpha_composite(panel, dest=(760, 116))

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    accent = (255, 88, 88)
    line_y = 104
    draw.rounded_rectangle((88, line_y, 360, line_y + 10), radius=5, fill=(*accent, 220))

    eyebrow_font = ImageFont.truetype(FONT_REGULAR, 28)
    title_font = ImageFont.truetype(FONT_BOLD, 74)
    subtitle_font = ImageFont.truetype(FONT_REGULAR, 26)
    chip_font = ImageFont.truetype(FONT_REGULAR, 26)

    draw.text((88, 134), "NETRUNVPN", font=eyebrow_font, fill=(235, 239, 246, 255))
    draw.multiline_text(
        (88, 200),
        "Подписка,\nподключение\nи поддержка",
        font=title_font,
        fill=(248, 248, 250, 255),
        spacing=6,
    )
    draw.multiline_text(
        (88, 510),
        "VPN через Telegram-бот и Mini App.\nБыстрый доступ к конфигам, тарифам и поддержке.",
        font=subtitle_font,
        fill=(214, 220, 232, 235),
        spacing=8,
    )

    chip_y = 598
    x = 88
    x = draw_chip(draw, x, chip_y, "Telegram Bot", chip_font) + 16
    x = draw_chip(draw, x, chip_y, "Mini App", chip_font) + 16
    draw_chip(draw, x, chip_y, "Secure Access", chip_font)

    canvas.alpha_composite(overlay)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    final = canvas.convert("RGB").resize((EXPORT_WIDTH, EXPORT_HEIGHT), Image.Resampling.LANCZOS)
    final.save(output_path, format="PNG")
    print(f"saved {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Path to source image")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    build_description_picture(args.source, args.output)


if __name__ == "__main__":
    main()
