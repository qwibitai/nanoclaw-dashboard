/**
 * Dashboard snapshot — the JSON blob pushed by NanoClaw.
 *
 * Field names use snake_case to match NanoClaw's SQLite output
 * and the dashboard UI pages. The pusher sends data as-is from
 * the DB — no transformation needed.
 */
export interface DashboardSnapshot {
  timestamp: string;
  assistant_name: string;
  uptime: number;

  agent_groups: AgentGroupInfo[];
  sessions: SessionInfo[];
  channels: ChannelInfo[];
  users: UserInfo[];
  tokens: TokenSummary;
  context_windows: ContextWindowInfo[];
  activity: ActivityBucket[];
}

export interface AgentGroupInfo {
  id: string;
  name: string;
  folder: string;
  agent_provider?: string;
  container_config?: Record<string, unknown> | null;
  sessionCount: number;
  runningSessions: number;
  wirings: WiringInfo[];
  destinations: DestinationInfo[];
  members: MemberInfo[];
  admins: RoleInfo[];
  created_at: string;
}

export interface WiringInfo {
  channel_type: string;
  platform_id: string;
  mg_name?: string;
  is_group: number;
  unknown_sender_policy: string;
  priority: number;
}

export interface DestinationInfo {
  local_name: string;
  target_type: string;
  target_id: string;
}

export interface MemberInfo {
  user_id: string;
  display_name?: string;
  added_at: string;
}

export interface RoleInfo {
  user_id: string;
  display_name?: string;
  role: string;
  agent_group_id?: string | null;
  granted_at: string;
}

export interface SessionInfo {
  id: string;
  agent_group_id: string;
  agent_group_name?: string;
  agent_group_folder?: string;
  messaging_group_id?: string;
  messaging_group_name?: string;
  channel_type?: string;
  platform_id?: string;
  thread_id?: string;
  status: string;
  container_status: string;
  last_active?: string;
  created_at: string;
}

export interface ChannelInfo {
  channelType: string;
  isLive: boolean;
  isRegistered: boolean;
  groups: ChannelGroupEntry[];
}

/** Matches the shape the channels page expects: { messagingGroup, agents } */
export interface ChannelGroupEntry {
  messagingGroup: {
    id: string;
    platform_id: string;
    name?: string;
    is_group: number;
    unknown_sender_policy: string;
  };
  agents: {
    agent_group_id: string;
    agent_group_name?: string;
    priority: number;
  }[];
}

export interface UserInfo {
  id: string;
  kind: string;
  display_name?: string;
  privilege: string;
  roles: RoleInfo[];
  memberships: { agent_group_id: string; agent_group_name: string }[];
  dmChannels: { channel_type: string }[];
  created_at: string;
}

export interface TokenSummary {
  totals: TokenTotals;
  byModel: Record<string, TokenTotals>;
  byGroup: Record<string, TokenTotals & { name: string }>;
}

export interface TokenTotals {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

export interface ContextWindowInfo {
  agentGroupId: string;
  agentGroupName?: string;
  sessionId: string;
  model: string;
  contextTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  maxContext: number;
  usagePercent: number;
  timestamp: string;
}

export interface ActivityBucket {
  hour: string;
  inbound: number;
  outbound: number;
}

export interface DashboardConfig {
  port?: number;
  secret?: string;
}
