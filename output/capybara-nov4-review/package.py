from pathlib import Path
import json
import zipfile
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parent
records = json.loads((root / 'mapping.json').read_text(encoding='utf-8-sig'))
sheet = Image.new('RGB', (1200, 1140), '#f5f3ef')
for index, record in enumerate(records):
    image = Image.open(record['master']).convert('RGB')
    image = image.resize((1080, 2400), Image.Resampling.LANCZOS)
    image.save(root / f'capybara-{index + 1:02d}.png', compress_level=3)
    x, y = index % 5 * 240 + 15, index // 5 * 570 + 35
    sheet.paste(ImageOps.contain(image, (210, 500)), (x, y))
    ImageDraw.Draw(sheet).text((x, y - 22), f'Reference {index + 1:02d}', fill='#30261f')
sheet.save(root / 'overview.jpg', quality=92)
with zipfile.ZipFile(root / 'capybara-wallpapers.zip', 'w', zipfile.ZIP_STORED) as archive:
    for index in range(len(records)):
        file = root / f'capybara-{index + 1:02d}.png'
        archive.write(file, file.name)
print(f'Packaged {len(records)} wallpapers at 1080 x 2400')
