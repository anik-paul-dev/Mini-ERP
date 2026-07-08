import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void;
  currentImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, currentImageUrl }) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative inline-block border border-surface-600 rounded-xl overflow-hidden bg-surface-900 shadow-sm group">
          <img src={preview} alt="Preview" className="h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-rose-500/90 text-white rounded-full p-1.5 hover:bg-rose-600 focus:outline-none backdrop-blur-sm shadow-sm transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-600 border-dashed rounded-xl cursor-pointer hover:border-brand-500 hover:bg-surface-700/50 transition-colors bg-surface-800"
        >
          <div className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 text-surface-400 bg-surface-700 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex text-sm text-surface-300 justify-center">
              <span className="relative rounded-md font-medium text-brand-400 hover:text-brand-300 focus-within:outline-none">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-surface-500">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
