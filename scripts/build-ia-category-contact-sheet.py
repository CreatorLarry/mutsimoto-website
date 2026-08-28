from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "output" / "branding" / "ia-branch" / "category-photos"
LOCAL = ROOT / "public" / "images" / "applications"
OUT = ROOT / "tmp" / "pdfs" / "ia-branding-final" / "category-photo-contact-sheet.jpg"

items = [
    ("01  LIGHT COMMERCIAL", WEB / "01-light-commercial-vehicle.jpg"),
    ("02  HEAVY COMMERCIAL", WEB / "02-heavy-commercial-vehicle.jpg"),
    ("03  MATATUS & PSVs", WEB / "03-matatus-psvs.jpg"),
    ("04  PASSENGER CARS", WEB / "04-passenger-cars.jpg"),
    ("05  4WDs & SUVs", WEB / "05-4wd-suv.jpg"),
    ("06  PICKUPS", WEB / "06-pickups.jpg"),
    ("07  GENERATORS", WEB / "07-generators.jpg"),
    ("08  CONSTRUCTION", WEB / "08-construction-equipment.jpg"),
    ("09  MINING", WEB / "09-mining-equipment.jpg"),
    ("10  AGRICULTURAL", WEB / "10-agricultural-machinery.jpg"),
    ("11  TRACTORS", WEB / "11-tractors.jpg"),
    ("12  COMPRESSORS", WEB / "12-compressors.jpg"),
    ("13  INDUSTRIAL & PLANT", WEB / "13-industrial-plant-machinery.jpg"),
]

tile_w, photo_h, label_h = 600, 350, 56
cols = 3
rows = (len(items) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tile_w, rows * (photo_h + label_h)), "#11161A")
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arialbd.ttf", 24)
except OSError:
    font = ImageFont.load_default()

for index, (label, path) in enumerate(items):
    with Image.open(path) as source:
        image = ImageOps.fit(source.convert("RGB"), (tile_w, photo_h), method=Image.Resampling.LANCZOS)
    x = (index % cols) * tile_w
    y = (index // cols) * (photo_h + label_h)
    sheet.paste(image, (x, y))
    draw.rectangle((x, y + photo_h, x + tile_w, y + photo_h + label_h), fill="#11161A")
    draw.text((x + 18, y + photo_h + 14), label, fill="#F3F1EC", font=font)

OUT.parent.mkdir(parents=True, exist_ok=True)
sheet.save(OUT, quality=90, optimize=True)
print(OUT)
