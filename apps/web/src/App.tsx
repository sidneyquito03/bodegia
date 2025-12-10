import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// Páginas existentes
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Fiados from "./pages/Fiados";
import POS from "./pages/POS";
import Reportes from "./pages/Reportes";
import ReportesSUNAT from "./pages/ReportesSUNAT";
import Vendedores from "./pages/Equipo";
import Proveedores from "./pages/Proveedores";
import Configuracion from "./pages/Configuracion";
import ControlMermas from "./pages/ControlMermas";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";


const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* RUTA DE LOGIN */}
          <Route path="/login" element={<Login />} />


          {/* RUTAS PROTEGIDAS - Dashboard es la ruta principal */}
          <Route path="/" element={<Dashboard />} />


          {/* Rutas del sistema */}
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/fiados" element={<Fiados />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reportes-sunat" element={<ReportesSUNAT />} />
          <Route path="/equipo" element={<Vendedores />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/mermas" element={<ControlMermas />} />


          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
