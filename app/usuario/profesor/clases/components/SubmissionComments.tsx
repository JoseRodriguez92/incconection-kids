"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Reply, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  comment: string;
  author_type: string | null;
  parent_comment_id: string | null;
  created_at: string | null;
  profile: { id: string; full_name: string; avatar_url: string | null } | null;
}

interface SubmissionCommentsProps {
  submissionId: string;
  profileId: string;
  authorType: string; // "profesor" | "estudiante"
  /** Si viene de la vista del estudiante, oculta el badge de rol */
  compact?: boolean;
}

function timeAgo(dateString: string | null) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora mismo";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d !== 1 ? "s" : ""}`;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AUTHOR_STYLES: Record<string, string> = {
  profesor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  estudiante: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export function SubmissionComments({
  submissionId,
  profileId,
  authorType,
  compact = false,
}: SubmissionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [submissionId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_activity_submission_comment")
        .select("id, comment, author_type, parent_comment_id, created_at, profile:profile_id(id, full_name, avatar_url)")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments((data ?? []) as Comment[]);
    } catch {
      toast.error("Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("student_activity_submission_comment")
        .insert({
          submission_id: submissionId,
          profile_id: profileId,
          author_type: authorType,
          comment: text.trim(),
          parent_comment_id: replyTo?.id ?? null,
        });
      if (error) throw error;
      setText("");
      setReplyTo(null);
      setExpanded(true);
      await fetchComments();
    } catch {
      toast.error("Error al enviar comentario");
    } finally {
      setSending(false);
    }
  };

  // Separar top-level y replies
  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesFor = (id: string) => comments.filter((c) => c.parent_comment_id === id);

  const renderComment = (c: Comment, isReply = false) => (
    <div key={c.id} className={cn("flex gap-2.5", isReply && "ml-8 mt-2")}>
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        {c.profile?.avatar_url && <AvatarImage src={c.profile.avatar_url} />}
        <AvatarFallback className="text-[10px]">
          {initials(c.profile?.full_name ?? "?")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground truncate">
            {c.profile?.full_name ?? "Desconocido"}
          </span>
          {!compact && c.author_type && (
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
              AUTHOR_STYLES[c.author_type] ?? "bg-muted text-muted-foreground"
            )}>
              {c.author_type}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
            {timeAgo(c.created_at)}
          </span>
        </div>

        <p className="text-xs text-foreground mt-0.5 leading-relaxed whitespace-pre-wrap">
          {c.comment}
        </p>

        {!isReply && (
          <button
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary mt-1 transition-colors"
            onClick={() => {
              setReplyTo(c);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
          >
            <Reply className="h-3 w-3" />
            Responder
          </button>
        )}

        {repliesFor(c.id).map((r) => renderComment(r, true))}
      </div>
    </div>
  );

  const lastComment = topLevel[topLevel.length - 1];
  const hiddenCount = topLevel.length - 1;

  return (
    <div className="space-y-3">
      {/* Encabezado — clickeable si hay más de 1 */}
      <button
        className="flex items-center gap-2 w-full text-left group"
        onClick={() => topLevel.length > 1 && setExpanded((v) => !v)}
      >
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
          Comentarios {comments.length > 0 && `(${comments.length})`}
        </span>
        {topLevel.length > 1 && (
          <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
            {expanded ? (
              <><ChevronUp className="h-3 w-3" /> Ocultar</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Ver todos</>
            )}
          </span>
        )}
      </button>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Cargando...
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          Sin comentarios aún. Sé el primero en comentar.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Mensajes anteriores — solo si está expandido */}
          {expanded && hiddenCount > 0 && (
            <div className="space-y-3">
              {topLevel.slice(0, hiddenCount).map((c) => renderComment(c))}
            </div>
          )}

          {/* Último mensaje — siempre visible */}
          {lastComment && renderComment(lastComment)}
        </div>
      )}

      {/* Input de nuevo comentario */}
      <div className="pt-2 border-t space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
            <Reply className="h-3 w-3 text-primary shrink-0" />
            <span className="text-muted-foreground">
              Respondiendo a <span className="font-medium text-foreground">{replyTo.profile?.full_name}</span>
            </span>
            <button
              className="ml-auto text-muted-foreground hover:text-foreground"
              onClick={() => setReplyTo(null)}
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder={replyTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend();
            }}
            rows={2}
            className="text-xs resize-none flex-1"
          />
          <Button
            size="sm"
            className="self-end h-8 w-8 p-0 shrink-0"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            title="Enviar (Ctrl+Enter)"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Ctrl+Enter para enviar</p>
      </div>
    </div>
  );
}
