import "server-only";

import { createClient } from "@/lib/supabase/server";

export const auditActionOptions = [
  "product_status_changed",
  "product_updated",
  "products_insert",
  "products_delete",
  "staff_profile_updated",
  "enquiry_updated",
  "branches_insert",
  "branches_update",
  "branches_delete",
  "downloads_insert",
  "downloads_update",
  "downloads_delete",
  "content_pages_insert",
  "content_pages_update",
  "content_pages_delete",
  "leadership_profiles_insert",
  "leadership_profiles_update",
  "leadership_profiles_delete",
] as const;

export const auditEntityOptions = [
  "products",
  "profiles",
  "enquiries",
  "branches",
  "downloads",
  "content_pages",
  "leadership_profiles",
] as const;

export interface AuditActor {
  id: string;
  fullName: string;
  email: string | null;
}

export interface AdminAuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: AuditActor | null;
}

interface AuditLogRecord {
  id: number;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: unknown;
  created_at: string;
}

interface ProfileRecord {
  id: string;
  full_name: string;
}

export interface AuditLogFilters {
  query?: string;
  action?: string;
  entity?: string;
  actor?: string;
  days?: string;
  page?: string;
}

export interface AuditLogData {
  logs: AdminAuditLog[];
  actors: AuditActor[];
  total: number;
  page: number;
  pageSize: number;
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function getAdminAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogData> {
  const supabase = await createClient();
  const pageSize = 50;
  const parsedPage = Number(filters.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const start = (page - 1) * pageSize;

  let request = supabase
    .from("audit_logs")
    .select("id, user_id, action, entity_type, entity_id, metadata, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, start + pageSize - 1);

  const search = filters.query?.trim().slice(0, 100).replace(/[,()%]/g, "");
  if (search) request = request.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`);
  if (filters.action && auditActionOptions.some((action) => action === filters.action)) request = request.eq("action", filters.action);
  if (filters.entity && auditEntityOptions.some((entity) => entity === filters.entity)) request = request.eq("entity_type", filters.entity);
  if (filters.actor?.match(/^[0-9a-f-]{36}$/i)) request = request.eq("user_id", filters.actor);

  const requestedDays = Number(filters.days ?? "30");
  if ([7, 30, 90, 365].includes(requestedDays)) {
    request = request.gte("created_at", new Date(Date.now() - requestedDays * 86_400_000).toISOString());
  }

  const [logsResult, actorsResult] = await Promise.all([
    request,
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  if (logsResult.error) {
    console.error("[admin:audit-logs]", { code: logsResult.error.code, message: logsResult.error.message });
    throw new Error("Activity logs could not be loaded.");
  }

  const actorRows = actorsResult.error ? [] : (actorsResult.data ?? []) as ProfileRecord[];
  const actors = actorRows.map((actor) => ({ id: actor.id, fullName: actor.full_name, email: null }));
  const actorMap = new Map(actors.map((actor) => [actor.id, actor]));

  return {
    logs: ((logsResult.data ?? []) as AuditLogRecord[]).map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      metadata: metadataRecord(log.metadata),
      createdAt: log.created_at,
      actor: log.user_id ? actorMap.get(log.user_id) ?? null : null,
    })),
    actors,
    total: logsResult.count ?? 0,
    page,
    pageSize,
  };
}
