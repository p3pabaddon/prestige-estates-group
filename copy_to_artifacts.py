import shutil
import os

source_pdf = "Sarraf34_Sistem_Sunumu.pdf"
artifacts_dir = r"C:\Users\asrin\.gemini\antigravity\brain\4253d211-d73c-4311-b847-fd2097a158f7"
os.makedirs(artifacts_dir, exist_ok=True)

target_pdf = os.path.join(artifacts_dir, "Sarraf34_Sistem_Sunumu.pdf")
shutil.copyfile(source_pdf, target_pdf)

print(f"Copied PDF to artifacts: {target_pdf}")

# Also copy slides
for i in range(1, 8):
    src_img = os.path.join("presentation_slides", f"slide_{i}.png")
    dst_img = os.path.join(artifacts_dir, f"slide_{i}.png")
    if os.path.exists(src_img):
        shutil.copyfile(src_img, dst_img)
        print(f"Copied slide {i} to artifacts: {dst_img}")
