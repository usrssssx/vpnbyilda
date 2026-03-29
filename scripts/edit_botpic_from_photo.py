from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


SOURCE = Path("/Users/daniilglusenko/Downloads/photo_2026-03-29 19.52.31.jpeg")
OUTPUT = Path("app/bot/static/botpic.png")


def add_vignette(base: Image.Image, strength: int = 135) -> Image.Image:
    width, height = base.size
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    margin = int(width * 0.11)
    draw.ellipse((margin, margin, width - margin, height - margin), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=140))
    shade = Image.new("RGB", (width, height), (6, 6, 8))
    return Image.composite(base, Image.blend(base, shade, strength / 255), mask)


def boost_red_glow(base: Image.Image) -> Image.Image:
    r, g, b = base.split()
    boosted_r = ImageEnhance.Contrast(r).enhance(1.18)
    boosted_r = ImageEnhance.Brightness(boosted_r).enhance(1.08)
    merged = Image.merge("RGB", (boosted_r, g, b))

    glow_mask = ImageChops.subtract(boosted_r, g).filter(ImageFilter.GaussianBlur(10))
    glow = Image.new("RGB", base.size, (255, 54, 54))
    glow_layer = Image.composite(glow, Image.new("RGB", base.size, (0, 0, 0)), glow_mask)
    return Image.blend(merged, glow_layer, 0.12)


def make_botpic(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path).convert("RGB")
    size = source.size[0]

    bg = source.resize((size, size), Image.Resampling.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(18))
    bg = ImageEnhance.Brightness(bg).enhance(0.42)
    bg = ImageEnhance.Contrast(bg).enhance(1.1)

    fg = source.resize((900, 900), Image.Resampling.LANCZOS)
    fg = ImageEnhance.Contrast(fg).enhance(1.16)
    fg = ImageEnhance.Color(fg).enhance(1.08)
    fg = ImageEnhance.Sharpness(fg).enhance(1.4)
    fg = boost_red_glow(fg)

    canvas = bg.copy()
    offset = ((size - fg.width) // 2, (size - fg.height) // 2)
    canvas.paste(fg, offset)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    x0, y0 = offset
    x1, y1 = x0 + fg.width, y0 + fg.height
    shadow_draw.rounded_rectangle((x0 + 18, y0 + 18, x1 + 18, y1 + 18), radius=34, fill=(0, 0, 0, 68))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow).convert("RGB")
    canvas.paste(fg, offset)

    canvas = add_vignette(canvas)

    final = ImageEnhance.Contrast(canvas).enhance(1.04)
    final = ImageEnhance.Sharpness(final).enhance(1.1)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    final.save(output_path, format="PNG")
    print(f"saved {output_path}")


if __name__ == "__main__":
    make_botpic(SOURCE, OUTPUT)
