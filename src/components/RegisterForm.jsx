import { useState } from 'react';
import { nowLocalInput } from '../domain.js';

export default function RegisterForm({ points, roadways, onRegister }) {
  const [pointId, setPointId] = useState(points[0] ? points[0].id : '');
  const [windSpeed, setWindSpeed] = useState('');
  const [methane, setMethane] = useState('');
  const [oxygen, setOxygen] = useState('');
  const [temperature, setTemperature] = useState('');
  const [measurer, setMeasurer] = useState('');
  const [measuredAt, setMeasuredAt] = useState(nowLocalInput());
  const [error, setError] = useState('');

  const roadwayName = (id) => {
    const r = roadways.find((x) => x.id === id);
    return r ? r.name : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pointId) return setError('请选择测点');
    if ([windSpeed, methane, oxygen, temperature].some((v) => v === '' || !Number.isFinite(Number(v)))) {
      return setError('风速、甲烷、氧气、温度都必须是数字');
    }
    const nums = {
      windSpeed: Number(windSpeed),
      methane: Number(methane),
      oxygen: Number(oxygen),
      temperature: Number(temperature),
    };
    if (nums.windSpeed < 0 || nums.methane < 0 || nums.oxygen < 0) {
      return setError('风速 / 甲烷 / 氧气不能为负数');
    }
    if (!measurer.trim()) return setError('请填写测量人');
    if (!measuredAt) return setError('请选择测量时间');

    onRegister(pointId, { ...nums, measurer: measurer.trim(), measuredAt });
    setError('');
    setWindSpeed('');
    setMethane('');
    setOxygen('');
    setTemperature('');
    setMeasuredAt(nowLocalInput());
  };

  return (
    <section className="panel">
      <h2>登记测量</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          测点
          <select value={pointId} onChange={(e) => setPointId(e.target.value)}>
            {points.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（{roadwayName(p.roadwayId)}）
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            风速 (m/s)
            <input type="number" step="0.1" min="0" value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} placeholder="如 1.6" />
          </label>
          <label>
            甲烷 (%)
            <input type="number" step="0.01" min="0" value={methane} onChange={(e) => setMethane(e.target.value)} placeholder="如 0.45" />
          </label>
          <label>
            氧气 (%)
            <input type="number" step="0.1" min="0" value={oxygen} onChange={(e) => setOxygen(e.target.value)} placeholder="如 20.5" />
          </label>
          <label>
            温度 (℃)
            <input type="number" step="0.5" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="如 24" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            测量人
            <input value={measurer} onChange={(e) => setMeasurer(e.target.value)} placeholder="姓名" />
          </label>
          <label>
            测量时间
            <input type="datetime-local" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block">
          登记测量
        </button>
        <p className="hint">判定规则：风速 &lt; 1 m/s 或 甲烷 &gt; 1% → 待复核并移出巡检路线</p>
      </form>
    </section>
  );
}
