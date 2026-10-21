const steps = [
  {
    title: 'Choose a design',
    description: 'Pick your device and find a wallpaper that fits your style.',
    image: '/images/how-it-works/choose-design.webp',
    height: 512,
  },
  {
    title: 'Add your classes',
    description: 'Upload your timetable or enter classes manually, then check the details.',
    image: '/images/how-it-works/add-classes.webp',
    height: 512,
  },
  {
    title: 'Customize and download',
    description: 'Adjust the layout and colors, then download your schedule as a wallpaper.',
    image: '/images/how-it-works/download-wallpaper.webp',
    height: 576,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-how-it-works" aria-labelledby="how-it-works-heading">
      <div className="page-wrap">
        <div className="how-it-works-heading">
          <h2 id="how-it-works-heading">How it works</h2>
          <p>Turn your class schedule into a wallpaper in three simple steps.</p>
        </div>
        <ol className="how-it-works-steps">
          {steps.map(({ title, description, image, height }, index) => (
            <li key={title} className="how-it-works-step">
              <div className="how-it-works-art">
                <picture><source type="image/avif" srcSet={[360, 560, 768].map(width => `${image.replace('.webp', `-${width}.avif`)} ${width}w`).join(', ')} sizes={`(max-width: 640px) min(calc(100vw - 32px), ${Math.round(210 * 768 / height)}px), (max-width: 1200px) 28vw, 384px`} /><img src={image} srcSet={`${image.replace('.webp', '-560.webp')} 560w, ${image} 768w`} sizes={`(max-width: 640px) min(calc(100vw - 32px), ${Math.round(210 * 768 / height)}px), (max-width: 1200px) 28vw, 384px`} alt="" width="768" height={height} loading="lazy" decoding="async" /></picture>
              </div>
              <div className="how-it-works-copy">
                <h3><span className="how-it-works-number" aria-hidden="true">{index + 1}</span>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
