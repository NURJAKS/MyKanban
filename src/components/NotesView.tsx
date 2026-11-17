import React, { useState, useEffect, useRef, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import {
  Plus,
  Pin,
  Trash2,
  Copy,
  Check,
  FileText,
  ListChecks,
  BookOpen,
} from 'lucide-react';

export const NotesView: React.FC = memo(() => {
  const { notes, addNote, updateNote, deleteNote, searchQuery, showToast } = useKanban();

  const sortedNotes = [...notes].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const filteredNotes = searchQuery.trim()
    ? sortedNotes.filter((n) => {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        );
      })
    : sortedNotes;

  const [activeNoteId, setActiveNoteId] = useState<string>(() => sortedNotes[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!notes.some((n) => n.id === activeNoteId)) {
      setActiveNoteId(sortedNotes[0]?.id || '');
    }
  }, [notes, activeNoteId, sortedNotes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || sortedNotes[0];

  const handleCreateNote = () => {
    const newId = addNote('New University Note');
    setActiveNoteId(newId);
  };

  const handleDeleteActive = () => {
    if (!activeNote || notes.length <= 1) return;
    deleteNote(activeNote.id);
    showToast('Note deleted');
  };

  const handleCopyContent = async () => {
    if (!activeNote) return;
    const text = activeNote.title
      ? `${activeNote.title}\n\n${activeNote.content}`
      : activeNote.content;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const insertPrefixAtCursor = (prefix: string) => {
    if (!activeNote) return;
    const el = textareaRef.current;
    if (!el) {
      const next = activeNote.content ? `${activeNote.content}\n${prefix}` : prefix;
      updateNote(activeNote.id, { content: next });
      return;
    }

    const start = el.selectionStart ?? activeNote.content.length;
    const end = el.selectionEnd ?? activeNote.content.length;
    const before = activeNote.content.slice(0, start);
    const after = activeNote.content.slice(end);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insertion = `${needsNewline ? '\n' : ''}${prefix}`;
    const nextContent = `${before}${insertion}${after}`;

    updateNote(activeNote.id, { content: nextContent });

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const pos = before.length + insertion.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    });
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const contentText = activeNote?.content || '';
  const wordCount = contentText.trim() ? contentText.trim().split(/\s+/).length : 0;
  const lineCount = contentText ? contentText.split('\n').length : 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 pb-6 min-h-[calc(100vh-170px)]">
      {/* Left Notes Sidebar */}
      <aside className="w-full md:w-72 shrink-0 bg-white dark:bg-[#18191a] border border-[#e0e2ec] dark:border-[#282a2c] rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm dark:shadow-none md:max-h-[calc(100vh-170px)]">
        <div className="flex items-center justify-between px-1 pb-2 border-b border-[#e0e2ec] dark:border-[#282a2c]">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-[#0b57d0] dark:text-[#8ab4f8]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
              University Notes ({notes.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCreateNote}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] hover:bg-[#d3e3fd] dark:hover:bg-[#8ab4f8]/25 transition-colors"
          >
            <Plus size={13} />
            <span>New</span>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto custom-scrollbar pb-1 md:pb-0">
          {filteredNotes.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#747775] dark:text-[#5f6368] w-full">
              No matching notes
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setActiveNoteId(note.id)}
                  className={`min-w-[190px] md:min-w-0 w-full text-left p-2.5 rounded-xl border transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#d3e3fd]/40 dark:bg-[#8ab4f8]/15 border-[#a8c7fa] dark:border-[#8ab4f8]/40'
                      : 'bg-[#f8fafd] dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] hover:bg-[#f0f4f9] dark:hover:bg-[#25272a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? 'text-[#0b57d0] dark:text-[#8ab4f8]'
                          : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                      }`}
                    >
                      {note.title.trim() || 'Untitled Note'}
                    </span>
                    {note.pinned && (
                      <Pin
                        size={11}
                        className="text-[#0b57d0] dark:text-[#8ab4f8] shrink-0 fill-current"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] truncate mt-1">
                    {note.content.trim() || 'Empty note — click to write rules...'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Note Editor */}
      {activeNote && (
        <section className="flex-1 bg-white dark:bg-[#18191a] border border-[#e0e2ec] dark:border-[#282a2c] rounded-2xl flex flex-col shadow-sm dark:shadow-none overflow-hidden min-h-[420px] md:max-h-[calc(100vh-170px)]">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#e0e2ec] dark:border-[#282a2c] bg-[#f8fafd] dark:bg-[#1e1f20]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateNote(activeNote.id, { pinned: !activeNote.pinned })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  activeNote.pinned
                    ? 'bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] border-[#a8c7fa] dark:border-[#8ab4f8]/40'
                    : 'bg-white dark:bg-[#282a2c] text-[#5f6368] dark:text-[#c4c7c5] border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#333538]'
                }`}
                title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin size={12} className={activeNote.pinned ? 'fill-current' : ''} />
                <span>{activeNote.pinned ? 'Pinned' : 'Pin'}</span>
              </button>

              <button
                type="button"
                onClick={() => insertPrefixAtCursor('• ')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#282a2c] text-[#5f6368] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#333538] transition-colors"
                title="Insert bullet rule"
              >
                <FileText size={12} />
                <span>+ Bullet</span>
              </button>

              <button
                type="button"
                onClick={() => insertPrefixAtCursor('[ ] ')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#282a2c] text-[#5f6368] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#333538] transition-colors"
                title="Insert checklist item"
              >
                <ListChecks size={12} />
                <span>+ Check</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#5f6368] dark:text-[#8e918f] hidden sm:inline font-mono">
                Updated {formatTimestamp(activeNote.updatedAt)}
              </span>

              <button
                type="button"
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#282a2c] text-[#5f6368] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#333538] transition-colors"
                title="Copy note to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-[#137333] dark:text-[#81c995]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {notes.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteActive}
                  className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#b3261e] dark:hover:text-[#f28b82] hover:bg-[#f9dedc]/50 dark:hover:bg-[#f28b82]/10 transition-colors"
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Note Title & Body */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              placeholder="Note title (e.g., General University Rules)"
              className="w-full bg-transparent text-lg sm:text-xl font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#5f6368] focus:outline-none pb-3 border-b border-[#f0f4f9] dark:border-[#282a2c]"
            />

            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder={`Write your general university rules here...\n\nExamples:\n• Attendance policy & max allowed absences\n• Grading scale, GPA thresholds & retake rules\n• Assignment submission & late penalty policy\n• Exam regulations, lab rules & campus contacts`}
              className="flex-1 w-full bg-transparent pt-4 text-sm text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#5f6368] focus:outline-none resize-none leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Editor Footer */}
          <div className="px-5 py-2 border-t border-[#f0f4f9] dark:border-[#282a2c] flex items-center justify-between text-[11px] text-[#5f6368] dark:text-[#8e918f] font-mono">
            <span>Auto-saved locally &amp; synced with Gist when connected</span>
            <span>
              {lineCount} lines · {wordCount} words · {contentText.length} chars
            </span>
          </div>
        </section>
      )}
    </div>
  );
});
