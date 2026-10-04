import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { DataService } from '../../services/supabase';

interface ProductGalleryUploaderProps {
  mainImage: string;
  galleryImages: string[];
  onChangeMainImage: (url: string) => void;
  onChangeGalleryImages: (images: string[]) => void;
  onError?: (msg: string) => void;
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ProductGalleryUploader: React.FC<ProductGalleryUploaderProps> = ({
  mainImage,
  galleryImages,
  onChangeMainImage,
  onChangeGalleryImages,
  onError
}) => {
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const reportError = (msg: string) => {
    setValidationError(msg);
    if (onError) onError(msg);
    setTimeout(() => {
      setValidationError('');
    }, 4500);
  };

  // Validate file
  const validateFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext) && !file.type.startsWith('image/')) {
      reportError(`“${file.name}” is not a supported image. Please select JPG, JPEG, PNG, or WEBP.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      reportError(`“${file.name}” exceeds the 10MB file size limit.`);
      return false;
    }
    return true;
  };

  // Upload a single file using existing DataService
  const uploadSingleFile = async (file: File): Promise<string> => {
    try {
      return await DataService.uploadImage(file);
    } catch {
      // Fallback to local DataURL FileReader
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // Main Image Upload Handler
  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    setIsUploadingMain(true);
    setValidationError('');
    try {
      const url = await uploadSingleFile(file);
      onChangeMainImage(url);

      // If gallery doesn't have this or any image, keep it aligned
      if (!galleryImages.includes(url)) {
        // Keep existing gallery images or add
      }
    } catch (err) {
      console.error(err);
      reportError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  // Gallery Multiple Images Upload Handler
  const handleGalleryFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const validFiles: File[] = [];

    for (const f of fileList) {
      if (validateFile(f)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setIsUploadingGallery(true);
    setValidationError('');

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgressText(`Uploading ${i + 1} of ${validFiles.length}...`);
        const url = await uploadSingleFile(validFiles[i]);
        newUrls.push(url);
      }

      // If main image was empty, assign the first uploaded image as main
      if (!mainImage && newUrls.length > 0) {
        onChangeMainImage(newUrls[0]);
      }

      // Append to gallery
      const updated = Array.from(new Set([...galleryImages, ...newUrls]));
      onChangeGalleryImages(updated);
    } catch (err) {
      console.error(err);
      reportError('Some images could not be uploaded.');
    } finally {
      setIsUploadingGallery(false);
      setUploadProgressText('');
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Remove Main Image
  const handleRemoveMainImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (galleryImages.length > 0) {
      // Promote first gallery image if available
      const nextMain = galleryImages[0];
      onChangeMainImage(nextMain);
    } else {
      onChangeMainImage('');
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const removedUrl = galleryImages[indexToRemove];
    const updated = galleryImages.filter((_, idx) => idx !== indexToRemove);
    onChangeGalleryImages(updated);

    // If removed image was also mainImage, pick another or clear
    if (mainImage === removedUrl) {
      if (updated.length > 0) {
        onChangeMainImage(updated[0]);
      } else {
        onChangeMainImage('');
      }
    }
  };

  // Set as Main Image
  const handleSetAsMain = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeMainImage(url);
    // Ensure it exists in gallery list
    if (!galleryImages.includes(url)) {
      onChangeGalleryImages([url, ...galleryImages]);
    }
  };

  // Reorder Gallery Images (left / right)
  const handleMoveImage = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const reordered = [...galleryImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChangeGalleryImages(reordered);
  };

  // HTML5 Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...galleryImages];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onChangeGalleryImages(reordered);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={mainInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleMainFileSelect}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleGalleryFilesSelect}
        className="hidden"
      />

      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div>
          <h4 className="font-bold text-[#1B4332] uppercase tracking-wider text-xs sm:text-sm flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#1B4332]" />
            <span>PRODUCT GALLERY</span>
          </h4>
          <p className="text-[11px] text-stone-500">
            Upload product photos from your device. Tap any image to set as main or use arrows to reorder.
          </p>
        </div>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isUploadingGallery || isUploadingMain}
          className="self-start sm:self-auto bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isUploadingGallery ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{uploadProgressText || 'Uploading...'}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Images</span>
            </>
          )}
        </button>
      </div>

      {/* Validation / Error Message */}
      {validationError && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Visual Workspace: Section 1 (Main Image) & Section 2 (Gallery) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        
        {/* ==================================================
            1. MAIN PRODUCT IMAGE UPLOAD BOX
            ================================================== */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
            MAIN PRODUCT IMAGE *
          </label>

          {mainImage ? (
            <div className="relative group aspect-square w-full max-w-[220px] bg-stone-100 border-2 border-[#1B4332] rounded-xs overflow-hidden shadow-2xs">
              <img
                src={mainImage}
                alt="Main product"
                className="w-full h-full object-cover object-center"
              />

              {/* Main Badge */}
              <div className="absolute top-2 left-2 bg-[#1B4332] text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-2xs shadow-xs flex items-center gap-1 pointer-events-none">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>MAIN</span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={handleRemoveMainImage}
                title="Remove main image"
                className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Change overlay */}
              <div
                onClick={() => mainInputRef.current?.click()}
                className="absolute inset-x-0 bottom-0 bg-stone-900/80 hover:bg-stone-900 text-white py-1.5 px-2 text-[11px] font-bold text-center uppercase tracking-wider cursor-pointer transition-colors backdrop-blur-2xs flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Change Main Photo</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              disabled={isUploadingMain}
              className="w-full max-w-[220px] aspect-square border-2 border-dashed border-stone-300 hover:border-[#1B4332] bg-[#FFFDF7] hover:bg-stone-50 transition-colors flex flex-col items-center justify-center p-4 rounded-xs text-stone-600 hover:text-[#1B4332] cursor-pointer group"
            >
              {isUploadingMain ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-[#1B4332] mb-2" />
                  <span className="text-xs font-bold">Uploading...</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-emerald-50 border border-stone-200 group-hover:border-[#1B4332] flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-5 h-5 text-stone-600 group-hover:text-[#1B4332]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Upload product image
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1">
                    JPG, PNG, WEBP (Max 10MB)
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ==================================================
            2. PRODUCT GALLERY IMAGES (Thumbnails Grid + Add Box)
            ================================================== */}
        <div className="md:col-span-8 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
              PRODUCT GALLERY IMAGES ({galleryImages.length})
            </label>
            <span className="text-[10px] text-stone-400">
              Drag or use arrows to reorder
            </span>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs min-h-[140px]">
            <div className="flex flex-wrap gap-2.5 items-center">
              
              {/* Gallery Image Thumbnails */}
              {galleryImages.map((imgUrl, index) => {
                const isMain = imgUrl === mainImage;
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`relative group w-20 h-20 sm:w-24 sm:h-24 aspect-square bg-white border rounded-xs overflow-hidden shadow-2xs transition-all ${
                      isMain
                        ? 'border-[#1B4332] ring-2 ring-[#1B4332]/40'
                        : 'border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery item ${index + 1}`}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />

                    {/* Top-Right: Remove Button (×) */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveGalleryImage(index, e)}
                      title="Remove image"
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Top-Left: Main Indicator / Make Main Button */}
                    {isMain ? (
                      <span className="absolute top-1 left-1 bg-[#1B4332] text-white text-[8px] font-bold px-1.5 py-0.2 uppercase tracking-wider rounded-2xs shadow-2xs z-10">
                        MAIN
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSetAsMain(imgUrl, e)}
                        title="Set as main image"
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-stone-900/90 hover:bg-[#1B4332] text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-2xs shadow-2xs transition-opacity cursor-pointer z-10"
                      >
                        Set Main
                      </button>
                    )}

                    {/* Bottom: Reordering Controls (Touch-friendly arrows) */}
                    <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-1 py-0.5 text-[9px]">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => handleMoveImage(index, 'left', e)}
                        className="hover:text-amber-300 disabled:opacity-30 cursor-pointer p-0.5"
                        title="Move left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[9px] text-stone-300">{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === galleryImages.length - 1}
                        onClick={(e) => handleMoveImage(index, 'right', e)}
                        className="hover:text-amber-300 disabled:opacity-30 cursor-pointer p-0.5"
                        title="Move right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Image Box (Square Card with +) */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="w-20 h-20 sm:w-24 sm:h-24 aspect-square border-2 border-dashed border-stone-300 hover:border-[#1B4332] bg-white hover:bg-stone-50 rounded-xs flex flex-col items-center justify-center p-2 text-stone-500 hover:text-[#1B4332] transition-colors cursor-pointer group"
              >
                {isUploadingGallery ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1B4332]" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                      + Add
                    </span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
