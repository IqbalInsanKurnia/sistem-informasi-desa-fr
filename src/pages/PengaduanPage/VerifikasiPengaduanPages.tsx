import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { API_CONFIG } from "../../config/api";

// Helper function to format date strings
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString;
  }
};

// Interface for pengaduan media
interface MediaPengaduan {
  path: string;
  type: string;
  name: string;
  url: string;
}

// Interface for pengaduan data
interface Pengaduan {
  id_pengaduan: number;
  judul_pengaduan: string;
  isi_pengaduan: string;
  status_pengaduan: string;
  nama_pelapor: string;
  email_pelapor: string;
  telepon_pelapor: string;
  tanggal_kejadian: string | null;
  latitude: number;
  longitude: number;
  location_name: string;
  media_pengaduan: MediaPengaduan[];
  created_at: string;
  updated_at: string;
}

// Function to get user-friendly field labels
const getFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    id_pengaduan: "ID Pengaduan",
    judul_pengaduan: "Judul Pengaduan",
    isi_pengaduan: "Isi Pengaduan",
    status_pengaduan: "Status Pengaduan",
    nama_pelapor: "Nama Pelapor",
    email_pelapor: "Email Pelapor",
    telepon_pelapor: "Telepon Pelapor",
    tanggal_kejadian: "Tanggal Kejadian",
    latitude: "Latitude",
    longitude: "Longitude",
    location_name: "Lokasi",
    media_pengaduan: "Media Pengaduan",
    created_at: "Dibuat Pada",
    updated_at: "Diperbarui Pada",
  };

  return (
    labels[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

export default function VerifikasiPengaduanPage() {
  const { id } = useParams();
  const [pengaduan, setPengaduan] = useState<Pengaduan | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("diajukan");
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPengaduan = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_CONFIG.baseURL}/api/pengaduan/${id}`,
          {
            headers: {
              ...API_CONFIG.headers,
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("API Response Data:", response.data);

        // Check if response has data and handle different possible response structures
        const pengaduanData = response.data.data || response.data;
        if (!pengaduanData) {
          throw new Error("Data pengaduan tidak ditemukan");
        }

        setPengaduan(pengaduanData);
        // Set status from the pengaduan data, defaulting to "diajukan" if not present
        setStatus(
          pengaduanData.status || pengaduanData.status_pengaduan || "diajukan",
        );
      } catch (error) {
        console.error("Gagal mengambil data pengaduan:", error);
        toast.error("Gagal mengambil data pengaduan", {
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil data pengaduan",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPengaduan();
    }
  }, [id]);

  const handleVerifikasi = async () => {
    try {
      setSubmitting(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      await axios.patch(
        `${API_CONFIG.baseURL}/api/pengaduan/${id}/status`,
        {
          status: status,
        },
        {
          headers: {
            ...API_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // If we get here, the request was successful
      toast.success("Pengaduan berhasil diverifikasi!", {
        description: "Status pengaduan telah diperbarui",
        duration: 2000,
      });

      // Wait for toast to be visible before redirecting
      setTimeout(() => {
        window.location.href = "/pengaduan";
      }, 2000);
    } catch (error) {
      console.error("Gagal memverifikasi pengaduan:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error("Gagal memverifikasi pengaduan", {
          description: errorMessage,
        });
      } else {
        toast.error("Gagal memverifikasi pengaduan", {
          description:
            "Terjadi kesalahan saat memverifikasi pengaduan. Silakan coba lagi.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      await axios.delete(`${API_CONFIG.baseURL}/api/pengaduan/${id}`, {
        headers: {
          ...API_CONFIG.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Pengaduan berhasil dihapus!", {
        description: "Pengaduan telah dihapus dari sistem",
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = "/pengaduan";
      }, 2000);
    } catch (error) {
      console.error("Gagal menghapus pengaduan:", error);
      toast.error("Gagal menghapus pengaduan", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus pengaduan. Silakan coba lagi.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter fields to display
  const nonNullFields = pengaduan
    ? Object.entries(pengaduan).filter(
        ([key, value]) =>
          value !== null &&
          key !== "id_pengaduan" &&
          key !== "created_at" &&
          key !== "updated_at" &&
          key !== "status_pengaduan" &&
          !["status", "data", "message"].includes(key),
      )
    : [];

  return (
    <>
      <Toaster richColors position="top-center" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {loading ? (
            <div className="flex h-screen items-center justify-center">
              <div>Loading...</div>
            </div>
          ) : !pengaduan ? (
            <div className="flex h-screen items-center justify-center">
              <div>Data pengaduan tidak ditemukan.</div>
            </div>
          ) : (
            <>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        Pengaduan
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Verifikasi Pengaduan</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="mx-auto max-w-6xl space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Verifikasi Pengaduan
                    </h1>
                  </div>

                  <Card className="p-6">
                    <div className="grid grid-cols-1 gap-6">
                      {nonNullFields.map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key}>{getFieldLabel(key)}</Label>
                          {key === "media" ? (
                            (() => {
                              let mediaArr: {
                                path: string;
                                type: string;
                                name: string;
                                url: string;
                              }[] = [];
                              if (typeof value === "string") {
                                try {
                                  mediaArr = JSON.parse(value);
                                } catch {
                                  mediaArr = [];
                                }
                              } else if (Array.isArray(value)) {
                                mediaArr = value;
                              }
                              return mediaArr.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {mediaArr.map((media, index) => (
                                    <div key={index} className="space-y-2">
                                      {media.type &&
                                      media.type.startsWith("image/") ? (
                                        <img
                                          src={media.url}
                                          alt={
                                            media.name || `Media ${index + 1}`
                                          }
                                          className="max-h-[300px] w-full rounded-md bg-white object-contain"
                                        />
                                      ) : (
                                        <div className="bg-muted rounded-md border p-4">
                                          <a
                                            href={media.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            {media.name || `Media ${index + 1}`}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div>Tidak ada media</div>
                              );
                            })()
                          ) : key === "isi_pengaduan" ? (
                            <div className="bg-muted min-h-[200px] rounded-md border p-4 whitespace-pre-wrap">
                              {value}
                            </div>
                          ) : key === "latitude" || key === "longitude" ? (
                            <Input
                              id={key}
                              value={
                                typeof value === "number"
                                  ? value.toFixed(6)
                                  : value
                              }
                              readOnly
                              className="bg-muted"
                            />
                          ) : (
                            <Input
                              id={key}
                              value={(() => {
                                if (typeof value === "string") {
                                  if (
                                    [
                                      "tanggal_kejadian",
                                      "created_at",
                                      "updated_at",
                                    ].includes(key)
                                  ) {
                                    return formatDate(value);
                                  }
                                }
                                return value?.toString() || "";
                              })()}
                              readOnly
                              className="bg-muted"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="mb-4 text-xl font-semibold">Verifikasi</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status Pengaduan</Label>
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full rounded-md border p-2"
                        >
                          <option value="Diajukan">Diajukan</option>
                          <option value="Diterima">Diterima</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <div className="flex gap-4">
                          <Button
                            onClick={handleVerifikasi}
                            disabled={submitting}
                            className="w-full sm:w-auto"
                          >
                            {submitting ? "Memproses..." : "Simpan Verifikasi"}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                disabled={isDeleting}
                                className="w-full sm:w-auto"
                              >
                                {isDeleting
                                  ? "Menghapus..."
                                  : "Hapus Pengaduan"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Apakah Anda yakin?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat dibatalkan. Pengaduan
                                  akan dihapus secara permanen dari sistem.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </main>
            </>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
