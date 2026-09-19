import { useState } from 'react';
import { needsReview, RULES } from '../model.js';

function toLocalInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY = {
  windSpeed: '',
  methane: '',
  oxygen: '',
  temperature: '',
  measurer: '',
  measuredAt: '',
};

export default function MeasureForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    measuredAt: initial?.measuredAt || toLocalInputValue(),
  }));
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const willReview =
    form.windSpeed !== '' &&
    form.methane !== '' &&
    needsReview({ windSpeed: form.windSpeed, methane: form.methane });

  function handleSubmit(e) {
    e.preventDefault();
    const values = {
      windSpeed: parseFloat(form.windSpeed),
      methane: parseFloat(form.methane),
      oxygen: parseFloat(form.oxygen),
      temperature: parseFloat(form.temperature),
      measurer: form.measurer.trim(),
      measuredAt: form.measuredAt,
    };
    if (
      [values.windSpeed, values.methane, values.oxygen, values.temperature].some(Number.isNaN) ||
      !values.measurer ||
      !values.measuredAt
    ) {
      setError('请完整填写全部字段');
      return;
    }
    onSave(values);
  }

  return (
    <form className="measure-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          风速 (m/s)
          <input type="number" step="0.1" min="0" value={form.windSpeed} onChange={set('windSpeed')} placeholder="≥ 1.0" />
        </label>
        <label>
          甲烷 (%)
          <input type="number" step="0.01" min="0" value={form.methane} onChange={set('methane')} placeholder="≤ 1.0" />
        </label>
        <label>
          氧气 (%)
          <input type="number" step="0.1" min="0" value={form.oxygen} onChange={set('oxygen')} placeholder="如 20.5" />
        </label>
        <label>
          温度 (°C)
          <input type="number" step="0.5" value={form.temperature} onChange={set('temperature')} placeholder="如 24" />
        </label>
        <label>
          测量人
          <input type="text" value={form.measurer} onChange={set('measurer')} placeholder="姓名" />
        </label>
        <label>
          测量时间
          <input type="datetime-local" value={form.measuredAt} onChange={set('measuredAt')} />
        </label>
      </div>
      {willReview && (
        <p className="form-warning">
          风速低于 {RULES.MIN_WIND_SPEED} m/s 或甲烷超过 {RULES.MAX_METHANE}%，保存后该测点将进入待复核
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn primary">保存登记</button>
        <button type="button" className="btn" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}
