import { useEffect, useReducer, useRef, useState } from 'react';
import {
  STORAGE_KEY,
  evaluateRecord,
  loadState,
  reducer,
  validateSubmission,
} from './domain.js';
import StatsBar from './components/StatsBar.jsx';
import PointCard from './components/PointCard.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import RouteTable from './components/RouteTable.jsx';
import SubmissionPanel from './components/SubmissionPanel.jsx';
import HistoryTable from './components/HistoryTable.jsx';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [notice, setNotice] = useState(null);
  const timer = useRef(null);

  // 数据只存浏览器本地：任何状态变化都写回 localStorage，刷新后保留
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (type, text) => {
    clearTimeout(timer.current);
    setNotice({ type, text });
    timer.current = setTimeout(() => setNotice(null), 6000);
  };

  const roadwayOf = (id) => state.roadways.find((r) => r.id === id);

  const handleRegister = (pointId, record) => {
    dispatch({ type: 'register', pointId, record });
    const point = state.points.find((p) => p.id === pointId);
    const issues = evaluateRecord(record);
    if (issues.length > 0) {
      flash('error', `${point.name} 已登记，但触发待复核（${issues.join('；')}），已移出巡检路线`);
    } else {
      flash('success', `${point.name} 已登记，数值正常，已占用巡检路线`);
    }
  };

  const handleRelease = (pointId, reviewer) => {
    const point = state.points.find((p) => p.id === pointId);
    dispatch({ type: 'release', pointId, reviewer });
    flash('success', `${point.name} 已复核放行，恢复占用巡检路线，卡片 / 路线 / 统计已同步`);
  };

  const handleSubmit = () => {
    const reasons = validateSubmission(state);
    dispatch({ type: 'submit' });
    if (reasons.length > 0) {
      flash('error', `整次巡检已拒绝：${reasons.join('；')}。测点、路线与原始记录均保持不变`);
    } else {
      flash('success', '整次巡检提交成功，已受理');
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要清空本机数据并恢复预置的三条巷道、四个测点吗？')) {
      dispatch({ type: 'reset' });
      flash('info', '已恢复预置数据');
    }
  };

  return (
    <div className="app">
      <div className="hazard" />
      <header className="app-header">
        <div>
          <h1>矿井通风测点复核台</h1>
          <p className="subtitle">
            风速 &lt; 1 m/s 或 甲烷 &gt; 1% 自动进入待复核，待复核测点不占用巡检路线；数据仅保存在本机浏览器
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          重置预置数据
        </button>
      </header>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button type="button" className="notice-close" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}

      <StatsBar state={state} />

      <main className="layout">
        <section className="panel">
          <h2>测点卡片</h2>
          <div className="points">
            {state.points.map((p) => (
              <PointCard key={p.id} point={p} roadway={roadwayOf(p.roadwayId)} onRelease={handleRelease} />
            ))}
          </div>
        </section>

        <aside className="side">
          <RegisterForm points={state.points} roadways={state.roadways} onRegister={handleRegister} />
          <RouteTable
            state={state}
            onCapacity={(roadwayId, capacity) => dispatch({ type: 'capacity', roadwayId, capacity })}
          />
        </aside>
      </main>

      <SubmissionPanel state={state} onSubmit={handleSubmit} />
      <HistoryTable state={state} />
    </div>
  );
}
