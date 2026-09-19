function fmtTime(iso) {
  return iso ? new Date(iso).toLocaleString('zh-CN', { hour12: false }) : '—';
}

export default function RoutePanel({
  route,
  points,
  roadwayNameOf,
  measurements,
  flash,
  onSubmit,
  inspections,
}) {
  const assignedPoints = route.assigned
    .map((id) => points.find((p) => p.id === id))
    .filter(Boolean);
  const pendingPoints = points.filter((p) => measurements[p.id]?.status === 'pending');
  const full = route.assigned.length >= route.capacity;

  return (
    <aside className="route-panel">
      <div className="card">
        <div className="card-head">
          <h3>{route.name}</h3>
          <span className={`badge ${full ? 'warn' : 'ok'}`}>
            {route.assigned.length}/{route.capacity} {full ? '已满' : ''}
          </span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${(route.assigned.length / route.capacity) * 100}%` }}
          />
        </div>

        {assignedPoints.length ? (
          <table className="route-table">
            <thead>
              <tr>
                <th>#</th>
                <th>测点</th>
                <th>巷道</th>
                <th>风速</th>
                <th>甲烷</th>
              </tr>
            </thead>
            <tbody>
              {assignedPoints.map((p, i) => {
                const m = measurements[p.id];
                return (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{roadwayNameOf(p)}</td>
                    <td>{m ? `${m.windSpeed} m/s` : '—'}</td>
                    <td>{m ? `${m.methane} %` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty">路线上暂无测点</p>
        )}

        {pendingPoints.length > 0 && (
          <p className="blocked">
            待复核不可占用路线：{pendingPoints.map((p) => p.name).join('、')}
          </p>
        )}

        <button className="btn primary block" onClick={onSubmit}>
          提交整次巡检
        </button>
        {flash && <p className={`flash ${flash.type}`}>{flash.text}</p>}
      </div>

      <div className="card">
        <h3>提交记录</h3>
        {inspections.length ? (
          <ul className="history">
            {inspections.map((it) => (
              <li key={it.id} className={it.result}>
                <span className="history-time">{fmtTime(it.time)}</span>
                <span className={`badge ${it.result === 'accepted' ? 'ok' : 'warn'}`}>
                  {it.result === 'accepted' ? '已受理' : '已拒绝'}
                </span>
                <span className="history-detail">
                  {it.result === 'accepted'
                    ? `上路线：${it.added.join('、') || '无'}`
                    : it.reason}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">尚无提交记录</p>
        )}
      </div>
    </aside>
  );
}
