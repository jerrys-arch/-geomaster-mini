const OptionButton = ({ label, onClick, disabled = false, status = null }) => {
  const getBg = () => {
    if (status === 'correct') return '#4caf50';
    if (status === 'wrong') return '#e53935';
    return '#ffffff';
  };

  const getColor = () => {
    if (status === 'correct' || status === 'wrong') return '#ffffff';
    return '#000000';
  };

  const getBorder = () => {
    if (status === 'correct') return '2px solid #4caf50';
    if (status === 'wrong') return '2px solid #e53935';
    return '2px solid #1976d2';
  };

  return (
    <button
      onClick={() => !disabled && onClick(label)}
      disabled={disabled}
      className={status === 'wrong' ? 'shake' : ''}
      style={{
        width: '100%',
        height: '55px',
        borderRadius: '15px',
        border: getBorder(),
        background: getBg(),
        color: getColor(),
        fontSize: '17px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: '12px',
        transition: 'background 0.2s, border 0.2s, color 0.2s',
        fontWeight: '500',
      }}
    >
      {label}
    </button>
  );
};

export default OptionButton;