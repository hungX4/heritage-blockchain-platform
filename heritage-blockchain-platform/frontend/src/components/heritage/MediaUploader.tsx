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
      e.target.value = '';
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
      <span className="text-xs font-semibold text-stone-300">Hình ảnh / Phương tiện truyền thông đính kèm</span>

      {/* Khu vực Drag & Drop */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-800 rounded-xl cursor-pointer bg-stone-950/60 hover:bg-stone-900 hover:border-[#A50C1E] transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-7 h-7 text-[#A50C1E] mb-2" />
              <p className="text-xs text-stone-300">
                <span className="font-bold text-amber-300">Bấm để tải file lên</span> hoặc kéo thả vào đây
              </p>
              <p className="text-[10px] text-stone-500 mt-1">Hỗ trợ Hình ảnh, Audio, Video (Tối đa 50MB)</p>
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

      {/* Danh sách phương tiện đã upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {mediaList.map((item, idx) => (
          <div key={item.cid || idx} className="flex gap-3 p-2.5 border border-stone-800 rounded-xl bg-stone-950/80 relative group">
            {/* Khung xem trước */}
            <div className="w-16 h-16 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 overflow-hidden">
              {item.type === 'IMAGE' ? (
                <img src={item.thumbnailUrl || item.url} alt="" className="w-full h-full object-cover" />
              ) : item.type === 'VIDEO' ? (
                <Film className="w-6 h-6 text-amber-400" />
              ) : (
                <Music className="w-6 h-6 text-amber-400" />
              )}
            </div>

            {/* Thông tin & Nhập chú thích */}
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-xs font-semibold text-stone-200 truncate">{item.fileName || 'Tệp phương tiện'}</p>
              <p className="text-[10px] text-amber-300 font-mono truncate">CID: {item.cid}</p>
              <input
                type="text"
                placeholder="Nhập chú thích hiển thị..."
                value={item.caption || ''}
                onChange={(e) => handleCaptionChange(idx, e.target.value)}
                className="mt-1.5 w-full text-xs border border-stone-800 rounded-lg bg-stone-900 px-2 py-1 text-stone-200 placeholder-stone-500 outline-none focus:border-[#A50C1E]"
              />
            </div>

            {/* Nút Xóa */}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2.5 right-2.5 text-stone-500 hover:text-red-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
