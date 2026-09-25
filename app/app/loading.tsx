export default function SubscriberLoading() {
  return (
    <main className="subscriber-main route-loading" aria-live="polite" aria-busy="true">
      <span className="button-spinner" aria-hidden="true" />
      <p>Loading your LotterySoup issue…</p>
    </main>
  );
}
