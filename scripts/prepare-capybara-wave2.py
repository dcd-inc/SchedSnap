"""Size the 22 approved mobile previews without stretching or cutting characters."""
import hashlib
import json
from pathlib import Path
from PIL import Image

record = json.loads(Path('documentation/capybara-mobile-previews-20261019.json').read_text())
assets = []
for item in record['assets']:
    source = Path(item['path'])
    slug = item['name'].lower().replace(' ', '-')
    target = Path('public/wallpapers/scenic') / f'capybara-{slug}' / 'mobile.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        image = original.convert('RGB')
        scaled_height = round(image.height * 1080 / image.width)
        scaled = image.resize((1080, scaled_height), Image.Resampling.LANCZOS)
        if scaled_height < 2400:
            # These sources have an empty blue upper field: extend only that field.
            padding = 2400 - scaled_height
            assert padding < scaled_height // 2
            final = Image.new('RGB', (1080, 2400))
            final.paste(scaled.crop((0, 0, 1080, padding)), (0, 0))
            final.paste(scaled, (0, padding))
        else:
            assert scaled_height - 2400 <= 2
            final = scaled.crop((0, scaled_height - 2400, 1080, scaled_height))
        final.save(target)
    with Image.open(target) as saved:
        assert saved.size == (1080, 2400) and saved.mode == 'RGB'
    assets.append({
        'number': item['number'], 'id': f'capybara-{slug}', 'path': target.as_posix(),
        'opaque': True, 'dimensionsValid': True,
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'source': str(source), 'width': 1080, 'height': 2400,
    })
assert len(assets) == 22 and len({item['sha256'] for item in assets}) == 22
output = Path('output/capybara-wave2')
output.mkdir(parents=True, exist_ok=True)
(output / 'manifest.json').write_text(json.dumps({'assets': assets}, indent=2) + '\n')
print('Verified 22 unique opaque 1080 x 2400 mobile wallpapers; aspect ratios preserved.')
