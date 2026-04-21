import { useState } from "react";
import {
  AlertCircle,
  X,
  Upload,
  Phone,
  User,
  FileText,
  Tag,
  Camera,
  CheckCircle,
  Send,
} from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api";

interface FormData {
  nama: string;
  nomor_telepon: string;
  kategori: string;
  detail_pengaduan: string;
  media: File[];
}

const kategoriOptions = [
  { value: "", label: "Pilih Kategori Pengaduan", icon: "📝" },
  { value: "Umum", label: "Umum", icon: "📢" },
  { value: "Sosial", label: "Sosial", icon: "👥" },
  { value: "Keamanan", label: "Keamanan", icon: "🔒" },
  { value: "Kesehatan", label: "Kesehatan", icon: "🏥" },
  { value: "Kebersihan", label: "Kebersihan", icon: "🧹" },
  { value: "Permintaan", label: "Permintaan", icon: "📋" },
];

interface PengaduanPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PengaduanPopup({ isOpen, onClose }: PengaduanPopupProps) {
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    nomor_telepon: "",
    kategori: "",
    detail_pengaduan: "",
    media: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      for (const file of newFiles) {
        if (file.size > 2 * 1024 * 1024) {
          setFileUploadError("Ukuran file maksimal 2MB");
          return;
        }
        validFiles.push(file);
      }
      setFileUploadError(null);
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...validFiles],
      }));
      const newPreviewUrls = validFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newFiles = [...prev.media];
      newFiles.splice(index, 1);
      return { ...prev, media: newFiles };
    });
    setPreviewImages((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.nomor_telepon)) {
      setSubmitError("Nomor telepon harus berupa angka dan minimal 10 digit");
      setIsSubmitting(false);
      return;
    }
    if (!formData.kategori) {
      setSubmitError("Kategori pengaduan harus dipilih");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("nomor_telepon", formData.nomor_telepon);
      formDataToSend.append("kategori", formData.kategori);
      formDataToSend.append("detail_pengaduan", formData.detail_pengaduan);
      formData.media.forEach((file) => {
        formDataToSend.append("media[]", file);
      });

      await axios.post(
        `${API_CONFIG.baseURL}/api/publik/pengaduan`,
        formDataToSend,
        {
          headers: {
            ...API_CONFIG.headers,
          },
        },
      );

      setSubmitSuccess(true);

      setTimeout(() => {
        setFormData({
          nama: "",
          nomor_telepon: "",
          kategori: "",
          detail_pengaduan: "",
          media: [],
        });
        previewImages.forEach((url) => URL.revokeObjectURL(url));
        setPreviewImages([]);
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting pengaduan:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        setSubmitError(errorMessage);
      } else {
        setSubmitError(
          "Terjadi kesalahan saat mengirim pengaduan. Silakan coba lagi.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl transition-all sm:max-w-lg sm:rounded-2xl md:max-w-xl">
        {/* Header */}
        <div className="rounded-t-xl border-b border-gray-100 bg-white p-4 pb-3 sm:rounded-t-2xl sm:p-6 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-2xl">
                  Pengaduan Warga
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Laporkan masalah atau keluhan Anda
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Success State */}
          {submitSuccess && (
            <div className="p-4 sm:p-6">
              <div className="py-6 text-center sm:py-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
                  <CheckCircle className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                  Pengaduan Berhasil Dikirim!
                </h3>
                <p className="text-sm text-gray-600 sm:text-base">
                  Petugas desa akan segera menindaklanjuti laporan Anda.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {!submitSuccess && (
            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
              {/* Error Alert */}
              {submitError && (
                <div className="flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-xs text-red-700 sm:text-sm">
                    {submitError}
                  </p>
                </div>
              )}

              {/* File Upload Error */}
              {fileUploadError && (
                <div className="flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-xs text-red-700 sm:text-sm">
                    {fileUploadError}
                  </p>
                </div>
              )}

              {/* Name and Phone */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1 sm:space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 sm:text-sm">
                    <User className="h-4 w-4" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    placeholder="Masukkan nama lengkap Anda"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 sm:text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Nomor Telepon</span>
                  </label>
                  <input
                    type="tel"
                    name="nomor_telepon"
                    placeholder="081234567890"
                    value={formData.nomor_telepon}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1 sm:space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 sm:text-sm">
                  <Tag className="h-4 w-4" />
                  <span>Kategori Pengaduan</span>
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
                >
                  {kategoriOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detail */}
              <div className="space-y-1 sm:space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 sm:text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Detail Pengaduan</span>
                </label>
                <textarea
                  name="detail_pengaduan"
                  placeholder="Jelaskan secara detail pengaduan atau masalah yang Anda alami..."
                  value={formData.detail_pengaduan}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1 sm:space-y-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 sm:text-sm">
                  <Camera className="h-4 w-4" />
                  <span>Upload Foto (Opsional)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="flex w-full flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-200 px-3 py-4 transition-colors hover:border-blue-400 sm:px-4 sm:py-6">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <p className="text-xs text-gray-600 sm:text-sm">
                      Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG (Max 2MB per file)
                    </p>
                  </div>
                </div>
                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">
                    {previewImages.map((url, index) => (
                      <div key={index} className="group relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-full rounded-lg border border-gray-200 object-cover sm:h-20"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 sm:h-6 sm:w-6"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
            </div>
          )}
        </div>
        {/* Submit Button (selalu di bawah modal) */}
        {!submitSuccess && (
          <div className="sticky bottom-0 left-0 z-20 border-t border-gray-100 bg-white p-4 pt-3 sm:p-6 sm:pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all sm:py-3 sm:text-base ${
                isSubmitting
                  ? "cursor-not-allowed bg-gray-400"
                  : "transform bg-blue-600 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Kirim Pengaduan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
