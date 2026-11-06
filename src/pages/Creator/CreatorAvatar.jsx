import { useState } from 'react';
import { Bird, Cat, Dog, Fish, Rabbit, Turtle, UserRound } from 'lucide-react';
import './creatorAvatar.css';

const icons = { cat: Cat, dog: Dog, rabbit: Rabbit, bird: Bird, fish: Fish, turtle: Turtle };

function AvatarPhoto({ src }) {
  const [status, setStatus] = useState('loading');
  if (status === 'failed') return <UserRound size={20} />;
  return <>
    <img src={src} alt="" hidden={status !== 'loaded'} referrerPolicy="no-referrer" onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />
    {status === 'loading' && <span className="creator-avatar-skeleton wallpaper-skeleton" />}
  </>;
}

export default function CreatorAvatar({ avatar, googlePhoto, loading = false }) {
  const custom = typeof avatar === 'string' && avatar.startsWith('data:image/');
  const photo = custom ? avatar : !avatar && googlePhoto;
  const Icon = icons[avatar] || UserRound;
  return <span className="creator-avatar" data-avatar={custom ? 'custom' : avatar ?? 'google'} aria-hidden="true">
    {loading ? <span className="creator-avatar-skeleton wallpaper-skeleton" /> :
      photo ? <AvatarPhoto key={photo} src={photo} /> : <Icon size={20} />}
  </span>;
}
