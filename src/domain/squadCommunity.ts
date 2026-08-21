/**
 * ============================================================================
 * SQUAD, COMMUNITY FEED, AND CHAT DOMAIN CONTRACTS (R13)
 * ============================================================================
 *
 * Scope boundary:
 * Pure TypeScript view models and state unions for squad presence, community posts,
 * and group chat transcripts.
 *
 * INVARIANTS:
 * 1. Zero live tracking, GPS, or background location claims.
 * 2. Zero network/WebSockets/REST/GraphQL messaging provider dependencies.
 * 3. Every model carries explicit synthetic disclosures and source versions.
 */

export type FixturePresenceState =
  | 'cached'
  | 'last_known'
  | 'unavailable'
  | 'mesh_preview';

export type FixtureMessageState =
  | 'cached'
  | 'local_draft'
  | 'preview_queued'
  | 'failed_preview';

export type FixturePostState =
  | 'cached'
  | 'media_unavailable'
  | 'local_draft'
  | 'hidden_preview';

export type FeedFilterCategory = 'following' | 'nearby' | 'routes';

export interface FixtureSquadPresence {
  memberId: string;
  displayName: string;
  displayNameNepali?: string;
  role: 'lead' | 'sweep' | 'rider';
  presence: FixturePresenceState;
  observedAt: string;
  relativePosition?: 'ahead' | 'behind' | 'nearby';
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixtureCommunityPost {
  id: string;
  author: string;
  authorNepali?: string;
  avatarFallback: string;
  state: FixturePostState;
  body: string;
  bodyNepali?: string;
  routeSummary?: string;
  filterCategory: FeedFilterCategory;
  mediaKind?: 'image_placeholder' | 'video_placeholder';
  mediaCaption?: string;
  postedAt: string;
  likesCount: number;
  commentsCount: number;
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixtureChatMessage {
  id: string;
  author: string;
  authorNepali?: string;
  body: string;
  state: FixtureMessageState;
  createdAt: string;
  isCurrentUser: boolean;
  syntheticDisclosure: string;
}

export interface FixtureSquadGroup {
  id: string;
  name: string;
  nameNepali?: string;
  description: string;
  corridor: string;
  members: FixtureSquadPresence[];
  sourceVersion: string;
  syntheticDisclosure: string;
}
