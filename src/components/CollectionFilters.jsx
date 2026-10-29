import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, SwatchBook } from 'lucide-react';
import { matchesGalleryCategory } from '../config/collections.js';
import { cloudinaryAssetUrl } from '../utils/cloudinaryAssets.js';
import { generativePatternMap } from '../assets/generativePatterns.js';
import './collectionFilters.css';

const collectionSubjects = {
  transformers: ['transformers-steel-and-scarlet', 1.3],
  'wuthering-waves': ['wuwa-silver-resonance', 1.5],
  cars: ['cars-blush-hibiscus', 1.2],
  anime: ['anime-jujutsu-gaze', 1.3],
  naruto: ['anime-naruto-neon-dojutsu', 1],
  arcane: ['arcane-jinx-pink-rebellion', 1.4],
  collage: ['collage-manga-newsprint', 1],
  graffiti: ['graffiti-orange-character-crew', 1.2],
  flowers: ['flowers-rose-hibiscus', 1.4],
  doodle: ['doodle-duck-parade', 1.5],
  sanrio: ['sanrio-kuromi-flower', 1.8],
  snoopy: ['snoopy-navy-cool', 2],
  genshin: ['genshin-hutao-nap', 1.8],
  'hunter-x-hunter': ['anime-hunter-prismatic-gaze', 1.3],
  'we-bare-bears': ['wbb-pink-selfie-pop', 1.5],
  domo: ['domo-brown-face', 1.3],
  'adventure-time': ['adventure-jake-face', 1.1],
  chiikawa: ['little-friends-white-shy', 1.1],
  ghibli: ['ghibli-totoro-closeup', 1.1],
  meep: ['meep-heart-eyes', 1.1],
  capybara: ['capybara-strawberry-hood', 1.2],
  pattern: ['print-play-ribbon-bows', 1],
};

const collectionColors = {
  transformers: '#e8e1d3', 'wuthering-waves': '#dce9ec', cars: '#f4dfe4',
  anime: '#e0e4f4', naruto: '#f5e2cd', arcane: '#e6dcf0', collage: '#e8e3da',
  graffiti: '#e6ebd4', flowers: '#f2dce7', doodle: '#f1e9c9', sanrio: '#f5e0ef',
  snoopy: '#e0eaf2', genshin: '#e2ecd8', 'hunter-x-hunter': '#d9e8dd',
  'we-bare-bears': '#eadfce', domo: '#dfd0c5', 'adventure-time': '#f4e6b8',
  chiikawa: '#e4e0f1', ghibli: '#dce5d2', meep: '#f7edc9',
  capybara: '#e5dccf', pattern: '#e4e8ec',
};

function PatternThumbnail({ template }) {
  const canvas = useRef(null);
  useEffect(() => {
    const design = generativePatternMap.get(template.pattern);
    const ctx = canvas.current.getContext('2d');
    if (!design || !ctx) return;
    ctx.fillStyle = template.background;
    ctx.fillRect(0, 0, 128, 128);
    ctx.save();
    ctx.scale(128 / 240, 128 / 240);
    design.draw(ctx, { color: template.patternColor || design.patternColor, accent: template.patternAccent || design.patternAccent, seed: 1 });
    ctx.restore();
  }, [template]);
  return <canvas ref={canvas} width="128" height="128" />;
}

function CollectionThumbnail({ category, template }) {
  // Collection photos stay consistent when the visitor switches wallpaper sizes.
  const artwork = template?.deviceImages?.mobile || template?.image || Object.values(template?.deviceImages || {}).find(Boolean);
  const [failedSource, setFailedSource] = useState(null);
  // Crop the original around its subject before shrinking it to a filter thumbnail.
  const zoom = collectionSubjects[category.id]?.[1] || 1;
  const source = artwork && cloudinaryAssetUrl(artwork, { width: 128, height: 128 })
    .replace('/image/upload/', `/image/upload/${template.layout === 'mascot' ? 'e_trim/' : ''}c_thumb,g_auto,z_${zoom},w_128,h_128/`);
  return <span className="collection-chip-art" style={{ backgroundColor: category.id === 'all' ? undefined : template?.background }} aria-hidden="true">
    {category.id === 'all' ? <LayoutGrid size={18} /> : template?.pattern && template.layout !== 'mascot' ? <PatternThumbnail template={template} /> : source && failedSource !== source ? <img key={source} src={source} alt="" width="44" height="44" loading="lazy" onError={() => setFailedSource(source)} /> : <SwatchBook size={18} />}
  </span>;
}

export default function CollectionFilters({ categories, templates, value, onChange, controls }) {
  const strip = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const previews = useMemo(() => Object.fromEntries(categories.map(category => {
    const matching = templates.filter(template => matchesGalleryCategory(template, category.id));
    return [category.id, matching.find(template => template.id === collectionSubjects[category.id]?.[0]) || matching.find(template => template.layout === 'mascot' && template.image) || matching.find(template => template.image || template.pattern)];
  })), [categories, templates]);
  useEffect(() => {
    const node = strip.current;
    const update = () => setEdges({ start: node.scrollLeft <= 1, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 1 });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener('scroll', update); };
  }, []);
  useEffect(() => {
    const node = strip.current;
    const selected = node.querySelector('[aria-pressed="true"]');
    if (!selected) return;
    if (selected.offsetLeft < node.scrollLeft) node.scrollTo({ left: selected.offsetLeft });
    else if (selected.offsetLeft + selected.offsetWidth > node.scrollLeft + node.clientWidth) node.scrollTo({ left: selected.offsetLeft + selected.offsetWidth - node.clientWidth });
  }, [value]);
  function scroll(direction) {
    strip.current.scrollBy({ left: direction * strip.current.clientWidth * .75, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <div className="collection-filters" role="group" aria-label="Design collections" data-at-start={edges.start} data-at-end={edges.end}>
    <button type="button" className="collection-scroll collection-scroll-previous" aria-label="Previous collections" disabled={edges.start} onClick={() => scroll(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
    <div ref={strip} className="collection-filter-strip">
      {categories.map(category => <button key={category.id} type="button" className={`collection-chip${category.id === 'all' ? ' collection-chip-all' : ''}`} style={{ '--collection-color': collectionColors[category.id] }} aria-pressed={value === category.id} aria-controls={controls} onClick={() => onChange(category.id)}>
        <CollectionThumbnail category={category} template={previews[category.id]} />
        <span className="collection-chip-name">{category.name}</span>
      </button>)}
    </div>
    <button type="button" className="collection-scroll collection-scroll-next" aria-label="Next collections" disabled={edges.end} onClick={() => scroll(1)}><ChevronRight size={20} aria-hidden="true" /></button>
  </div>;
}
