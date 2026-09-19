import { useState } from 'react';
import { THRESHOLDS, fmtTime } from '../domain.js';

export default function PointCard({ point, roadway, onRelease }) {
  const [reviewer, setReviewer] = useState('安监员');
  const r = point.record;
  const pending = point.status === 'pending';
  const windBad = r && r.windSpeed < THRESHOLDS.windSpeedMin;
  const ch4Bad = r && r.methane > THRESHOLDS.methaneMax;

  return (
    <article className={`point-card ${pending ? 'point-pending' : ''}`}>
      <header className="point-head">
        <div>
          <h3>{point.name}</h3>
          <span className="tag">{roadway ? roadway.name : '未分配巷道'}</span>
        </div>
        <span className={`badge ${pending ? 'badge-bad' : 'badge-ok'}`}>
          {pending ? '待复核' : '正常'}
        </span>
      </header>

      {r ? (
        <div className="metrics">
          <div className={`metric ${windBad ? 'metric-bad' : ''}`}>
            <span className="metric-label">风速</span>
            <span className="metric-value">
              {r.windSpeed}
              <small> m/s</small>
            </span>
          </div>
          <div className={`metric ${ch4Bad ? 'metric-bad' : ''}`}>
            <span className="metric-label">甲烷</span>
            <span className="metric-value">
              {r.methane}
              <small> %</small>
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">氧气</span>
            <span className="metric-value">
              {r.oxygen}
              <small> %</small>
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">温度</span>
            <span className="metric-value">
              {r.temperature}
              <small> ℃</small>
            </span>
          </div>
        </div>
      ) : (
        <p className="muted">暂无测量记录</p>
      )}

      {r && (
        <p className="point-meta">
          测量人 {r.measurer} · 测量时间 {fmtTime(r.measuredAt)}
        </p>
      )}

      <p className={`route-line ${point.onRoute ? 'route-on' : 'route-off'}`}>
        {point.onRoute ? '● 已占用巡检路线' : '○ 未占用巡检路线'}
      </p>

      {pending ? (
        <div className="review-box">
          <input
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="复核人"
            aria-label="复核人"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onRelease(point.id, reviewer.trim() || '安监员')}
          >
            复核放行
          </button>
        </div>
      ) : (
        point.review && (
          <p className="review-note">
            已复核放行：{point.review.by} · {fmtTime(point.review.at)}
          </p>
        )
      )}
    </article>
  );
}
