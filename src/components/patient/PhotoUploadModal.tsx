import React, { useState } from 'react';
import { X, Upload, Check, Camera, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  onSavePhoto: (photoUrl: string) => Promise<void> | void;
}

const PRESET_AVATARS = [
  {
    id: 'av-1',
    label: 'Warm Portrait',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-2',
    label: 'Caring Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-3',
    label: 'Senior Citizen',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-4',
    label: 'Professional',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-5',
    label: 'Young Adult',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-6',
    label: 'Active Care',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || PRESET_AVATARS[0].url);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPreviewError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPreviewError('Image size exceeds 5MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedPhoto(result);
      }
    };
    reader.onerror = () => {
      setPreviewError('Failed to read photo file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSavePhoto(selectedPhoto);
      onClose();
    } catch {
      setPreviewError('Could not update profile photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 id="photo-modal-title" className="text-lg font-bold text-gray-900">
                Patient Profile Photo
              </h3>
              <p className="text-xs text-gray-500">
                Custom photo appears on your digital Health ID and hospital admission pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {previewError && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
              {previewError}
            </div>
          )}

          {/* Active Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
            <div className="relative group">
              <img
                src={selectedPhoto}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-sm">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="text-sm font-semibold text-gray-900">Live Health ID Preview</div>
              <p className="text-xs text-gray-500">
                Clear facial photos assist triage medics in rapid identity verification during emergencies.
              </p>
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 cursor-pointer shadow-sm transition-all">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Presets Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Or Select From Verified Avatars
              </span>
              <span className="text-xs text-gray-400">6 high-res options</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedPhoto === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(preset.url);
                      setPreviewError(null);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105 shadow-md'
                        : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Save Profile Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};
