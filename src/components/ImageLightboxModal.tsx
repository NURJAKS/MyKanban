import React, { useEffect, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export const ImageLightboxModal: React.FC = memo(() => {
  const { previewImages, setPreviewImages } = useKanban();

  useEffect(() => {
    if (!previewImages) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImages(null);
      } else if (e.key === 'ArrowRight' && previewImages.images.length > 1) {
        setPreviewImages({
          ...previewImages,
          index: (previewImages.index + 1) % previewImages.images.length,
        });
      } else if (e.key === 'ArrowLeft' && previewImages.images.length > 1) {
        setPreviewImages({
          ...previewImages,
          index: (previewImages.index - 1 + previewImages.images.length) % previewImages.images.length,
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewImages, setPreviewImages]);

  if (!previewImages || previewImages.images.length === 0) return null;

  const { images, index } = previewImages;
  const safeIndex = Math.min(Math.max(0, index), images.length - 1);
  const current = images[safeIndex];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={() => setPreviewImages(null)}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-medium truncate">{current.name}</span>
          {images.length > 1 && (
            <span className="text-xs font-mono text-white/60 shrink-0">
              ({safeIndex + 1}/{images.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={current.dataUrl}
            download={current.name || 'task-image'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
          >
            <Download size={14} />
            <span>Download</span>
          </a>
          <button
            type="button"
            onClick={() => setPreviewImages(null)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Close preview"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div
        className="relative flex-1 w-full max-w-5xl flex items-center justify-center min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={() =>
              setPreviewImages({
                images,
                index: (safeIndex - 1 + images.length) % images.length,
              })
            }
            className="absolute left-2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            title="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <img
          src={current.dataUrl}
          alt={current.name}
          className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl select-none"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() =>
              setPreviewImages({
                images,
                index: (safeIndex + 1) % images.length,
              })
            }
            className="absolute right-2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            title="Next image"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
});
