export default function StatsBar({ points, roadways, measurements, route }) {
  const measured = points.filter((p) => measurements[p.id]);
  const pending = measured.filter((p) => measurements[p.id].status === 'pending');
  const normal = measured.filter((p) => measurements[p.id].status === 'normal');

  const avg = (list, key) =>
    list.length
      ? (list.reduce((sum, p) => sum + Number(measurements[p.id][key]), 0) / list.length).toFixed(2)
      : '—';

  return (
    <section className="stats">
      <div className="stat-cards">
        <div className="stat">
          <span className="stat-num">{points.length}</span>
          <span className="stat-label">测点总数</span>
        </div>
        <div className="stat">
          <span className="stat-num ok-text">{normal.length}</span>
          <span className="stat-label">正常</span>
        </div>
        <div className="stat">
          <span className="stat-num warn-text">{pending.length}</span>
          <span className="stat-label">待复核</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {route.assigned.length}/{route.capacity}
          </span>
          <span className="stat-label">路线占用</span>
        </div>
      </div>
      <table className="stats-table">
        <thead>
          <tr>
            <th>巷道</th>
            <th>已测/总数</th>
            <th>平均风速 (m/s)</th>
            <th>平均甲烷 (%)</th>
          </tr>
        </thead>
        <tbody>
          {roadways.map((r) => {
            const inRoadway = points.filter((p) => p.roadwayId === r.id);
            const done = inRoadway.filter((p) => measurements[p.id]);
            return (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  {done.length}/{inRoadway.length}
                </td>
                <td>{avg(done, 'windSpeed')}</td>
                <td>{avg(done, 'methane')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
