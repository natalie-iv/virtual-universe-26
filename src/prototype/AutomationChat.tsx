import { useEffect, useRef, useState } from "react";
import { Avatar, Text } from "@primer/react-brand";
import { PlaybackControl } from "./PlaybackControl";
import userAvatar from "./automation-user-avatar.png";
import copilotAvatar from "./copilot-avatar.webp";
import styles from "./styles.module.css";

const messages = [
  { from: "user", text: "Hi Copilot 👋" },
  { from: "user", text: "Can you turn new issues into suggested fixes for this repo?" },
  { from: "copilot", text: "I'm setting up an automation for all new issues to open draft PRs." },
  { from: "copilot", text: "Want me to try it now on a sample issue?" },
];

let nextMessageAt = 100;

const timeline = messages.map((message, index) => {
  const pendingAt = nextMessageAt;

  const shownAt = pendingAt + (index === 0 ? 400 : 1000);

  nextMessageAt = shownAt + message.text.length * 22 + 700;
  return { pendingAt, shownAt };
});

const duration = nextMessageAt;

export function AutomationChat() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [elapsed, setElapsed] = useState(0);

  const [inView, setInView] = useState(false);

  const [playing, setPlaying] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);

  const time = reducedMotion ? duration : elapsed;

  const complete = time >= duration;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updatePreference() {
      setReducedMotion(preference.matches);
    }

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !playing || reducedMotion || complete) return;

    let previousTime = performance.now();

    let frame: number;

    function advance(now: number) {
      const delta = Math.min(100, now - previousTime);

      previousTime = now;
      setElapsed((value) => Math.min(duration, value + delta));
      frame = requestAnimationFrame(advance);
    }

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [inView, playing, reducedMotion, complete]);

  return (
    <div
      ref={containerRef}
      className={styles.conversation}
      role="region"
      aria-label="Copilot automations animation"
    >
      <div className={styles.chatMessages}>
        {messages.map((message, index) => {
          const { pendingAt, shownAt } = timeline[index];

          const shown = time >= shownAt;

          const pending = !shown && time >= pendingAt;

          const isCopilot = message.from === "copilot";

          const showAvatar = index === 0 || messages[index - 1].from !== message.from;

          const count = Math.max(
            0,
            Math.min(message.text.length, Math.floor((time - shownAt) / 22) + 1),
          );

          const avatar = (
            <span className={styles.chatAvatar} data-hidden={!showAvatar}>
              <Avatar
                src={isCopilot ? copilotAvatar : userAvatar}
                alt=""
                size={{ narrow: 32, regular: 48 }}
              />
            </span>
          );

          return (
            <div
              key={message.text}
              className={isCopilot ? styles.assistantMessage : styles.userMessage}
              data-state={shown ? "shown" : pending ? "pending" : "waiting"}
              data-new-sender={showAvatar}
              aria-hidden={!shown}
            >
              {isCopilot && avatar}
              <div className={styles.bubble}>
                <Text as="p" size="200">
                  <span className={styles.chatAccessibleText}>{message.text}</span>
                  <span aria-hidden="true">{shown ? message.text.slice(0, count) : ""}</span>
                  <span aria-hidden="true" className={styles.chatUnwritten}>
                    {shown ? message.text.slice(count) : message.text}
                  </span>
                </Text>
                {pending && (
                  <span className={styles.typingDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
              {!isCopilot && avatar}
            </div>
          );
        })}
      </div>
      {!reducedMotion && (
        <PlaybackControl
          complete={complete}
          playing={playing}
          label="Copilot automations animation"
          onClick={() => {
            if (complete) {
              setElapsed(0);
              setPlaying(true);
            } else {
              setPlaying((value) => !value);
            }
          }}
        />
      )}
    </div>
  );
}
