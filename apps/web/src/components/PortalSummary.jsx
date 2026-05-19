export default function PortalSummary({ label, value, tone = "default" }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}
