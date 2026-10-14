// The Studio's save API. Exists only while the Studio runs (`npm run studio`);
// the published site has no server and never includes this file.
import fs from "node:fs/promises";
import type { MediaItem } from "@/lib/content-types";
import { readAllContent } from "@/studio/server/content";
import { contentFile, exists, pageFile, writeJson } from "@/studio/server/files";
import { deletedPages, listSnapshots, listVersions, readSnapshot, restoreSnapshot, restoreVersion, saveVersion, snapshot } from "@/studio/server/history";
import { UploadError, addUpload, cutSwatch, removeMedia, replaceEverywhere, usage } from "@/studio/server/media";
import { buildPreview, changes, discard, githubDesktop, previewState, publish } from "@/studio/server/publish";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string[] }> };

const ok = (data: unknown = { ok: true }) => Response.json(data);
const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

const readAll = readAllContent;

async function save(name: string, data: unknown) {
  await snapshot(name, "edit");
  await writeJson(contentFile(name), data);
}

async function handle(method: string, req: Request, ctx: Ctx) {
  const [area, id, sub] = (await ctx.params).slug;
  const url = new URL(req.url);

  switch (`${method} ${area}`) {
    case "GET content":
      return ok(await readAll());

    case "PUT pages": {
      if (!id) return fail("Which page?");
      await save(`pages/${id}`, await req.json());
      return ok();
    }
    case "POST pages": {
      if (!id) return fail("Which page?");
      if (await exists(pageFile(id))) return fail("A page with that name already exists.", 409);
      await writeJson(pageFile(id), await req.json());
      return ok();
    }
    case "DELETE pages": {
      if (!id) return fail("Which page?");
      if (id === "home") return fail("The home page can't be deleted.");
      await snapshot(`pages/${id}`, "deleted", { force: true });
      await fs.rm(pageFile(id), { force: true });
      return ok();
    }
    case "PUT site":
    case "PUT collections":
    case "PUT media":
      await save(area, await req.json());
      return ok();

    case "POST upload": {
      const form = await req.formData();
      const folder = String(form.get("folder") ?? "Uploads");
      const items: MediaItem[] = [];
      const errors: string[] = [];
      for (const file of form.getAll("files")) {
        if (!(file instanceof File)) continue;
        try {
          items.push(await addUpload(file, folder));
        } catch (e) {
          errors.push(e instanceof UploadError ? e.message : `${file.name} couldn't be added.`);
        }
      }
      return ok({ items, errors });
    }
    case "POST swatch": {
      const { src, focus, size } = await req.json();
      return ok(await cutSwatch(src, focus ?? { x: 50, y: 50 }, Number(size) || 0.5));
    }
    case "GET usage":
      return ok(await usage(url.searchParams.get("src") ?? ""));
    case "POST replace": {
      const form = await req.formData();
      const src = String(form.get("src") ?? "");
      const file = form.get("file");
      if (!src || !(file instanceof File)) return fail("Choose a photo to replace it with.");
      const item = await addUpload(file, String(form.get("folder") ?? "Uploads"));
      const changed = await replaceEverywhere(src, item);
      return ok({ item, changed });
    }
    case "DELETE media":
      await removeMedia(url.searchParams.get("src") ?? "");
      return ok();

    case "GET history": {
      const file = url.searchParams.get("file") ?? "";
      if (!file) return ok({ versions: await listVersions(), deleted: await deletedPages() });
      if (id === "read") return ok(await readSnapshot(file, url.searchParams.get("id") ?? ""));
      return ok(await listSnapshots(file));
    }
    case "POST history": {
      const body = await req.json();
      if (id === "restore") return ok({ data: await restoreSnapshot(body.file, body.id) });
      if (id === "version") return ok(await saveVersion(String(body.label ?? "")));
      if (id === "restore-version") {
        await restoreVersion(body.id);
        return ok(await readAll());
      }
      if (id === "undelete") {
        const data = await readSnapshot(`pages/${body.id}`, body.snapshot);
        await writeJson(pageFile(body.id), data);
        return ok({ data });
      }
      return fail("Unknown history action");
    }

    case "GET publish":
      return ok({ ...(await changes()), desktop: await githubDesktop() });
    case "POST publish":
      if (id === "discard") {
        await discard();
        return ok(await readAll());
      }
      return ok(await publish());

    case "GET preview":
      return ok(previewState());
    case "POST preview":
      return ok(buildPreview());
  }
  void sub;
  return fail(`Unknown Studio request: ${method} ${area}`, 404);
}

async function run(method: string, req: Request, ctx: Ctx) {
  try {
    return await handle(method, req, ctx);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return fail(message, e instanceof UploadError ? 400 : 500);
  }
}

export const GET = (req: Request, ctx: Ctx) => run("GET", req, ctx);
export const PUT = (req: Request, ctx: Ctx) => run("PUT", req, ctx);
export const POST = (req: Request, ctx: Ctx) => run("POST", req, ctx);
export const DELETE = (req: Request, ctx: Ctx) => run("DELETE", req, ctx);
