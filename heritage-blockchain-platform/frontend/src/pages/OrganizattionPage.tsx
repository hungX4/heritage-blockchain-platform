import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, FileText, UploadCloud, Loader2, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { OrganizationFormValues, organizationSchema } from '../types/organization';
import toast from 'react-hot-toast';



export default function CreateOrganizationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // State quản lý danh sách file để hỗ trợ cộng dồn
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      legalDocuments: []
    }
  });

  // Xử lý khi người dùng chọn file (Cộng dồn file cũ + mới)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    // Cộng dồn file cũ và file mới, tối đa 3 file
    const updatedFiles = [...selectedFiles, ...newFiles].slice(0, 3);

    setSelectedFiles(updatedFiles);
    // Cập nhật giá trị vào React Hook Form để Zod validate
    setValue('legalDocuments', updatedFiles, { shouldValidate: true });
  };

  // Xóa 1 file khỏi danh sách preview
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    setValue('legalDocuments', updatedFiles, { shouldValidate: true });
  };

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);
      setSuccessMessage('');

      // BƯỚC 1: Đẩy File lên API Upload
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file); // 'files' khớp với multer.array('files')
      });

      const uploadRes = await axiosClient.post('/upload/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrls = uploadRes.data.data.urls;

      // BƯỚC 2: Gửi JSON đăng ký Tổ chức
      const payload = {
        name: data.name,
        description: data.description,
        contactEmail: data.contactEmail,
        legalDocumentUrls: fileUrls,
      };

      await axiosClient.post('/organization/request', payload);

      setSuccessMessage('Gửi yêu cầu thành công! Vui lòng chờ System Admin phê duyệt.');
      toast.success('Gửi yêu cầu đăng ký tổ chức thành công!');
      reset();
      setSelectedFiles([]); // Reset mảng file preview
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Đăng ký Tổ chức mới</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cung cấp thông tin pháp lý để tham gia vào mạng lưới thẩm định di sản.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Tên Tổ chức */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Building2 size={16} className="text-slate-400" />
              Tên tổ chức
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="VD: Bảo tàng Lịch sử Quốc gia"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email Liên hệ */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail size={16} className="text-slate-400" />
              Email cơ quan (.gov.vn, .edu.vn, .org.vn)
            </label>
            <input
              {...register('contactEmail')}
              type="email"
              placeholder="lienhe@baotanglichsu.gov.vn"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>}
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText size={16} className="text-slate-400" />
              Mô tả tổ chức
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Giới thiệu sơ lược về tổ chức, chức năng, nhiệm vụ..."
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Minh chứng pháp lý */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <UploadCloud size={16} className="text-slate-400" />
              Minh chứng pháp lý (Tối đa 3 file ảnh/PDF)
            </label>

            <div className="flex w-full items-center justify-center">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:bg-stone-100">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <UploadCloud size={24} className="mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Nhấn để chọn file</span> hoặc kéo thả vào đây
                  </p>
                </div>
                {/* Thay thế register bằng onChange tùy chỉnh */}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png, application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danh sách Preview Ảnh có nút Xóa */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-stone-200 shadow-sm">
                    {/* Nút Xóa File */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-90 transition-opacity hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>

                    {file.type.includes('image') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-stone-100 text-stone-500 p-2">
                        <FileText size={24} />
                        <span className="mt-1 w-full truncate text-center text-[10px] font-medium">
                          {file.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errors.legalDocuments && (
              <p className="mt-1 text-xs text-red-500">{errors.legalDocuments.message?.toString()}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Yêu cầu bản scan có mộc đỏ: Quyết định thành lập, Giấy phép hoạt động...
            </p>
          </div>

          {/* Nút Submit */}
          <div className="border-t border-stone-100 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang xử lý dữ liệu...
                </>
              ) : (
                'Gửi yêu cầu phê duyệt'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
