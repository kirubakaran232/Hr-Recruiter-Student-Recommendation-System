export default function ScoreRing({ score = 0, label = 'Talent Score' }) {
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className='score-badge-circle'>
      <span className='score-val'>{clampedScore}</span>
      <span className='score-lbl'>{label}</span>
    </div>
  );
}
