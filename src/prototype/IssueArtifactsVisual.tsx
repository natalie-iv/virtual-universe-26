import {
  useAnimationTime,
  LOOP_RESET_MS,
  productEase,
  animationClick,
  useLoopReset,
} from "./AnimationTimeline";
import {
  CodeIcon,
  FileIcon,
  ChecklistIcon,
  IssueOpenedIcon,
  LinkIcon,
} from "@primer/octicons-react";
import { SecurityReviewSession } from "./SecurityReviewSession";
import { useEffect, useRef, useState } from "react";
import { PlaybackControl } from "./PlaybackControl";
import { AnimationCursor, useMeasuredCursorPath } from "./AnimationCursor";
import { ProductControlFeedback } from "./ProductControlFeedback";
import startFrame from "./issue-artifacts-start.png";
import artifactPanel from "./issue-artifacts-panel.png";
import styles from "./ArtifactAnimation.module.css";

const artifactCreatedAt = 10200;

// Match Automations' 720 ms result hold before the reset's 200 ms lead-in.
const duration = artifactCreatedAt + 920;

function progress(time: number, start: number, end: number) {
  const value = Math.max(0, Math.min(1, (time - start) / (end - start)));

  return productEase(value);
}

export function IssueArtifactsVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  const loopRef = useRef<HTMLDivElement>(null);

  const [playbackTime, setElapsed] = useAnimationTime(duration, true, "artifacts");

  const elapsed = playbackTime;

  const [inView, setInView] = useState(false);

  const [playing, setPlaying] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);

  useLoopReset(loopRef, elapsed, duration, !reducedMotion);

  const complete = elapsed >= duration + LOOP_RESET_MS;

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");

    function updatePreference() {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setElapsed(duration);
        setPlaying(false);
      }
    }

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, [setElapsed]);

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
    if (!inView || !playing || complete || reducedMotion) return;

    let previousTime = performance.now();

    let frame: number;

    function advance(now: number) {
      const delta = Math.min(100, now - previousTime);

      previousTime = now;
      setElapsed((value) => value + delta);
      frame = requestAnimationFrame(advance);
    }

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [inView, playing, complete, reducedMotion, setElapsed]);

  const [cursorX, cursorY] = useMeasuredCursorPath(containerRef, elapsed, [
    [200, 2100, 850],
    [750, 370, 990, "artifact"],
    [2070, 370, 990, "artifact"],
    [2620, 1762, 50, "close-artifact"],
    [3440, 1762, 50, "close-artifact"],
    [3990, 1695, 726, "add-artifact"],
    [4810, 1695, 726, "add-artifact"],
    [5360, 1536, 1042, "create-artifact"],
    [5680, 1536, 1042, "create-artifact"],
    [6230, 2030, 1042],
  ]);

  const openClick = animationClick(elapsed, 850);

  const closeClick = animationClick(elapsed, 2720);

  const menuClick = animationClick(elapsed, 4090);

  const createClick = animationClick(elapsed, 5460);

  const artifactHovered = elapsed >= 750 && !openClick.released;

  const panelVisible = openClick.released && elapsed < closeClick.release + 200;

  const panelProgress =
    progress(elapsed, openClick.release, openClick.release + 200) *
    (1 - progress(elapsed, closeClick.release, closeClick.release + 200));

  const menuOpen = menuClick.released && !createClick.released;

  const artifactCreated = elapsed >= artifactCreatedAt;

  const menuProgress =
    progress(elapsed, menuClick.release, menuClick.release + 200) * Number(!createClick.released);

  const clicking =
    openClick.pressing || closeClick.pressing || menuClick.pressing || createClick.pressing;

  return (
    <div
      ref={containerRef}
      className={styles.issueArtifactsVisual}
      role="group"
      aria-label="Issue artifacts animation: open an artifact, then send the create-issue-artifact command. Copilot creates a rollout checklist and attaches it to the issue."
      data-animation-time={elapsed}
      data-artifact-stage={
        createClick.released
          ? "workspace"
          : menuOpen
            ? "menu"
            : closeClick.released && panelVisible
              ? "closing"
              : panelVisible
                ? "panel"
                : artifactHovered
                  ? "artifact"
                  : "start"
      }
    >
      <div ref={loopRef} className={styles.issueArtifactsLoop}>
        <div className={styles.issueArtifactsScene} aria-hidden="true">
          <div className={styles.issueArtifactsArtwork}>
            <img className={styles.issueArtifactsImage} src={startFrame} alt="" />
            {menuOpen && (
              <div
                className={styles.issueArtifactsMenu}
                aria-hidden="true"
                style={{ opacity: reducedMotion ? 1 : menuProgress }}
              >
                <div className={styles.issueArtifactsMenuItem}>
                  <LinkIcon size={28} />
                  <span>Add link</span>
                </div>
                <div
                  className={styles.issueArtifactsMenuItem}
                  data-cursor-target="create-artifact"
                >
                  <FileIcon size={28} />
                  <span>Create artifact</span>
                </div>
                <div className={styles.issueArtifactsMenuItem}>
                  <CodeIcon size={28} />
                  <span>Create HTML artifact</span>
                </div>
              </div>
            )}
            {artifactCreated && (
              <>
                <span className={styles.issueArtifactsCount}>4</span>
                <div className={styles.issueArtifactsUpdatedList}>
                  {[
                    "Plan: Issues Page Header Redesign",
                    "Design doc",
                    "API contract draft",
                    "Rollout checklist",
                  ].map((name, index) => (
                    <div key={name}>
                      {index === 0 ? <ChecklistIcon size={32} /> : <FileIcon size={32} />}
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {panelVisible && (
              <>
                <div
                  className={styles.issueArtifactsVeil}
                  style={{ opacity: panelProgress * 0.5 }}
                />
                <img
                  className={styles.issueArtifactsPanel}
                  src={artifactPanel}
                  alt=""
                  style={{ opacity: panelProgress }}
                />
              </>
            )}
            <div
              className={styles.issueArtifactsParent}
              data-dimmed={panelVisible}
              style={{
                clipPath: panelVisible ? "inset(0 16px 0 0)" : undefined,
              }}
            >
              <IssueOpenedIcon size={28} />
              <span>Parent:</span>
              <span>[Initiative] Improve the developer onboarding experience</span>
            </div>
            {!menuOpen && !createClick.released && !panelVisible && (
              <ProductControlFeedback
                image={startFrame}
                target="artifact"
                rect={[100, 952, 1620, 96]}
                variant="invisible"
                hovered={artifactHovered}
                pressed={openClick.pressing}
              />
            )}
            {!panelVisible && !createClick.released && (
              <ProductControlFeedback
                image={startFrame}
                target="add-artifact"
                rect={[1664, 698, 64, 56]}
                variant="invisible"
                hovered={elapsed >= 3990 && !menuClick.released}
                pressed={menuClick.pressing}
              />
            )}
            {panelVisible && (
              <div style={{ position: "absolute", left: 1030, top: 0 }}>
                <ProductControlFeedback
                  image={artifactPanel}
                  target="close-artifact"
                  rect={[708, 26, 48, 48]}
                  variant="invisible"
                  hovered={elapsed >= 2620 && !closeClick.released}
                  pressed={closeClick.pressing}
                />
              </div>
            )}
            {createClick.released && (
              <div className={styles.artifactWorkspace}>
                <SecurityReviewSession
                  showControls={false}
                  artifactDraft="/create-issue-artifact write a rollout checklist for the header redesign"
                  artifactElapsed={elapsed - createClick.release}
                />
              </div>
            )}
          </div>
          <div
            className={styles.aiFindingsCursor}
            data-clicking={clicking}
            style={{
              transform: `translate(${cursorX}px, ${cursorY}px)`,
              opacity: elapsed >= 200 && elapsed < createClick.release && !reducedMotion ? 1 : 0,
            }}
          >
            <AnimationCursor
              clickAge={
                elapsed >= 5460
                  ? createClick.age
                  : elapsed >= 4090
                    ? menuClick.age
                    : elapsed >= 2720
                      ? closeClick.age
                      : openClick.age
              }
            />
          </div>
        </div>
      </div>
      <span className={styles.aiFindingsAccessibleStatus} role="status">
        {artifactCreated
          ? "Rollout checklist created and attached. Issue with four attached artifacts."
          : createClick.released
            ? "Creating a rollout checklist in the linked conversation."
            : menuOpen
              ? "Artifacts menu open."
              : closeClick.released && panelVisible
                ? "API contract draft panel closing."
                : panelVisible
                  ? "API contract draft panel open with endpoint details and response shape."
                  : artifactHovered
                    ? "API contract draft highlighted in the artifact list."
                    : "Issue with three attached artifacts."}
      </span>
      <PlaybackControl
        complete={complete}
        playing={playing}
        label="issue artifacts animation"
        onClick={() => {
          if (complete) {
            setElapsed(0);
            setPlaying(true);
          } else {
            setPlaying((value) => !value);
          }
        }}
      />
    </div>
  );
}
