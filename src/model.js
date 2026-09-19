// 复核规则与预置数据

export const RULES = {
  MIN_WIND_SPEED: 1, // m/s，低于该值进入待复核
  MAX_METHANE: 1, // %，超过该值进入待复核
};

export const STORAGE_KEY = 'mine-vent-review-v1';

/** 风速 < 1 m/s 或 甲烷 > 1% 时触发待复核 */
export function needsReview(m) {
  return Number(m.windSpeed) < RULES.MIN_WIND_SPEED || Number(m.methane) > RULES.MAX_METHANE;
}

export function seedState() {
  return {
    roadways: [
      { id: 'R1', name: '运输大巷' },
      { id: 'R2', name: '回风斜井' },
      { id: 'R3', name: '采区进风巷' },
    ],
    points: [
      { id: 'P1', roadwayId: 'R1', name: 'P1 · 大巷入口' },
      { id: 'P2', roadwayId: 'R1', name: 'P2 · 大巷中段' },
      { id: 'P3', roadwayId: 'R2', name: 'P3 · 斜井井底' },
      { id: 'P4', roadwayId: 'R3', name: 'P4 · 进风巷口' },
    ],
    // pointId -> { windSpeed, methane, oxygen, temperature, measurer, measuredAt,
    //              status: 'normal' | 'pending', review: null | { reviewer, reviewedAt } }
    measurements: {},
    route: { name: '巡检路线 A', capacity: 3, assigned: [] },
    inspections: [], // { id, time, result: 'accepted' | 'rejected', reason, added: [pointId] }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.points) || !parsed.route) return seedState();
    return { ...seedState(), ...parsed };
  } catch {
    return seedState();
  }
}
