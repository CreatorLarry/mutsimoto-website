from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PHOTO_DIR = ROOT / "output" / "branding" / "ia-branch" / "category-photos"
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)

INK = HexColor("#11161A")
PAPER = HexColor("#F3F1EC")
RED = HexColor("#8E1F2D")
RED_DARK = HexColor("#64141E")
MUTED = HexColor("#B9BEC1")
WHITE = white


CATEGORIES = [
    {
        "number": "01",
        "lines": ["LIGHT COMMERCIAL", "VEHICLES"],
        "photo": "01-light-commercial-vehicle.jpg",
        "focus": (0.42, 0.52),
    },
    {
        "number": "02",
        "lines": ["HEAVY COMMERCIAL", "VEHICLES"],
        "photo": "02-heavy-commercial-vehicle.jpg",
        "focus": (0.52, 0.50),
    },
    {
        "number": "03",
        "lines": ["MATATUS &", "PSVs"],
        "photo": "03-matatus-psvs.jpg",
        "focus": (0.67, 0.55),
    },
    {
        "number": "04",
        "lines": ["PASSENGER", "CARS"],
        "photo": "04-passenger-cars.jpg",
        "focus": (0.53, 0.50),
    },
    {
        "number": "05",
        "lines": ["4WDs &", "SUVs"],
        "photo": "05-4wd-suv.jpg",
        "focus": (0.50, 0.58),
    },
    {
        "number": "06",
        "lines": ["PICKUPS"],
        "photo": "06-pickups.jpg",
        "focus": (0.68, 0.55),
    },
    {
        "number": "07",
        "lines": ["GENERATORS"],
        "photo": "07-generators.jpg",
        "focus": (0.52, 0.54),
    },
    {
        "number": "08",
        "lines": ["CONSTRUCTION", "EQUIPMENT"],
        "photo": "08-construction-equipment.jpg",
        "focus": (0.52, 0.52),
    },
    {
        "number": "09",
        "lines": ["MINING", "EQUIPMENT"],
        "photo": "09-mining-equipment.jpg",
        "focus": (0.48, 0.74),
    },
    {
        "number": "10",
        "lines": ["AGRICULTURAL", "MACHINERY"],
        "photo": "10-agricultural-machinery.jpg",
        "focus": (0.53, 0.64),
    },
    {
        "number": "11",
        "lines": ["TRACTORS"],
        "photo": "11-tractors.jpg",
        "focus": (0.54, 0.55),
    },
    {
        "number": "12",
        "lines": ["COMPRESSORS"],
        "photo": "12-compressors.jpg",
        "focus": (0.50, 0.48),
    },
    {
        "number": "13",
        "lines": ["INDUSTRIAL & PLANT", "MACHINERY"],
        "photo": "13-industrial-plant-machinery.jpg",
        "focus": (0.48, 0.54),
    },
]


def draw_vector_mark(c, x, y, size):
    c.saveState()
    path = c.beginPath()
    path.moveTo(x + size * 0.50, y + size)
    path.lineTo(x + size * 0.93, y + size * 0.75)
    path.lineTo(x + size * 0.93, y + size * 0.25)
    path.lineTo(x + size * 0.50, y)
    path.lineTo(x + size * 0.07, y + size * 0.25)
    path.lineTo(x + size * 0.07, y + size * 0.75)
    path.close()
    c.setFillColor(RED_DARK)
    c.drawPath(path, fill=1, stroke=0)

    cap = c.beginPath()
    cap.moveTo(x + size * 0.50, y + size * 0.93)
    cap.lineTo(x + size * 0.85, y + size * 0.72)
    cap.lineTo(x + size * 0.85, y + size * 0.58)
    cap.lineTo(x + size * 0.50, y + size * 0.78)
    cap.lineTo(x + size * 0.15, y + size * 0.58)
    cap.lineTo(x + size * 0.15, y + size * 0.72)
    cap.close()
    c.setFillColor(HexColor("#A92C38"))
    c.drawPath(cap, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", size * 0.47)
    c.drawCentredString(x + size * 0.50, y + size * 0.34, "M")
    c.restoreState()


def draw_lockup(c, x, y, mark_size):
    draw_vector_mark(c, x, y, mark_size)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", mark_size * 0.38)
    c.drawString(x + mark_size * 1.22, y + mark_size * 0.52, "MUTSIMOTO")
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", mark_size * 0.095)
    c.drawString(x + mark_size * 1.23, y + mark_size * 0.25, "POWERED BY PASSION")


def draw_photo_cover(c, image_path, x, y, w, h, focus=(0.5, 0.5)):
    with Image.open(image_path) as image:
        iw, ih = image.size
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx = x - max(0, dw - w) * focus[0]
    dy = y - max(0, dh - h) * focus[1]

    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(ImageReader(str(image_path)), dx, dy, dw, dh, mask="auto")
    c.restoreState()

    crop_w_px = w / scale
    crop_h_px = h / scale
    return crop_w_px, crop_h_px


def create_category_pdf(filename, final_width_ft, final_height_ft, categories):
    # Vendor-scale PDF: 1:10. All text, rules, badges and branding remain vector.
    page_w = final_width_ft * 1.2 * inch
    page_h = final_height_ft * 1.2 * inch
    c = canvas.Canvas(str(OUT / filename), pagesize=(page_w, page_h), pageCompression=1)
    c.setTitle(filename.replace(".pdf", ""))
    c.setAuthor("Mutsimoto")
    c.setSubject(
        f"Large-format production artwork at 1:10 scale; final size {final_width_ft:g} ft x {final_height_ft:g} ft; vector typography with original-resolution photography"
    )

    header_h = page_h * 0.18
    photo_h = (page_h - header_h) * 0.59
    label_h = page_h - header_h - photo_h
    panel_w = page_w / len(categories)

    c.setFillColor(INK)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    draw_lockup(c, page_w * 0.025, page_h - header_h * 0.84, header_h * 0.66)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", header_h * 0.25)
    c.drawRightString(page_w * 0.975, page_h - header_h * 0.47, "BUILT FOR EVERY APPLICATION.")
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", header_h * 0.085)
    c.drawRightString(page_w * 0.975, page_h - header_h * 0.72, "13 APPLICATION CATEGORIES - ONE FILTRATION PARTNER")

    quality_rows = []
    photo_y = label_h
    for index, category in enumerate(categories):
        x = index * panel_w
        dark = index % 2 == 1
        c.setFillColor(INK if dark else PAPER)
        c.rect(x, 0, panel_w, label_h, fill=1, stroke=0)

        image_path = PHOTO_DIR / category["photo"]
        crop_w_px, crop_h_px = draw_photo_cover(
            c,
            image_path,
            x,
            photo_y,
            panel_w,
            photo_h,
            category["focus"],
        )

        # A restrained speed edge makes the sequence read as one moving panorama.
        c.saveState()
        c.setFillAlpha(0.82)
        c.setFillColor(RED)
        slash = c.beginPath()
        slash.moveTo(x, photo_y)
        slash.lineTo(x + panel_w * 0.035, photo_y)
        slash.lineTo(x + panel_w * 0.12, photo_y + photo_h)
        slash.lineTo(x, photo_y + photo_h)
        slash.close()
        c.drawPath(slash, fill=1, stroke=0)
        c.restoreState()

        c.setFillColor(RED)
        c.rect(x, photo_y - page_h * 0.007, panel_w, page_h * 0.014, fill=1, stroke=0)

        number_size = min(panel_w * 0.18, label_h * 0.28)
        c.setFont("Helvetica-Bold", number_size)
        c.setFillColor(RED)
        c.drawString(x + panel_w * 0.075, label_h * 0.63, category["number"])

        label_size = min(panel_w * 0.064, label_h * 0.10)
        c.setFont("Helvetica-Bold", label_size)
        c.setFillColor(WHITE if dark else INK)
        line_y = label_h * 0.29
        for line in category["lines"]:
            c.drawString(x + panel_w * 0.075, line_y, line)
            line_y -= label_size * 1.55

        c.setStrokeColor(HexColor("#D7D4CE"))
        c.setLineWidth(0.55)
        c.line(x + panel_w, page_h * 0.02, x + panel_w, page_h - header_h)

        final_panel_w_in = final_width_ft * 12 / len(categories)
        final_photo_h_in = final_height_ft * 12 * ((page_h - header_h) / page_h) * 0.59
        effective_ppi = min(crop_w_px / final_panel_w_in, crop_h_px / final_photo_h_in)
        quality_rows.append((category["number"], category["photo"], effective_ppi))

    c.setStrokeColor(RED)
    c.setLineWidth(page_h * 0.005)
    c.rect(page_h * 0.006, page_h * 0.006, page_w - page_h * 0.012, page_h - page_h * 0.012, fill=0, stroke=1)
    c.showPage()
    c.save()
    return quality_rows


qa_rows = []
qa_rows.extend(
    create_category_pdf(
        "ia-parking-categories-01-07-22.5x8ft.pdf",
        22.5,
        8,
        CATEGORIES[:7],
    )
)
qa_rows.extend(
    create_category_pdf(
        "ia-parking-categories-08-13-22.4x9.2ft.pdf",
        22.4,
        9.2,
        CATEGORIES[7:],
    )
)

qa_path = PHOTO_DIR / "PRINT-RESOLUTION-QA.txt"
with qa_path.open("w", encoding="ascii") as stream:
    stream.write("MUTSIMOTO IA CATEGORY BANNERS - EFFECTIVE PHOTO RESOLUTION AT FINAL SIZE\n")
    stream.write("PDF scale: 1:10. Typography, rules and corporate mark: vector.\n\n")
    for number, photo, ppi in qa_rows:
        stream.write(f"{number}  {photo}  {ppi:.1f} effective ppi\n")
    stream.write("\nLarge-format viewing guidance: preserve original image streams; do not rasterise the PDF; output at the stated final dimensions.\n")

print(OUT / "ia-parking-categories-01-07-22.5x8ft.pdf")
print(OUT / "ia-parking-categories-08-13-22.4x9.2ft.pdf")
print(qa_path)
