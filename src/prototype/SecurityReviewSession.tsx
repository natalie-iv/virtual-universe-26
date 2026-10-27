import {
  useAnimationTime,
  useLoopReset,
  animationClick,
  productEase,
  typedLength,
  typingDuration,
  typingCaretVisible,
} from "./AnimationTimeline";
import {
  ArrowUpIcon,
  ZapIcon,
  ServerIcon,
  ChecklistIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashIcon,
  CopyIcon,
  FileIcon,
  FilterIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  KebabHorizontalIcon,
  ListUnorderedIcon,
  MarkGithubIcon,
  PauseIcon,
  PlusIcon,
  ScreenFullIcon,
  ShieldCheckIcon,
  TagIcon,
  TerminalIcon,
  ToolsIcon,
  XIcon,
} from "@primer/octicons-react";
import { Tooltip } from "@primer/react-brand";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import copilotAvatar from "./copilot-avatar.webp";
import womanAvatar from "./krayrizen-avatar.png";
import manAvatar from "./arturcraft-avatar.png";
import yellowAvatar from "./inesvibe-avatar.png";
import { PixelMona } from "./PixelMona";
import { monaGlide } from "./MonaTrail";
import { AnimationCursor, useMeasuredCursorPath } from "./AnimationCursor";
import homeFrame from "./ensemble-app-start.png";
import homeMona from "./security-home-mona.png";
import styles from "./ArtifactAnimation.module.css";
import pageStyles from "./styles.module.css";
import { PlayIcon } from "./PlayIcon";

export function UnreadDotIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="#0969da" />
    </svg>
  );
}

function OpenFolderIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function FolderIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export function ChatBubbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
      <path
        d="M8 2.25c3.2 0 5.75 2.4 5.75 5.375S11.2 13 8 13a6.3 6.3 0 0 1-2.2-.39L2.5 13.75l.95-2.85A5.2 5.2 0 0 1 2.25 7.625C2.25 4.65 4.8 2.25 8 2.25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AutomationsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 3H5M21 13V5a2 2 0 0 0-2-2M3 19a2 2 0 0 0 2 2M3 5v14M5 3a2 2 0 0 0-2 2m13 14 2 2 4-4M16 2v3M3 9h18M5 21h7.5M8 2v3" />
    </svg>
  );
}

export function CustomizeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
    </svg>
  );
}

function PanelToggleIcon({ side }: { side: "start" | "end" }) {
  const dividerX = side === "start" ? 6.5 : 9.5;

  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect
        x="1.75"
        y="1.75"
        width="12.5"
        height="12.5"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d={`M${dividerX} 2v12`} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const navItems = [
  { icon: PlusIcon, label: "New" },
  { icon: GitPullRequestIcon, label: "Pull requests" },
  { icon: IssueOpenedIcon, label: "Issues" },
  { icon: AutomationsIcon, label: "Automations" },
  { icon: CustomizeIcon, label: "Customize" },
] as const;

const sessionItems = [
  { icon: ChatBubbleIcon, label: "Chats" },
  { icon: FolderIcon, label: "mona-security" },
  { icon: UnreadDotIcon, label: "Open security extension", active: true },
  { icon: FolderIcon, label: "github-app" },
  { icon: FolderIcon, label: "design-tokens-explorer" },
  { icon: FolderIcon, label: "paper-cranes-lab" },
] as const;

const prompt = "Open the security canvas";

const homePrompt = "Open the security extension";

const clickMs = 850;

const typeStartMs = clickMs + 220;

const typeEndMs = typeStartMs + typingDuration(prompt);

const sendReadyMs = typeEndMs + 250;

const sendClickMs = sendReadyMs + 800;

const homeSendReadyMs = typeStartMs + typingDuration(homePrompt) + 250;

const homeSendClickMs = homeSendReadyMs + 650;

const homeDurationMs = animationClick(0, homeSendClickMs).release;

const sentMs = sendClickMs + 700;

const openingMs = sentMs + 500;

const canvasOpenMs = openingMs + 1800;

const findingsCursorMs = canvasOpenMs + 1200;

const findingsClickMs = findingsCursorMs + 650;

const findingsOpenMs = animationClick(0, findingsClickMs).release;

const rowCursorMs = findingsOpenMs + 600;

const rowHoverMs = rowCursorMs + 550;

const rowClickMs = rowCursorMs + 650;

const explainOpenMs = animationClick(0, rowClickMs).release;

const detailCursorMs = explainOpenMs + 1100;

const detailClickMs = detailCursorMs + 650;

const explainMessageMs = animationClick(0, detailClickMs).release;

const explainWorkingMs = explainMessageMs + 600;

const explainDoneMs = explainWorkingMs + 2200;

const explainReplyMs = explainDoneMs + 200;

const cursorHideMs = explainMessageMs + 1150;

const monaSideX = 1906;

const monaCornerY = 240;

const monaSideY = 526;

const monaExitDurationMs = monaGlide([monaSideX, monaSideY], [2100, monaSideY - 80], 3).duration;

const finalFrameHoldMs = 2000;

const animationDurationMs =
  Math.max(explainReplyMs, cursorHideMs + monaExitDurationMs) + finalFrameHoldMs + 200;

type Severity = "Critical" | "High" | "Medium" | "Low";

const findingCode = [
  { line: 12, code: "    if (!target[key]) target[key] = {};" },
  { line: 13, code: "    mergePreferences(target[key], value);" },
  { line: 14, code: "  } else {" },
  { line: 15, code: "    target[key] = value;", flagged: true },
  { line: 16, code: "  }" },
  { line: 17, code: "}" },
  { line: 18, code: "return target;" },
];

const findings: {
  title: string;
  titleLines?: [string, string];
  number: number;
  severity: Severity;
  age: string;
  avatars?: string[];
}[] = [
  {
    title: "Prototype-polluting assignment",
    number: 57,
    severity: "High",
    age: "5d ago",
    avatars: [womanAvatar, manAvatar],
  },
  {
    title: "Regular expression injection",
    number: 56,
    severity: "High",
    age: "1w ago",
  },
  {
    title: "Polynomial regular expression used on uncontrolled data",
    titleLines: ["Polynomial regular expression used on", "uncontrolled data"],
    number: 54,
    severity: "High",
    age: "1w ago",
    avatars: [yellowAvatar, copilotAvatar, womanAvatar],
  },
  { title: "Missing rate limiting", number: 49, severity: "High", age: "2w ago" },
  { title: "Client-side cross-site scripting", number: 48, severity: "High", age: "2w ago" },
  {
    title: "Uncontrolled data used in path expression",
    number: 47,
    severity: "Medium",
    age: "2w ago",
    avatars: [manAvatar, yellowAvatar],
  },
  { title: "Prototype-polluting assignment", number: 62, severity: "Medium", age: "1d ago" },
  {
    title: "Information exposure through a stack trace",
    number: 59,
    severity: "Medium",
    age: "2d ago",
  },
  {
    title: "Prototype pollution via merged session data",
    number: 22,
    severity: "Low",
    age: "2d ago",
  },
];

function usePlaybackTimeline(duration: number) {
  const containerRef = useRef<HTMLDivElement>(null);

  const loopRef = useRef<HTMLDivElement>(null);

  const [elapsed, setElapsed] = useAnimationTime(duration, true);

  const [inView, setInView] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);

  const time = reducedMotion ? duration : elapsed;

  useLoopReset(loopRef, time, duration, !reducedMotion);

  const complete = reducedMotion && time >= duration;

  const active = inView && isPlaying && !reducedMotion && !complete;

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
    if (!active) return;

    let previousTime = performance.now();

    let frame: number;

    function advance(now: number) {
      const delta = Math.min(100, now - previousTime);

      previousTime = now;
      setElapsed((value) => value + delta);
      frame = window.requestAnimationFrame(advance);
    }

    frame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frame);
  }, [active, duration, setElapsed]);

  function togglePlayback() {
    if (complete) {
      setElapsed(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((playing) => !playing);
    }
  }

  return { containerRef, loopRef, time, complete, isPlaying, reducedMotion, togglePlayback };
}

// [delay, duration] in ms: pixels appear one after another, then soften.
export const monaTrailGlitch = [
  [0, 900],
  [90, 1000],
  [180, 860],
  [270, 1050],
  [360, 940],
  [450, 1000],
  [540, 880],
  [630, 1020],
  [720, 920],
  [810, 980],
] as const;

export function SecurityReviewSession({
  showControls = true,
  artifactDraft,
  artifactElapsed = 0,
}: {
  showControls?: boolean;
  artifactDraft?: string;
  artifactElapsed?: number;
}) {
  const {
    containerRef,
    loopRef,
    time: playbackTime,
    complete,
    isPlaying,
    reducedMotion,
    togglePlayback,
  } = usePlaybackTimeline(homeDurationMs + animationDurationMs - sentMs);

  const home = !artifactDraft && playbackTime < homeDurationMs;

  const homeOpacity = !reducedMotion && home ? 1 : 0;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      container.style.setProperty("--security-scene-scale", `${container.clientWidth / 2000}`);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  const homeTyped = homePrompt.slice(0, typedLength(homePrompt, playbackTime - typeStartMs));

  const time = artifactDraft ? 0 : Math.max(0, playbackTime - homeDurationMs) + sentMs;

  const artifactTypeStart = 1600;

  const artifactFocus = animationClick(artifactElapsed, 1350);

  const artifactSendAt = artifactTypeStart + typingDuration(artifactDraft ?? "", 35) + 650;

  const artifactSend = animationClick(artifactElapsed, artifactSendAt);

  const artifactDone = artifactElapsed >= artifactSend.release + 850;

  const focusClick = animationClick(playbackTime, clickMs);

  const homeSendClick = animationClick(playbackTime, homeSendClickMs);

  const findingsClick = animationClick(time, findingsClickMs);

  const rowClick = animationClick(time, rowClickMs);

  const detailClick = animationClick(time, detailClickMs);

  const focused = artifactDraft ? artifactFocus.released : animationClick(time, clickMs).released;

  const typedCount = typedLength(prompt, time - typeStartMs);

  const typed = artifactDraft
    ? artifactDraft.slice(0, typedLength(artifactDraft, artifactElapsed - artifactTypeStart, 35))
    : time >= typeStartMs
      ? prompt.slice(0, typedCount)
      : "";

  const sent = artifactDraft ? artifactSend.released : time >= sentMs;

  const artifactSendOpacity = sent
    ? 0.5
    : 0.5 +
      0.5 *
        productEase(
          Math.max(
            0,
            Math.min(
              1,
              (artifactElapsed -
                artifactTypeStart -
                typingDuration(artifactDraft?.slice(0, 1) ?? "", 35)) /
                150,
            ),
          ),
        );

  const opening = time >= openingMs;

  const canvasOpen = time >= canvasOpenMs;

  const showFindings = time >= findingsOpenMs;

  const showFindingDetail = time >= explainOpenMs;

  const explainDone = time >= explainDoneMs;

  const responding =
    !artifactDraft &&
    ((sent && !canvasOpen) || (time >= explainMessageMs && time < explainReplyMs));

  const paneRef = useRef<HTMLDivElement>(null);

  const sendRef = useRef<HTMLSpanElement>(null);

  const rowRef = useRef<HTMLLIElement>(null);

  const detailExplainRef = useRef<HTMLSpanElement>(null);

  const findingsRef = useRef<HTMLDivElement>(null);

  const composerRef = useRef<HTMLDivElement>(null);

  const homeComposerRef = useRef<HTMLDivElement>(null);

  const homeSendRef = useRef<HTMLSpanElement>(null);

  const taskOffset = homeDurationMs - sentMs;

  const monaCornerArrival =
    homeSendReadyMs - 100 + monaGlide([690, 330], [monaSideX, monaCornerY], 1).duration;

  const monaFindingsDeparture = taskOffset + canvasOpenMs;

  const monaFindingsArrival =
    monaFindingsDeparture + monaGlide([monaSideX, monaCornerY], [monaSideX, monaSideY], 2).duration;

  const [cursorX, cursorY] = useMeasuredCursorPath(
    containerRef,
    artifactDraft ? artifactElapsed : playbackTime,
    artifactDraft
      ? [
          [0, 2100, 850, "artifact-composer", 1100, 0],
          [600, 2100, 850, "artifact-composer", 1100, 0],
          [1250, 1000, 850, "artifact-composer"],
          [1520, 1000, 850, "artifact-composer"],
          [1950, 1000, 980, "artifact-composer", 0, 130],
          [artifactSendAt - 650, 1000, 980, "artifact-composer", 0, 130],
          [artifactSendAt - 100, 1600, 950, "artifact-send"],
          [artifactSend.release + 150, 1600, 950, "artifact-send"],
          [artifactSend.release + 700, 2100, 950],
        ]
      : [
          [200, -100, 650],
          [750, 950, 550, "security-composer"],
          [homeSendReadyMs, 950, 550, "security-composer"],
          [homeSendClickMs - 100, 1250, 600, "security-send"],
          [homeDurationMs + 150, 1250, 600, "security-send"],
          [homeDurationMs + 700, 2100, 600],
          [taskOffset + findingsCursorMs, 2100, 520],
          [taskOffset + findingsClickMs - 100, 1560, 520, "security-findings"],
          [taskOffset + rowCursorMs, 1560, 520, "security-findings"],
          [taskOffset + rowClickMs - 100, 1640, 390, "security-finding"],
          [taskOffset + detailCursorMs, 1640, 390, "security-finding"],
          [taskOffset + detailClickMs - 100, 1640, 600, "security-explain"],
          [taskOffset + explainMessageMs + 600, 1640, 600, "security-explain"],
          [taskOffset + explainMessageMs + 1150, 2100, 600],
        ],
  );

  const cursorClick =
    playbackTime >= taskOffset + detailClickMs
      ? detailClick
      : playbackTime >= taskOffset + rowClickMs
        ? rowClick
        : playbackTime >= taskOffset + findingsClickMs
          ? findingsClick
          : playbackTime >= homeSendClickMs
            ? homeSendClick
            : focusClick;

  const artifactCursorClick = artifactElapsed < artifactSendAt - 650 ? artifactFocus : artifactSend;

  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const target = pane.scrollHeight - pane.clientHeight;

    pane.scrollTop = sent ? target : 0;
  });

  return (
    <div
      ref={containerRef}
      className={`${styles.quietPanel} ${styles.copilotAppPanel} ${styles.prDemo} ${styles.securitySessionPanel}`}
      data-animation-time={artifactDraft ? artifactElapsed : playbackTime}
      data-security-playing={isPlaying && !complete}
      data-security-stage={home ? "home" : "session"}
      data-security-focused={focusClick.released}
      data-security-sent={homeSendClick.released}
      data-security-findings={showFindings}
      data-security-detail={showFindingDetail}
      data-security-explaining={time >= explainMessageMs}
    >
      <div
        className={styles.securitySessionStage}
        data-grid-background
        role="img"
        aria-label="GitHub Copilot Home with the mona-security repository. Open the security extension is typed and sent to start a new session. The session continues into the Security canvas with a local security review and code scanning findings."
      >
        <div ref={loopRef} className={styles.securitySessionLoop}>
          <div className={styles.securitySessionWindow} aria-hidden="true">
            <div className={styles.securitySessionTitlebar}>
              <MarkGithubIcon size={16} />
              <span>GitHub Copilot</span>
              <span className={styles.securitySessionWindowControls}>
                <DashIcon size={16} />
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <rect
                    x="2.75"
                    y="2.75"
                    width="10.5"
                    height="10.5"
                    rx="1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <XIcon size={16} />
              </span>
            </div>
            <div className={styles.securitySessionBody}>
              <nav className={styles.securitySessionSidebar}>
                <div className={styles.securitySessionSidebarTop}>
                  <PanelToggleIcon side="start" />
                  <span>
                    <ChevronLeftIcon size={16} />
                    <ChevronRightIcon size={16} />
                  </span>
                </div>
                <ul>
                  {navItems.map(({ icon: Icon, label }) => (
                    <li key={label}>
                      <Icon size={16} />
                      {label}
                    </li>
                  ))}
                </ul>
                <div className={styles.securitySessionSessionsHeading}>
                  Sessions
                  <span>
                    <FilterIcon size={16} />
                    <PlusIcon size={16} />
                  </span>
                </div>
                <ul>
                  {sessionItems
                    .filter((item) => !home || !("active" in item))
                    .map(({ icon: Icon, label, ...item }) => (
                      <li key={label} data-active={"active" in item ? true : undefined}>
                        {!home && label === "mona-security" ? (
                          <OpenFolderIcon size={16} />
                        ) : (
                          <Icon size={16} />
                        )}
                        {artifactDraft && "active" in item ? "Header redesign #493" : label}
                      </li>
                    ))}
                </ul>
              </nav>
              <div className={styles.securitySessionMain}>
                {homeOpacity > 0 && (
                  <div className={styles.securityHomeScene} style={{ opacity: homeOpacity }}>
                    <div className={styles.securityHomeArtwork}>
                      <img className={styles.ensembleFrame} src={homeFrame} alt="" />
                      <img className={styles.securityHomeMonaLogo} src={homeMona} alt="" />
                      <span className={styles.securityHomeInteractive}>
                        <PlusIcon size={18} />
                        <span>Interactive</span>
                      </span>
                      <div className={styles.securityHomeIcebreakers}>
                        <div>
                          <ZapIcon size={20} />
                          <p>
                            Write a script that watches a folder and converts CSV files to JSON.
                          </p>
                        </div>
                        <div>
                          <ServerIcon size={20} />
                          <p>Compare SQL and NoSQL databases with decision criteria for each.</p>
                        </div>
                        <div>
                          <ChecklistIcon size={20} />
                          <p>
                            Create a reusable technical design doc template for feature proposals.
                          </p>
                        </div>
                      </div>
                      <span
                        className={styles.securityHomeFocus}
                        data-focused={focusClick.released}
                        aria-hidden="true"
                      />
                      <span className={styles.securityHomeModel}>
                        <span>Copilot Fusion · Standard</span>
                      </span>
                      <div className={styles.securityHomeContextBackground} />
                      <div className={styles.securityHomeContext}>
                        <span>
                          <FolderIcon size={20} />
                          mona-security
                        </span>
                        <span>
                          <svg
                            className={styles.securityHomeWorktreeIcon}
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M16 3h5v5" />
                            <path d="M8 3H3v5" />
                            <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
                            <path d="m15 9 6-6" />
                          </svg>
                          New worktree
                        </span>
                      </div>
                      <div
                        ref={homeComposerRef}
                        className={styles.securityHomeInput}
                        data-cursor-target="security-composer"
                        data-pressed={focusClick.pressing}
                      >
                        {homeTyped || (
                          <span className={styles.securitySessionPlaceholder}>
                            Ask anything or paste a URL. Use / for commands, &amp; sessions, #
                            issues...
                          </span>
                        )}
                        {playbackTime >= typeStartMs && playbackTime < homeSendClickMs && (
                          <span
                            className={styles.securitySessionCaret}
                            style={{
                              visibility: typingCaretVisible(homePrompt, playbackTime - typeStartMs)
                                ? "visible"
                                : "hidden",
                            }}
                          />
                        )}
                      </div>
                      <span
                        ref={homeSendRef}
                        className={styles.securityHomeSend}
                        data-cursor-target="security-send"
                        data-ready={homeTyped.length === homePrompt.length}
                        data-sent={homeSendClick.released}
                        data-hover={
                          playbackTime >= homeSendClickMs - 350 &&
                          playbackTime < homeSendClickMs + 650
                        }
                        data-pressed={homeSendClick.pressing}
                      >
                        <ArrowUpIcon size={22} />
                      </span>
                    </div>
                  </div>
                )}
                <header className={styles.securitySessionHeader}>
                  <strong>
                    {artifactDraft ? "Header redesign #493" : "Open security extension"}
                  </strong>
                  <span className={styles.securitySessionHeaderActions}>
                    <span>
                      <PlayIcon size={16} /> Run
                    </span>
                    <span>
                      Review <ChevronDownIcon size={16} />
                    </span>
                    <PanelToggleIcon side="end" />
                  </span>
                </header>
                <div
                  className={styles.securitySessionContent}
                  data-canvas={canvasOpen}
                  data-preserve-composer={!artifactDraft}
                >
                  <div ref={paneRef} className={styles.securitySessionPane}>
                    <div className={styles.securitySessionConversation} data-sent={sent}>
                      {sent && (
                        <>
                          <p className={styles.securitySessionUserMessage}>
                            {artifactDraft ?? homePrompt}
                          </p>
                          <div
                            className={
                              artifactDraft
                                ? styles.artifactToolRow
                                : styles.securitySessionOpenedCanvas
                            }
                            data-visible={
                              artifactDraft
                                ? artifactElapsed >= artifactSend.release + 150
                                : opening
                            }
                            data-working={artifactDraft ? !artifactDone : !canvasOpen}
                          >
                            {artifactDraft ? (
                              <ToolsIcon size={12} />
                            ) : canvasOpen ? (
                              <TerminalIcon size={16} />
                            ) : (
                              <span className={styles.securitySessionSpinner} />
                            )}
                            <span className={styles.securitySessionOpenedLabel}>
                              {artifactDraft
                                ? "Create issue artifact"
                                : canvasOpen
                                  ? "Opened canvas"
                                  : "Opening canvas"}
                            </span>
                            <span>{artifactDraft ? "Rollout checklist" : "Security"}</span>
                          </div>
                          <p
                            className={styles.securitySessionReply}
                            data-visible={artifactDraft ? artifactDone : canvasOpen}
                          >
                            {artifactDraft
                              ? "Created the rollout checklist and attached it to this issue."
                              : "Opened the security extension."}
                          </p>
                        </>
                      )}
                      {time >= explainMessageMs && (
                        <>
                          <p className={styles.securitySessionUserMessage}>
                            Explain the selected finding
                          </p>
                          <div
                            className={styles.securitySessionOpenedCanvas}
                            data-visible={time >= explainWorkingMs}
                            data-working={!explainDone}
                          >
                            {explainDone ? (
                              <TerminalIcon size={16} />
                            ) : (
                              <span className={styles.securitySessionSpinner} />
                            )}
                            <span className={styles.securitySessionOpenedLabel}>
                              Security Review: Verify selected parameter finding
                            </span>
                            {explainDone && <span>· Worked for 1m 4s</span>}
                          </div>
                          <div
                            className={styles.securitySessionExplanation}
                            data-visible={time >= explainReplyMs}
                          >
                            <p>
                              <strong>Confirmed: the recursive merge can modify</strong>{" "}
                              <code>Object.prototype</code>.
                            </p>
                            <p>
                              At lines 8–9, <code>mergePreferences</code> reads{" "}
                              <code>target[key]</code> without checking whether the property belongs
                              to the target. A user-controlled key such as <code>__proto__</code>{" "}
                              causes recursion into the inherited prototype. The assignment on line
                              11 then writes attacker-controlled properties onto it.
                            </p>
                            <p>
                              <strong>Why it matters:</strong> unrelated objects in the same process
                              can inherit those properties, potentially changing application
                              defaults or security-sensitive behavior. Authorization bypass or code
                              execution depends on how downstream code uses the polluted properties;
                              neither impact is established by this finding alone.
                            </p>
                            <p>
                              <strong>Recommended fix:</strong> validate incoming preferences
                              against a strict schema and copy only supported fields. If a generic
                              merge is required, reject <code>__proto__</code>,{" "}
                              <code>constructor</code>, and <code>prototype</code> at every level
                              before accessing the target, and recurse only into own properties.
                            </p>
                            <p>No files were edited.</p>
                          </div>
                        </>
                      )}
                      <div
                        ref={composerRef}
                        data-cursor-target={artifactDraft ? "artifact-composer" : undefined}
                        className={styles.securitySessionComposer}
                        data-focused={focused && !sent}
                      >
                        <span className={styles.securitySessionInput}>
                          {focused && !sent ? (
                            <>
                              {typed}
                              <span
                                className={styles.securitySessionCaret}
                                style={{
                                  visibility: typingCaretVisible(
                                    artifactDraft ?? prompt,
                                    artifactDraft
                                      ? artifactElapsed - artifactTypeStart
                                      : time - typeStartMs,
                                    artifactDraft ? 35 : 70,
                                  )
                                    ? "visible"
                                    : "hidden",
                                }}
                              />
                            </>
                          ) : (
                            <span className={styles.securitySessionPlaceholder}>
                              Ask anything. Use / for commands, @ files, &amp; sessions, # issues…
                            </span>
                          )}
                        </span>
                        <div className={styles.securitySessionComposerActions}>
                          <PlusIcon size={16} />
                          <span>
                            Interactive <ChevronDownIcon size={12} />
                          </span>
                          <span>
                            Copilot Fusion · Standard <ChevronDownIcon size={12} />
                          </span>
                          <span
                            ref={sendRef}
                            data-cursor-target={artifactDraft ? "artifact-send" : undefined}
                            className={styles.securitySessionSend}
                            data-responding={responding}
                            aria-label={responding ? "Stop response" : "Send message"}
                            data-ready={
                              artifactDraft
                                ? typed.trim().length > 0 && !sent
                                : time >= sendReadyMs && !sent
                            }
                            data-hover={
                              artifactDraft
                                ? artifactElapsed >= artifactSendAt - 100 && !sent
                                : time >= sendClickMs - 350 && time < sendClickMs + 650
                            }
                            style={artifactDraft ? { opacity: artifactSendOpacity } : undefined}
                            data-pressed={
                              artifactDraft
                                ? artifactSend.pressing
                                : animationClick(time, sendClickMs).pressing
                            }
                          >
                            {responding ? (
                              <span className={styles.securitySessionStopIcon} />
                            ) : (
                              <ArrowUpIcon size={16} />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <aside className={styles.securitySessionCanvas}>
                    <div className={styles.securitySessionCanvasInner}>
                      <div className={styles.securitySessionCanvasTabs}>
                        <span className={styles.securitySessionCanvasTab}>
                          <CustomizeIcon size={16} /> Security
                        </span>
                        <PlusIcon size={16} />
                        <ScreenFullIcon size={16} />
                      </div>
                      {showFindingDetail ? (
                        <div className={styles.securitySessionFindings}>
                          <div className={styles.securitySessionFindingsBar}>
                            <span>
                              Security / Code scanning findings /{" "}
                              <strong title="Prototype-polluting assignment">
                                Prototype-polluting assignment
                              </strong>
                            </span>
                          </div>
                          <div className={styles.securitySessionFindingDetail}>
                            <div className={styles.securitySessionFindingDetailHeader}>
                              <div>
                                <h4>
                                  Prototype-polluting assignment{" "}
                                  <span className={styles.securitySessionFindingNumber}>
                                    <span>#57</span>
                                    <CopyIcon size={16} />
                                  </span>
                                </h4>
                                <span>Detected by CodeQL · Opened 5d ago</span>
                              </div>
                              <span className={styles.securitySessionFindingActions}>
                                <span>Fix</span>
                                <span
                                  ref={detailExplainRef}
                                  data-cursor-target="security-explain"
                                  data-hover={
                                    time >= detailClickMs - 350 && time < detailClickMs + 650
                                  }
                                  data-pressed={detailClick.pressing}
                                >
                                  Explain
                                </span>
                                <span>
                                  <KebabHorizontalIcon size={16} />
                                </span>
                              </span>
                            </div>
                            <div className={styles.securitySessionFindingPills}>
                              <span>
                                <span className={styles.securitySessionHighDot} /> High severity
                              </span>
                              <span>
                                <TagIcon size={16} /> 3 tags
                              </span>
                            </div>
                            <div className={styles.securitySessionCodeBox}>
                              <div className={styles.securitySessionCodeBoxHeader}>
                                <FileIcon size={16} />
                                <span>
                                  src/server/utils/deep-merge.js:<span>15-15</span>
                                </span>
                              </div>
                              <ol>
                                {findingCode.map((row) => (
                                  <li key={row.line} data-flagged={row.flagged}>
                                    <span>{row.line}</span>
                                    <code>
                                      {row.code
                                        .split(/(\b(?:if|else|return|mergePreferences)\b|[!=])/g)
                                        .map((token, index) => (
                                          <span
                                            key={index}
                                            data-token={
                                              /^(if|else|return|!|=)$/.test(token)
                                                ? "keyword"
                                                : token === "mergePreferences"
                                                  ? "function"
                                                  : undefined
                                            }
                                          >
                                            {token}
                                          </span>
                                        ))}
                                    </code>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            <div className={styles.securitySessionFindingDescription}>
                              <strong>Description</strong>
                              <p>
                                This assignment uses a user-controlled property name, which may
                                allow an attacker to modify the prototype of a built-in object.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : showFindings ? (
                        <div className={styles.securitySessionFindings}>
                          <div className={styles.securitySessionFindingsBar}>
                            <span>
                              Security / <strong>Code scanning findings</strong>
                            </span>
                            <FilterIcon size={16} />
                            <KebabHorizontalIcon size={16} />
                          </div>
                          <div className={styles.securitySessionFindingsSummary}>
                            <span className={styles.securitySessionCheckbox} />
                            <span>23 findings</span>
                            <span>Updated just now</span>
                          </div>
                          <ul className={styles.securitySessionFindingsList}>
                            {findings.map((finding, index) => (
                              <li
                                key={finding.number}
                                ref={index === 0 ? rowRef : undefined}
                                data-cursor-target={index === 0 ? "security-finding" : undefined}
                                data-selected={index === 0 && time >= rowHoverMs}
                                data-hover={index === 0 && time >= rowHoverMs && !rowClick.released}
                                data-pressed={index === 0 && rowClick.pressing}
                              >
                                <span className={styles.securitySessionCheckbox} />
                                <div>
                                  <span className={styles.securitySessionFindingTitle}>
                                    <strong>
                                      {finding.titleLines ? (
                                        <>
                                          {finding.titleLines[0]}
                                          <br />
                                          {finding.titleLines[1]}
                                        </>
                                      ) : (
                                        finding.title
                                      )}
                                    </strong>{" "}
                                    #{finding.number}
                                    {index === 0 && <ChevronRightIcon size={16} />}
                                  </span>
                                  <span className={styles.securitySessionFindingMeta}>
                                    <span
                                      className={styles.securitySessionSeverity}
                                      data-severity={finding.severity}
                                    >
                                      {finding.severity}
                                    </span>
                                    {finding.avatars && (
                                      <span className={styles.securitySessionAvatars}>
                                        {finding.avatars.map((avatar, index) => (
                                          <img key={index} src={avatar} alt="" />
                                        ))}
                                      </span>
                                    )}
                                    CodeQL · {finding.age}
                                  </span>
                                </div>
                                {index === 0 && (
                                  <span className={styles.securitySessionFindingActions}>
                                    <span>Fix</span>
                                    <span>Explain</span>
                                    <span>
                                      <KebabHorizontalIcon size={16} />
                                    </span>
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <>
                          <strong className={styles.securitySessionCanvasHeading}>Security</strong>
                          <div className={styles.securitySessionCanvasCard}>
                            <ShieldCheckIcon size={16} />
                            <div>
                              <strong>Security review</strong>
                              <span>
                                Run a local AI-powered security review on your current code changes
                              </span>
                              <div className={styles.securitySessionCanvasCardFooter}>
                                <span className={styles.securitySessionNoChanges}>No changes</span>
                                <span className={styles.securitySessionStartReview}>
                                  Start review
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={styles.securitySessionCanvasCard}
                            ref={findingsRef}
                            data-cursor-target="security-findings"
                            data-hover={
                              time >= findingsClickMs - 350 && time < findingsClickMs + 650
                            }
                            data-pressed={findingsClick.pressing}
                          >
                            <ListUnorderedIcon size={16} />
                            <div>
                              <strong>Code scanning findings</strong>
                              <span>View this repository&apos;s code scanning findings</span>
                            </div>
                            <ChevronRightIcon size={16} />
                          </div>
                        </>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
          {!reducedMotion && !artifactDraft && (
            <PixelMona
              time={playbackTime}
              end={taskOffset + cursorHideMs + monaExitDurationMs}
              stops={[
                {
                  arrive: 1200,
                  leave: homeSendReadyMs - 100,
                  x: 690,
                  y: 330,
                  focusX: cursorX,
                },
                {
                  arrive: monaCornerArrival,
                  leave: monaFindingsDeparture,
                  x: monaSideX,
                  y: monaCornerY,
                  focusX: 1650,
                },
                {
                  arrive: monaFindingsArrival,
                  leave: taskOffset + cursorHideMs,
                  x: monaSideX,
                  y: monaSideY,
                  focusX: 1650,
                },
              ]}
            />
          )}
          <div
            className={pageStyles.aiFindingsCursor}
            data-clicking={artifactDraft ? artifactCursorClick.pressing : cursorClick.pressing}
            style={{
              transform: `translate(${cursorX}px, ${cursorY}px)`,
              opacity: (
                artifactDraft
                  ? artifactElapsed < artifactSend.release + 700 && !reducedMotion
                  : playbackTime >= 200 && time < cursorHideMs && !reducedMotion
              )
                ? 1
                : 0,
              zIndex: 6,
            }}
          >
            <AnimationCursor clickAge={artifactDraft ? artifactCursorClick.age : cursorClick.age} />
          </div>
        </div>
      </div>
      {showControls && (
        <div className={styles.cliAttachReplay}>
          {!reducedMotion && (
            <Tooltip
              text={
                complete
                  ? "Replay the animation from the beginning"
                  : isPlaying
                    ? "Pause the animation"
                    : "Play the animation from the current frame"
              }
              type="description"
            >
              <button
                type="button"
                className={styles.animationControlButton}
                aria-label={
                  complete
                    ? "Replay security review animation"
                    : !isPlaying
                      ? "Play security review animation"
                      : "Pause security review animation"
                }
                onClick={togglePlayback}
              >
                {complete ? (
                  <PlayIcon size={16} aria-hidden="true" />
                ) : !isPlaying ? (
                  <PlayIcon size={16} aria-hidden="true" />
                ) : (
                  <PauseIcon size={16} aria-hidden="true" />
                )}
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
