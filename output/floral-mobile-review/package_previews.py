"""Package local artwork previews; never publishes or modifies the catalog."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parent
NAMES = [
    '01-blue-lilies', '02-purple-lily', '03-burgundy-lily',
    '04-plum-ink', '05-vermilion-sun', '06-crimson-plum',
    '07-airy-plum', '08-botanical-collage', '10-impasto-hibiscus',
]

def main():
    missing = [name for name in NAMES if not (ROOT / f'{name}.png').exists()]
    if missing:
        raise SystemExit(f'Waiting for: {missing}')
    export = ROOT / 'mobile-1080x2400'
    export.mkdir(exist_ok=True)
    sheet = Image.new('RGB', (858, 1908), '#eeeae4')
    draw = ImageDraw.Draw(sheet)
    records = []
    for index, name in enumerate(NAMES):
        source = ROOT / f'{name}.png'
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened)
            native_size = image.size
            if abs(image.width / image.height - 0.45) > 0.005:
                raise ValueError(f'{name}: unexpected aspect ratio {image.size}; review required')
            if 'A' in image.getbands() and image.getchannel('A').getextrema() != (255, 255):
                raise ValueError(f'{name}: wallpaper is not opaque')
            # Match the exact mobile export canvas. The aspect guard above prevents
            # material cropping; source masters are preserved beside these exports.
            mobile = ImageOps.fit(image.convert('RGB'), (1080, 2400), Image.Resampling.LANCZOS)
            destination = export / f'{name}.png'
            mobile.save(destination)
            x, y = 12 + (index % 3) * 282, 12 + (index // 3) * 632
            sheet.paste(mobile.resize((270, 600), Image.Resampling.LANCZOS), (x, y))
            draw.text((x + 4, y + 608), f'Reference {int(name[:2]):02d}', fill='#272321')
            records.append({
                'reference': int(name[:2]), 'file': str(destination.relative_to(ROOT)),
                'nativeDimensions': list(native_size), 'exportDimensions': [1080, 2400],
                'opaque': True, 'bytes': destination.stat().st_size,
                'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
            })
    sheet.save(ROOT / 'contact-sheet.jpg', quality=94)
    (ROOT / 'manifest.json').write_text(json.dumps({
        'status': 'local-preview-only', 'provider': 'built-in image_gen',
        'skippedReference': {'number': 9, 'reason': 'Attachment appears black'},
        'exportMethod': 'Lanczos fit to 1080x2400; native generated masters retained',
        'assets': records,
    }, indent=2), encoding='utf-8')
    with zipfile.ZipFile(ROOT / 'floral-mobile-wallpapers.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for record in records:
            archive.write(ROOT / record['file'], Path(record['file']).name)
    print(json.dumps(records, indent=2))

if __name__ == '__main__':
    main()
