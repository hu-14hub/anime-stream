"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

interface Comment {
  id: number;
  author: string;
  text: string;
}

export function CommentsSection({ dict }: { dict: Dictionary }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      { id: Date.now(), author: "Guest", text },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <section aria-labelledby="comments-heading" className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 id="comments-heading" className="flex items-center gap-2 text-lg font-extrabold">
        <MessageCircle className="h-5 w-5 text-purple-400" aria-hidden />
        {dict.watch.comments}
        <span dir="ltr" className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-300">
          {comments.length}
        </span>
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{dict.watch.commentsPlaceholder}</p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={dict.watch.writeComment}
          aria-label={dict.watch.writeComment}
          className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 text-sm font-bold text-white shadow-lg shadow-purple-900/30 transition hover:scale-105 disabled:opacity-50"
          disabled={!draft.trim()}
        >
          <Send className="h-4 w-4 rtl-flip" aria-hidden />
          {dict.watch.postComment}
        </button>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-xs font-bold text-purple-300">{c.author}</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
