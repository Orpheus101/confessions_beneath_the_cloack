import { useState, useEffect, useRef } from "react";

const letters = [
  {
    id: "A",
    title: "The Door I Closed",
    color: "#8BA8C4",
    warmColor: "#6B8FAD",
    phase: "opening",
    preview: "It took me time…",
    content: `for you... Ihsan…

It took me time, maybe more than I'd ever admit, to understand what was happening inside me.

I had once known love, and it left in silence what words could never repair, so I convinced myself that some doors are better left closed… forever.`,
    quote: null,
    ambience: "rain",
  },
  {
    id: "B",
    title: "A Calm I Didn't Question",
    color: "#A89070",
    warmColor: "#C4A882",
    phase: "rising",
    preview: "Then you found your way back…",
    content: `Then, somehow, you found your way back into my life.

At first, you were simply that rare kind of presence — a calm I didn't question, a friendship that felt like one of those golden moments we don't notice while living them, only after.

But slowly, quietly, something shifted.`,
    quote: null,
    ambience: "warmth",
  },
  {
    id: "C",
    title: "A Melody Growing",
    color: "#B8956A",
    warmColor: "#D4AA7A",
    phase: "rising",
    preview: "Like a melody in the background…",
    content: `It wasn't sudden — it was like a melody growing in the background… the kind that changes your whole mood without asking permission.

Even the smallest conversations with you had this strange power to turn emptiness into something warm, almost alive.

And I kept telling myself it was nothing. Yet the truth has a way of echoing, no matter how deeply we try to bury it.`,
    quote: null,
    ambience: "warmth",
  },
  {
    id: "D",
    title: "You Are Not Alone",
    color: "#C4955A",
    warmColor: "#E0A860",
    phase: "shift",
    preview: "Like Michael Jackson once said…",
    content: `I don't know how much time life gives us — days or years, none of it is promised.

But I do know that silence can sometimes be more unfair than any risk. Especially when it concerns someone who became… this important.`,
    quote: { text: "You are not alone, I am here with you", author: "Michael Jackson" },
    ambience: "vinyl",
  },
  {
    id: "E",
    title: "The Best of Me",
    color: "#C8A06A",
    warmColor: "#E8B870",
    phase: "confession",
    preview: "You gave me the best of me…",
    content: `Somehow, with you, I felt something I hadn't in a long time.

And maybe it sounds strange, but there's a line that stayed with me…`,
    quote: { text: "You gave me the best of me", author: "BTS" },
    ambience: "peak",
  },
  {
    id: "F",
    title: "As Boundless As the Sea",
    color: "#D4B080",
    warmColor: "#F0C880",
    phase: "closing",
    preview: "So instead of hiding…",
    content: `So instead of hiding behind distance or silence, I wanted to say it in a way that feels true to who I am.

And maybe that's the closest I can get to saying it… without breaking the quiet that made it grow in the first place.`,
    quote: { text: "My bounty is as boundless as the sea, my love as deep", author: "William Shakespeare" },
    ambience: "fade",
  },
];

const phaseColors = {
  opening: { bg: "#0F1A26", text: "#8BA8C4", grain: 0.06 },
  rising: { bg: "#1A1408", text: "#C4A882", grain: 0.04 },
  shift: { bg: "#1A0E08", text: "#D4AA7A", grain: 0.04 },
  confession: { bg: "#0D0A04", text: "#E8C890", grain: 0.03 },
  closing: { bg: "#1A1208", text: "#F0D8A8", grain: 0.02 },
};

function GrainOverlay({ opacity }) {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100, opacity }} xmlns="http://www.w3.org/2000/svg">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="overlay" result="blend" />
        <feComposite in="blend" in2="SourceGraphic" operator="in" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.4" />
    </svg>
  );
}

function Particles({ phase }) {
  const count = phase === "opening" ? 20 : phase === "closing" ? 8 : 12;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            borderRadius: "50%",
            background: phase === "opening" ? "rgba(139,168,196,0.4)" : "rgba(240,200,128,0.3)",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: Math.random() * 8 + "s",
          }}
        />
      ))}
    </div>
  );
}

export default function ConfessionGame() {
  const [opened, setOpened] = useState([]);
  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState("opening");
  const [contentVisible, setContentVisible] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [allRead, setAllRead] = useState(false);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const bgNodesRef = useRef([]);

  useEffect(() => {
    if (opened.length === letters.length) {
      setTimeout(() => setAllRead(true), 800);
    }
  }, [opened]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0.08;
      gainRef.current.connect(audioCtxRef.current.destination);
    }
    return audioCtxRef.current;
  };

  const stopAllAudio = () => {
    oscillatorsRef.current.forEach(o => { try { o.stop(); } catch {} });
    bgNodesRef.current.forEach(o => { try { o.stop(); } catch {} });
    oscillatorsRef.current = [];
    bgNodesRef.current = [];
  };

  const playAmbience = (type) => {
    stopAllAudio();
    const ctx = getAudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    const baseNotes = {
      rain: [220, 277, 330, 415],
      warmth: [261, 329, 392, 493],
      vinyl: [293, 370, 440, 587],
      peak: [349, 440, 523, 659],
      fade: [261, 329, 415, 523],
    }[type] || [220, 277, 330];

    baseNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = 0.015 / (i + 1);

      // Add subtle tremolo
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.3 + i * 0.1;
      lfoGain.gain.value = 0.003;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      lfo.start();

      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      oscillatorsRef.current.push(osc, lfo);
    });

    // Noise for rain/grain feel
    if (type === "rain" || type === "opening") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.04;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = type === "rain" ? 800 : 2000;
      filter.Q.value = 0.5;
      source.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      source.start();
      bgNodesRef.current.push(source);
    }
  };

  const openLetter = (letter) => {
    playAmbience(letter.ambience);
    setActive(letter);
    setPhase(letter.phase);
    setContentVisible(false);
    setQuoteVisible(false);
    if (!opened.includes(letter.id)) setOpened(p => [...p, letter.id]);
    setTimeout(() => setContentVisible(true), 300);
    if (letter.quote) setTimeout(() => setQuoteVisible(true), 2200);
  };

  const closeLetter = () => {
    setContentVisible(false);
    setQuoteVisible(false);
    setTimeout(() => {
      setActive(null);
      stopAllAudio();
    }, 600);
  };

  const colors = phaseColors[phase];

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      transition: "background 2s ease",
      fontFamily: "'Crimson Text', 'Georgia', serif",
      position: "relative",
      overflow: "hidden",
      cursor: "default",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-20px) translateX(8px); opacity: 0.6; }
          66% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInSlow {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes letterFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--r)); }
          50% { transform: translateY(-6px) rotate(var(--r)); }
        }

        @keyframes shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 0.9; }
          100% { opacity: 0.4; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes quoteIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .letter-envelope {
          position: relative;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .letter-envelope:hover {
          transform: translateY(-8px) rotate(0deg) scale(1.05) !important;
        }

        .letter-envelope:hover .envelope-flap {
          transform: rotateX(-30deg);
        }

        .envelope-flap {
          transition: transform 0.4s ease;
          transform-origin: top center;
          transform-style: preserve-3d;
        }

        .close-btn:hover {
          opacity: 1 !important;
        }

        .intro-text {
          animation: slideUp 1.2s ease forwards;
        }

        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <GrainOverlay opacity={colors.grain} />
      <Particles phase={phase} />

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Intro screen */}
      {introVisible && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "#0A0F16",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "2rem",
          animation: "fadeInSlow 1s ease",
        }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: "0 2rem" }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px",
              letterSpacing: "0.3em",
              color: "#4A6A8A",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
              animation: "fadeIn 1s ease 0.3s both",
            }}>A letter, in six parts</p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              color: "#8BA8C4",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
              animation: "fadeIn 1s ease 0.6s both",
            }}>Sara7a Ihsan</h1>
            <p style={{
              fontSize: "15px",
              color: "#4A6A8A",
              lineHeight: 1.8,
              fontStyle: "italic",
              animation: "fadeIn 1s ease 0.9s both",
            }}>
              Six envelopes are waiting for you.<br />
              Each one holds a piece of something true.
            </p>
          </div>
          <button
            onClick={() => { setIntroVisible(false); playAmbience("rain"); }}
            style={{
              background: "transparent",
              border: "0.5px solid rgba(139,168,196,0.3)",
              color: "#8BA8C4",
              padding: "12px 36px",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px",
              letterSpacing: "0.2em",
              cursor: "pointer",
              transition: "all 0.3s ease",
              animation: "fadeIn 1s ease 1.5s both",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(139,168,196,0.7)"; e.target.style.color = "#B8C8D8"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(139,168,196,0.3)"; e.target.style.color = "#8BA8C4"; }}
          >
            open the room
          </button>
        </div>
      )}

      {/* Main room */}
      {!introVisible && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 10,
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem", animation: "fadeIn 1s ease 0.2s both" }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px",
              letterSpacing: "0.3em",
              color: phase === "opening" ? "#4A6A8A" : "#8A7050",
              textTransform: "uppercase",
              transition: "color 2s ease",
            }}>
              {opened.length} of {letters.length} opened
            </p>
            <div style={{
              width: "60px",
              height: "0.5px",
              background: phase === "opening" ? "#2A4A6A" : "#6A5030",
              margin: "12px auto",
              transition: "background 2s ease",
            }} />
          </div>

          {/* Envelopes grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(1rem, 3vw, 2.5rem)",
            maxWidth: "700px",
            width: "100%",
          }}>
            {letters.map((letter, i) => {
              const isOpened = opened.includes(letter.id);
              const rot = [-2, 1.5, -1, 2, -1.5, 1][i];
              return (
                <div
                  key={letter.id}
                  className="letter-envelope"
                  onClick={() => openLetter(letter)}
                  style={{
                    "--r": `${rot}deg`,
                    transform: `rotate(${rot}deg)`,
                    animation: `letterFloat ${6 + i * 0.7}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  {/* Envelope */}
                  <div style={{
                    background: isOpened
                      ? `linear-gradient(135deg, ${letter.warmColor}22, ${letter.warmColor}11)`
                      : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: `0.5px solid ${isOpened ? letter.warmColor + "50" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "4px",
                    padding: "1.5rem 1rem 1.2rem",
                    position: "relative",
                    transition: "all 0.6s ease",
                    aspectRatio: "3/2",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* Envelope V lines */}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 120 80">
                      <line x1="0" y1="0" x2="60" y2="35" stroke={letter.color} strokeWidth="0.5" />
                      <line x1="120" y1="0" x2="60" y2="35" stroke={letter.color} strokeWidth="0.5" />
                      <line x1="0" y1="80" x2="60" y2="45" stroke={letter.color} strokeWidth="0.5" />
                      <line x1="120" y1="80" x2="60" y2="45" stroke={letter.color} strokeWidth="0.5" />
                    </svg>

                    {/* Wax seal */}
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isOpened
                        ? `radial-gradient(circle, ${letter.warmColor}60, ${letter.warmColor}30)`
                        : "radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                      border: `0.5px solid ${isOpened ? letter.warmColor + "80" : "rgba(255,255,255,0.12)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      transition: "all 0.6s ease",
                      animation: isOpened ? "shimmer 3s ease-in-out infinite" : "none",
                    }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: isOpened ? letter.warmColor : "rgba(255,255,255,0.3)",
                        transition: "color 0.6s ease",
                      }}>{letter.id}</span>
                    </div>

                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "11px",
                      color: isOpened ? letter.warmColor + "CC" : "rgba(255,255,255,0.2)",
                      textAlign: "center",
                      transition: "color 0.6s ease",
                      lineHeight: 1.4,
                    }}>
                      {isOpened ? letter.preview : "···"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress line */}
          <div style={{ marginTop: "3rem", width: "200px", animation: "fadeIn 1s ease 0.8s both" }}>
            <div style={{
              height: "0.5px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${(opened.length / letters.length) * 100}%`,
                background: phase === "opening" ? "#8BA8C4" : "#D4AA7A",
                transition: "width 1s ease, background 2s ease",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Letter modal */}
      {active && (
        <div
          onClick={closeLetter}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
            backdropFilter: "blur(12px)",
            animation: "fadeInSlow 0.4s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: `linear-gradient(160deg, ${active.color}10, rgba(0,0,0,0.7))`,
              border: `0.5px solid ${active.color}30`,
              borderRadius: "4px",
              padding: "clamp(2rem, 5vw, 3.5rem)",
              maxWidth: "560px",
              width: "100%",
              position: "relative",
              maxHeight: "85vh",
              overflowY: "auto",
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {/* Decorative corner */}
            <div style={{
              position: "absolute", top: 16, left: 16, width: 20, height: 20,
              borderLeft: `0.5px solid ${active.color}40`,
              borderTop: `0.5px solid ${active.color}40`,
            }} />
            <div style={{
              position: "absolute", bottom: 16, right: 16, width: 20, height: 20,
              borderRight: `0.5px solid ${active.color}40`,
              borderBottom: `0.5px solid ${active.color}40`,
            }} />

            {/* Close */}
            <button
              className="close-btn"
              onClick={closeLetter}
              style={{
                position: "absolute", top: 16, right: 20,
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", fontSize: "18px",
                fontFamily: "'Cormorant Garamond', serif",
                opacity: 0.5, transition: "opacity 0.2s ease",
              }}
            >×</button>

            {/* Letter label */}
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: active.warmColor,
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}>
              Letter {active.id} — {active.title}
            </p>

            {/* Content */}
            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: "clamp(15px, 2.5vw, 17px)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
              letterSpacing: "0.01em",
            }}>
              {active.content}
            </div>

            {/* Quote */}
            {active.quote && (
              <div style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: `0.5px solid ${active.color}25`,
                opacity: quoteVisible ? 1 : 0,
                transform: quoteVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(16px, 2.5vw, 19px)",
                  color: active.warmColor,
                  lineHeight: 1.6,
                  marginBottom: "0.8rem",
                }}>
                  "{active.quote.text}"
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  color: `${active.warmColor}80`,
                  textTransform: "uppercase",
                }}>
                  — {active.quote.author}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All read ending */}
      {allRead && !active && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 250,
          background: "rgba(10,8,4,0.85)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "1.5rem",
          backdropFilter: "blur(8px)",
          animation: "fadeInSlow 1.5s ease",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "11px",
            letterSpacing: "0.3em",
            color: "#8A7050",
            textTransform: "uppercase",
            animation: "fadeIn 1s ease 0.5s both",
            opacity: 0,
          }}>now you know</p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            color: "#D4AA7A",
            textAlign: "center",
            maxWidth: 400,
            lineHeight: 1.4,
            animation: "fadeIn 1s ease 1s both",
            opacity: 0,
          }}>
            My bounty is as boundless<br />as the sea.
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "13px",
            color: "#6A5030",
            fontStyle: "italic",
            animation: "fadeIn 1s ease 2s both",
            opacity: 0,
          }}>— William Shakespeare</p>
          <button
            onClick={() => setAllRead(false)}
            style={{
              marginTop: "1rem",
              background: "transparent",
              border: "0.5px solid rgba(212,170,122,0.25)",
              color: "#8A7050",
              padding: "10px 28px",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "13px",
              letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.3s ease",
              animation: "fadeIn 1s ease 2.5s both",
              opacity: 0,
            }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(212,170,122,0.5)"; e.target.style.color = "#D4AA7A"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(212,170,122,0.25)"; e.target.style.color = "#8A7050"; }}
          >read again</button>
        </div>
      )}
    </div>
  );
}
