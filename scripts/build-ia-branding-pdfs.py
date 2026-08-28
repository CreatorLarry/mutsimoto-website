from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "output" / "branding" / "ia-branch"
PREV = BRAND / "previews"
PRINT = BRAND / "print-raster"
MOCK = BRAND / "mockups"
SURVEY = ROOT / "tmp" / "pdfs" / "ia-branding"
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)

INK = HexColor("#11161A")
PAPER = HexColor("#F3F1EC")
RED = HexColor("#8E1F2D")
MUTED = HexColor("#777A7D")
LINE = HexColor("#D7D4CE")

DECK = (13.333 * inch, 7.5 * inch)


def image_size(path: Path):
    with Image.open(path) as im:
        return im.size


def place_contain(c, image_path: Path, x, y, w, h, pad=0):
    iw, ih = image_size(image_path)
    scale = min((w - 2 * pad) / iw, (h - 2 * pad) / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(ImageReader(str(image_path)), x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def place_cover(c, image_path: Path, x, y, w, h):
    iw, ih = image_size(image_path)
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(ImageReader(str(image_path)), x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def footer(c, page_no, note="CONCEPT FOR REVIEW"):
    w, _ = DECK
    c.setFillColor(RED)
    c.rect(0, 0, w, 0.06 * inch, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(MUTED)
    c.drawString(0.42 * inch, 0.18 * inch, note)
    c.drawRightString(w - 0.42 * inch, 0.18 * inch, f"MUTSIMOTO IA BRANCH  /  {page_no:02d}")


def heading(c, eyebrow, title, body=None):
    w, h = DECK
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.55 * inch, h - 0.52 * inch, eyebrow.upper())
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(0.55 * inch, h - 0.88 * inch, title)
    if body:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(0.55 * inch, h - 1.12 * inch, body)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(0.55 * inch, h - 1.28 * inch, w - 0.55 * inch, h - 1.28 * inch)


def text_block(c, x, y, lines, leading=13, color=INK, size=9, bullet=False):
    c.setFillColor(color)
    c.setFont("Helvetica", size)
    for line in lines:
        prefix = "-  " if bullet else ""
        c.drawString(x, y, prefix + line)
        y -= leading
    return y


def make_art_pdf(output_name, raster_name, final_width_ft, final_height_ft):
    # Artwork is supplied at 1:10 scale. One final foot = 1.2 inches on the PDF page.
    page = (final_width_ft * 1.2 * inch, final_height_ft * 1.2 * inch)
    c = canvas.Canvas(str(OUT / output_name), pagesize=page, pageCompression=1)
    c.setTitle(output_name.replace(".pdf", ""))
    c.setSubject(f"Mutsimoto IA Branch banner artwork at 1:10 scale; final size {final_width_ft:g} ft x {final_height_ft:g} ft")
    c.drawImage(ImageReader(str(PRINT / raster_name)), 0, 0, page[0], page[1], mask="auto")
    c.showPage()
    c.save()


make_art_pdf("ia-left-corporate-banner-18x8ft.pdf", "01-left-corporate-brand-banner-18x8ft-250dpi-at-1to10.png", 18, 8)
make_art_pdf("ia-right-product-banner-16x8ft.pdf", "02-right-product-banner-16x8ft-250dpi-at-1to10.png", 16, 8)


concept_path = OUT / "ia-branch-branding-concept.pdf"
c = canvas.Canvas(str(concept_path), pagesize=DECK, pageCompression=1)
c.setTitle("Mutsimoto Industrial Area Branch Branding Concept")
c.setAuthor("Mutsimoto / Codex concept development")

# 1 Cover
w, h = DECK
place_cover(c, MOCK / "01-left-corporate-banner-site-mockup.png", 0, 0, w, h)
c.setFillColor(INK)
c.setFillAlpha(0.88)
c.rect(0, 0, 4.95 * inch, h, fill=1, stroke=0)
c.setFillAlpha(1)
c.setFillColor(RED)
c.rect(0.52 * inch, h - 1.02 * inch, 0.7 * inch, 0.08 * inch, fill=1, stroke=0)
c.setFillColor(white)
c.setFont("Helvetica-Bold", 30)
c.drawString(0.52 * inch, h - 1.58 * inch, "INDUSTRIAL AREA")
c.drawString(0.52 * inch, h - 2.02 * inch, "BRANCH BRANDING")
c.setFont("Helvetica", 15)
c.setFillColor(HexColor("#D7D9DA"))
c.drawString(0.52 * inch, h - 2.43 * inch, "Full concept + review artwork")
c.setFont("Helvetica-Bold", 9)
c.setFillColor(white)
c.drawString(0.52 * inch, 0.64 * inch, "NAIROBI  /  AUGUST 2026")
c.showPage()

# 2 Strategy
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c, "01 / STRATEGY", "A disciplined four-surface system", "Brand where it matters; leave the factory architecture visually calm.")
cols = [
    ("STREET LEFT", "18 x 8 ft", "Corporate identity + five logos", "Printed flex banner; non-backlit; tamper-resistant tension frame."),
    ("STREET RIGHT", "16 x 8 ft", "Mutsimoto logo + product visual", "Printed flex banner; product-led visual; tree remains in front."),
    ("PARKING WALL A", "22.5 x 8 ft", "Categories 01-07", "Matte wall graphic/panel system; low anti-scuff plinth."),
    ("PARKING WALL B", "22.4 x 9.2 ft", "Categories 08-13", "Completes the application story; no illumination required."),
]
for i,(name,size,content,build) in enumerate(cols):
    x = 0.55*inch + i*3.12*inch
    c.setFillColor(white); c.roundRect(x,1.22*inch,2.82*inch,4.55*inch,9,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont("Helvetica-Bold",9); c.drawString(x+0.2*inch,5.42*inch,name)
    c.setFillColor(INK); c.setFont("Helvetica-Bold",18); c.drawString(x+0.2*inch,4.94*inch,size)
    c.setStrokeColor(LINE); c.line(x+0.2*inch,4.65*inch,x+2.62*inch,4.65*inch)
    c.setFont("Helvetica-Bold",10); c.drawString(x+0.2*inch,4.2*inch,content[:34])
    if len(content)>34: c.drawString(x+0.2*inch,4.02*inch,content[34:])
    c.setFillColor(MUTED); c.setFont("Helvetica",8)
    words=build.split(); lines=[]; line=""
    for word in words:
        if len(line+" "+word)>38: lines.append(line); line=word
        else: line=(line+" "+word).strip()
    lines.append(line)
    yy=3.55*inch
    for line in lines: c.drawString(x+0.2*inch,yy,line); yy-=0.17*inch
footer(c,2)
c.showPage()

# 3 Left
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"02 / STREET LEFT","Corporate banner - logos only","The earlier corporate direction, translated into a theft-resistant non-backlit banner.")
place_contain(c, MOCK/"01-left-corporate-banner-site-mockup.png",0.55*inch,0.58*inch,7.8*inch,5.45*inch)
place_contain(c, PREV/"01-left-corporate-brand-banner-18x8ft.png",8.55*inch,2.54*inch,4.22*inch,2.0*inch)
c.setFillColor(INK); c.setFont("Helvetica-Bold",10); c.drawString(8.62*inch,2.23*inch,"INSTALLATION")
text_block(c,8.62*inch,2.0*inch,["- Printed PVC flex / mesh banner","- Matte-charcoal tension frame","- Close tamper-resistant fixings","- No backlighting or electrical hardware"],leading=12,size=8)
footer(c,3)
c.showPage()

# 4 Right
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"03 / STREET RIGHT","Product-led banner","One master logo, one message, and a restrained filter-product hero.")
place_contain(c, MOCK/"02-right-product-banner-site-mockup.png",0.55*inch,0.58*inch,7.8*inch,5.45*inch)
place_contain(c, PREV/"02-right-product-banner-16x8ft.png",8.55*inch,2.54*inch,4.22*inch,2.0*inch)
c.setFillColor(INK); c.setFont("Helvetica-Bold",10); c.drawString(8.62*inch,2.23*inch,"DESIGN ROLE")
text_block(c,8.62*inch,2.0*inch,["- Product visual balances the logo-only wall","- Tree remains part of the real frontage","- High contrast for passing traffic","- Same non-backlit security specification"],leading=12,size=8)
footer(c,4)
c.showPage()

# 5 Parking A
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"04 / PARKING WALL A","Applications 01-07","Real road and operating photography; seven equal modules across 22.5 ft.")
place_contain(c, PREV/"03-parking-categories-01-07-22.5x8ft.png",0.55*inch,1.22*inch,12.23*inch,4.78*inch)
c.setFillColor(MUTED); c.setFont("Helvetica",8)
c.drawString(0.65*inch,0.88*inch,"ACTION-LED PHOTOGRAPHY  /  VECTOR LABELS  /  LARGE-FORMAT PDF AT 1:10 SCALE")
footer(c,5)
c.showPage()

# 6 Parking B
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"05 / PARKING WALL B","Applications 08-13","Active construction, mining, agricultural and plant scenes across 22.4 ft.")
place_contain(c, PREV/"04-parking-categories-08-13-22.4x9.2ft.png",0.55*inch,1.22*inch,12.23*inch,4.78*inch)
c.setFillColor(MUTED); c.setFont("Helvetica",8)
c.drawString(0.65*inch,0.88*inch,"ORIGINAL-RESOLUTION PHOTOGRAPHY  /  VECTOR LABELS  /  LARGE-FORMAT PDF AT 1:10 SCALE")
footer(c,6)
c.showPage()

# 7 Keep quiet
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"06 / RESTRAINT","Keep the factory walls quiet","Pages 3, 5 and 6 remain unbranded beyond repair, repainting and the existing company sign.")
for i,p in enumerate([SURVEY/"page-3.jpg",SURVEY/"page-5.jpg",SURVEY/"page-6.jpg"]):
    x=0.55*inch+i*4.18*inch
    place_contain(c,p,x,1.45*inch,3.92*inch,4.52*inch)
    c.setFillColor(INK); c.setFont("Helvetica-Bold",9)
    c.drawCentredString(x+1.96*inch,1.18*inch,["MAIN FACTORY FACE","LEFT WINDOW ZONE","RIGHT WINDOW ZONE"][i])
footer(c,7)
c.showPage()

# 8 Category approval
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"07 / COPY APPROVAL","Proposed 13 application categories","Based on Mutsimoto's published applications and brand coverage; confirm before final print release.")
cats=["01  Light Commercial Vehicles","02  Heavy Commercial Vehicles","03  Matatus & PSVs","04  Passenger Cars","05  4WDs & SUVs","06  Pickups","07  Generators","08  Construction Equipment","09  Mining Equipment","10  Agricultural Machinery","11  Tractors","12  Compressors","13  Industrial & Plant Machinery"]
for i,cat in enumerate(cats):
    col=0 if i<7 else 1; row=i if i<7 else i-7
    x=0.85*inch+col*6.15*inch; y=5.72*inch-row*0.62*inch
    c.setFillColor(white); c.roundRect(x,y-0.34*inch,5.55*inch,0.46*inch,5,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont("Helvetica-Bold",10); c.drawString(x+0.16*inch,y-0.08*inch,cat[:2])
    c.setFillColor(INK); c.drawString(x+0.62*inch,y-0.08*inch,cat[4:])
footer(c,8,"COPY APPROVAL REQUIRED")
c.showPage()

# 9 Production notes
c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
heading(c,"08 / PRODUCTION","Fabrication and print notes","Review set is ready; vendor preflight follows approval of copy, logos and site measurements.")
sections=[
 ("STREET BANNERS",["510-550 gsm UV-stabilised matte PVC flex or mesh","Hemmed edges with stainless eyelets at close centres","Powder-coated steel/aluminium tension frame","Tamper-resistant fixings; no illumination"]),
 ("PARKING WALLS",["Original-resolution real photography; 50-130 effective ppi at final size","Vector typography, rules and corporate mark","Vertical joins aligned to category module boundaries","Do not flatten or rasterise the production PDF"]),
 ("PRE-PRESS",["Artwork PDFs supplied at 1:10 scale","Final-size ratios: 18x8, 16x8, 22.5x8, 22.4x9.2 ft","Vendor to convert imagery to the selected CMYK press profile","Add final bleed and safe-area requirements after site remeasure"]),
]
for i,(name,items) in enumerate(sections):
    x=0.65*inch+i*4.18*inch
    c.setFillColor(white); c.roundRect(x,1.32*inch,3.82*inch,4.45*inch,9,fill=1,stroke=0)
    c.setFillColor(RED); c.setFont("Helvetica-Bold",11); c.drawString(x+0.22*inch,5.35*inch,name)
    y=4.85*inch
    for item in items:
        c.setFillColor(INK); c.circle(x+0.28*inch,y+0.04*inch,2.2,fill=1,stroke=0)
        c.setFillColor(MUTED); c.setFont("Helvetica",8)
        words=item.split(); lines=[]; line=""
        for word in words:
            if len(line+" "+word)>45: lines.append(line); line=word
            else: line=(line+" "+word).strip()
        lines.append(line)
        for li in lines: c.drawString(x+0.46*inch,y,li); y-=0.15*inch
        y-=0.18*inch
footer(c,9)
c.showPage()

c.save()
print(concept_path)
