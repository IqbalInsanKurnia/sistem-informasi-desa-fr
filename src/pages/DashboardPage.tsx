// import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import {
  FileText,
  AlertCircle,
  Clock,
  DollarSign,
  Receipt,
  Wallet,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: boolean;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    surat: {
      total: 0,
      diajukan: 0,
    },
    artikel: {
      total: 0,
      diajukan: 0,
    },
    pengaduan: {
      total: 0,
      diajukan: 0,
    },
    keuangan: {
      pendapatan: 0,
      belanja: 0,
      saldo: 0,
      tahun: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");

        // Define inline interfaces for API responses
        interface SuratResponseData {
          id_surat: number;
          status_surat: string;
        }
        interface ArtikelListResponseData {
          id_artikel: number;
          status_artikel: string;
        }
        interface PengaduanResponseData {
          id: string;
          status: string;
        }
        interface DetailPendapatan {
          "Pendapatan Asli Desa": string;
          "Pendapatan Transfer": string | number;
          "Pendapatan Lain-lain": string | number;
        }
        interface DetailBelanja {
          "Belanja Barang/Jasa": string;
          "Belanja Modal": string | number;
          "Belanja Tak Terduga": string | number;
        }
        interface APBDesaResponseData {
          tahun_anggaran: number;
          total_pendapatan: string;
          total_belanja: string;
          saldo_sisa: string;
          detail_pendapatan: DetailPendapatan;
          detail_belanja: DetailBelanja;
        }

        // Fetch Surat Stats
        const suratResponse = await axios.get<{ data: SuratResponseData[] }>(
          `${API_CONFIG.baseURL}/api/surat`,
          {
            headers: {
              ...API_CONFIG.headers,
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Fetch Artikel Data (for total) and Artikel Stats (for diajukan)
        const artikelListResponse = await axios.get<{
          data: { data: ArtikelListResponseData[]; total: number };
        }>(`${API_CONFIG.baseURL}/api/artikel`, {
          headers: {
            ...API_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });
        const artikelStatsResponse = await axios.get<{
          data: { diajukan: number };
        }>(`${API_CONFIG.baseURL}/api/artikel/stats`, {
          headers: {
            ...API_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch Pengaduan Stats
        const pengaduanResponse = await axios.get<
          { data: PengaduanResponseData[] } | PengaduanResponseData[]
        >(`${API_CONFIG.baseURL}/api/pengaduan`, {
          headers: {
            ...API_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch Keuangan Stats
        const keuanganResponse = await axios.get<{
          data: APBDesaResponseData[];
        }>(`${API_CONFIG.baseURL}/api/publik/apbdesa/multi-tahun`, {
          headers: {
            ...API_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        // Process Surat Stats
        const suratData = suratResponse.data?.data || [];
        const totalSurat = suratData.length;
        const suratDiajukan = suratData.filter(
          (surat: SuratResponseData) => surat.status_surat === "Diajukan",
        ).length;

        // Process Artikel Stats
        const totalArtikel = artikelListResponse.data?.data?.total || 0; // From list endpoint
        const artikelDiajukan = artikelStatsResponse.data?.data?.diajukan || 0; // From stats endpoint

        // Process Pengaduan Stats
        const rawPengaduanData = pengaduanResponse.data;
        const pengaduanData: PengaduanResponseData[] = Array.isArray(
          rawPengaduanData,
        )
          ? rawPengaduanData
          : rawPengaduanData?.data || [];
        const totalPengaduan = pengaduanData.length;
        const pengaduanDiajukan = pengaduanData.filter(
          (pengaduan: PengaduanResponseData) => pengaduan.status === "Diajukan",
        ).length;

        // Process Keuangan Stats
        const keuanganData: APBDesaResponseData[] =
          keuanganResponse.data?.data || [];
        if (!Array.isArray(keuanganData) || keuanganData.length === 0) {
          throw new Error("Data keuangan tidak ditemukan");
        }

        const latestYearData = keuanganData.sort(
          (a: APBDesaResponseData, b: APBDesaResponseData) =>
            b.tahun_anggaran - a.tahun_anggaran,
        )[0];
        if (!latestYearData) {
          throw new Error("Data keuangan tahun terbaru tidak ditemukan");
        }

        setStats({
          surat: {
            total: totalSurat,
            diajukan: suratDiajukan,
          },
          artikel: {
            total: totalArtikel,
            diajukan: artikelDiajukan,
          },
          pengaduan: {
            total: totalPengaduan,
            diajukan: pengaduanDiajukan,
          },
          keuangan: {
            pendapatan: parseFloat(latestYearData.total_pendapatan || "0"),
            belanja: parseFloat(latestYearData.total_belanja || "0"),
            saldo: parseFloat(latestYearData.saldo_sisa || "0"),
            tahun: latestYearData.tahun_anggaran,
          },
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Gagal mengambil data dashboard");
        // Set default values when there's an error
        setStats({
          surat: { total: 0, diajukan: 0 },
          artikel: { total: 0, diajukan: 0 },
          pengaduan: { total: 0, diajukan: 0 },
          keuangan: { pendapatan: 0, belanja: 0, saldo: 0, tahun: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Desa
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Pantau statistik dan informasi desa
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="xl" text="Memuat data..." />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Error
                </h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {/* Surat Stats */}
                  <StatCard
                    title="Total Surat"
                    value={stats.surat.total}
                    icon={FileText}
                    color="bg-blue-100 text-blue-600"
                  />
                  <StatCard
                    title="Surat Diajukan"
                    value={stats.surat.diajukan}
                    icon={Clock}
                    color="bg-yellow-100 text-yellow-600"
                  />

                  {/* Artikel Stats */}
                  <StatCard
                    title="Total Artikel"
                    value={stats.artikel.total}
                    icon={FileText}
                    color="bg-purple-100 text-purple-600"
                  />
                  <StatCard
                    title="Artikel Diajukan"
                    value={stats.artikel.diajukan}
                    icon={Clock}
                    color="bg-yellow-100 text-yellow-600"
                  />

                  {/* Pengaduan Stats */}
                  <StatCard
                    title="Total Pengaduan"
                    value={stats.pengaduan.total}
                    icon={AlertCircle}
                    color="bg-red-100 text-red-600"
                  />
                  <StatCard
                    title="Pengaduan Diajukan"
                    value={stats.pengaduan.diajukan}
                    icon={Clock}
                    color="bg-yellow-100 text-yellow-600"
                  />
                </div>

                {/* Keuangan Stats in one row */}
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
                  <StatCard
                    title="Total Pendapatan"
                    value={formatCurrency(stats.keuangan.pendapatan)}
                    icon={DollarSign}
                    color="bg-green-100 text-green-600"
                    subtitle={`Tahun ${stats.keuangan.tahun}`}
                  />
                  <StatCard
                    title="Total Belanja"
                    value={formatCurrency(stats.keuangan.belanja)}
                    icon={Receipt}
                    color="bg-orange-100 text-orange-600"
                    subtitle={`Tahun ${stats.keuangan.tahun}`}
                  />
                  <StatCard
                    title="Saldo Sisa"
                    value={formatCurrency(stats.keuangan.saldo)}
                    icon={Wallet}
                    color="bg-blue-100 text-blue-600"
                    subtitle={`Tahun ${stats.keuangan.tahun}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
