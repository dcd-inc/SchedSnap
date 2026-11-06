import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { SUBMIT_DESIGN_PATH } from '../../shared/seo.js';

const steps = [
  { title: 'Sign in', image: 'sign-in', description: 'Continue with Google and choose the creator name you want shown with your designs.' },
  { title: 'Upload your design', image: 'upload-design', description: 'Crop and preview a design you have permission to share. Tell us if any part was generated with AI.' },
  { title: 'Wait for approval', image: 'await-review', description: 'Track your submission in My designs. If approved, it joins the Community collection with your name credited.' },
];

export default function CommunityDesignGuide() {
  return <article className="page-wrap community-guide">
    <header className="how-it-works-heading">
      <h1>Get your design featured</h1>
      <p>Contribute your own wallpaper design to the SchedSnap Community collection.</p>
    </header>
    <ol className="how-it-works-steps">
      {steps.map(({ title, image, description }, index) => <li key={image} className="how-it-works-step">
        <div className="how-it-works-art">
          <img src={`/images/community-guide/${image}.webp`} alt="" width="768" height="512" decoding="async" />
        </div>
        <div className="how-it-works-copy">
          <h2><span className="how-it-works-number" aria-hidden="true">{index + 1}</span>{title}</h2>
          <p>{description}</p>
        </div>
      </li>)}
    </ol>
    <footer className="community-guide-actions">
      <Link className="button-secondary" to="/terms#community-submissions">Submission terms</Link>
      <Link className="button-primary" to={SUBMIT_DESIGN_PATH}>Submit a design <ArrowRight size={18} aria-hidden="true" /></Link>
    </footer>
  </article>;
}
