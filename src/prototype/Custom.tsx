import { useEffect, useId, useRef, useState } from "react";
import {
  Accordion,
  Box,
  Button,
  CTABanner,
  Heading,
  Hero,
  InlineCode,
  MinimalFooter,
  River,
  Stack,
  SubdomainNavBar,
  Text,
} from "@primer/react-brand";
import { ArrowUpRightIcon, ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { AutomationsVisual } from "./AutomationsVisual";
import { IssueArtifactsVisual } from "./IssueArtifactsVisual";
import { PlaybackControl } from "./PlaybackControl";
import { MonaArtwork } from "./MonaArtwork";
import keynoteWordmark from "./keynote-wordmark.svg";
import artifactStyles from "./ArtifactAnimation.module.css";
import styles from "./styles.module.css";

const repository =
  "https://github.com/octodemo/virtual-universe-26?utm_source=virtual-universe-insider-resources-repo&utm_medium=web&utm_campaign=universe-2026";

const eventRecap =
  "https://github.com/events/universe/recap?utm_source=virtual-universe-26-insider-resources-cta-very-bottom-k2k&utm_medium=web&utm_campaign=universe-2026";

const sectionLinks = [
  { label: "Modern GitHub experience", href: "#modern-github" },
  { label: "Build an automation", href: "#automation" },
  { label: "Cheat sheet artifact", href: "#artifacts" },
];

function SectionNavigation() {
  const [activeSection, setActiveSection] = useState("#modern-github");

  const [expanded, setExpanded] = useState(false);

  const linksRef = useRef<HTMLDivElement>(null);

  const toggleRef = useRef<HTMLButtonElement>(null);

  const menuId = useId();

  useEffect(() => {
    const updateSection = () => setActiveSection(window.location.hash || "#modern-github");

    updateSection();
    window.addEventListener("hashchange", updateSection);
    window.addEventListener("popstate", updateSection);
    return () => {
      window.removeEventListener("hashchange", updateSection);
      window.removeEventListener("popstate", updateSection);
    };
  }, []);

  useEffect(() => {
    const links = linksRef.current;

    const active = links?.querySelector<HTMLElement>('[aria-current="location"]');

    if (links && active) {
      links.scrollTo({ left: active.offsetLeft - links.offsetLeft, behavior: "instant" });
    }
  }, [activeSection]);

  return (
    <nav
      className={styles.sectionNavigation}
      aria-label="Page sections"
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          setExpanded(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <div className={styles.navigationLinks} ref={linksRef}>
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={activeSection === link.href ? "location" : undefined}
            onClick={() => setExpanded(false)}
          >
            {link.label}
          </a>
        ))}
        <a href={eventRecap}>
          All event announcements <ArrowUpRightIcon size={16} aria-hidden="true" />
        </a>
      </div>
      <button
        ref={toggleRef}
        className={styles.navigationToggle}
        type="button"
        aria-label={expanded ? "Close page sections" : "Open page sections"}
        aria-expanded={expanded}
        aria-controls={menuId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
      </button>
      <div className={styles.navigationDropdown} id={menuId} hidden={!expanded}>
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={activeSection === link.href ? "location" : undefined}
            onClick={() => setExpanded(false)}
          >
            {link.label}
          </a>
        ))}
        <a href={eventRecap}>All event announcements</a>
      </div>
    </nav>
  );
}

const examples = [
  {
    label: "Stacked PRs",
    compactLabel: "Stacked PRs",
    title: "monas-cafe — gh stack",
    code: `monas-cafe > gh stack init fix/price-parser
✓ Started a stack on main

monas-cafe > git commit -am "Strip the $ before parseFloat"
monas-cafe > gh stack add -Am "Show prices as currency" fix/menu-display

monas-cafe > gh stack submit --auto
✓ Draft PR #3  fix/price-parser → main
✓ Draft PR #4  fix/menu-display → fix/price-parser

Two small pull requests, reviewed in order.`,
  },
  {
    label: "Attach to an issue",
    compactLabel: "Issue",
    title: "monas-cafe — gh issue comment --attach",
    code: `monas-cafe > npx playwright test
✘ menu prices render as currency
  Received: ["$NaN", "$NaN", "$NaN", ...]
test-results/screenshots/menu-prices.png

monas-cafe > gh issue comment 1 \\
  --body "Playwright caught this:" \\
  --attach './test-results/screenshots/menu-prices.png#Menu board showing $NaN'

✓ Screenshot attached, alt text and all.`,
  },
  {
    label: "Attach to a PR",
    compactLabel: "PR",
    title: "monas-cafe — gh pr create --attach",
    code: `monas-cafe > gh pr create \\
  --title "Fix: prices render as $NaN" \\
  --body "Fixes #1. parseFloat choked on the $." \\
  --attach 'evidence/after.png#Prices render correctly'

✓ Screenshot embedded in the pull request.

Give reviewers the context they need,
without leaving the terminal.`,
  },
];

function Terminal() {
  const panelRef = useRef<HTMLDivElement>(null);

  const [exampleIndex, setExampleIndex] = useState(0);

  const [elapsed, setElapsed] = useState(0);

  const [inView, setInView] = useState(false);

  const [pageVisible, setPageVisible] = useState(true);

  const [paused, setPaused] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  const { title, code } = examples[exampleIndex];

  const duration = code.length * 10 + 2000;

  const complete = exampleIndex === examples.length - 1 && elapsed >= duration;

  const position = Math.min(code.length, Math.floor(elapsed / 10));

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReducedMotion(preference.matches);

    const updateVisibility = () => setPageVisible(!document.hidden);

    update();
    updateVisibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const topMargin =
      parseFloat(getComputedStyle(panel).getPropertyValue("--base-size-80")) *
      parseFloat(getComputedStyle(document.documentElement).fontSize);

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `-${topMargin}px 0px -15% 0px`,
    });

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || !inView || !pageVisible || complete) return;

    let previous = performance.now();

    let frame: number;

    function advance(now: number) {
      const delta = Math.min(100, now - previous);

      previous = now;
      setElapsed((value) => Math.min(duration, value + delta));
      frame = requestAnimationFrame(advance);
    }

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [paused, reducedMotion, inView, pageVisible, complete, duration]);

  useEffect(() => {
    if (elapsed < duration || exampleIndex === examples.length - 1 || reducedMotion) return;
    setExampleIndex((value) => value + 1);
    setElapsed(0);
  }, [elapsed, duration, exampleIndex, reducedMotion]);

  const visible = reducedMotion ? code : code.slice(0, position);

  return (
    <div ref={panelRef} className={styles.terminalDemo}>
      <div className={styles.terminal} id="cli-animation">
        <div className={styles.terminalBar}>
          <Text size="100" variant="muted" className={styles.terminalTitle}>
            {title}
          </Text>
          {!reducedMotion && (
            <PlaybackControl
              complete={complete}
              playing={!paused}
              label="CLI animation"
              onClick={() => {
                if (complete) {
                  setExampleIndex(0);
                  setElapsed(0);
                  setPaused(false);
                } else {
                  setPaused((value) => !value);
                }
              }}
            />
          )}
        </div>
        <pre className={styles.screen} tabIndex={0} role="region" aria-label={title}>
          <code className={styles.screenSizer} aria-hidden="true">
            {code}
          </code>
          <code>
            {visible.split("\n").map((line, index) => (
              <span
                key={index}
                className={
                  line.startsWith("✓")
                    ? styles.success
                    : line.startsWith("✘") || line.includes("Received:")
                      ? styles.error
                      : undefined
                }
              >
                {line.startsWith("monas-cafe > ") ? (
                  <>
                    <span className={styles.success}>monas-cafe &gt; </span>
                    {line.slice(13)}
                  </>
                ) : (
                  line
                )}
                {index < visible.split("\n").length - 1 ? "\n" : ""}
              </span>
            ))}
          </code>
        </pre>
      </div>
      <div className={styles.exampleButtons} role="group" aria-label="CLI examples">
        {examples.map((example, index) => (
          <button
            key={example.label}
            type="button"
            aria-label={example.label}
            aria-pressed={exampleIndex === index}
            aria-controls="cli-animation"
            onClick={() => {
              setExampleIndex(index);
              setElapsed(0);
              setPaused(false);
            }}
          >
            {index === exampleIndex && !reducedMotion && (
              <span
                className={styles.exampleProgress}
                aria-hidden="true"
                style={{ transform: `scaleX(${elapsed / duration})` }}
              />
            )}
            <span className={styles.exampleLabel}>
              <span className={styles.exampleFullLabel}>{example.label}</span>
              <span className={styles.exampleCompactLabel}>{example.compactLabel}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CliActions() {
  return (
    <>
      <Button
        as="a"
        href="https://github.com/codespaces/new/octodemo/virtual-universe-26?ref=main&utm_source=virtual-universe-26-insider-resources-cta-bottom-codespace&utm_medium=web&utm_campaign=universe-2026"
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="medium"
      >
        Try in Codespaces
      </Button>
      <Text as="p" size="100" variant="muted" className={styles.hint}>
        Opens a fresh workshop Codespace in a new tab.
      </Text>
    </>
  );
}

function ArtifactActions() {
  return (
    <div>
      <Button
        as="a"
        href="https://github.com/octodemo/virtual-universe-26/tree/main/github-virtual-universe-highlights/attach-a-cheat-sheet-artifact"
        variant="primary"
        size="medium"
      >
        Create an artifact
      </Button>
      <Text as="p" size="100" variant="muted" className={styles.hint}>
        Opens a Copilot app canvas for guided activity (5–10 min).
      </Text>
    </div>
  );
}

function AutomationActions() {
  const guideGroup = useId();

  return (
    <>
      <div>
        <Button
          as="a"
          href="https://github.com/copilot/app/launch?open=ghapp%3A%2F%2Fsession%2Fnew%3Frepo%3Doctodemo%252Fvirtual-universe-26%26canvas%3Duniverse-welcome&utm_source=virtual-universe-26-insider-resources-cta-mid-tutorial&utm_medium=web&utm_campaign=universe-2026"
          variant="primary"
          size="medium"
        >
          Create an automation
        </Button>
        <Text as="p" size="100" variant="muted" className={styles.hint}>
          Explore the GitHub Universe announcements.
        </Text>
      </div>
      <div className={styles.guides}>
        <Accordion name={guideGroup}>
          <Accordion.Heading as="h3">Skills</Accordion.Heading>
          <Accordion.Content>
            <Text as="p" size="200" variant="muted">
              Open the existing <InlineCode>issue-to-pr</InlineCode> skill, edit its instructions,
              and run <InlineCode>/issue-to-pr</InlineCode>. Prepare your fork when you are ready to
              make changes.
            </Text>
          </Accordion.Content>
        </Accordion>
        <Accordion name={guideGroup}>
          <Accordion.Heading as="h3">Tools and connectors</Accordion.Heading>
          <Accordion.Content>
            <Text as="p" size="200" variant="muted">
              Discover a documentation agent with <InlineCode>/agentfinder</InlineCode>. Add
              Context7 through <strong>Customize</strong>, look up current Node.js documentation,
              and add that lookup to your skill.
            </Text>
          </Accordion.Content>
        </Accordion>
        <Accordion name={guideGroup}>
          <Accordion.Heading as="h3">Security review</Accordion.Heading>
          <Accordion.Content>
            <Text as="p" size="200" variant="muted">
              Run <InlineCode>/security-review</InlineCode> on the last PR created by the{" "}
              <InlineCode>issue-to-pr</InlineCode> skill. Review the fix in the PR, then add
              security review to the skill.
            </Text>
          </Accordion.Content>
        </Accordion>
        <Accordion name={guideGroup}>
          <Accordion.Heading as="h3">Automate</Accordion.Heading>
          <Accordion.Content>
            <Text as="p" size="200" variant="muted">
              Go to <strong>Automations → New Automation</strong>, select your fork as the project,
              and enter <InlineCode>/issue-to-pr</InlineCode>. Choose a <strong>Manual</strong>{" "}
              trigger for now; schedule it later.
            </Text>
          </Accordion.Content>
        </Accordion>
      </div>
    </>
  );
}

export default function UniverseWorkshop() {
  return (
    <Box backgroundColor="default" className={styles.page}>
      <title>GitHub Universe '26 | Hands-on exercises</title>
      <meta
        name="description"
        content="Try the latest GitHub CLI features and build a Copilot automation with hands-on GitHub Universe exercises, skills, documentation, and security review."
      />
      <SubdomainNavBar
        className={styles.navigation}
        title="GitHub Universe '26"
        titleHref="https://githubuniverse.com/"
        fixed={false}
        skipToContentTargetId="exercises"
      >
        <SubdomainNavBar.SecondaryAction href={repository}>
          Workshop repository <ArrowUpRightIcon size={16} aria-hidden="true" />
        </SubdomainNavBar.SecondaryAction>
      </SubdomainNavBar>

      <main id="exercises" className={styles.content}>
        <div className={styles.hero} data-mona-section="hero">
          <Hero variant="gridline" align="center" className={styles.heroContent}>
            <Hero.Label>GitHub Universe '26</Hero.Label>
            <Hero.Heading>Try what’s next. Build it yourself.</Hero.Heading>
            <Hero.Description>
              Hands-on guides for trying the latest features in GitHub and Copilot. Explore the
              examples, then launch an exercise to try them yourself.
            </Hero.Description>
            <Hero.ButtonGroup>
              <Button
                as="a"
                href="https://github.com/features/ai/github-app?utm_source=virtual-universe-26-insider-resources-cta-top-app-download&utm_medium=web&utm_campaign=universe-2026"
                variant="primary"
                size="medium"
              >
                Download GitHub Copilot app
              </Button>
            </Hero.ButtonGroup>
          </Hero>
          <div className={styles.heroArtwork}>
            <MonaArtwork />
          </div>
        </div>

        <div className={styles.sectionNavigationFrame}>
          <SectionNavigation />
        </div>

        <Stack id="workshops" direction="vertical" padding="none" gap="spacious">
          <River
            id="modern-github"
            variant="gridline"
            align="start"
            className={styles.river}
            aria-labelledby="cli-heading"
            data-workshop="cli"
          >
            <River.Content trailingComponent={CliActions}>
              <Heading as="h2" size="5" id="cli-heading">
                The modern GitHub experience
              </Heading>
              <Text as="p" variant="muted">
                Create stacked pull requests and attach screenshots to issues and PRs, right from
                the GitHub CLI.
              </Text>
            </River.Content>
            <River.Visual
              className={styles.demo}
              position="center"
              padding="none"
              fillMedia={false}
              aria-label="GitHub CLI examples"
              data-animation-panel
            >
              <div className={styles.demoContent}>
                <Terminal />
              </div>
            </River.Visual>
          </River>

          <River
            id="automation"
            variant="gridline"
            align="start"
            className={`${styles.river} ${styles.automationRiver}`}
            aria-labelledby="copilot-heading"
            data-workshop="copilot"
          >
            <River.Content trailingComponent={AutomationActions}>
              <Heading as="h2" size="5" id="copilot-heading">
                Build your own automation
              </Heading>
              <Text as="p" variant="muted">
                Turn an issue into a proposed fix with a skill, current documentation, and a
                security review. Then automate it.
              </Text>
            </River.Content>
            <River.Visual
              className={styles.demo}
              position="center"
              padding="none"
              fillMedia={false}
              aria-label="Copilot automations demonstration"
              data-animation-panel
            >
              <div
                className={styles.automationPreview}
                role="region"
                aria-label="Create a daily Issue triage automation for the mona-security repository"
              >
                <div className={styles.automationStage} inert>
                  <AutomationsVisual />
                </div>
              </div>
            </River.Visual>
          </River>
          <River
            id="artifacts"
            variant="gridline"
            align="start"
            className={styles.river}
            aria-labelledby="artifacts-heading"
            data-workshop="artifacts"
          >
            <River.Content trailingComponent={ArtifactActions}>
              <Heading as="h2" size="5" id="artifacts-heading">
                Create your Universe cheat sheet
              </Heading>
              <Text as="p" variant="muted">
                Turn workshop highlights into a visual cheat sheet with Copilot. Attach it to a
                GitHub issue as an artifact, alongside a surprise card.
              </Text>
            </River.Content>
            <River.Visual
              className={styles.demo}
              position="center"
              padding="none"
              fillMedia={false}
              aria-label="Issue artifacts demonstration"
              data-animation-panel
            >
              <div
                className={`${styles.artifactsPreview} ${artifactStyles.page}`}
                role="region"
                aria-label="Issue artifacts: open a document, create a rollout checklist with Copilot, and attach it to the issue."
              >
                <div className={styles.automationStage} inert>
                  <IssueArtifactsVisual />
                </div>
              </div>
            </River.Visual>
          </River>
        </Stack>

        <CTABanner
          data-mona-section="cta"
          className={styles.keynote}
          align="center"
          hasGridLines
          aria-labelledby="keynote-heading"
        >
          <CTABanner.Logo className={styles.keynoteLogo}>
            <img src={keynoteWordmark} alt="Universe '26" />
          </CTABanner.Logo>
          <CTABanner.Heading as="h2" id="keynote-heading">
            Catch up on all that was announced at GitHub Universe.
          </CTABanner.Heading>
          <CTABanner.ButtonGroup className={styles.keynoteActions}>
            <Button as="a" href={eventRecap} variant="primary" size="medium">
              See what's new
            </Button>
          </CTABanner.ButtonGroup>
          <MonaArtwork variant="cta" />
        </CTABanner>
      </main>

      <div className={styles.universeFooter}>
        <MinimalFooter
          socialLinks={["x", "tiktok", "facebook", "youtube", "twitch", "linkedin"]}
          copyrightStatement="© 2026 GitHub inc."
        >
          <MinimalFooter.Link href="https://github.com/enterprise">Enterprise</MinimalFooter.Link>
          <MinimalFooter.Link href="https://github.com/enterprise/trial">
            Try GitHub free
          </MinimalFooter.Link>
        </MinimalFooter>
      </div>
    </Box>
  );
}
