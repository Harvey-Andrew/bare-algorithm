import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="landing-s2">
      <div className="landing-s2-bg" />
      <div className="landing-s2-grid" />

      <div className="landing-node-field">
        <div
          className="landing-node"
          style={{
            top: '20%',
            left: '10%',
            animationDelay: '0s',
            background: 'rgba(59,130,246,0.6)',
          }}
        />
        <div
          className="landing-node"
          style={{
            top: '70%',
            left: '15%',
            animationDelay: '1s',
            background: 'rgba(139,92,246,0.5)',
          }}
        />
        <div
          className="landing-node"
          style={{
            top: '30%',
            right: '12%',
            animationDelay: '2s',
            background: 'rgba(236,72,153,0.5)',
          }}
        />
        <div
          className="landing-node"
          style={{
            top: '60%',
            right: '20%',
            animationDelay: '3s',
            background: 'rgba(59,130,246,0.4)',
          }}
        />
        <div
          className="landing-node"
          style={{
            top: '85%',
            left: '40%',
            animationDelay: '1.5s',
            background: 'rgba(139,92,246,0.6)',
          }}
        />
      </div>

      <div className="landing-s2-eyebrow">
        <span>✦</span> Bare Algo <span>✦</span>
      </div>

      <h1 className="landing-s2-headline">
        <span className="line2">朴素算法</span>
      </h1>

      <p className="landing-s2-slogan">
        <span className="landing-s2-slogan-en">看见，即理解。</span>
      </p>

      <div className="landing-s2-cta">
        <Link href="/problems" className="landing-btn-glow">
          开始探索 →
        </Link>
      </div>
    </div>
  );
}
