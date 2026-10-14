// Talks to the Studio's save API (src/app/api/studio). Every call returns the
// parsed JSON or throws an Error carrying a message fit to show her.
import type { Collection, Img, MediaItem, PageData, SiteSettings } from "@/lib/content-types";

export type Content = { site: SiteSettings; collections: Collection[]; media: MediaItem[]; pages: Record<string, PageData> };

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, headers: {} };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  let res: Response;
  try {
    res = await fetch(`/api/studio/${path}`, init);
  } catch {
    throw new Error("The Studio isn't running. Open it again with Open Studio, then try once more.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Something went wrong (${res.status}).`);
  return data as T;
}

const q = (o: Record<string, string>) => new URLSearchParams(o).toString();

export const api = {
  content: () => call<Content>("GET", "content/"),
  savePage: (id: string, data: PageData) => call("PUT", `pages/${id}/`, data),
  createPage: (id: string, data: PageData) => call("POST", `pages/${id}/`, data),
  deletePage: (id: string) => call("DELETE", `pages/${id}/`),
  saveFile: (name: "site" | "collections" | "media", data: unknown) => call("PUT", `${name}/`, data),

  upload: (files: File[], folder = "Uploads") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);
    return call<{ items: MediaItem[]; errors: string[] }>("POST", "upload/", form);
  },
  swatch: (src: string, focus: { x: number; y: number }, size: number) => call<Img & { shade: string }>("POST", "swatch/", { src, focus, size }),
  usage: (src: string) => call<{ file: string; title: string }[]>("GET", `usage/?${q({ src })}`),
  replace: (src: string, file: File) => {
    const form = new FormData();
    form.append("src", src);
    form.append("file", file);
    return call<{ item: MediaItem; changed: string[] }>("POST", "replace/", form);
  },
  removeMedia: (src: string) => call("DELETE", `media/?${q({ src })}`),

  snapshots: (file: string) => call<{ id: string; at: string; reason: string }[]>("GET", `history/?${q({ file })}`),
  history: () => call<{ versions: { id: string; at: string; label: string }[]; deleted: { id: string; snapshot: string; at: string; title: string }[] }>("GET", "history/"),
  restoreSnapshot: (file: string, id: string) => call<{ data: unknown }>("POST", "history/restore/", { file, id }),
  saveVersion: (label: string) => call("POST", "history/version/", { label }),
  restoreVersion: (id: string) => call<Content>("POST", "history/restore-version/", { id }),
  undelete: (id: string, snapshot: string) => call<{ data: PageData }>("POST", "history/undelete/", { id, snapshot }),

  publishStatus: () =>
    call<{ publishedAt: string; changes: { file: string; title: string; change: "new" | "changed" | "removed" }[]; desktop: { installed: boolean; repo: boolean } }>("GET", "publish/"),
  publish: () => call<{ installed: boolean; repo: boolean; published: number }>("POST", "publish/"),
  discard: () => call<Content>("POST", "publish/discard/"),
  previewStatus: () => call<{ status: "idle" | "building" | "ready" | "failed"; log: string; url: string }>("GET", "preview/"),
  buildPreview: () => call<{ status: string }>("POST", "preview/"),
};
