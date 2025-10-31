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
import { CreditCard, Users, TrendingDown, UserPlus, Search, Calendar } from "lucide-react";
import { useFiados } from "@/hooks/useFiados";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";

const Fiados = () => {
  const { clientes, loading, registrarPago, registrarCliente } = useFiados();
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const deudaTotal = clientes.reduce((sum, c) => sum + c.deuda_total, 0);
  const clientesConDeuda = clientes.filter(c => c.deuda_total > 0).length;
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Fiados</h1>
            <p className="text-muted-foreground mt-1">Control de créditos a clientes</p>
          </div>
          <Button onClick={() => setClienteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar Cliente
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Deuda Total"
            value={`S/. ${deudaTotal.toFixed(2)}`}
            icon={<CreditCard className="h-6 w-6" />}
          />
          <KPICard
            title="Clientes con Deuda"
            value={clientesConDeuda}
            icon={<Users className="h-6 w-6" />}
          />
          <KPICard
            title="Promedio por Cliente"
            value={`S/. ${promedioDeuda.toFixed(2)}`}
            icon={<TrendingDown className="h-6 w-6" />}
          />
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clientes con Deuda */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Clientes con Deuda</h2>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando...</p>
          ) : clientesFiltrados.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((cliente: any) => (
                <Card key={cliente.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-14 w-14 bg-primary text-primary-foreground">
                      <AvatarImage src={cliente.foto_url} />
                      <AvatarFallback>{getIniciales(cliente.nombre)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{cliente.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cliente.celular || 'Sin teléfono'}
                      </p>
                      {cliente.dni && (
                        <p className="text-xs text-muted-foreground">DNI: {cliente.dni}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Deuda:</span>
                      <span className="text-xl font-bold text-destructive">
                        S/. {cliente.deuda_total.toFixed(2)}
                      </span>
                    </div>
                    
                    {cliente.deuda_total > 0 && cliente.created_at && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          {getDiasPendientes(cliente.created_at)} días pendientes
                        </span>
                      </div>
                    )}
                    
                    {cliente.deuda_total === 0 && (
                      <Badge variant="outline" className="w-full justify-center">
                        Al día
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => {
                      setSelectedCliente(cliente);
                      setPagoModalOpen(true);
                    }}
                    disabled={cliente.deuda_total === 0}
                  >
                    Registrar Pago
                  </Button>
                </Card>
              ))}
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
