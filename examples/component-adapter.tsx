/**
 * ILLUSTRATIVE CONTRACT — deliberately no import from a guessed ResourceCard path.
 * Replace `loadOriginalComponent` only after checking the REAL source in the pilot.
 * This adapter is not a new implementation of the website design.
 */
import type { ComponentType, ReactNode } from 'react';
export type OriginalComponentAdapter<Props> = {
  sourceRepoCommit: string;
  actualSourceFile: string;
  loadOriginalComponent: () => Promise<ComponentType<Props>>;
  readonlySnapshotToProps: (snapshot: Record<string, unknown>) => Props;
  VideoHost: (args: { children: ReactNode }) => ReactNode;
  childSelectors: Record<string, string>;
  assertSafeNoWrites: (props: Props) => void;
};

// TODO Phase 1: actual audited source component import and provider/CSS host.
// Do not put an imitation JSX resource card into this file.
