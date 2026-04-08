import React, { useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "SDE @ Amazon",
    text: "It's Time To DSA took away the decision fatigue. I used to spend 30 minutes just deciding what to solve. Now I log in, code, and leave.",
    avatar: "👨🏽‍💻"
  },
  {
    name: "Sarah Chen",
    role: "SWE @ Google",
    text: "The spaced repetition is a game-changer. It forced me to review Dynamic Programming problems just as I was about to forget them.",
    avatar: "👩🏻‍💻"
  },
  {
    name: "David Kim",
    role: "Frontend @ Meta",
    text: "I actually look forward to doing my daily problem now. The streak system keeps me insanely motivated.",
    avatar: "👨🏻‍💻"
  },
  {
    name: "Priya Patel",
    role: "SDE 2 @ Microsoft",
    text: "No more messy Notion templates or Google Sheets. The automated LeetCode syncing is pure magic.",
    avatar: "👩🏽‍💻"
  }
];

const TestimonialsCarousel = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.5;
      if (scrollPos >= el.scrollWidth / 2) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="section bg-base" style={{ overflow: 'hidden' }}>
      <div className="container" style={{ marginBottom: '40px' }}>
        <h2 className="section-title text-center reveal">Don't just take our word for it</h2>
      </div>

      {/* Manual infinite scroll implementation without external CSS utilities */}
      <div 
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '24px',
          padding: '24px',
          overflowX: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        {/* Double the array for infinite loop effect */}
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
          <div 
            key={idx} 
            className="bento-card" 
            style={{
              minWidth: '350px',
              maxWidth: '350px',
              whiteSpace: 'normal',
              flex: '0 0 auto',
              background: 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--indigo-400)' }}>{t.role}</div>
              </div>
            </div>
            <p style={{ color: 'var(--slate-400)', fontStyle: 'italic', lineHeight: '1.6' }}>"{t.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
