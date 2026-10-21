import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { uploadProfilePhoto } from '../api/profileApi';

const MAX_SIZE_MB = 5;

export function ProfilePhotoUpload({ user }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // اسم الفيلد الحقيقي في الـ user model هو photoUrl (مؤكد من الـ service)
  const currentPhoto = preview || user?.photoUrl;

  const mutation = useMutation({
    mutationFn: (file) => uploadProfilePhoto(file),
    onSuccess: () => {
      toast.success('اتحدّثت صورة البروفايل');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'معرفناش نرفع الصورة');
      setPreview(null);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لازم تختار صورة');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`الصورة أكبر من ${MAX_SIZE_MB} ميجا`);
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-amber-400 bg-sand-300"
      >
        {currentPhoto ? (
          <img src={currentPhoto} alt="صورة البروفايل" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl text-ink-400">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-xs text-transparent transition-all group-hover:bg-ink/50 group-hover:text-sand-100">
          تغيير
        </span>
      </button>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-sm font-medium text-ink-900">صورة البروفايل</p>
        <p className="mb-2 text-xs text-ink-400">JPG أو PNG، أقصى حجم {MAX_SIZE_MB} ميجا</p>
        {selectedFile && (
          <Button
            variant="outline"
            className="text-sm"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate(selectedFile)}
          >
            حفظ الصورة
          </Button>
        )}
      </div>
    </div>
  );
}
