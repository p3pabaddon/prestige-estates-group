import fitz # PyMuPDF
import os

pdf_doc = fitz.open("Sarraf34_Sistem_Sunumu.pdf")
output_dir = "presentation_slides"
os.makedirs(output_dir, exist_ok=True)

print(f"Total pages in PDF: {len(pdf_doc)}")
for i, page in enumerate(pdf_doc):
    pix = page.get_pixmap(dpi=150)
    img_path = os.path.join(output_dir, f"slide_{i+1}.png")
    pix.save(img_path)
    print(f"Saved: {img_path}")
