"use client";

// Publish: check the site, see what changed since the last publish, preview
// the finished site, then send it to GitHub with GitHub Desktop.
import { useGetPuck } from "@puckeditor/core";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { InfoIcon } from "@phosphor-icons/react/dist/ssr/Info";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { runChecks, type Issue } from "./checks";
import { selectAndReveal } from "./puck-utils";
import { useStudio } from "./state";
import { Button, Dialog, Section, Spinner, ui } from "./ui";
import st from "./studio.module.css";

type Status = Awaited<ReturnType<typeof api.publishStatus>>;
type Stage = "review" | "publishing" | "done";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function PublishDialog() {
  const { dialog } = useStudio();
  // Mounted fresh each time it opens, so it always starts at the review step.
  return dialog === "publish" ? <PublishFlow /> : null;
}

function PublishFlow() {
  const studio = useStudio();
  const { setDialog, content, flush, toast, confirm, reloadAll, openPage, currentId } = studio;
  const open = true;
  const getPuck = useGetPuck();
  const [status, setStatus] = useState<Status | null>(null);
  const [stage, setStage] = useState<Stage>("review");
  const [desktopOpened, setDesktopOpened] = useState(false);
  const [preview, setPreview] = useState<{ status: string; url: string } | null>(null);

  const issues = useMemo(() => runChecks(content), [content]);
  const mustFix = issues.filter((i) => i.level === "fix");
  const improve = issues.filter((i) => i.level === "improve");

  useEffect(() => {
    void flush().then(() => api.publishStatus().then(setStatus).catch((e) => toast(e.message, { tone: "error" })));
  }, [flush, toast]);

  useEffect(() => {
    if (preview?.status !== "building") return;
    const t = setInterval(async () => {
      const s = await api.previewStatus().catch(() => null);
      if (!s) return;
      setPreview(s);
      if (s.status === "ready") window.open(`${s.url}${content.pages[currentId]?.root.props.path.replace(/^\//, "") ?? ""}`, "_blank", "noopener");
      if (s.status === "failed") toast("The site didn't build. A page may have a problem the checks didn't catch.", { tone: "error" });
    }, 2000);
    return () => clearInterval(t);
  }, [preview?.status, toast, content.pages, currentId]);

  const goTo = (issue: Issue) => {
    setDialog(null);
    if (!issue.pageId) return;
    if (issue.pageId !== currentId) openPage(issue.pageId, { select: issue.blockId });
    else if (issue.blockId) selectAndReveal(getPuck() as never, issue.blockId);
  };

  const publish = async () => {
    setStage("publishing");
    try {
      const res = await api.publish();
      setDesktopOpened(res.installed && res.repo);
      setStage("done");
    } catch (e) {
      toast((e as Error).message, { tone: "error" });
      setStage("review");
    }
  };

  const buildPreview = async () => {
    await flush();
    setPreview({ status: "building", url: "" });
    await api.buildPreview().catch((e) => toast(e.message, { tone: "error" }));
  };

  const discard = async () => {
    const ok = await confirm({
      title: "Discard every change since the last publish?",
      body: "Pages, photos and settings go back to how they were when you last published. Today's work is kept in History, so you can still bring it back.",
      confirm: "Discard changes",
      danger: true,
    });
    if (!ok) return;
    const next = await api.discard();
    reloadAll(next);
    setDialog(null);
    toast("Back to the last published version.", { tone: "success" });
  };

  const changes = status?.changes ?? [];

  return (
    <Dialog
      open={open}
      onClose={() => setDialog(null)}
      title={stage === "done" ? "Almost live" : "Publish your changes"}
      size="m"
      footer={
        stage === "done" ? (
          <Button variant="primary" onClick={() => setDialog(null)}>
            Back to editing
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={buildPreview} disabled={preview?.status === "building"} icon={preview?.status === "building" ? <Spinner /> : <ArrowSquareOutIcon size={16} />}>
              {preview?.status === "building" ? "Building the finished site…" : "See the finished site first"}
            </Button>
            <Button variant="primary" onClick={publish} disabled={stage === "publishing" || (status !== null && changes.length === 0)}>
              {stage === "publishing" ? "Preparing…" : changes.length ? `Publish ${changes.length} ${changes.length === 1 ? "change" : "changes"}` : "Nothing to publish"}
            </Button>
          </>
        )
      }
    >
      {stage === "done" ? (
        <div className={st.publishGrid}>
          <p style={{ margin: 0 }}>{desktopOpened ? "GitHub Desktop has opened with your changes. Finish there:" : "Open GitHub Desktop and choose this site's repository, then:"}</p>
          <ol className={st.steps}>
            <li>Check the list on the left: it shows every file that changed.</li>
            <li>In the Summary box at the bottom left, write a few words, like &ldquo;New photos for Ratna&rdquo;.</li>
            <li>Press Commit to main.</li>
            <li>Press Push origin at the top.</li>
          </ol>
          <p className={ui.hint} style={{ margin: 0 }}>
            Your site updates about two minutes after pushing. {status?.desktop.installed ? null : "GitHub Desktop isn't installed on this Mac yet: get it from desktop.github.com."}
          </p>
        </div>
      ) : (
        <div className={st.publishGrid}>
          <Section title="Before you publish">
            {issues.length === 0 ? (
              <p style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}>
                <CheckCircleIcon size={18} className={st.level} data-level="good" /> Everything looks ready.
              </p>
            ) : (
              <ul className={st.checkList}>
                {[...mustFix, ...improve].slice(0, 40).map((i, n) => (
                  <li key={n}>
                    {i.level === "fix" ? <WarningCircleIcon size={18} className={st.level} data-level="fix" /> : <InfoIcon size={18} className={st.level} data-level="improve" />}
                    <span>
                      {i.message}
                      <small>{i.where}</small>
                    </span>
                    {i.pageId ? (
                      <Button size="s" onClick={() => goTo(i)}>
                        Go to it
                      </Button>
                    ) : (
                      <span />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {mustFix.length ? <p className={ui.hint}>You can still publish; these are worth fixing first.</p> : null}
          </Section>

          <Section title="What will change">
            {!status ? (
              <Spinner />
            ) : changes.length ? (
              <ul className={st.checkList}>
                {changes.map((c) => (
                  <li key={c.file}>
                    <span className={ui.caps} style={{ minWidth: 64 }}>
                      {c.change === "new" ? "New" : c.change === "removed" ? "Removed" : "Changed"}
                    </span>
                    <span>{c.title}</span>
                    <span />
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0 }}>Nothing has changed since you last published on {when(status.publishedAt)}.</p>
            )}
            {status && changes.length ? <p className={ui.hint}>Last published {when(status.publishedAt)}.</p> : null}
          </Section>

          {changes.length ? (
            <Section title="Changed your mind?">
              <div>
                <Button variant="danger" size="s" onClick={discard}>
                  Discard changes since the last publish
                </Button>
              </div>
            </Section>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
