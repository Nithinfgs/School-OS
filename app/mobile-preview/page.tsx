import './preview.css';

export const dynamic = 'force-dynamic';

/**
 * Laptop-friendly device preview. The iframe renders the live SchoolOS route
 * at a true phone viewport, so it always reflects the current product UI.
 */
export default function MobilePreviewPage() {
  return (
    <main className="mobile-preview-page">
      <section className="mobile-preview-intro">
        <span>SchoolOS mobile preview</span>
        <h1>Head of School</h1>
        <p>Live vertical phone layout. Use the app normally inside the device frame.</p>
      </section>
      <section className="phone-stage" aria-label="Phone layout preview">
        <div className="phone-frame">
          <div className="phone-speaker" aria-hidden="true" />
          <iframe
            title="SchoolOS mobile Head of School preview"
            src="/hos/"
            className="phone-screen"
          />
        </div>
      </section>
    </main>
  );
}
