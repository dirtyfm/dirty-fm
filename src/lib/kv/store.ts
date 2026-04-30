import {
  isProductionLikeRuntime,
  validateCloudflareKvRestEnv
} from "../runtimeConfigCore.ts";

type JsonValue = unknown;

export type DirtyKvNamespace = {
  delete(key: string): Promise<void>;
  get<T = JsonValue>(key: string, type: "json"): Promise<T | null>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type CloudflareKvRestEnv = {
  accountId: string;
  apiToken: string;
  namespaceId: string;
};

const memoryKv = new Map<string, string>();

const memoryNamespace: DirtyKvNamespace = {
  async delete(key) {
    memoryKv.delete(key);
  },
  async get<T = JsonValue>(key: string, type?: "json") {
    const value = memoryKv.get(key) ?? null;

    if (type === "json") {
      return value ? (JSON.parse(value) as T) : null;
    }

    return value as T | null;
  },
  async put(key, value) {
    memoryKv.set(key, value);
  }
};

type CloudflareContext = {
  env?: {
    DIRTYFM_CONTENT?: DirtyKvNamespace;
  };
};

function getCloudflareKvRestEnv(): CloudflareKvRestEnv | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    return null;
  }

  return { accountId, apiToken, namespaceId };
}

function createCloudflareKvRestNamespace(
  env: CloudflareKvRestEnv,
  fetcher: typeof fetch = fetch
): DirtyKvNamespace {
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/storage/kv/namespaces/${env.namespaceId}/values`;

  function keyUrl(key: string) {
    return `${baseUrl}/${encodeURIComponent(key)}`;
  }

  async function request(key: string, init?: RequestInit) {
    return fetcher(keyUrl(key), {
      ...init,
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
        ...init?.headers
      }
    });
  }

  async function assertOk(response: Response, action: string, key: string) {
    if (response.ok) {
      return;
    }

    const detail = await response.text().catch(() => "");
    throw new Error(
      `Cloudflare KV ${action} failed for ${key}: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`
    );
  }

  async function assertMutationOk(response: Response, action: string, key: string) {
    const detail = await response.text().catch(() => "");

    if (action === "delete" && response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Cloudflare KV ${action} failed for ${key}: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`
      );
    }

    if (!detail.trim()) {
      return;
    }

    try {
      const payload = JSON.parse(detail) as {
        errors?: Array<{ message?: string }>;
        messages?: Array<{ message?: string }>;
        success?: boolean;
      };

      if (payload.success === false) {
        const messages = [...(payload.errors ?? []), ...(payload.messages ?? [])]
          .map((item) => item.message)
          .filter(Boolean)
          .join("; ");
        throw new Error(
          `Cloudflare KV ${action} failed for ${key}: API success=false${messages ? ` - ${messages}` : ""}`
        );
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        return;
      }

      throw error;
    }
  }

  return {
    async delete(key) {
      const response = await request(key, { method: "DELETE" });
      await assertMutationOk(response, "delete", key);
    },
    async get<T = JsonValue>(key: string, type?: "json") {
      const response = await request(key);

      if (response.status === 404) {
        return null;
      }

      await assertOk(response, "read", key);
      const value = await response.text();

      if (type === "json") {
        return (value ? JSON.parse(value) : null) as T | null;
      }

      return value as T | null;
    },
    async put(key, value) {
      const response = await request(key, {
        body: value,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        method: "PUT"
      });
      await assertMutationOk(response, "write", key);
    }
  };
}

async function getCloudflareContext(): Promise<CloudflareContext | null> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string
    ) => Promise<{ getCloudflareContext?: () => CloudflareContext }>;
    const mod = await dynamicImport("@opennextjs/cloudflare");
    return mod.getCloudflareContext?.() ?? null;
  } catch {
    return null;
  }
}

export async function getDirtyfmKvNamespace() {
  const context = await getCloudflareContext();
  const binding = context?.env?.DIRTYFM_CONTENT;

  if (binding) {
    return binding;
  }

  const restEnv = getCloudflareKvRestEnv();

  if (restEnv) {
    return createCloudflareKvRestNamespace(restEnv);
  }

  if (isProductionLikeRuntime(process.env)) {
    validateCloudflareKvRestEnv();
  }

  return memoryNamespace;
}

export const __test = {
  createCloudflareKvRestNamespace,
  readJsonKeyFromNamespace,
  resetMemoryKv() {
    memoryKv.clear();
  }
};

export async function readJsonKey<T>(key: string, fallback: T): Promise<T> {
  const namespace = await getDirtyfmKvNamespace();
  return readJsonKeyFromNamespace(namespace, key, fallback);
}

async function readJsonKeyFromNamespace<T>(
  namespace: DirtyKvNamespace,
  key: string,
  fallback: T
): Promise<T> {
  try {
    return (await namespace.get<T>(key, "json")) ?? fallback;
  } catch (error) {
    console.error(`Cloudflare KV read failed for ${key}; using fallback.`, error);
    return fallback;
  }
}

export async function writeJsonKey<T>(key: string, value: T) {
  const namespace = await getDirtyfmKvNamespace();
  await namespace.put(key, JSON.stringify(value));
}

export async function deleteJsonKey(key: string) {
  const namespace = await getDirtyfmKvNamespace();
  await namespace.delete(key);
}
