// 领域逻辑：阈值判定、路线占用、整次提交校验、状态迁移。
// 全部为纯函数 / 纯 reducer，保证“整次拒绝时测点、路线、原始记录保持不变”。

export const THRESHOLDS = { windSpeedMin: 1.0, methaneMax: 1.0 };
export const STORAGE_KEY = 'mine-vent-review:v1';

let seq = 0;
export function uid() {
  seq += 1;
  return `${Date.now().toString(36)}-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowLocalInput() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fmtTime(value) {
  return value ? value.replace('T', ' ') : '—';
}

// 阈值判定：风速 < 1 m/s 或 甲烷 > 1% → 待复核
export function evaluateRecord(record) {
  const issues = [];
  if (record.windSpeed < THRESHOLDS.windSpeedMin) {
    issues.push(`风速 ${record.windSpeed} m/s 低于 ${THRESHOLDS.windSpeedMin} m/s`);
  }
  if (record.methane > THRESHOLDS.methaneMax) {
    issues.push(`甲烷 ${record.methane}% 超过 ${THRESHOLDS.methaneMax}%`);
  }
  return issues;
}

// 路线占用：仅统计状态正常且在路线上的测点（待复核测点不占用路线）
export function routeOccupancy(points, roadwayId) {
  return points.filter((p) => p.roadwayId === roadwayId && p.onRoute).length;
}

export function isRouteFull(points, roadway) {
  return routeOccupancy(points, roadway.id) >= roadway.capacity;
}

// 整次提交校验：任一测点待复核，或任一巡检路线容量已满 → 整次拒绝
export function validateSubmission(state) {
  const reasons = [];
  const pending = state.points.filter((p) => p.status === 'pending');
  if (pending.length > 0) {
    reasons.push(`存在待复核测点：${pending.map((p) => p.name).join('、')}`);
  }
  const full = state.roadways.filter((r) => isRouteFull(state.points, r));
  if (full.length > 0) {
    reasons.push(
      `路线容量已满：${full
        .map((r) => `${r.name} ${routeOccupancy(state.points, r.id)}/${r.capacity}`)
        .join('、')}`,
    );
  }
  return reasons;
}

// 预置数据：三条巷道、四个测点（P3 风速 0.8 m/s，初始即处于待复核）
export function presetState() {
  const roadways = [
    { id: 'rd-transport', name: '一水平运输大巷', capacity: 3 },
    { id: 'rd-return', name: '二采区回风巷', capacity: 2 },
    { id: 'rd-intake', name: '三采区进风联络巷', capacity: 2 },
  ];
  const seed = [
    {
      id: 'p1',
      name: 'P1 测点',
      roadwayId: 'rd-transport',
      record: { windSpeed: 2.4, methane: 0.32, oxygen: 20.5, temperature: 22, measurer: '张伟', measuredAt: '2026-09-19T08:10' },
    },
    {
      id: 'p2',
      name: 'P2 测点',
      roadwayId: 'rd-transport',
      record: { windSpeed: 1.8, methane: 0.41, oxygen: 20.8, temperature: 23, measurer: '李强', measuredAt: '2026-09-19T08:25' },
    },
    {
      id: 'p3',
      name: 'P3 测点',
      roadwayId: 'rd-return',
      record: { windSpeed: 0.8, methane: 0.95, oxygen: 20.1, temperature: 26, measurer: '王敏', measuredAt: '2026-09-19T08:40' },
    },
    {
      id: 'p4',
      name: 'P4 测点',
      roadwayId: 'rd-intake',
      record: { windSpeed: 3.1, methane: 0.18, oxygen: 21.0, temperature: 21, measurer: '赵磊', measuredAt: '2026-09-19T09:05' },
    },
  ];
  const points = seed.map((s) => {
    const issues = evaluateRecord(s.record);
    const status = issues.length > 0 ? 'pending' : 'normal';
    return {
      id: s.id,
      name: s.name,
      roadwayId: s.roadwayId,
      record: s.record,
      status,
      onRoute: status === 'normal',
      review: null,
    };
  });
  const history = seed.map((s) => ({
    id: uid(),
    pointId: s.id,
    ...s.record,
    registeredAt: s.record.measuredAt,
    verdict: evaluateRecord(s.record).length > 0 ? 'pending' : 'normal',
  }));
  return { roadways, points, history, submissions: [] };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'register': {
      const { pointId, record } = action;
      const issues = evaluateRecord(record);
      const status = issues.length > 0 ? 'pending' : 'normal';
      const entry = {
        id: uid(),
        pointId,
        ...record,
        registeredAt: nowLocalInput(),
        verdict: status,
      };
      return {
        ...state,
        points: state.points.map((p) =>
          p.id === pointId
            ? { ...p, record, status, onRoute: status === 'normal', review: null }
            : p,
        ),
        history: [entry, ...state.history],
      };
    }
    case 'release': {
      // 复核放行：恢复正常并重新占用巡检路线，卡片 / 路线表 / 统计由同一状态派生，自动同步
      return {
        ...state,
        points: state.points.map((p) =>
          p.id === action.pointId && p.status === 'pending'
            ? {
                ...p,
                status: 'normal',
                onRoute: true,
                review: { by: action.reviewer, at: nowLocalInput() },
              }
            : p,
        ),
      };
    }
    case 'capacity': {
      const capacity = Math.max(0, Math.floor(Number(action.capacity)) || 0);
      return {
        ...state,
        roadways: state.roadways.map((r) => (r.id === action.roadwayId ? { ...r, capacity } : r)),
      };
    }
    case 'submit': {
      // 先校验后落账：拒绝时只追加一条提交日志，测点 / 路线 / 原始记录保持原引用不变
      const reasons = validateSubmission(state);
      const occupied = state.roadways.reduce((sum, r) => sum + routeOccupancy(state.points, r.id), 0);
      const capacity = state.roadways.reduce((sum, r) => sum + r.capacity, 0);
      const entry =
        reasons.length > 0
          ? { id: uid(), at: nowLocalInput(), result: 'rejected', reasons }
          : {
              id: uid(),
              at: nowLocalInput(),
              result: 'accepted',
              summary: `${state.points.length} 个测点全部正常，路线占用 ${occupied}/${capacity}`,
            };
      return { ...state, submissions: [entry, ...state.submissions] };
    }
    case 'reset':
      return presetState();
    default:
      return state;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return presetState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.roadways) || !Array.isArray(parsed.points)) {
      return presetState();
    }
    return { history: [], submissions: [], ...parsed };
  } catch {
    return presetState();
  }
}
