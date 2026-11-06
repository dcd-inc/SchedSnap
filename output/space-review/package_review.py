from pathlib import Path
import json
import shutil
import zipfile
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parent

def package(group, manifests):
    records = []
    for name in manifests:
        data = json.loads((ROOT / name).read_text(encoding='utf-8-sig'))
        records.extend(data if isinstance(data, list) else data['images'])
    failures = [record for record in records if record.get('error')]
    if failures:
        (ROOT / f'{group}-unavailable.json').write_text(json.dumps(failures, indent=2), encoding='utf-8')
    records = [record for record in records if not record.get('error')]
    destination = ROOT / group
    destination.mkdir(exist_ok=True)
    exports = []
    sheets = []
    for index, record in enumerate(records):
        master = Path(record.get('master') or record.get('path') or record.get('output'))
        label = record.get('label', str(index + 1))
        image = Image.open(master).convert('RGB')
        # Technical normalization only; retain the entire generated composition.
        image = image.resize((1080, 2400), Image.Resampling.LANCZOS)
        export = destination / f'{group}-{index + 1:02d}.png'
        image.save(export, compress_level=3)
        exports.append(export)
        record.update(number=index + 1, label=label, export=str(export))
        if index % 20 == 0:
            sheets.append(Image.new('RGB', (1200, 2280), '#f5f5f5'))
        slot = index % 20
        x, y = slot % 5 * 240 + 15, slot // 5 * 570 + 35
        sheets[-1].paste(ImageOps.contain(image, (210, 500)), (x, y))
        ImageDraw.Draw(sheets[-1]).text((x, y - 23), f'{group.title()} {index + 1:02d} | {label}', fill='#222222')
    for index, sheet in enumerate(sheets):
        sheet.save(ROOT / f'{group}-overview-{index + 1}.jpg', quality=90)
    (ROOT / f'{group}-mapping.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
    with zipfile.ZipFile(ROOT / f'{group}-wallpapers.zip', 'w', zipfile.ZIP_STORED) as archive:
        for export in exports:
            archive.write(export, export.name)
    print(f'{group}: {len(exports)} wallpapers, {len(sheets)} overview sheets')

if __name__ == '__main__':
    package('space', ['batch-a.json', 'batch-b.json', 'batch-c.json'])
