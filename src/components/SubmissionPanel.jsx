import { fmtTime, validateSubmission } from '../domain.js';

export default function SubmissionPanel({ state, onSubmit }) {
  const reasons = validateSubmission(state);
  const ready = reasons.length === 0;

  return (
    <section className="panel submit-panel">
      <div className="submit-head">
        <div>
          <h2>整次巡检提交</h2>
          {ready ? (
            <p className="submit-ok">✓ 当前全部测点正常、路线容量未满，可以提交</p>
          ) : (
            <ul className="submit-reasons">
              {reasons.map((r) => (
                <li key={r}>✕ {r}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="btn btn-accent btn-lg" onClick={onSubmit}>
          提交整次巡检
        </button>
      </div>

      <h3 className="log-title">提交记录</h3>
      {state.submissions.length === 0 ? (
        <p className="muted">暂无提交记录</p>
      ) : (
        <ul className="log">
          {state.submissions.map((s) => (
            <li key={s.id} className={`log-item log-${s.result}`}>
              <span className="log-time">{fmtTime(s.at)}</span>
              <span className={`badge ${s.result === 'accepted' ? 'badge-ok' : 'badge-bad'}`}>
                {s.result === 'accepted' ? '已受理' : '已拒绝'}
              </span>
              <span className="log-detail">
                {s.result === 'accepted'
                  ? s.summary
                  : `${s.reasons.join('；')}（测点、路线与原始记录均未改动）`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
