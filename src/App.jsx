import { useEffect, useState } from 'react';
import { loadState, seedState, needsReview, STORAGE_KEY } from './model.js';
import PointCard from './components/PointCard.jsx';
import RoutePanel from './components/RoutePanel.jsx';
import StatsBar from './components/StatsBar.jsx';

export default function App() {
  const [state, setState] = useState(loadState);
  const [flash, setFlash] = useState(null);

  // 任何状态变化都写入浏览器本地存储，刷新后保留
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const roadwayNameOf = (point) =>
    state.roadways.find((r) => r.id === point.roadwayId)?.name ?? '—';

  function registerMeasurement(pointId, values) {
    const status = needsReview(values) ? 'pending' : 'normal';
    setState((s) => ({
      ...s,
      measurements: {
        ...s.measurements,
        [pointId]: { ...values, status, review: null },
      },
      // 待复核测点不能占用巡检路线：一旦进入待复核即从路线上移除
      route:
        status === 'pending'
          ? { ...s.route, assigned: s.route.assigned.filter((id) => id !== pointId) }
          : s.route,
    }));
  }

  function releasePoint(pointId, reviewer) {
    setState((s) => {
      const m = s.measurements[pointId];
      if (!m || m.status !== 'pending') return s;
      return {
        ...s,
        measurements: {
          ...s.measurements,
          [pointId]: {
            ...m,
            status: 'normal',
            review: { reviewer, reviewedAt: new Date().toISOString() },
          },
        },
      };
    });
    setFlash({ type: 'ok', text: `${pointId} 已复核放行，卡片、路线与统计已同步` });
  }

  // 整次巡检提交：任一测点待复核或路线容量不足 -> 整次拒绝，
  // 测点、路线、原始记录保持原引用不变，仅追加一条拒绝日志。
  function submitInspection() {
    const pending = state.points.filter((p) => state.measurements[p.id]?.status === 'pending');
    const candidates = state.points
      .filter((p) => state.measurements[p.id]?.status === 'normal')
      .map((p) => p.id)
      .filter((id) => !state.route.assigned.includes(id));
    const remaining = state.route.capacity - state.route.assigned.length;

    let rejection = null;
    if (pending.length > 0) {
      rejection = `测点待复核：${pending.map((p) => p.name).join('、')}`;
    } else if (candidates.length === 0) {
      rejection = '没有可上路线的测点（均已上路线或尚未登记）';
    } else if (candidates.length > remaining) {
      rejection = `路线容量已满：剩余 ${remaining} 个位次，本次需 ${candidates.length} 个`;
    }

    const entry = {
      id: `I${String(state.inspections.length + 1).padStart(3, '0')}`,
      time: new Date().toISOString(),
      result: rejection ? 'rejected' : 'accepted',
      reason: rejection || '',
      added: rejection ? [] : candidates,
    };

    setState((s) => ({
      ...s,
      route: rejection ? s.route : { ...s.route, assigned: [...s.route.assigned, ...candidates] },
      inspections: [entry, ...s.inspections],
    }));

    setFlash(
      rejection
        ? { type: 'err', text: `整次拒绝：${rejection}。测点、路线与原始记录保持不变。` }
        : { type: 'ok', text: `巡检已受理，${candidates.length} 个测点进入 ${state.route.name}` },
    );
  }

  function resetAll() {
    if (!window.confirm('确定清空本地数据并恢复预置状态？')) return;
    localStorage.removeItem(STORAGE_KEY);
    setState(seedState());
    setFlash(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>矿井通风测点复核台</h1>
          <p>风速 &lt; 1 m/s 或 甲烷 &gt; 1% 自动进入待复核；待复核测点不占用巡检路线</p>
        </div>
        <button className="btn danger" onClick={resetAll}>重置数据</button>
      </header>

      <StatsBar
        points={state.points}
        roadways={state.roadways}
        measurements={state.measurements}
        route={state.route}
      />

      <main className="layout">
        <section className="points-grid">
          {state.points.map((p) => (
            <PointCard
              key={p.id}
              point={p}
              roadwayName={roadwayNameOf(p)}
              measurement={state.measurements[p.id]}
              onRegister={registerMeasurement}
              onRelease={releasePoint}
            />
          ))}
        </section>

        <RoutePanel
          route={state.route}
          points={state.points}
          roadwayNameOf={roadwayNameOf}
          measurements={state.measurements}
          flash={flash}
          onSubmit={submitInspection}
          inspections={state.inspections}
        />
      </main>
    </div>
  );
}
