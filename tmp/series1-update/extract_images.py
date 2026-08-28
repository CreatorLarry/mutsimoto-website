import json
import math
import re
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("tmp/series1-update")
SOURCE = ROOT / "source.xlsx"
OUTPUT = ROOT / "images"
OUTPUT.mkdir(parents=True, exist_ok=True)

with (ROOT / "source-values.json").open("r", encoding="utf-8") as handle:
    sheets = json.load(handle)
values = sheets[0]["values"]

drawings = []
with (ROOT / "source-drawings.ndjson").open("r", encoding="utf-8") as handle:
    for line in handle:
        drawing = json.loads(line)
        if drawing.get("sheet") == "FINAL 1 SERIES CATALOGUE":
            drawings.append(drawing)

assignments = []
counters = {}
with zipfile.ZipFile(SOURCE) as archive:
    for drawing in sorted(drawings, key=lambda item: (item["anchor"]["from"]["row"], item["anchor"]["from"]["col"])):
        row = int(drawing["anchor"]["from"]["row"])
        col = int(drawing["anchor"]["from"]["col"])
        part_number = str(values[row][1]).strip()
        safe_part = re.sub(r"[^A-Za-z0-9._-]+", "-", part_number).strip("-")
        counters[safe_part] = counters.get(safe_part, 0) + 1
        source_path = drawing["id"].lstrip("/")
        extension = Path(source_path).suffix.lower()
        filename = f"{safe_part}-{counters[safe_part]}{extension}"
        data = archive.read(source_path)
        (OUTPUT / filename).write_bytes(data)
        assignments.append({
            "partNumber": part_number,
            "excelRow": row + 1,
            "sourceColumn": col + 1,
            "sourceMedia": source_path,
            "filename": filename,
            "size": len(data),
        })

(ROOT / "image-mapping.json").write_text(json.dumps(assignments, indent=2), encoding="utf-8")

thumb_width = 300
thumb_height = 220
label_height = 58
columns = 4
rows = math.ceil(len(assignments) / columns)
canvas = Image.new("RGB", (columns * thumb_width, rows * (thumb_height + label_height)), "#eef2f5")
draw = ImageDraw.Draw(canvas)
font = ImageFont.load_default()

for index, assignment in enumerate(assignments):
    x = (index % columns) * thumb_width
    y = (index // columns) * (thumb_height + label_height)
    with Image.open(OUTPUT / assignment["filename"]) as image:
        image = image.convert("RGB")
        image.thumbnail((thumb_width - 24, thumb_height - 24), Image.Resampling.LANCZOS)
        image_x = x + (thumb_width - image.width) // 2
        image_y = y + (thumb_height - image.height) // 2
        canvas.paste(image, (image_x, image_y))
    draw.rectangle((x, y + thumb_height, x + thumb_width - 1, y + thumb_height + label_height - 1), fill="#07172b")
    draw.text((x + 10, y + thumb_height + 8), assignment["partNumber"], fill="white", font=font)
    draw.text((x + 10, y + thumb_height + 28), assignment["filename"], fill="#aebdca", font=font)

canvas.save(ROOT / "image-contact-sheet.jpg", quality=90)
print(json.dumps({"assignments": len(assignments), "uniqueProducts": len({item['partNumber'] for item in assignments}), "folder": str(OUTPUT)}, indent=2))
