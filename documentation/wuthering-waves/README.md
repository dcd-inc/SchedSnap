# Wuthering Waves wallpaper collection

Thirty explicitly approved mobile wallpaper templates, grouped under Wuthering Waves. Violet Reliquary and Equinox Promise were rejected by the user and are excluded from the final selection, upload manifest, and catalog presets.

- Starlit Shore
- Celestial Encore
- Silver Resonance
- Golden Reunion
- Ivory Companion
- Moonlit Companion
- Gilded Tide
- Sapphire Covenant
- Golden Reflection
- Midnight Throne
- Prismatic Oath
- Jade Lantern
- Digital Ghost
- Afterhours Lucy
- Vermilion Moon
- Amber Reverie
- Neon Recoil

- Blueflame Eclipse
- Emberglass
- Jade Oath
- Emerald Resolve
- Bamboo Drizzle
- Silent Current
- Sunforged
- Copper Dawn
- Lunar Anchor
- Pearl Tides
- Astral Dial
- Azure Hourglass
- Solstice Mirror

## Delivery

Original approved image bytes remain in the local `output/wuthering-waves/approved-batch-*` folders and `output/wuthering-waves/approved-wallpapers.zip`. Upload-ready PNGs preserve the complete composition and are resized to 1080 × 2400, without cropping or repainting. Source checksums and approval records are in the JSON files here. Git stores catalog presets and Cloudinary delivery metadata rather than large original artwork archives.

Each template has its own character, palette, and motif keywords. The shared renderer adds the class schedule, with matching light/dark palettes and a protected illustration footer. These templates are mobile-only.

Upload: `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/wuthering-waves/upload-manifest.json`. Publication: review `node scripts/publish-wuthering-waves-templates.mjs`, then use `--publish --expect-revision <reviewed revision>`. Publication preserves existing records and categories and verifies the saved catalog.

Validation: production build, lint, 15 focused catalog/category/keyword checks, 30 preset schemas, exact artwork dimensions, keyword lookups and sample schedule fitting.
