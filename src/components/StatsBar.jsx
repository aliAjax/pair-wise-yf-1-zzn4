import { routeOccupancy } from '../domain.js';

export default function StatsBar({ state }) {
  const total = state.points.length;
  const pending = state.points.filter((p) => p.status === 'pending').length;
  const normal = total - pending;
  const occupied = state.roadways.reduce((s, r) => s + routeOccupancy(state.points, r.id), 0);
  const capacity = state.roadways.reduce((s, r) => s + r.capacity, 0);
  const accepted = state.submissions.filter((s) => s.result === 'accepted').length;
  const rejected = state.submissions.filter((s) => s.result === 'rejected').length;

  const items = [
    { label: '测点总数', value: total },
    { label: '正常测点', value: normal, tone: 'ok' },
    { label: '待复核', value: pending, tone: pending > 0 ? 'bad' : undefined },
    { label: '路线占用', value: `${occupied} / ${capacity}` },
    { label: '提交受理', value: accepted, tone: 'ok' },
    { label: '提交拒绝', value: rejected, tone: rejected > 0 ? 'bad' : undefined },
  ];

  return (
    <section className="stats">
      {items.map((it) => (
        <div key={it.label} className={`stat ${it.tone ? `stat-${it.tone}` : ''}`}>
          <div className="stat-value">{it.value}</div>
          <div className="stat-label">{it.label}</div>
        </div>
      ))}
    </section>
  );
}
