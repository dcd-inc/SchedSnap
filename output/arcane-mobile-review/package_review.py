from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import zipfile

ROOT = Path(__file__).resolve().parent
files = sorted(p for group in ('red', 'neon', 'paper') for p in (ROOT / group).glob('*.png') if '-source' not in p.stem)
thumb_w, thumb_h, gap, label_h = 216, 480, 20, 42
cols = 5
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (thumb_w + gap) + gap, rows * (thumb_h + label_h + gap) + gap), '#e9e5df')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 14)
except OSError:
    font = ImageFont.load_default()
manifest = []
for index, path in enumerate(files):
    im = Image.open(path).convert('RGB')
    assert im.size == (1080, 2400), (path, im.size)
    x = gap + (index % cols) * (thumb_w + gap)
    y = gap + (index // cols) * (thumb_h + label_h + gap)
    sheet.paste(im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
    label = path.stem.replace('ref', '').replace('-', ' ')
    draw.text((x, y + thumb_h + 10), label, fill='#222222', font=font)
    manifest.append({'file': str(path.relative_to(ROOT)), 'dimensions': [1080, 2400], 'bytes': path.stat().st_size})
sheet.save(ROOT / 'review-sheet.jpg', quality=94)
(ROOT / 'manifest.json').write_text(json.dumps({'status': 'Review only; no upload or catalog publication', 'generation': 'Built-in Imagegen; native sources retained alongside delivery exports', 'eyeCorrection': '02-vi-red-portrait corrected to one iris and one pupil', 'assets': manifest}, indent=2))
with zipfile.ZipFile(ROOT / 'arcane-mobile-previews.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(ROOT))
print(f'Packaged {len(files)} wallpapers at 1080 x 2400.')
