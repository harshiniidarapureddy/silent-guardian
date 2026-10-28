import React, { useState } from 'react';
import { X, Upload, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  onSavePhoto: (photoUrl: string) => Promise<void> | void;
}

// Strictly Anime & Manga Guardian Avatars only (per user instructions)
const ANIME_AVATARS = [
  {
    id: 'an-1',
    label: 'Kenji - Anime Medic Sensei',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KenjiDoctor&hair=short01&eyes=variant04',
  },
  {
    id: 'an-2',
    label: 'Sakura - Manga Healer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SakuraMedic&hair=long01&eyes=variant02',
  },
  {
    id: 'an-3',
    label: 'Cyber Healer Hero',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CyberHealer&hair=short04',
  },
  {
    id: 'an-4',
    label: 'Kawaii ER Nurse',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AoiNurse&hair=long05',
  },
  {
    id: 'an-5',
    label: 'Chibi First Responder',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChibiEMT&hair=short02',
  },
  {
    id: 'an-6',
    label: 'Guardian Angel Medic',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HeroGuardian&hair=long03',
  },
  {
    id: 'an-7',
    label: 'Shinobi Field Surgeon',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShinobiMedic&hair=short06',
  },
  {
    id: 'an-8',
    label: 'Anime Alchemist Healer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeAlchemist&hair=long02',
  },
  {
    id: 'an-9',
    label: 'Ren - Astral Guardian',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AstralRen&hair=short08&eyes=variant08',
  },
  {
    id: 'an-10',
    label: 'Hana - Solar Life Healer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SolarHana&hair=long04&eyes=variant06',
  },
  {
    id: 'an-11',
    label: 'Mecha Trauma Specialist',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaTrauma',
  },
  {
    id: 'an-12',
    label: 'Bio-Sentinel EMT Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SentinelEMT',
  },
  {
    id: 'an-13',
    label: 'Lorelei Mystic Medic',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MysticMedic',
  },
  {
    id: 'an-14',
    label: 'Tatsuo Dragon Guardian',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TatsuoGuardian&hair=short11',
  },
  {
    id: 'an-15',
    label: 'Yuki Snow Angel Medic',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=YukiAngel&hair=long08',
  },
  {
    id: 'an-16',
    label: 'Cyberpulse Nano Doctor',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPulseNano',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || ANIME_AVATARS[0].url);
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
      setPreviewError('Could not update user photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="photo-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                User Anime Profile & Photo
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 tracking-wide uppercase">
                  Anime Only
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Pick a cool anime healer avatar or upload your personal photo for your Digital Health ID
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
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gradient-to-r from-purple-50/70 to-pink-50/50 rounded-2xl border border-purple-200/80 shadow-sm">
            <div className="relative group">
              <img
                src={selectedPhoto}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg ring-4 ring-purple-500/20 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ANIME_AVATARS[0].url;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-1 rounded-full shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="text-sm font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                <span>Active User Identity Preview</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Ready</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your anime avatar or custom picture shows on your digital health card, emergency hospital pass, and Guardian alert notifications.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-700 cursor-pointer shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Anime Avatars Collection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="text-base">✨</span> Anime & Manga Healers Collection ({ANIME_AVATARS.length})
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                  Curated Anime Avatars
                </span>
              </div>
              <span className="text-[11px] text-purple-600 font-semibold hidden sm:inline">Click any avatar to select</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1.5 sg-scrollbar bg-slate-50/80 rounded-2xl border border-slate-200">
              {ANIME_AVATARS.map((preset) => {
                const isSelected = selectedPhoto === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(preset.url);
                      setPreviewError(null);
                    }}
                    title={preset.label}
                    className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all p-1 focus:outline-none flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-purple-600 ring-4 ring-purple-500/30 scale-105 shadow-md bg-white'
                        : 'border-slate-200 hover:border-purple-300 hover:scale-[1.02] bg-white'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-contain rounded-xl bg-purple-50/30"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/15 rounded-2xl flex items-center justify-center backdrop-blur-[0.5px]">
                        <div className="bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-full p-1 shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    <span className="sr-only">{preset.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-gray-500 text-center sm:text-left flex items-center gap-1.5">
              <span className="text-pink-500">🌸</span>
              <span>All avatars are exclusive anime, manga, and mecha healer companions for user privacy and style.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedPhoto(ANIME_AVATARS[0].url)}
            className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
          >
            Reset to Default Anime
          </button>
          <div className="flex items-center gap-3">
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
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save User Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
