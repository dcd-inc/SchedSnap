import PopupPicker from '../../components/PopupPicker.jsx';
import FineSlider from '../../components/FineSlider.jsx';
import { stylePickerOptions } from '../../components/wallpaperOptionIcons.js';
import { particleStyles } from '../../utils/wallpaperParticles.js';
import { useLayoutEffect, useRef, useState } from 'react';
import { generativePatternIds, generativePatternMap } from '../../assets/generativePatterns.js';
import { patternScale, patternOpacity } from '../../utils/patternBackground.js';
import { scheduleMovement, tabletBoxSpacing, scheduleLayout } from '../../utils/canvasHelpers.js';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown, LayoutTemplate, Image, PanelsTopLeft, Type, Sparkles } from 'lucide-react';
import { colorInputValue, wallpaperFonts, mascotPosition, wallpaperTextOpacity, wallpaperFontScale, wallpaperContainerWidth, wallpaperContainerHeight, wallpaperCornerRadius, wallpaperFillOpacity, snapSchedulePosition, timelineLineWidth, wallpaperColorIntensity } from '../../utils/wallpaperTheme.js';

const colorFields = {
  background: { label: 'Background', colors: ['#dce8cb', '#f5daca', '#d8cbef', '#192f4b'] },
  patternColor: { label: 'Pattern', colors: ['#c8d7b7', '#e8c6ae', '#c0afd5', '#c5d8e7'] },
  patternAccent: { label: 'Accent', colors: ['#d78f83', '#c8a251', '#8ca899', '#a58abd'] },
  surface: { label: 'Fill', colors: ['#f8faf2', '#ffffff', '#f8ebe7', '#2b5145'] },
  ink: { label: 'Text color', colors: ['#294b38', '#0f172a', '#71394d', '#fffdf4'] },
  line: { label: 'Border', colors: ['#a6b5a1', '#e2e8f0', '#b98c96', '#8caa96'] },
};
const categoryIcons = { layout: LayoutTemplate, wallpaper: Image, cards: PanelsTopLeft, text: Type, decorations: Sparkles };
const editablePatterns = new Set(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame', ...generativePatternIds]);

function AppearanceColor({ colorKey, template, defaultTemplate = {}, onChange, toggleKey, label: labelOverride, stacked = false, trailing }) {
  const { label: defaultLabel, colors: defaultColors } = colorFields[colorKey];
  const label = labelOverride || defaultLabel;
  const rawValue = template[colorKey] || generativePatternMap.get(template.pattern)?.[colorKey] || (colorKey === 'patternColor' ? (template.pattern === 'circle' ? '#ad5b45' : template.line) : '#ffffff');
  const normalizedValue = colorInputValue(rawValue);
  const original = colorInputValue(defaultTemplate[colorKey] || generativePatternMap.get(defaultTemplate.pattern)?.[colorKey] || (colorKey === 'patternColor' ? (defaultTemplate.pattern === 'circle' ? '#ad5b45' : defaultTemplate.line) : '#ffffff'));
  const colors = [original, ...defaultColors.filter(color => colorInputValue(color) !== original)].slice(0, 3);
  const enabled = !toggleKey || template[toggleKey] !== false;
  return <div data-color-field={colorKey} className={`appearance-row${stacked ? ' appearance-color-stacked' : ''}`}>
    {toggleKey ? <label className="appearance-label appearance-switch"><input type="checkbox" checked={enabled} onChange={(event) => onChange(toggleKey, event.target.checked)} />{label}</label> : <span className="appearance-label">{label}</span>}
    {trailing}
    <fieldset className="appearance-palette" aria-label={`${label} choices`} disabled={!enabled}>
      {colors.map((color, index) => <button key={color} type="button" aria-label={index === 0 ? `Default ${label.toLowerCase()}` : `${label} ${color}`} title={index === 0 ? `Default ${label.toLowerCase()}` : color} aria-pressed={normalizedValue === colorInputValue(color)} onClick={() => onChange(colorKey, index === 0 ? undefined : color)} className="color-swatch" style={{ '--swatch': color }} />)}
      <label className="custom-color" data-active={!colors.some(color => colorInputValue(color) === normalizedValue)} title={`Custom ${label.toLowerCase()}`}><span className="sr-only">Custom {label.toLowerCase()}</span><input type="color" aria-label={`Custom ${label.toLowerCase()}${!colors.some(color => colorInputValue(color) === normalizedValue) ? ', selected' : ''}`} value={normalizedValue} onChange={(event) => onChange(colorKey, event.target.value)} /></label>
    </fieldset>
  </div>;
}

export default function TemplateControls({ template, onChange, defaultTemplate = {}, enablePlacement = false, layoutPicker, onTitleChange }) {
  const [category, setCategory] = useState('layout');
  const settingsRef = useRef(null);
  const scrollTabToStart = useRef(false);
  useLayoutEffect(() => {
    if (!scrollTabToStart.current) return;
    scrollTabToStart.current = false;
    const settings = settingsRef.current;
    const tabs = settings?.querySelector('.appearance-categories');
    const section = settings?.querySelector('.appearance-section:not([hidden])');
    if (!tabs || !section) return;
    const stickyTop = parseFloat(getComputedStyle(tabs).top) || 0;
    window.scrollTo({ top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - stickyTop - tabs.offsetHeight), behavior: 'instant' });
  }, [category]);
  const sectionKeys = { layout: ['horizontalPosition', 'verticalPosition', 'schedulePosition'], wallpaper: ['background', 'patternColor', 'patternAccent', 'patternScale', 'patternOpacity', 'mascotPosition'], cards: ['tabletBoxSpacing', 'containerStyle', 'colorIntensity', 'containerWidth', 'containerHeight', 'containerRadius', 'surface', 'containerFill', 'containerOpacity', 'line', 'containerBorder', 'timelineLineWidth'], text: ['textOpacity', 'titleAlignment', 'showTitle', 'showScheduleTitle', 'fontScale', 'fontFamily', 'ink'], decorations: ['particleStyle'] };
  const resetSection = key => { sectionKeys[key].forEach(field => onChange(field, undefined)); if (key === 'layout' && layoutPicker) onChange('scheduleLayout', 'stacked'); };
  const fixedBackground = Boolean(template.image && template.layout !== 'mascot');
  const timeline = ['timeline', 'grouped-list', 'day-columns'].includes(scheduleLayout(template));
  const radius = wallpaperCornerRadius(template);
  const containerWidth = wallpaperContainerWidth(template);
  const containerHeight = wallpaperContainerHeight(template);
  const defaultContainerWidth = wallpaperContainerWidth(defaultTemplate);
  const defaultContainerHeight = wallpaperContainerHeight(defaultTemplate);
  const fontSize = Math.round(wallpaperFontScale(template) * 1000) / 10;
  const defaultRadius = wallpaperCornerRadius({ ...template, containerRadius: undefined });
  const defaultColorIntensity = wallpaperColorIntensity({ ...defaultTemplate, containerStyle: template.containerStyle });
  const dragging = useRef({});
  const categories = [['layout', 'Layout'], ...(!fixedBackground || editablePatterns.has(template.pattern) ? [['wallpaper', 'Wallpaper']] : []), ['cards', 'Container'], ['text', 'Text'], ...(template.layout === 'mascot' ? [['decorations', 'Decorations']] : [])];
  return <aside ref={settingsRef} aria-label="Template appearance" className="template-settings" data-category={category}>
    <nav className="appearance-categories" aria-label="Appearance categories" style={{ '--category-count': categories.length, '--category-index': Math.max(0, categories.findIndex(([key]) => key === category)) }}><span className="category-indicator" aria-hidden="true" />{categories.map(([key, label]) => { const Icon = categoryIcons[key]; return <button key={key} type="button" aria-pressed={category === key} onClick={() => { if (key === category) return; scrollTabToStart.current = window.matchMedia('(max-width: 640px)').matches; setCategory(key); }}><Icon size={16} aria-hidden="true" /><span>{label}</span></button>; })}</nav>
    {(enablePlacement || (template.device && template.device !== 'mobile')) && <section className="appearance-section" data-section="layout" hidden={category !== 'layout'}><fieldset className="appearance-group">
      <legend className="sr-only">Layout</legend>{layoutPicker}
      <div className="position-offset">
        <div className="top-margin-label"><span>Position</span><span className="position-value"><button type="button" className="position-reset" disabled={['horizontal', 'vertical'].every(axis => scheduleMovement(template, axis) === scheduleMovement(defaultTemplate, axis))} onClick={() => { onChange('horizontalPosition', undefined); onChange('verticalPosition', undefined); }}>Reset</button><output>{scheduleMovement(template, 'horizontal')}%, {scheduleMovement(template, 'vertical')}%</output></span></div>
        {['horizontal', 'vertical'].map(axis => {
          const value = scheduleMovement(template, axis);
          const defaultValue = scheduleMovement(defaultTemplate, axis);
          const id = `schedule-${axis}-position`;
          return <div className="position-axis" key={axis}><label htmlFor={id}>{axis === 'horizontal' ? 'Left / Right' : 'Up / Down'}</label><FineSlider id={id} min="-100" max="100" step="1" value={value} aria-label={`${axis === 'horizontal' ? 'Horizontal' : 'Vertical'} position`} aria-valuetext={`${value}%`} onDragStart={() => { dragging.current[axis] = true; }} onDragEnd={() => { dragging.current[axis] = false; }} onValueChange={value => onChange(`${axis}Position`, snapSchedulePosition(value, dragging.current[axis], defaultValue))} /><output htmlFor={id}>{value}%</output></div>;
        })}
      </div>
    </fieldset><button type="button" className="button-secondary section-reset layout-default-reset" onClick={() => resetSection('layout')}>Reset layout to default</button></section>}
    {(!fixedBackground || editablePatterns.has(template.pattern)) && <section className="appearance-section" data-section="wallpaper" hidden={category !== 'wallpaper'}><fieldset className="appearance-group">
      <legend className="sr-only">Wallpaper</legend>
      {template.layout === 'mascot' && <div className="appearance-row">
        <label className="appearance-label" htmlFor="mascot-position">Character position</label>
        <div className="field-select appearance-select"><select id="mascot-position" className="field-input" value={mascotPosition(template)} onChange={(event) => onChange('mascotPosition', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>
      </div>}
      {!fixedBackground && <AppearanceColor colorKey="background" template={template} defaultTemplate={defaultTemplate} onChange={onChange} />}
      {editablePatterns.has(template.pattern) && <AppearanceColor colorKey="patternColor" template={template} defaultTemplate={defaultTemplate} onChange={onChange} />}
      {generativePatternIds.includes(template.pattern) && <>
        <AppearanceColor colorKey="patternAccent" template={template} defaultTemplate={defaultTemplate} onChange={onChange} />
        <div className="top-margin-control">
          <div className="top-margin-label"><label htmlFor="pattern-scale">Pattern size</label><span className="position-value"><output htmlFor="pattern-scale">{patternScale(template)}%</output><button type="button" className="position-reset" disabled={!(patternScale(template) !== patternScale(defaultTemplate))} aria-label="Reset pattern size" onClick={() => onChange('patternScale', patternScale(defaultTemplate))}>Reset</button></span></div>
          <FineSlider id="pattern-scale" min="50" max="200" step="5" value={patternScale(template)} onValueChange={value => onChange('patternScale', value)} />
        </div>
        <div className="top-margin-control">
          <div className="top-margin-label"><label htmlFor="pattern-opacity">Pattern opacity</label><span className="position-value"><output htmlFor="pattern-opacity">{patternOpacity(template)}%</output><button type="button" className="position-reset" disabled={!(patternOpacity(template) !== patternOpacity(defaultTemplate))} aria-label="Reset pattern opacity" onClick={() => onChange('patternOpacity', patternOpacity(defaultTemplate))}>Reset</button></span></div>
          <FineSlider id="pattern-opacity" min="0" max="100" step="5" value={patternOpacity(template)} onValueChange={value => onChange('patternOpacity', value)} />
        </div>
      </>}
    </fieldset><button type="button" className="button-secondary section-reset" onClick={() => resetSection('wallpaper')}>Reset wallpaper</button></section>}
    <section className="appearance-section" data-section="cards" hidden={category !== 'cards'}><fieldset className="appearance-group">
      <legend className="sr-only">{timeline ? 'Day groups' : 'Day containers'}</legend>
      {template.device === 'tablet' && <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="tablet-box-spacing">{timeline ? 'Space between days' : 'Space between boxes'}</label><span className="position-value"><output htmlFor="tablet-box-spacing">{tabletBoxSpacing(template)}</output><button type="button" className="position-reset" disabled={!(tabletBoxSpacing(template) !== tabletBoxSpacing(defaultTemplate))} aria-label="Reset spacing" onClick={() => onChange('tabletBoxSpacing', tabletBoxSpacing(defaultTemplate))}>Reset</button></span></div>
        <FineSlider id="tablet-box-spacing" min="0" max="300" step="1" value={tabletBoxSpacing(template)} aria-valuetext={`${tabletBoxSpacing(template)} spacing units`} onValueChange={value => onChange('tabletBoxSpacing', value)} />
      </div>}
      <fieldset className="schedule-layout-fieldset container-style-picker">
        <legend className="sr-only">Container style</legend>
        <div className="schedule-layout-options">
          {stylePickerOptions.map(([value, label, Icon]) => {
            const selected = template.containerStyle === 'colored-glass' ? 'colored-glass' : template.containerStyle?.startsWith('colored') ? 'colored' : template.containerStyle || 'glass';
            const descriptions = { glass: 'See-through fill', solid: 'Opaque fill', colored: 'A color for each day', 'colored-glass': 'See-through day colors', outline: 'Border only', none: 'Text without a box' };
            return <label key={value} className="schedule-layout-option">
              <input type="radio" name="container-style" value={value} checked={selected === value} onChange={() => onChange('containerStyle', value)} />
              <span className="container-style-icon" aria-hidden="true"><Icon size={24} /></span>
              <span className="layout-option-copy"><strong>{label}</strong><span>{descriptions[value]}</span></span>
            </label>;
          })}
        </div>
      </fieldset>
      <div hidden={template.containerStyle === 'none'}>
      {template.containerStyle?.startsWith('colored') && <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="color-intensity">Color intensity</label><span className="position-value"><output htmlFor="color-intensity">{wallpaperColorIntensity(template)}%</output><button type="button" className="position-reset" disabled={!(wallpaperColorIntensity(template) !== defaultColorIntensity)} aria-label="Reset color intensity" onClick={() => onChange('colorIntensity', defaultColorIntensity)}>Reset</button></span></div>
        <FineSlider id="color-intensity" min="0" max="100" step="1" value={wallpaperColorIntensity(template)} onValueChange={value => onChange('colorIntensity', value)} />
      </div>}
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="container-width">Container width</label><span className="position-value"><output htmlFor="container-width">{containerWidth}%</output><button type="button" className="position-reset" disabled={containerWidth === defaultContainerWidth} aria-label="Reset container width" onClick={() => onChange('containerWidth', undefined)}>Reset</button></span></div>
        <FineSlider id="container-width" min="60" max="120" step="1" value={containerWidth} aria-valuetext={`${containerWidth}% container width`} onValueChange={value => onChange('containerWidth', value)} />
      </div>
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="container-height">Container height</label><span className="position-value"><output htmlFor="container-height">{containerHeight}%</output><button type="button" className="position-reset" disabled={containerHeight === defaultContainerHeight} aria-label="Reset container height" onClick={() => onChange('containerHeight', undefined)}>Reset</button></span></div>
        <FineSlider id="container-height" min="70" max="140" step="1" value={containerHeight} aria-valuetext={`${containerHeight}% container height`} onValueChange={value => onChange('containerHeight', value)} />
      </div>
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="appearance-shape">Corner radius</label><span className="position-value"><output htmlFor="appearance-shape">{radius}%</output><button type="button" className="position-reset" disabled={!(radius !== defaultRadius)} aria-label="Reset corner radius" onClick={() => onChange('containerRadius', undefined)}>Reset</button></span></div>
        <FineSlider id="appearance-shape" min="0" max="50" step="1" value={radius} aria-valuetext={`${radius}% corner radius`} onValueChange={value => onChange('containerRadius', value)} />
      </div>


      <AppearanceColor colorKey="surface" template={template} defaultTemplate={defaultTemplate} onChange={onChange} toggleKey="containerFill" />
      {(template.containerFill !== false) && <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="fill-opacity">Fill opacity</label><span className="position-value"><output htmlFor="fill-opacity">{wallpaperFillOpacity(template)}%</output><button type="button" className="position-reset" disabled={!(wallpaperFillOpacity(template) !== wallpaperFillOpacity(defaultTemplate))} aria-label="Reset fill opacity" onClick={() => onChange('containerOpacity', wallpaperFillOpacity(defaultTemplate))}>Reset</button></span></div>
        <FineSlider id="fill-opacity" min="0" max="100" step="1" value={wallpaperFillOpacity(template)} disabled={template.containerFill === false} aria-valuetext={`${wallpaperFillOpacity(template)}% fill opacity`} onValueChange={value => onChange('containerOpacity', value)} />
      </div>}
      {!timeline && <AppearanceColor colorKey="line" template={template} defaultTemplate={defaultTemplate} onChange={onChange} toggleKey="containerBorder" />}
      {timeline && <AppearanceColor colorKey="line" label="Day outline" template={template} defaultTemplate={defaultTemplate} onChange={onChange} toggleKey="containerBorder" />}
      {(timeline || template.containerBorder !== false) && <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="timeline-line-width">{timeline ? 'Line thickness' : 'Border thickness'}</label><span className="position-value"><output htmlFor="timeline-line-width">{timelineLineWidth(template)} px</output><button type="button" className="position-reset" disabled={!(timelineLineWidth(template) !== timelineLineWidth(defaultTemplate))} aria-label="Reset line thickness" onClick={() => onChange('timelineLineWidth', timelineLineWidth(defaultTemplate))}>Reset</button></span></div>
        <FineSlider id="timeline-line-width" min="0.5" max="6" step="0.5" value={timelineLineWidth(template)} onValueChange={value => onChange('timelineLineWidth', value)} />
      </div>}

      </div>
    </fieldset><button type="button" className="button-secondary section-reset day-styles-reset" onClick={() => resetSection('cards')}>Reset container to default</button></section>
    <section className="appearance-section" data-section="text" hidden={category !== 'text'}><fieldset className="appearance-group">
      <legend className="sr-only">Text</legend>
      <div className="appearance-row">
        <label className="appearance-label appearance-switch"><input type="checkbox" checked={template.showTitle !== false && template.showScheduleTitle !== false} onChange={event => { onChange('showTitle', event.target.checked); onChange('showScheduleTitle', event.target.checked); }} />Title</label>
        <input className="field-input appearance-title-input" aria-label="Schedule title" maxLength={48} value={template.scheduleTitle ?? 'Class Schedule'} placeholder="Class Schedule" disabled={template.showTitle === false || template.showScheduleTitle === false} onChange={event => onTitleChange ? onTitleChange(event.target.value) : onChange('scheduleTitle', event.target.value)} onBlur={event => { if (!event.target.value.trim()) { if (onTitleChange) onTitleChange('Class Schedule'); else onChange('scheduleTitle', 'Class Schedule'); } }} />
      </div>
      <div className="appearance-row">
        <span className="appearance-label">Title position</span>
        <PopupPicker label="Title position" disabled={template.showTitle === false || template.showScheduleTitle === false} value={template.titleAlignment || 'center'} onChange={value => onChange('titleAlignment', value)} options={[[ 'left', 'Left', AlignLeft ], [ 'center', 'Center', AlignCenter ], [ 'right', 'Right', AlignRight ]]} />
      </div>
      <div className="appearance-row">
        <span className="appearance-label">Font family</span>
        <PopupPicker previewFonts label="Font family" value={template.fontFamily || 'DM Sans Variable'} onChange={value => onChange('fontFamily', value)} options={wallpaperFonts.map(({ value, label }) => [value, label, Type])} />
      </div>
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="appearance-font-size">Font size</label><span className="position-value"><button type="button" className="position-reset" disabled={wallpaperFontScale(template) === wallpaperFontScale(defaultTemplate)} aria-label="Reset font size" onClick={() => onChange('fontScale', undefined)}>Reset</button><output htmlFor="appearance-font-size">{fontSize}%</output></span></div>
        <FineSlider id="appearance-font-size" min="70" max="160" step="0.5" value={fontSize} aria-valuetext={`${fontSize}% font size`} onValueChange={value => onChange('fontScale', value / 100)} />
      </div>
      <AppearanceColor colorKey="ink" template={template} defaultTemplate={defaultTemplate} onChange={onChange} />
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="text-opacity">Text opacity</label><span className="position-value"><button type="button" className="position-reset" disabled={wallpaperTextOpacity(template) === wallpaperTextOpacity(defaultTemplate)} aria-label="Reset text opacity" onClick={() => onChange('textOpacity', undefined)}>Reset</button><output htmlFor="text-opacity">{wallpaperTextOpacity(template)}%</output></span></div>
        <FineSlider id="text-opacity" min="0" max="100" step="1" value={wallpaperTextOpacity(template)} aria-valuetext={`${wallpaperTextOpacity(template)}% text opacity`} onValueChange={value => onChange('textOpacity', value)} />
      </div>
    </fieldset><button type="button" className="button-secondary section-reset" onClick={() => resetSection('text')}>Reset text to default</button></section>
    {template.layout === 'mascot' && <section className="appearance-section" data-section="decorations" hidden={category !== 'decorations'}><fieldset className="appearance-group">
      <legend className="sr-only">Decorations</legend>
      <div className="appearance-row">
        <label className="appearance-label" htmlFor="particle-style">Particles</label>
        <div className="field-select appearance-select">
          <select id="particle-style" className="field-input" value={template.particleStyle || 'auto'} onChange={(event) => onChange('particleStyle', event.target.value)}>
            {particleStyles.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <ChevronDown size={16} className="field-select-icon" aria-hidden="true" />
        </div>
      </div>
    </fieldset><button type="button" className="button-secondary section-reset" onClick={() => resetSection('decorations')}>Reset decorations</button></section>}

  </aside>;
}
