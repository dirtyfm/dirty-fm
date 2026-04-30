type JsonValue = unknown;

export type DirtyKvNamespace = {
  delete(key: string): Promise<void>;
  get<T = JsonValue>(key: string, type: "json"): Promise<T | null>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
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
  return context?.env?.DIRTYFM_CONTENT ?? memoryNamespace;
}

export async function readJsonKey<T>(key: string, fallback: T): Promise<T> {
  const namespace = await getDirtyfmKvNamespace();
  return (await namespace.get<T>(key, "json")) ?? fallback;
}

export async function writeJsonKey<T>(key: string, value: T) {
  const namespace = await getDirtyfmKvNamespace();
  await namespace.put(key, JSON.stringify(value));
}

export async function deleteJsonKey(key: string) {
  const namespace = await getDirtyfmKvNamespace();
  await namespace.delete(key);
}
