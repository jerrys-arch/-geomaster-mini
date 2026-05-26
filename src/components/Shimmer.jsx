const TimerBar = ({ remaining, total = 15 }) => {
  const pct = (remaining / total) * 100;
  const danger = remaining <= 5;

  return (
    <div style={{
      height: '10px',
      background: '#e0e0e0',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: danger ? '#e53935' : '#1976d2',
        borderRadius: '10px',
        transition: 'width 0.9s linear, background 0.3s',
      }} />
    </div>
  );
};

export default TimerBar;