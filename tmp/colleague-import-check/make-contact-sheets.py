from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent / "previews-after"
for series in range(1, 5):
    folder = root / f"{series}-series"
    files = sorted(folder.glob("*.png"))
    cards = []
    for file in files:
        image = Image.open(file).convert("RGB")
        image.thumbnail((1200, 360))
        card = Image.new("RGB", (1220, image.height + 42), "white")
        ImageDraw.Draw(card).text((10, 10), file.stem.replace("-", " "), fill="#07172b")
        card.paste(image, (10, 32))
        cards.append(card)
    sheet = Image.new("RGB", (1220, sum(card.height for card in cards)), "#e9eef3")
    y = 0
    for card in cards:
        sheet.paste(card, (0, y))
        y += card.height
    sheet.save(root / f"{series}-series-contact.jpg", quality=88)
