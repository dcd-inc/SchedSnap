# Image sizes and delivery

Use this when generating or reviewing artwork for the design gallery. Keep source quality appropriate for wallpaper exports; the app creates smaller gallery requests at render time.

## Source artwork

| Artwork | Source dimensions | Format and notes |
| --- | --- | --- |
| Scenic background | Mobile 1080 × 2400; tablet 1600 × 2560; laptop 1920 × 1080 | Opaque PNG, one composition per device |
| Transparent mascot | 1024–1536 px on the visible character's longest edge | One RGBA PNG master per character; remove unnecessary transparent padding |
| Pixel mascot | Same shared master guidance | PNG with crisp pixel clusters; set `pixelArt: true` |
| Procedural pattern | No bitmap | Use the Canvas patterns in `src/assets/patternTemplates.js` |

There is no configured hard byte-size limit for template artwork in the upload script. Keep a high-quality source master, but avoid excessive dimensions, hidden layers, empty transparent margins, and repeated device copies. Do not lower a background to its gallery size: the same source path is used for a full-resolution wallpaper export.

To check actual dimensions, color/alpha mode, and bytes before upload:

```powershell
python -c "from pathlib import Path; from PIL import Image; p=Path(r'public/wallpapers/scenic/tea-garden/mobile.png'); i=Image.open(p); print(f'{i.width}x{i.height} | {i.mode} | {p.stat().st_size / 1024:.0f} KiB')"
```

For transparent masters, confirm the PNG really has an alpha channel and inspect the alpha bounds. A checkerboard painted into the image is not transparency. Keep it as PNG; do not convert pixel art or transparent characters to JPEG. The mascot packager indexes dimensions and bounds but does not compress the master.

## What the gallery downloads

`src/pages/ScheduleWallpaper/TemplateGallery.jsx` renders gallery previews as Canvas at 270 px wide on mobile, 384 px on tablet, and 480 px on laptop. `src/utils/cloudinaryAssets.js` asks Cloudinary to limit artwork to the Canvas dimensions. Standard artwork uses `f_auto,q_auto:good` for smaller previews; pixel-art previews are resized as lossless PNG. Full-resolution canvases request PNG. If a path has no Cloudinary manifest entry, the browser uses its local source path without those transformations.

Canvas previews load when near the viewport using `IntersectionObserver`; this keeps the page responsive while scrolling. Source PNG byte size alone does not describe gallery transfer size: inspect the transformed Cloudinary request and its transferred bytes in the browser Network panel. Do not replace the master with a thumbnail to fix a slow gallery.

After uploading or changing a manifest, check the delivery behavior:

```powershell
node scripts/verify-cloudinary.mjs
```

This checks representative optimized previews, full-size PNG responses, and CORS headers. It does not judge visual quality; compare the preview to the source at normal display size, especially small schedule text, gradients, transparent edges, and pixel-art outlines.

## Schedule screenshot uploads are different

User screenshots go through `src/utils/imageHelpers.js`, not the artwork uploader. The selected file must be JPG, PNG, or WebP, at most 10 MiB and 40 megapixels. The app scales the longest side to at most 2400 px and prepares a payload of at most 3 MiB, retaining PNG when it fits or trying JPEG quality levels. These limits protect AI analysis uploads; they are not gallery asset size limits.

## Diagnose a slow gallery

Use Lighthouse with a clean mobile profile, then inspect the LCP element and Network panel. If the heading/shell is late, check JavaScript, catalog request timing, and route rendering before resizing images. If the LCP is artwork, check that it is using the expected Cloudinary preview URL and dimensions. Compare transferred bytes and request timing rather than the on-disk master size. The creator route's initial HTML, current gallery rendering, and public catalog cache behavior are implemented in `src/pages/ScheduleWallpaper/Index.jsx`, `src/pages/ScheduleWallpaper/TemplateGallery.jsx`, and `api/catalog.js`.
