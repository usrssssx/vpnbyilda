from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


SIZE = 1024
OUTPUT = Path("app/bot/static/botpic.png")
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def vertical_gradient(size: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (size, size), top)
    draw = ImageDraw.Draw(image)
    for y in range(size):
        ratio = y / max(size - 1, 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.line((0, y, size, y), fill=color)
    return image


def add_noise(base: Image.Image, seed: int = 42) -> None:
    rng = random.Random(seed)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(220):
        x0 = rng.randint(-80, SIZE)
        y0 = rng.randint(-80, SIZE)
        x1 = x0 + rng.randint(40, 220)
        y1 = y0 + rng.randint(1, 4)
        alpha = rng.randint(14, 34)
        fill = (255, rng.randint(40, 90), rng.randint(40, 90), alpha)
        draw.rounded_rectangle((x0, y0, x1, y1), radius=2, fill=fill)

    for _ in range(90):
        x0 = rng.randint(0, SIZE)
        y0 = rng.randint(0, SIZE)
        x1 = x0 + rng.randint(-240, 240)
        y1 = y0 + rng.randint(-240, 240)
        alpha = rng.randint(18, 48)
        draw.line((x0, y0, x1, y1), fill=(235, 240, 255, alpha), width=1)

    for _ in range(1500):
        x = rng.randint(0, SIZE - 1)
        y = rng.randint(0, SIZE - 1)
        alpha = rng.randint(10, 38)
        overlay.putpixel((x, y), (255, 255, 255, alpha))

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.35))
    base.alpha_composite(overlay)


def add_glow(base: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> None:
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=100))
    base.alpha_composite(glow)


def draw_cables(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cable_colors = [
        (34, 38, 48, 220),
        (58, 18, 18, 190),
        (70, 70, 78, 160),
    ]

    paths = [
        ((-80, 120), (120, 40), (280, 90), (420, -40)),
        ((-60, 210), (160, 160), (310, 220), (520, 120)),
        ((820, -40), (760, 120), (900, 260), (700, 420)),
        ((960, 780), (780, 700), (680, 900), (520, 860)),
        ((120, 1040), (220, 860), (380, 760), (480, 620)),
    ]

    for idx, points in enumerate(paths):
        color = cable_colors[idx % len(cable_colors)]
        draw.line(points, fill=color, width=24, joint="curve")
        draw.line(points, fill=(12, 14, 18, 200), width=14, joint="curve")

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.5))
    base.alpha_composite(overlay)


def create_panel() -> Image.Image:
    panel = Image.new("RGBA", (860, 680), (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)

    outer = (28, 26, 30)
    inner = (17, 20, 24)
    draw.rounded_rectangle((0, 0, 860, 680), radius=48, fill=outer)
    draw.rounded_rectangle((24, 24, 836, 656), radius=40, fill=inner)

    for offset in range(0, 12):
        alpha = max(0, 90 - offset * 7)
        draw.rounded_rectangle(
            (24 + offset, 24 + offset, 836 - offset, 656 - offset),
            radius=40,
            outline=(255, 255, 255, alpha),
            width=1,
        )

    screw_fill = (92, 96, 108)
    screw_positions = [(62, 62), (798, 62), (62, 618), (798, 618)]
    for x, y in screw_positions:
        draw.ellipse((x - 14, y - 14, x + 14, y + 14), fill=screw_fill)
        draw.line((x - 7, y, x + 7, y), fill=(36, 38, 42), width=2)
        draw.line((x, y - 7, x, y + 7), fill=(36, 38, 42), width=2)

    scratches = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    scratches_draw = ImageDraw.Draw(scratches)
    rng = random.Random(7)
    for _ in range(55):
        x0 = rng.randint(40, 820)
        y0 = rng.randint(40, 640)
        x1 = x0 + rng.randint(-180, 180)
        y1 = y0 + rng.randint(-120, 120)
        scratches_draw.line((x0, y0, x1, y1), fill=(255, 255, 255, rng.randint(18, 50)), width=1)
    scratches = scratches.filter(ImageFilter.GaussianBlur(0.4))
    panel.alpha_composite(scratches)
    return panel


def draw_glow_text(text: str) -> Image.Image:
    canvas = Image.new("RGBA", (1020, 520), (0, 0, 0, 0))
    font = ImageFont.truetype(FONT_BOLD, 230)
    draw = ImageDraw.Draw(canvas)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (canvas.width - text_w) // 2
    y = (canvas.height - text_h) // 2 - 4

    for blur, alpha in ((30, 24), (18, 36), (10, 58)):
        glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).text((x, y), text, font=font, fill=(255, 72, 72, alpha))
        glow = glow.filter(ImageFilter.GaussianBlur(blur))
        canvas.alpha_composite(glow)

    pattern = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pattern_draw = ImageDraw.Draw(pattern)
    for row in range(y, y + text_h + 12, 6):
        pattern_draw.text((x, row), text, font=font, fill=(255, 96, 96, 0 if (row // 6) % 2 else 255))
    pattern = pattern.filter(ImageFilter.GaussianBlur(0.35))
    canvas.alpha_composite(pattern)

    crisp = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    crisp_draw = ImageDraw.Draw(crisp)
    crisp_draw.text((x, y), text, font=font, fill=(255, 118, 118, 255))
    crisp_draw.text((x + 4, y + 4), text, font=font, fill=(170, 15, 25, 90))
    canvas.alpha_composite(crisp)

    for i in range(16):
        px = 110 + i * 54
        py = 308 + int(math.sin(i / 2) * 8)
        line = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(line).rounded_rectangle((px, py, px + 44, py + 4), radius=2, fill=(255, 68, 68, 165))
        line = line.filter(ImageFilter.GaussianBlur(1.2))
        canvas.alpha_composite(line)

    return canvas.rotate(-18, resample=Image.Resampling.BICUBIC, expand=True)


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    base = vertical_gradient(SIZE, (8, 11, 15), (15, 17, 21)).convert("RGBA")
    add_glow(base, center=(620, 650), radius=300, color=(255, 56, 56), alpha=48)
    add_glow(base, center=(300, 280), radius=240, color=(255, 78, 78), alpha=28)
    draw_cables(base)

    panel = create_panel()
    rotated_panel = panel.rotate(-14, resample=Image.Resampling.BICUBIC, expand=True)
    base.alpha_composite(rotated_panel, dest=(56, 154))

    text = draw_glow_text("netrun")
    base.alpha_composite(text, dest=(-10, 194))

    add_noise(base)

    vignette = Image.new("RGBA", base.size, (0, 0, 0, 0))
    mask = Image.new("L", base.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((-60, -60, SIZE + 60, SIZE + 60), fill=180)
    mask = mask.filter(ImageFilter.GaussianBlur(80))
    vignette.putalpha(Image.eval(mask, lambda px: 255 - px))
    base.alpha_composite(vignette)

    base.convert("RGB").save(OUTPUT, quality=95)
    print(f"generated {OUTPUT}")


if __name__ == "__main__":
    main()
