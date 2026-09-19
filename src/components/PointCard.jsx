import { useState } from 'react';
import MeasureForm from './MeasureForm.jsx';
import { RULES } from '../model.js';

const STATUS = {
  none: { label: '未测量', cls: 'badge muted' },
  normal: { label: '正常', cls: 'badge ok' },
  pending: { label: '待复核', cls: 'badge warn' },
};

function fmtTime(t) {
  return t ? t.replace('T', ' ') : '—';
}

export default function PointCard({ point, roadwayName, measurement, onRegister, onRelease }) {
  const [editing, setEditing] = useState(false);
  const [reviewer, setReviewer] = useState('');

  const status = !measurement ? 'none' : measurement.status;
  const badge = STATUS[status];
  const windBad = measurement && Number(measurement.windSpeed) < RULES.MIN_WIND_SPEED;
  const methaneBad = measurement && Number(measurement.methane) > RULES.MAX_METHANE;

  return (
    <div className={`card point-card ${status === 'pending' ? 'is-pending' : ''}`}>
      <div className="card-head">
        <div>
          <h3>{point.name}</h3>
          <span className="roadway">{roadwayName}</span>
        </div>
        <span className={badge.cls}>{badge.label}</span>
      </div>

      {measurement ? (
        <dl className="values">
          <div className={windBad ? 'bad' : ''}>
            <dt>风速</dt>
            <dd>{measurement.windSpeed} m/s</dd>
          </div>
          <div className={methaneBad ? 'bad' : ''}>
            <dt>甲烷</dt>
            <dd>{measurement.methane} %</dd>
          </div>
          <div>
            <dt>氧气</dt>
            <dd>{measurement.oxygen} %</dd>
          </div>
          <div>
            <dt>温度</dt>
            <dd>{measurement.temperature} °C</dd>
          </div>
          <div>
            <dt>测量人</dt>
            <dd>{measurement.measurer}</dd>
          </div>
          <div>
            <dt>测量时间</dt>
            <dd>{fmtTime(measurement.measuredAt)}</dd>
          </div>
        </dl>
      ) : (
        <p className="empty">尚未登记测量数据</p>
      )}

      {measurement?.review && (
        <p className="review-info">
          已复核放行：{measurement.review.reviewer} · {fmtTime(measurement.review.reviewedAt)}
        </p>
      )}

      {status === 'pending' && (
        <div className="review-box">
          <input
            type="text"
            placeholder="复核人姓名"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
          />
          <button
            className="btn primary"
            disabled={!reviewer.trim()}
            onClick={() => {
              onRelease(point.id, reviewer.trim());
              setReviewer('');
            }}
          >
            复核放行
          </button>
        </div>
      )}

      {editing ? (
        <MeasureForm
          initial={measurement}
          onSave={(values) => {
            onRegister(point.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <button className="btn block" onClick={() => setEditing(true)}>
          {measurement ? '重新登记' : '登记测量'}
        </button>
      )}
    </div>
  );
}
