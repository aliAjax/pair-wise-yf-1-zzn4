import { isRouteFull, routeOccupancy } from '../domain.js';

export default function RouteTable({ state, onCapacity }) {
  return (
    <section className="panel">
      <h2>巡检路线</h2>
      <table className="table">
        <thead>
          <tr>
            <th>巷道 / 路线</th>
            <th>容量</th>
            <th>已占用</th>
            <th>测点</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {state.roadways.map((r) => {
            const occupied = routeOccupancy(state.points, r.id);
            const full = isRouteFull(state.points, r);
            const occupants = state.points.filter((p) => p.roadwayId === r.id && p.onRoute);
            const excluded = state.points.filter((p) => p.roadwayId === r.id && !p.onRoute);
            return (
              <tr key={r.id} className={full ? 'row-full' : ''}>
                <td>{r.name}</td>
                <td>
                  <input
                    className="capacity-input"
                    type="number"
                    min="0"
                    step="1"
                    value={r.capacity}
                    onChange={(e) => onCapacity(r.id, e.target.value)}
                    aria-label={`${r.name}容量`}
                  />
                </td>
                <td className="num">{occupied}</td>
                <td>
                  <div className="chips">
                    {occupants.map((p) => (
                      <span key={p.id} className="chip chip-on">
                        {p.name}
                      </span>
                    ))}
                    {excluded.map((p) => (
                      <span key={p.id} className="chip chip-off">
                        {p.name}·待复核
                      </span>
                    ))}
                    {occupants.length + excluded.length === 0 && <span className="muted">—</span>}
                  </div>
                </td>
                <td>{full ? <span className="badge badge-bad">已满</span> : <span className="badge badge-ok">未满</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint">容量可调整；占用 ≥ 容量即视为“已满”，整次提交将被拒绝。待复核测点不占用路线。</p>
    </section>
  );
}
