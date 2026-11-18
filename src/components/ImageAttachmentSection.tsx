import React, { useState, useRef, memo } from 'react';
import { TaskImage } from '../types';
import { useKanban } from '../context/KanbanContext';
import { compressImageFile } from '../utils/imageUtils';
import { ImagePlus, X } from 'lucide-react';

interface ImageAttachmentSectionProps {
  images: TaskImage[];
  onAddImages: (newImages: TaskImage[]) => void;
  onDeleteImage: (imageId: string) => void;
  gridClassName?: string;
}

export async function processImageFiles(
  files: FileList | File[],
  onAddImages: (newImages: TaskImage[]) => void,
  showToast: (msg: string) => void
): Promise<void> {
  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  try {
    const compressed = await Promise.all(imageFiles.map((f) => compressImageFile(f)));
    onAddImages(compressed);
    showToast(
      compressed.length === 1 ? 'Image attached' : `${compressed.length} images attached`
    );
  } catch {
    showToast('Failed to attach image');
  }
}

export function extractClipboardImages(e: React.ClipboardEvent): File[] {
  const items = e.clipboardData?.items;
  if (!items) return [];
  const pastedFiles: File[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const f = items[i].getAsFile();
      if (f) pastedFiles.push(f);
    }
  }
  return pastedFiles;
}

export const ImageAttachmentSection: React.FC<ImageAttachmentSectionProps> = memo(({
  images,
  onAddImages,
  onDeleteImage,
  gridClassName = 'grid-cols-2 sm:grid-cols-3',
}) => {
  const { setPreviewImages, showToast } = useKanban();
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploadingImage(true);
    try {
      await processImageFiles(files, onAddImages, showToast);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider">
          Images ({images.length})
        </label>
        <button
          type="button"
          disabled={isUploadingImage}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] hover:bg-[#d3e3fd] dark:hover:bg-[#8ab4f8]/25 transition-colors disabled:opacity-50"
        >
          <ImagePlus size={12} />
          <span>{isUploadingImage ? 'Adding...' : 'Attach Image'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingImage(true);
        }}
        onDragLeave={() => setIsDraggingImage(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingImage(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => images.length === 0 && fileInputRef.current?.click()}
        className={`rounded-xl border border-dashed p-3 transition-colors ${
          isDraggingImage
            ? 'border-[#0b57d0] dark:border-[#8ab4f8] bg-[#d3e3fd]/25 dark:bg-[#8ab4f8]/10'
            : 'border-[#c4c7c5] dark:border-[#3c4043] bg-[#f8fafd] dark:bg-[#282a2c]/40'
        } ${images.length === 0 ? 'cursor-pointer hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]/70' : ''}`}
      >
        {images.length === 0 ? (
          <div className="py-2.5 text-center text-xs text-[#5f6368] dark:text-[#8e918f] space-y-1">
            <ImagePlus size={18} className="mx-auto opacity-70" />
            <p>Click, drag &amp; drop, or paste (Ctrl+V) images here</p>
          </div>
        ) : (
          <div className={`grid gap-2 ${gridClassName}`}>
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group/img relative aspect-square rounded-lg overflow-hidden border border-[#e0e2ec] dark:border-[#3c4043] bg-white dark:bg-[#1e1f20]"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  onClick={() => setPreviewImages({ images, index: idx })}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-150 group-hover/img:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(img.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/65 text-white opacity-90 sm:opacity-0 sm:group-hover/img:opacity-100 hover:bg-[#b3261e] transition-all"
                  title="Remove image"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
