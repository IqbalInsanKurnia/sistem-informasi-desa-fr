import { DarkThemeToggle } from "flowbite-react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import the HomePage
import LoginPage from "./pages/LoginPage"; // Import the LoginPage
import DashboardPage from "./pages/DashboardPage"; // Import the DashboardPage
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import PindahPages from "./pages/SuratPage/PindahPage";
import DomisiliPages from "./pages/SuratPage/DomisiliPages";
import KematianPages from "./pages/SuratPage/KematianPages";
import UsahaPages from "./pages/SuratPage/UsahaPages";
import TidakMampuPages from "./pages/SuratPage/TidakMampuPages";
import KehilanganKtpPages from "./pages/SuratPage/KehilanganKtpPages";
import KehilanganKkPages from "./pages/SuratPage/KehilanganKkPages";
import UmumPages from "./pages/SuratPage/UmumPages";
import ArtikelPages from "./pages/ArtikelPage/ArtikelPages";
import PendapatanPages from "./pages/InfografisPage/PendapatanPages";
import BelanjaPages from "./pages/InfografisPage/BelanjaPages";
import PetaPages from "./pages/InfografisPage/PetaPages";
import DataKTPPages from "./pages/PendudukPage/KtpPages";
import DataKKPages from "./pages/PendudukPage/KkPages";
import PengaduanPages from "./pages/PengaduanPage/PenganduanPages";
import ProfilPages from "./pages/ProfilPage/ProfilPages";
import KelahiranPages from "./pages/SuratPage/KelahiranPages";
import KipPages from "./pages/SuratPage/KipPages";

// You might want to create a DashboardPage for after login
// import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <>
<<<<<<< Updated upstream
=======
      {/* <div className="absolute top-4 right-4 z-50"> 
        <DarkThemeToggle />
      </div> */}

>>>>>>> Stashed changes
      <div className="absolute top-4 right-4 z-50">
        <DarkThemeToggle />
      </div>

      {/* Navigation example (optional, you can place this in a Navbar component) */}
      {/* <nav className="bg-gray-100 dark:bg-gray-800 p-4 absolute top-16 right-4 z-50 rounded shadow">
        <ul className="flex flex-col space-y-2">
          <li>
            <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">Home</Link>
          </li>
          <li>
            <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">Login</Link>
          </li>
        
          <li>
            <Link to="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">Dashboard</Link>
          </li>
        </ul>
      </nav> */}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/skpindah" element={<PindahPages />} />
          <Route path="/skdomisili" element={<DomisiliPages />} />
          <Route path="/skkematian" element={<KematianPages />} />
          <Route path="/skkelahiran" element={<KelahiranPages />} />
          <Route path="/skusaha" element={<UsahaPages />} />
          <Route path="/sktidakmampu" element={<TidakMampuPages />} />
          <Route path="/sktmkip" element={<KipPages />} />
          <Route path="/skkehilanganktp" element={<KehilanganKtpPages />} />
          <Route path="/skkehilangankk" element={<KehilanganKkPages />} />
          <Route path="/skumum" element={<UmumPages />} />
          <Route path="/profil" element={<ProfilPages />} />
          <Route path="/artikel" element={<ArtikelPages />} />
          <Route path="/pendapatan" element={<PendapatanPages />} />
          <Route path="/belanja" element={<BelanjaPages />} />
          <Route path="/peta" element={<PetaPages />} />
          <Route path="/dataktp" element={<DataKTPPages />} />
          <Route path="/datakk" element={<DataKKPages />} />
          <Route path="/datakk" element={<DataKKPages />} />
          <Route path="/pengaduan" element={<PengaduanPages />} />
        </Route>
      </Routes>
    </>
  );
}
