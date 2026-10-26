import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PauseIcon } from "@primer/octicons-react";
import { Tooltip } from "@primer/react-brand";
import { PlayIcon } from "./PlayIcon";
import styles from "./styles.module.css";

export function PlaybackControl({
  complete,
  playing,
  label,
  onClick,
}: {
  complete: boolean;
  playing: boolean;
  label: string;
  onClick: () => void;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  const [panel, setPanel] = useState<Element | null>(null);

  const action = complete ? "Replay" : playing ? "Pause" : "Play";

  useLayoutEffect(() => {
    const target = anchorRef.current?.closest("[data-animation-panel]");
    if (!target) throw new Error("Playback controls require an animation panel.");
    setPanel(target);
  }, []);

  return (
    <>
      <span ref={anchorRef} hidden />
      {panel &&
        createPortal(
          <div className={styles.playbackControls}>
            <Tooltip
              text={
                complete
                  ? "Replay the animation from the beginning."
                  : playing
                    ? "Pause the animation."
                    : "Play the animation from the current frame."
              }
              type="description"
            >
              <button
                type="button"
                className={styles.playbackButton}
                aria-label={`${action} ${label}`}
                onClick={onClick}
              >
                {complete || !playing ? (
                  <PlayIcon size={16} />
                ) : (
                  <PauseIcon size={16} aria-hidden="true" />
                )}
              </button>
            </Tooltip>
          </div>,
          panel,
        )}
    </>
  );
}
