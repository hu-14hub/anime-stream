"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  MessageCircle,
  CornerDownRight,
  Send,
  Trash2,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { CommentItem } from "@/types";
import {
  KEYS,
  addComment,
  addReply,
  addReport,
  deleteComment,
  getProfile,
  toggleCommentLike,
} from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { cn } from "@/lib/utils";

function timeAgo(ts: number, dict: Dictionary): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return dict.comments.justNow;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(ts).toLocaleDateString();
}

/**
 * Threaded comments with likes, replies, reporting and moderation flags.
 * `target` scopes the thread, e.g. `anime:one-piece` or
 * `watch:one-piece:5` — everything persists in the local store so the
 * admin moderation screen can read the exact same collection.
 */
export function CommentsSection({
  target,
  dict,
  headingId,
  title,
}: {
  target: string;
  dict: Dictionary;
  headingId?: string;
  title?: string;
}) {
  const [comments, refresh] = useStore<CommentItem[]>(KEYS.comments, []);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reported, setReported] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const p = getProfile();
    setName(p.name && p.name !== "Guest" ? p.name : dict.comments.guest);
  }, [dict.comments.guest]);

  // Live-sync across tabs is handled by useStore's own subscriptions.

  const thread = comments.filter((c) => c.target === target && !c.hidden);
  const hiddenCount = comments.filter((c) => c.target === target && c.hidden).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addComment({ target, author: name, text });
    setDraft("");
  };

  const submitReply = (id: string) => {
    const text = replyDraft.trim();
    if (!text) return;
    addReply(target, id, name, text);
    setReplyDraft("");
    setReplyTo(null);
  };

  const like = (id: string) => {
    toggleCommentLike(target, id);
    refresh();
  };

  const toggleReplies = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const report = (id: string) => {
    // Lands in the shared reports collection consumed by /admin/moderation.
    addReport({
      targetType: "comment",
      targetId: id,
      reason: "comment",
      detail: `${target} — ${name}`,
    });
    setReported(id);
    setTimeout(() => setReported((cur) => (cur === id ? null : cur)), 2500);
  };

  return (
    <section aria-labelledby={headingId ?? "comments-heading"} className="rounded-2xl bg-white/[0.03] p-5 sm:p-6">
      <h2
        id={headingId ?? "comments-heading"}
        className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white"
      >
        <MessageCircle className="h-5 w-5 text-cyan-300" aria-hidden />
        {title ?? dict.comments.title}
        <span
          dir="ltr"
          className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-neutral-300"
        >
          {thread.length}
        </span>
        {hiddenCount > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            {hiddenCount} {dict.comments.hidden}
          </span>
        )}
      </h2>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={dict.comments.placeholder}
          aria-label={dict.comments.placeholder}
          maxLength={800}
          className="h-11 flex-1 rounded-full bg-white/5 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all duration-300 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/40"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1.5 rounded-full bg-cyan-400 px-5 text-sm font-bold text-neutral-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:bg-cyan-300 disabled:opacity-50"
          disabled={!draft.trim()}
        >
          <Send className="h-4 w-4 rtl-flip" aria-hidden />
          {dict.comments.post}
        </button>
      </form>

      {thread.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white/[0.03] px-4 py-8 text-center text-sm text-neutral-500">
          {dict.comments.noComments}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {thread.map((c) => {
            const isOpen = expanded.has(c.id);
            return (
              <li key={c.id} className="animate-fade-up rounded-xl bg-white/5 p-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    {c.author}
                    <span className="font-medium text-neutral-600">
                      · {timeAgo(c.createdAt, dict)}
                    </span>
                  </p>
                  <p className="mt-1 break-words text-sm leading-7 text-neutral-200">{c.text}</p>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => like(c.id)}
                    aria-pressed={Boolean(c.likedByMe)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                      c.likedByMe
                        ? "bg-red-500/15 text-red-400"
                        : "text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
                    )}
                  >
                    <Heart className={cn("h-3.5 w-3.5", c.likedByMe && "fill-red-500")} aria-hidden />
                    <span dir="ltr">{c.likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(replyTo === c.id ? null : c.id);
                      setReplyDraft("");
                    }}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-500 transition-colors hover:bg-white/10 hover:text-cyan-300"
                  >
                    <CornerDownRight className="h-3.5 w-3.5" aria-hidden />
                    {dict.comments.reply}
                  </button>


                  {c.replies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(c.id)}
                      aria-expanded={isOpen}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      )}
                      <span dir="ltr">{c.replies.length}</span> {dict.comments.replies}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => report(c.id)}
                    disabled={reported === c.id}
                    className="ms-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-600 transition-colors hover:bg-white/10 hover:text-amber-400 disabled:text-emerald-400"
                  >
                    <Flag className="h-3.5 w-3.5" aria-hidden />
                    {reported === c.id ? dict.comments.reported : dict.comments.report}
                  </button>

                  {c.author === name && (
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      aria-label={dict.admin.remove}
                      className="rounded-full px-2 py-1 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                </div>

                {/* Reply composer */}
                {replyTo === c.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitReply(c.id);
                    }}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      autoFocus
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder={`${dict.comments.replyTo} ${c.author}…`}
                      aria-label={dict.comments.replyPlaceholder}
                      className="h-9 flex-1 rounded-full bg-white/5 px-3.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <button
                      type="submit"
                      disabled={!replyDraft.trim()}
                      className="flex h-9 items-center gap-1 rounded-full bg-cyan-400 px-3.5 text-xs font-bold text-neutral-950 transition-all duration-300 hover:bg-cyan-300 disabled:opacity-50"
                    >
                      <Send className="h-3 w-3 rtl-flip" aria-hidden />
                      {dict.comments.send}
                    </button>
                  </form>
                )}

                {/* Replies */}
                {isOpen && c.replies.length > 0 && (
                  <ul className="mt-3 space-y-2 border-s-2 border-white/10 ps-3">
                    {c.replies.map((r) => (
                      <li key={r.id} className="rounded-lg bg-white/[0.04] p-2.5">
                        <p className="flex items-center gap-2 text-[11px] font-bold text-cyan-400/90">
                          {r.author}
                          <span className="font-medium text-neutral-600">
                            · {timeAgo(r.createdAt, dict)}
                          </span>
                        </p>
                        <p className="mt-0.5 break-words text-xs leading-6 text-neutral-300">
                          {r.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

