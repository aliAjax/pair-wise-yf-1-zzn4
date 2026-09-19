import { fmtTime } from '../domain.js';

export default function HistoryTable({ state }) {
  const pointName = (id) => {
    const p = state.points.find((x) => x.id === id);
    return p ? p.name : id;
  };

  return (
    <section className="panel history-panel">
      <h2>原始测量记录</h2>
      {state.history.length === 0 ? (
        <p className="muted">暂无记录</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>登记时间</th>
                <th>测点</th>
                <th>风速 (m/s)</th>
                <th>甲烷 (%)</th>
                <th>氧气 (%)</th>
                <th>温度 (℃)</th>
                <th>测量人</th>
                <th>测量时间</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {state.history.map((h) => (
                <tr key={h.id}>
                  <td className="num">{fmtTime(h.registeredAt)}</td>
                  <td>{pointName(h.pointId)}</td>
                  <td className="num">{h.windSpeed}</td>
                  <td className="num">{h.methane}</td>
                  <td className="num">{h.oxygen}</td>
                  <td className="num">{h.temperature}</td>
                  <td>{h.measurer}</td>
                  <td className="num">{fmtTime(h.measuredAt)}</td>
                  <td>
                    {h.verdict === 'pending' ? (
                      <span className="badge badge-bad">待复核</span>
                    ) : (
                      <span className="badge badge-ok">正常</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
