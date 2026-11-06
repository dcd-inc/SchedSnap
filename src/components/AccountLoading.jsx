import BrandMark from './BrandMark.jsx';
import './accountLoading.css';

export default function AccountLoading() {
  return <div className="account-loading" role="status">
    <span className="account-loading-brand" aria-hidden="true"><BrandMark />SchedSnap</span>
    <span className="account-loading-dots" aria-hidden="true"><i /><i /><i /></span>
    <span className="sr-only">Loading SchedSnap account</span>
  </div>;
}
