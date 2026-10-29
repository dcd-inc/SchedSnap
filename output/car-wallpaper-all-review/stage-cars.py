import json, subprocess
from pathlib import Path

def git(*args, data=None):
    return subprocess.run(['git',*args],input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
if git('diff','--cached','--name-only').strip():
    raise SystemExit('Index already has staged work; refusing to mix it.')
shared=['shared/templateKeywords.js','shared/templateSchema.js','src/assets/templates.js','src/config/collections.js','tests/collections.test.js','tests/wallpaper.test.js']
for filename in shared:
    content=Path(filename).read_text(encoding='utf-8')
    content='\n'.join(line for line in content.split('\n') if not (line.startswith('import { collageTemplates }') or line.strip()=='...collageTemplates,' or line.strip().startswith("collage: [") or line.strip().startswith("{ id: 'collage',")))
    content=content.replace("'collage', ",'').replace('collageTemplates.length + ','')
    blob=git('hash-object','-w','--stdin',data=content.encode()).decode().strip()
    git('update-index','--add','--cacheinfo',f'100644,{blob},{filename}')
filename='src/assets/cloudinaryManifest.js'
base=git('show',f'HEAD:{filename}').decode()
working=Path(filename).read_text(encoding='utf-8')
def parse(text):return json.loads(text.split('export default ',1)[1].strip().removesuffix(';'))
assets=parse(base)
new={k:v for k,v in parse(working).items() if k.startswith('/wallpapers/scenic/cars-')}
assert len(new)==16
assets.update(new)
content=base.split('export default ',1)[0]+'export default '+json.dumps(assets,indent=2,ensure_ascii=False)+';\n'
blob=git('hash-object','-w','--stdin',data=content.encode()).decode().strip()
git('update-index','--add','--cacheinfo',f'100644,{blob},{filename}')
files=['src/assets/carTemplates.js','tests/cars.test.js','scripts/publish-cars.mjs','tests/admin.test.js','.impeccable/config.json','documentation/cars-collection.md','documentation/car-mobile-wallpaper-previews.md','documentation/car-mobile-reference-wallpaper-previews.md','documentation/cars/generation-prompts.json']
git('add','--',*files)
print(git('diff','--cached','--stat').decode())
