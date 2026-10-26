import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CopilotIcon,
  PlusIcon,
  RepoIcon,
  SearchIcon,
  XIcon,
} from "@primer/octicons-react";
import { PlaybackControl } from "./PlaybackControl";
import { AnimationCursor, useMeasuredCursorPath } from "./AnimationCursor";
import { animationClick, productEase, useAnimationTime, useLoopReset } from "./AnimationTimeline";
import { ProductControlFeedback } from "./ProductControlFeedback";
import { PlayIcon } from "./PlayIcon";
import artwork from "./copilot-automations.png";
import styles from "./ProductInteraction.module.css";
import pageStyles from "./styles.module.css";

export function AutomationsVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const [elapsed, setTime] = useAnimationTime(7000, true, "automations");

  const [reducedMotion, setReducedMotion] = useState(false);

  const time = reducedMotion ? 6500 : elapsed;

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");

    function updatePreference() {
      setReducedMotion(preference.matches);
    }
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useLoopReset(ref, time, 7000, !reducedMotion);

  const [playing, setPlaying] = useState(true);

  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));

    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !inView || reducedMotion) return;
    let frame: number;

    let last = performance.now();

    function advance(now: number) {
      const delta = Math.min(100, now - last);

      setTime((value) => value + delta);
      last = now;
      frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing, inView, reducedMotion, setTime]);
  const [x, y] = useMeasuredCursorPath(ref, time, [
    [200, -60, 600],
    [750, 150, 490, "triage"],
    [2070, 150, 490, "triage"],
    [2620, 200, 520, "automation-project"],
    [3440, 200, 520, "automation-project"],
    [3990, 210, 350, "automation-repo"],
    [4810, 210, 350, "automation-repo"],
    [5360, 620, 617, "automation-create"],
    [5680, 620, 617, "automation-create"],
    [6230, 870, 660],
  ]);

  const openClick = animationClick(time, 850);

  const projectClick = animationClick(time, 2720);

  const repoClick = animationClick(time, 4090);

  const createClick = animationClick(time, 5460);

  const open = openClick.released && !createClick.released;

  const pickerOpen = projectClick.released && !repoClick.released;

  const pickerReveal = productEase((time - projectClick.release) / 200);

  const resultFraming = productEase((time - createClick.release) / 550);

  const click =
    time >= 5460 ? createClick : time >= 4090 ? repoClick : time >= 2720 ? projectClick : openClick;

  return (
    <>
      <div
        ref={ref}
        className={styles.automations}
        data-animation-time={time}
        data-automation-open={open}
        data-automation-picker-open={pickerOpen}
        data-automation-project={repoClick.released}
        data-automation-created={createClick.released}
        role="img"
        aria-label="Create a daily Issue triage automation at 09:00 for the mona-security repository, then view its card in Your automations."
      >
        <div
          className={styles.automationsScene}
          style={{
            transform: `translate(-50%, -50%) scale(${1 + 0.8 * resultFraming}) translate(${418 * resultFraming}px, ${7.5 * resultFraming}px)`,
          }}
        >
          <img src={artwork} alt="" />
          <ProductControlFeedback
            image={artwork}
            rect={[75, 470, 412, 206]}
            target="triage"
            hovered={time >= 750 && !openClick.released}
            pressed={openClick.pressing}
          />
          {createClick.released && (
            <div className={styles.automationResult}>
              <h2>Your automations</h2>
              <p>
                Use agents to handle recurring work
                <br />
                on a cadence you choose.
              </p>
              <article className={styles.automationResultCard}>
                <div>
                  <strong>Issue triage</strong>
                  <span>Daily</span>
                </div>
                <p>Review the latest GitHub issues and propose priorities and owners.</p>
                <footer>
                  mona-security{" "}
                  <span aria-label="Run">
                    <PlayIcon size={24} />
                  </span>
                </footer>
              </article>
            </div>
          )}
        </div>
        <div className={styles.automationDialogLayer} hidden={!open}>
          <div className={styles.automationDialog} data-automation-dialog>
            <header>
              <strong>New automation</strong>
              <button type="button" aria-label="Close">
                <XIcon size={16} />
              </button>
            </header>
            <div className={styles.automationDialogBody}>
              <label>
                Name
                <input aria-label="Name" value="Issue triage" readOnly />
              </label>
              <div className={styles.automationSchedule}>
                <label>
                  Interval
                  <button type="button">
                    Daily <ChevronDownIcon size={16} />
                  </button>
                </label>
                <label>
                  Hours
                  <button type="button">
                    09:00 <ChevronDownIcon size={16} />
                  </button>
                </label>
                <label>
                  Minute
                  <button type="button">
                    :00 <ChevronDownIcon size={16} />
                  </button>
                </label>
              </div>
              <label>Prompt</label>
              <div className={styles.automationPrompt}>
                <p>Review the latest GitHub issues and propose priorities and owners.</p>
                <div>
                  <span>
                    <PlusIcon size={16} /> <CopilotIcon size={16} /> Agent{" "}
                    <ChevronDownIcon size={12} />
                  </span>
                  <span>
                    Copilot Fusion · High <ChevronDownIcon size={12} />
                  </span>
                </div>
              </div>
              <div className={styles.automationProjectRow}>
                <div className={styles.automationProjectPicker}>
                  <button
                    type="button"
                    className={styles.automationProject}
                    data-cursor-target="automation-project"
                    data-hover={time >= 2620 && !repoClick.released}
                    data-pressed={projectClick.pressing}
                  >
                    <RepoIcon size={16} /> {repoClick.released ? "mona-security" : "Select project"}{" "}
                    <ChevronDownIcon size={16} />
                  </button>
                  {pickerOpen && (
                    <div
                      className={styles.automationProjectMenu}
                      style={{
                        opacity: pickerReveal,
                        transform: `scale(${0.95 + 0.05 * pickerReveal})`,
                      }}
                    >
                      <div>
                        <input
                          placeholder="Search projects..."
                          readOnly
                          aria-label="Search projects"
                        />
                        <SearchIcon size={16} />
                      </div>
                      <ul>
                        {[
                          "mona-security",
                          "github-app",
                          "design-token-explorer",
                          "paper-cranes-lab",
                          "portrait-studio",
                        ].map((name, index) => (
                          <li
                            key={name}
                            data-cursor-target={index === 0 ? "automation-repo" : undefined}
                            data-hover={index === 0 && time >= 3990}
                            data-pressed={index === 0 && repoClick.pressing}
                          >
                            <RepoIcon size={16} /> {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {repoClick.released ? (
                  <button type="button" className={styles.automationProject}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.automationWorktreeIcon}
                      aria-hidden="true"
                    >
                      <path d="M16 3h5v5" />
                      <path d="M8 3H3v5" />
                      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
                      <path d="m15 9 6-6" />
                    </svg>{" "}
                    New worktree <ChevronDownIcon size={16} />
                  </button>
                ) : (
                  <p className={styles.automationHint}>
                    Without a project, this automation will run as a chat.
                  </p>
                )}
              </div>
            </div>
            <footer>
              <p className={styles.automationHint}>
                Use Create and run from the menu to test your prompt right away.
              </p>
              <div>
                <button type="button">Cancel</button>
                <span className={styles.automationCreate}>
                  <button
                    type="button"
                    data-cursor-target="automation-create"
                    data-hover={time >= 5360 && !createClick.released}
                    data-pressed={createClick.pressing}
                  >
                    Create
                  </button>
                  <button type="button" aria-label="More create options">
                    <ChevronDownIcon size={16} />
                  </button>
                </span>
              </div>
            </footer>
          </div>
        </div>
        <div
          className={pageStyles.aiFindingsCursor}
          data-clicking={click.pressing}
          style={{
            transform: `translate(${x}px, ${y}px)`,
            opacity: time >= 200 && time < 6230 ? 1 : 0,
          }}
        >
          <AnimationCursor clickAge={click.age} />
        </div>
      </div>
      <PlaybackControl
        complete={false}
        playing={playing}
        label="Copilot automations animation"
        onClick={() => setPlaying((value) => !value)}
      />
    </>
  );
}
