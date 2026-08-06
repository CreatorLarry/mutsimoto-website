from pathlib import Path
from openpyxl import load_workbook

path = Path(r"C:\Users\ADMIN\Downloads\FINAL 1 SERIES CATALOGUE.xlsx")
workbook = load_workbook(path, read_only=False, data_only=False)

for sheet in workbook.worksheets:
    images = getattr(sheet, "_images", [])
    print(f"{sheet.title}: {len(images)} images")
    for index, image in enumerate(images, start=1):
        anchor = getattr(image, "anchor", None)
        marker = getattr(anchor, "_from", None)
        print(
            f"  {index}: row={getattr(marker, 'row', None)} col={getattr(marker, 'col', None)} "
            f"format={getattr(image, 'format', None)} size={getattr(image, 'width', None)}x{getattr(image, 'height', None)}"
        )
