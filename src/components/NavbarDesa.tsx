import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Button as FlowbiteButton,
} from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDesa } from "@/contexts/DesaContext";

// Create a custom event for chatbot state
export const CHATBOT_MINIMIZE_EVENT = "chatbot-minimize";

export default function NavbarDesa() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFiturDesaInView, setIsFiturDesaInView] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { desaConfig } = useDesa();

  // Handle scroll position and navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const isAtTop = scrollPosition < 100;

      setIsScrolled(scrollPosition > 10);

      // Chatbot minimize event
      window.dispatchEvent(
        new CustomEvent(CHATBOT_MINIMIZE_EVENT, {
          detail: { minimize: !isAtTop },
        }),
      );
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for Fitur Desa section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFiturDesaInView(entry.isIntersecting);
      },
      {
        threshold: 0.5,
        rootMargin: "-80px 0px 0px 0px",
      },
    );

    const fiturDesaElement = document.getElementById("FiturDesa");
    if (fiturDesaElement) {
      observer.observe(fiturDesaElement);
    }

    return () => {
      if (fiturDesaElement) {
        observer.unobserve(fiturDesaElement);
      }
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleFiturDesaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToFiturDesa(), 100);
    } else {
      scrollToFiturDesa();
    }
  };

  const scrollToFiturDesa = () => {
    const element = document.getElementById("FiturDesa");
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    {
      href: "/",
      label: "Beranda",
      active: location.pathname === "/" && !location.hash && !isFiturDesaInView,
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: "/#FiturDesa",
      label: "Fitur Desa",
      active: isFiturDesaInView,
      onClick: handleFiturDesaClick,
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      href: "/profildesa",
      label: "Profil Desa",
      active: location.pathname === "/profildesa",
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      href: "/infografis/penduduk",
      label: "Infografis",
      active: location.pathname.startsWith("/infografis"),
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      href: "/artikeldesa",
      label: "Artikel",
      active: location.pathname === "/artikeldesa",
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      href: "/petafasilitasdesa",
      label: "Peta",
      active: location.pathname === "/petafasilitasdesa",
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="sticky top-0 z-50">
      <Navbar
        fluid
        rounded={false}
        className={`border-b-2 px-4 transition-all duration-300 ease-in-out sm:px-6 lg:px-8 ${
          isScrolled
            ? "border-[var(--color-slate-gray)] bg-[var(--color-pure-white)]/95 shadow-lg backdrop-blur-md dark:border-[var(--color-dark-slate)] dark:bg-[var(--color-dark-slate)]/95"
            : "border-transparent bg-transparent"
        }`}
      >
        <NavbarBrand href="/" className="group">
          <div className="flex min-w-0 items-center space-x-3 sm:space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-fresh-green)] to-[var(--color-cyan-blue)] shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
                />
              </svg>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-bold text-transparent transition-all duration-300 ease-in-out group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-blue-600 sm:text-xl lg:text-2xl dark:from-white dark:to-gray-200 dark:text-white">
                {desaConfig?.nama_desa || "Portal Desa"}
              </span>
              <span className="truncate text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                {desaConfig?.nama_kabupaten || "Kabupaten"} •{" "}
                {desaConfig?.nama_provinsi || "Provinsi"}
              </span>
            </div>
          </div>
        </NavbarBrand>

        <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-3 md:order-2">
          <FlowbiteButton
            href="/admin/dashboard"
            size="sm"
            className="group relative hidden overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 transition-all duration-300 ease-in-out hover:scale-105 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300/50 active:scale-95 lg:flex dark:focus:ring-blue-800/50"
          >
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
            <svg
              className="relative mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="relative font-medium">Executive Login</span>
          </FlowbiteButton>

          <NavbarToggle
            className="rounded-lg p-2 transition-all duration-300 ease-in-out hover:scale-105 focus:ring-4 focus:ring-gray-200 active:scale-95 lg:hidden dark:focus:ring-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        <NavbarCollapse
          className={`${isMobileMenuOpen ? "block" : "hidden"} lg:block`}
        >
          {navItems.map((item, index) => (
            <NavbarLink
              key={index}
              href={item.href}
              active={item.active}
              onClick={item.onClick}
              className={`group flex items-center rounded-lg px-4 py-2.5 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                item.active
                  ? "bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-800 hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400"
              } `}
            >
              {item.icon}
              <span className="transition-all duration-300 ease-in-out group-hover:translate-x-1">
                {item.label}
              </span>
              {item.active && (
                <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
              )}
            </NavbarLink>
          ))}

          {/* Mobile/Tablet Login Button */}
          <div className="mt-4 border-t border-gray-200 pt-4 lg:hidden dark:border-gray-700">
            <FlowbiteButton
              href="/admin/dashboard"
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700"
            >
              Executive Login
            </FlowbiteButton>
          </div>
        </NavbarCollapse>
      </Navbar>
    </div>
  );
}
