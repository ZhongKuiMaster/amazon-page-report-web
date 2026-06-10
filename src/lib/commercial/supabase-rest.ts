type SupabaseRow = Record<string, unknown>;

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

function getConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url: url.endsWith("/") ? url.slice(0, -1) : url,
    serviceRoleKey,
  };
}

export function isCommercialBackendConfigured() {
  return getConfig() !== null;
}

function headers(config: SupabaseConfig, prefer?: string) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {}),
  };
}

function tableUrl(config: SupabaseConfig, table: string, query = "") {
  const suffix = query ? `?${query}` : "";
  return `${config.url}/rest/v1/${table}${suffix}`;
}

export async function supabaseSelect<T extends SupabaseRow>(table: string, query: string): Promise<T[]> {
  const config = getConfig();
  if (!config) {
    throw new Error("COMMERCIAL_BACKEND_NOT_CONFIGURED");
  }

  const response = await fetch(tableUrl(config, table, query), {
    headers: headers(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SUPABASE_SELECT_FAILED");
  }

  return response.json() as Promise<T[]>;
}

export async function supabaseInsert<T extends SupabaseRow>(table: string, payload: SupabaseRow | SupabaseRow[]): Promise<T[]> {
  const config = getConfig();
  if (!config) {
    throw new Error("COMMERCIAL_BACKEND_NOT_CONFIGURED");
  }

  const response = await fetch(tableUrl(config, table), {
    method: "POST",
    headers: headers(config, "return=representation"),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SUPABASE_INSERT_FAILED");
  }

  return response.json() as Promise<T[]>;
}

export async function supabasePatch<T extends SupabaseRow>(table: string, query: string, payload: SupabaseRow): Promise<T[]> {
  const config = getConfig();
  if (!config) {
    throw new Error("COMMERCIAL_BACKEND_NOT_CONFIGURED");
  }

  const response = await fetch(tableUrl(config, table, query), {
    method: "PATCH",
    headers: headers(config, "return=representation"),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SUPABASE_PATCH_FAILED");
  }

  return response.json() as Promise<T[]>;
}

export async function supabaseRpc<T extends SupabaseRow | SupabaseRow[]>(functionName: string, payload: SupabaseRow): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error("COMMERCIAL_BACKEND_NOT_CONFIGURED");
  }

  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SUPABASE_RPC_FAILED");
  }

  return response.json() as Promise<T>;
}
