"use client";

// History: going back further than undo. Named versions of the whole site,
// the copies the Studio keeps of the open page as she works, and pages she
// deleted, ready to bring back.
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PageData } from "@/lib/content-types";
import { api } from "../api";
import { useStudio } from "../state";
import { Button, Empty, PanelHead, Section, Spinner, TextInput } from "../ui";
import { errorText, friendlyDate, plainDate, useOpenWhenReady, whenText } from "./shared";
import p from "./panels.module.css";

type Version = { id: string; at: string; label: string };
type Deleted = { id: string; snapshot: string; at: string; title: string };
type Snap = { id: string; at: string; reason: string };

const REASONS: Record<string, string> = {
  edit: "Autosaved",
  "before-restore": "Before going back",
  "before-discard": "Before discarding changes",
  deleted: "Before deleting",
};

const FIRST = 6;

export function HistoryPanel() {
  const { content, currentId, flush, toast, confirm, reloadAll, replaceCurrent, setSite, openPage } = useStudio();
  const openWhenReady = useOpenWhenReady();
  const pageTitle = content.pages[currentId]?.root.props.title ?? "this page";

  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [history, setHistory] = useState<{ versions: Version[]; deleted: Deleted[] } | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [allVersions, setAllVersions] = useState(false);

  const [snaps, setSnaps] = useState<{ page: string; list: Snap[] } | null>(null);
  const [snapsError, setSnapsError] = useState<{ page: string; message: string } | null>(null);
  const [snapsKey, setSnapsKey] = useState(0);
  const [snapCount, setSnapCount] = useState(FIRST);

  // The open page right now, for answers that arrive after she moved on.
  const live = useRef(currentId);
  useEffect(() => {
    live.current = currentId;
  }, [currentId]);

  // Saved versions and deleted pages. Bumping historyKey loads them again.
  const [historyKey, setHistoryKey] = useState(0);
  const reloadHistory = () => setHistoryKey((k) => k + 1);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        await flush();
        const h = await api.history();
        if (!alive) return;
        setHistory({ versions: h.versions, deleted: h.deleted });
        setHistoryError(null);
      } catch (e) {
        if (!alive) return;
        setHistoryError(errorText(e));
        toast(errorText(e), { tone: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [historyKey, flush, toast]);

  // The open page's earlier copies, again whenever she opens another page.
  useEffect(() => {
    let alive = true;
    const page = currentId;
    void (async () => {
      try {
        await flush();
        const list = await api.snapshots(`pages/${page}`);
        if (!alive) return;
        setSnaps({ page, list });
        setSnapsError(null);
        setSnapCount(FIRST);
      } catch (e) {
        if (!alive) return;
        setSnapsError({ page, message: errorText(e) });
        toast(errorText(e), { tone: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentId, snapsKey, flush, toast]);

  const refreshAll = () => {
    setSnapsKey((k) => k + 1);
    reloadHistory();
  };

  // ------------------------------------------------------------------ actions

  async function saveVersion(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await flush();
      const name = label.trim() || `Saved ${plainDate(new Date())}`;
      await api.saveVersion(name);
      setLabel("");
      toast(`Saved "${name}". You can go back to it any time.`, { tone: "success" });
      reloadHistory();
    } catch (err) {
      toast(errorText(err), { tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function goBackToVersion(v: Version) {
    const ok = await confirm({
      title: `Go back to "${v.label}"?`,
      body: `The whole site returns to how it was ${whenText(v.at)}. The site as it is now is saved as a version first, so you can come back to it.`,
      confirm: "Go back to this",
    });
    if (!ok) return;
    setBusy(v.id);
    try {
      await flush();
      const result = await api.restoreVersion(v.id);
      reloadAll(result);
      if (!result.pages[live.current]) openPage("home");
      toast(`The site is back to "${v.label}".`, { tone: "success" });
      refreshAll();
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function goBackToCopy(s: Snap) {
    const page = currentId;
    const ok = await confirm({
      title: "Go back to this copy?",
      body: `"${pageTitle}" returns to how it was ${whenText(s.at)}. The page as it is now is kept in this list too, so you can switch back.`,
      confirm: "Go back to this",
    });
    if (!ok) return;
    setBusy(s.id);
    try {
      await flush();
      const { data } = await api.restoreSnapshot(`pages/${page}`, s.id);
      if (live.current === page) replaceCurrent(data as PageData);
      else reloadAll(await api.content());
      toast(`"${pageTitle}" is back to how it was ${whenText(s.at)}.`, { tone: "success" });
      setSnapsKey((k) => k + 1);
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function bringBack(d: Deleted) {
    setBusy(d.id);
    try {
      await flush();
      await api.undelete(d.id, d.snapshot);
      reloadAll(await api.content());
      setSite((s) => ({ ...s, pageOrder: (s.pageOrder ?? []).includes(d.id) ? s.pageOrder : [...(s.pageOrder ?? []), d.id] }));
      openWhenReady(d.id);
      toast(`"${d.title}" is back. Add it to the menu from Pages if you need to.`, { tone: "success" });
      reloadHistory();
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    } finally {
      setBusy(null);
    }
  }

  // ------------------------------------------------------------------- render

  const versions = history?.versions ?? [];
  const shownVersions = allVersions ? versions : versions.slice(0, FIRST);
  const pageSnaps = snaps?.page === currentId ? snaps.list : null;
  const pageSnapsError = snapsError?.page === currentId && !pageSnaps ? snapsError.message : null;

  return (
    <div className={p.panel}>
      <PanelHead title="History" />
      <div className={p.body}>
        <Section title="Save a version">
          <form className={p.saveRow} onSubmit={saveVersion}>
            <TextInput label="Name this version" value={label} onChange={setLabel} placeholder="e.g. Before the festive update" />
            <Button type="submit" variant="primary" disabled={saving} icon={saving ? <Spinner /> : null}>
              {saving ? "Saving" : "Save"}
            </Button>
          </form>
          <p className={p.hint}>A snapshot of the whole site you can go back to.</p>
        </Section>

        <Section title="Saved versions">
          {history ? (
            versions.length ? (
              <>
                <ul className={p.entries}>
                  {shownVersions.map((v) => (
                    <li key={v.id} className={p.entry}>
                      <span className={p.entryText}>
                        <span className={p.entryTitle} title={v.label}>
                          {v.label}
                        </span>
                        <span className={p.entryMeta}>{friendlyDate(v.at)}</span>
                      </span>
                      <Button size="s" disabled={busy !== null} icon={busy === v.id ? <Spinner /> : null} onClick={() => void goBackToVersion(v)} aria-label={`Go back to this: ${v.label}`}>
                        Go back to this
                      </Button>
                    </li>
                  ))}
                </ul>
                {versions.length > FIRST ? (
                  <div>
                    <Button size="s" variant="ghost" onClick={() => setAllVersions((x) => !x)} aria-expanded={allVersions}>
                      {allVersions ? "Show fewer" : `Show all ${versions.length}`}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <Empty title="No saved versions yet">Versions appear here as you save them.</Empty>
            )
          ) : historyError ? (
            <LoadError
              message={historyError}
              onRetry={() => {
                setHistoryError(null);
                reloadHistory();
              }}
            />
          ) : (
            <Loading>Looking for saved versions</Loading>
          )}
        </Section>

        <Section title="This page's earlier copies">
          {pageSnaps ? (
            pageSnaps.length ? (
              <>
                <p className={p.hint}>Copies of &ldquo;{pageTitle}&rdquo; the Studio kept as you worked, newest first.</p>
                <ul className={p.entries}>
                  {pageSnaps.slice(0, snapCount).map((s) => (
                    <li key={s.id} className={p.entry}>
                      <span className={p.entryText}>
                        <span className={p.entryTitle}>{friendlyDate(s.at)}</span>
                        <span className={p.entryMeta}>{REASONS[s.reason] ?? "Saved copy"}</span>
                      </span>
                      <Button size="s" disabled={busy !== null} icon={busy === s.id ? <Spinner /> : null} onClick={() => void goBackToCopy(s)} aria-label={`Go back to this: the copy from ${friendlyDate(s.at)}`}>
                        Go back to this
                      </Button>
                    </li>
                  ))}
                </ul>
                {pageSnaps.length > snapCount ? (
                  <div>
                    <Button size="s" variant="ghost" onClick={() => setSnapCount((n) => n + 20)}>
                      Show older copies
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <Empty title="No earlier copies yet">The Studio keeps a copy of this page every few minutes while you edit it.</Empty>
            )
          ) : pageSnapsError ? (
            <LoadError
              message={pageSnapsError}
              onRetry={() => {
                setSnapsError(null);
                setSnapsKey((k) => k + 1);
              }}
            />
          ) : (
            <Loading>Looking for earlier copies</Loading>
          )}
        </Section>

        <Section title="Deleted pages">
          {history ? (
            history.deleted.length ? (
              <ul className={p.entries}>
                {history.deleted.map((d) => (
                  <li key={d.id} className={p.entry}>
                    <span className={p.entryText}>
                      <span className={p.entryTitle} title={d.title}>
                        {d.title}
                      </span>
                      <span className={p.entryMeta}>Deleted {whenText(d.at)}</span>
                    </span>
                    <Button size="s" disabled={busy !== null} icon={busy === d.id ? <Spinner /> : null} onClick={() => void bringBack(d)} aria-label={`Bring back ${d.title}`}>
                      Bring back
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No deleted pages">Pages you delete wait here, so you can bring them back.</Empty>
            )
          ) : historyError ? null : (
            <Loading>Looking for deleted pages</Loading>
          )}
        </Section>
      </div>
    </div>
  );
}

function Loading({ children }: { children: string }) {
  return (
    <div className={p.loading}>
      <Spinner />
      <span>{children}</span>
    </div>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Empty
      title="History couldn't be loaded"
      action={
        <Button size="s" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      {message}
    </Empty>
  );
}
