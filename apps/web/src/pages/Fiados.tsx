import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { PagoModal } from "@/components/modals/PagoModal";
import { ClienteModal } from "@/components/modals/ClienteModal";
import { CreditCard, Users, TrendingDown, UserPlus, Search, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useFiados } from "@/hooks/useFiados";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";


// --- DATOS FALSOS PARA CLIENTES ---
const CLIENTES_INICIALES = [
  {
    id: "1",
    nombre: "Juan Pérez García",
    celular: "+51 987 654 321",
    dni: "12345678",
    deuda_total: 450.50,
    foto_url: "",
    activo: true,
    created_at: "2024-11-15"
  },
  {
    id: "2",
    nombre: "María López Rodríguez",
    celular: "+51 991 234 567",
    dni: "23456789",
    deuda_total: 850.00,
    foto_url: "",
    activo: true,
    created_at: "2024-11-10"
  },
  {
    id: "3",
    nombre: "Carlos Silva Morales",
    celular: "+51 992 345 678",
    dni: "34567890",
    deuda_total: 0,
    foto_url: "",
    activo: true,
    created_at: "2024-10-20"
  },
  {
    id: "4",
    nombre: "Ana García Fernández",
    celular: "+51 988 123 456",
    dni: "45678901",
    deuda_total: 1200.75,
    foto_url: "",
    activo: true,
    created_at: "2024-11-05"
  },
  {
    id: "5",
    nombre: "Roberto Flores Gutiérrez",
    celular: "+51 993 567 890",
    dni: "56789012",
    deuda_total: 320.25,
    foto_url: "",
    activo: true,
    created_at: "2024-11-20"
  },
  {
    id: "6",
    nombre: "Martina Sánchez Vélez",
    celular: "+51 994 678 901",
    dni: "67890123",
    deuda_total: 0,
    foto_url: "",
    activo: true,
    created_at: "2024-10-15"
  },
  {
    id: "7",
    nombre: "David Ramírez López",
    celular: "+51 995 789 012",
    dni: "78901234",
    deuda_total: 675.00,
    foto_url: "",
    activo: true,
    created_at: "2024-11-08"
  },
];


const Fiados = () => {
  const { clientes: clientesHook, loading, registrarPago, registrarCliente } = useFiados();
  
  // Usar datos falsos si no hay clientes en el hook
  const clientes = clientesHook.length > 0 ? clientesHook : CLIENTES_INICIALES;
  
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const deudaTotal = clientes.reduce((sum, c) => sum + c.deuda_total, 0);
  const clientesConDeuda = clientes.filter(c => c.deuda_total > 0).length;
  const clientesAlDia = clientes.filter(c => c.deuda_total === 0).length;
  const promedioDeuda = clientesConDeuda > 0 ? deudaTotal / clientesConDeuda : 0;


  const handleRegistrarPago = (
    monto: number, 
    descripcion: string, 
    metodoPago: string, 
    referencia?: string, 
    comprobanteUrl?: string
  ) => {
    if (selectedCliente) {
      registrarPago(selectedCliente.id, monto, descripcion, metodoPago, referencia, comprobanteUrl);
      setSelectedCliente(null);
    }
  };


  const handleRegistrarCliente = (clienteData: any) => {
    registrarCliente(clienteData);
  };


  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    c.activo !== false
  );


  const getDiasPendientes = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };


  const getIniciales = (nombre: string) => {
    const parts = nombre.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`
      : nombre.slice(0, 2).toUpperCase();
  };


  const getEstadoDeuda = (deuda: number) => {
    if (deuda === 0) return { label: "Al día", color: "bg-green-50 border-green-200", icon: CheckCircle2, textColor: "text-green-700" };
    if (deuda < 500) return { label: "Bajo", color: "bg-yellow-50 border-yellow-200", icon: Clock, textColor: "text-yellow-700" };
    if (deuda < 1000) return { label: "Medio", color: "bg-orange-50 border-orange-200", icon: AlertCircle, textColor: "text-orange-700" };
    return { label: "Alto", color: "bg-red-50 border-red-200", icon: AlertCircle, textColor: "text-red-700" };
  };


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Fiados</h1>
              <p className="text-muted-foreground mt-1">Control de créditos a clientes</p>
            </div>
            <Button onClick={() => setClienteModalOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>


        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-border/50 bg-gradient-to-br from-red-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Deuda Total</p>
                <p className="text-2xl font-bold mt-2 text-red-600">S/. {deudaTotal.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-orange-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Con Deuda</p>
                <p className="text-2xl font-bold mt-2">{clientesConDeuda}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-green-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Al Día</p>
                <p className="text-2xl font-bold mt-2">{clientesAlDia}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-blue-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Promedio</p>
                <p className="text-2xl font-bold mt-2">S/. {promedioDeuda.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>


        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all"
          />
        </div>


        {/* Clientes con Deuda */}
        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Clientes Registrados</h2>
            <Badge variant="outline">{clientesFiltrados.length}</Badge>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando clientes...</p>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((cliente: any) => {
                const estado = getEstadoDeuda(cliente.deuda_total);
                const EstadoIcon = estado.icon;
                
                return (
                  <Card 
                    key={cliente.id} 
                    className={`p-5 border ${estado.color} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                        <AvatarImage src={cliente.foto_url} />
                        <AvatarFallback>{getIniciales(cliente.nombre)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{cliente.nombre}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {cliente.celular || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Deuda:</span>
                        <span className={`text-lg font-bold ${cliente.deuda_total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          S/. {cliente.deuda_total.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <EstadoIcon className="h-4 w-4" />
                        <Badge variant="outline" className={`${estado.textColor}`}>
                          {estado.label}
                        </Badge>
                      </div>
                      
                      {cliente.deuda_total > 0 && cliente.created_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{getDiasPendientes(cliente.created_at)} días pendientes</span>
                        </div>
                      )}

                      {cliente.dni && (
                        <p className="text-xs text-muted-foreground">DNI: {cliente.dni}</p>
                      )}
                    </div>


                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setSelectedCliente(cliente);
                        setPagoModalOpen(true);
                      }}
                      disabled={cliente.deuda_total === 0}
                      variant={cliente.deuda_total === 0 ? "outline" : "default"}
                    >
                      {cliente.deuda_total === 0 ? "Sin Deuda" : "Registrar Pago"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>


      {selectedCliente && (
        <PagoModal
          isOpen={pagoModalOpen}
          onClose={() => {
            setPagoModalOpen(false);
            setSelectedCliente(null);
          }}
          onSave={handleRegistrarPago}
          clienteNombre={selectedCliente.nombre}
          deudaActual={selectedCliente.deuda_total}
        />
      )}


      <ClienteModal
        isOpen={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onSave={handleRegistrarCliente}
      />


      <ChatbotWidget />
    </Layout>
  );
};


export default Fiados;
