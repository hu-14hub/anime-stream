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
    <section aria-labelledby="comments-heading" className="rounded-2xl bg-white/[0.03] p-5 sm:p-6">
      <h2 id="comments-heading" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
        <MessageCircle className="h-5 w-5 text-cyan-300" aria-hidden />
        {dict.watch.comments}
        <span dir="ltr" className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-neutral-300">
          {comments.length}
        </span>
      </h2>
      <p className="mt-2 text-sm leading-7 text-neutral-400">{dict.watch.commentsPlaceholder}</p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={dict.watch.writeComment}
          aria-label={dict.watch.writeComment}
          className="h-11 flex-1 rounded-full bg-white/5 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all duration-300 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/40"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1.5 rounded-full bg-cyan-400 px-5 text-sm font-bold text-neutral-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:bg-cyan-300 disabled:opacity-50"
          disabled={!draft.trim()}
        >
          <Send className="h-4 w-4 rtl-flip" aria-hidden />
          {dict.watch.postComment}
        </button>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="animate-fade-up rounded-xl bg-white/5 p-3.5">
            <p className="text-xs font-bold text-cyan-300">{c.author}</p>
            <p className="mt-1 text-sm leading-7 text-neutral-200">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
