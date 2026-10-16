import { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film, Music } from 'lucide-react';
import { mediaApi } from '../../api/media.api';
import toast from 'react-hot-toast';
import { HeritageMediaItem } from '../../types/heritage';

interface MediaUploaderProps {
  mediaList: HeritageMediaItem[];
  onChange: (newList: HeritageMediaItem[]) => void;
}

export function MediaUploader({ mediaList, onChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Tự đoán MediaType cơ bản
        let type = 'IMAGE';
        if (file.type.startsWith('video/')) type = 'VIDEO';
        if (file.type.startsWith('audio/')) type = 'AUDIO';

        const res = await mediaApi.upload(file, type);
        return res.data;
      });

      const uploadedResults = await Promise.all(uploadPromises);
      onChange([...mediaList, ...uploadedResults]);
      toast.success('Upload phương tiện thành công!');
    } catch {
      toast.error('Lỗi khi upload file.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemove = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...mediaList];
    updated[index].caption = caption;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-slate-700">Hình ảnh / Phương tiện đính kèm</span>

      {/* Khu vực Drag & Drop / Input file */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-stone-400 mb-2" />
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-emerald-700">Bấm để tải file lên</span> hoặc kéo thả vào đây
              </p>
              <p className="text-[10px] text-stone-400 mt-1">Hỗ trợ Ảnh, Audio, Video (Tối đa 50MB)</p>
            </>
          )}
        </div>
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>

      {/* Danh sách file đã upload thành công */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {mediaList.map((item, idx) => (
          <div key={item.cid || idx} className="flex gap-3 p-2 border border-stone-200 rounded-md bg-white relative group">
            {/* Thumbnail Preview */}
            <div className="w-16 h-16 rounded bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
              {item.type === 'IMAGE' ? (
                <img src={item.thumbnailUrl || item.url} alt="" className="w-full h-full object-cover" />
              ) : item.type === 'VIDEO' ? (
                <Film className="w-6 h-6 text-stone-500" />
              ) : (
                <Music className="w-6 h-6 text-stone-500" />
              )}
            </div>

            {/* Thông tin file & Caption */}
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-xs font-medium text-slate-800 truncate">{item.fileName}</p>
              <p className="text-[10px] text-emerald-700 font-mono truncate">CID: {item.cid}</p>
              <input
                type="text"
                placeholder="Nhập chú thích..."
                value={item.caption || ''}
                onChange={(e) => handleCaptionChange(idx, e.target.value)}
                className="mt-1 w-full text-xs border border-stone-200 rounded px-1.5 py-0.5 outline-none focus:border-emerald-700"
              />
            </div>

            {/* Nút xóa */}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 text-stone-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
