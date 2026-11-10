export default function DeviceNavCount({ count }) {
  if (count === undefined) return <span className="device-nav-count wallpaper-skeleton" aria-hidden="true" />;
  if (!(count > 0)) return null;
  return <span className="device-nav-count" aria-hidden="true">{count}</span>;
}
