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
        <div className="relative inline-block border rounded-lg overflow-hidden bg-gray-50">
          <img src={preview} alt="Preview" className="h-40 w-auto object-contain" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 justify-center">
              <span className="relative rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
