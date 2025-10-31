import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { OperadorModal } from "@/components/modals/OperadorModal";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useOperadores } from "@/hooks/useOperadores";

const Equipo = () => {
  const { operadores, loading, agregarOperador, toggleOperador } = useOperadores();
  const [modalOpen, setModalOpen] = useState(false);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Equipo</h1>
            <p className="text-muted-foreground mt-1">Administra a tus operadores</p>
          </div>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Crear Operador
          </Button>
        </div>

        {/* Lista de operadores */}
        {loading ? (
          <Card className="p-8 shadow-card">
            <p className="text-center text-muted-foreground">Cargando...</p>
          </Card>
        ) : operadores.length === 0 ? (
          <Card className="p-8 shadow-card">
            <p className="text-center text-muted-foreground">No hay operadores registrados</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operadores.map((operador) => (
              <Card key={operador.id} className="p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-lg">{getIniciales(operador.nombre)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{operador.nombre}</h3>
                    <p className="text-sm text-muted-foreground">📱 {operador.celular}</p>
                    <Badge 
                      className="mt-2"
                      variant={operador.activo ? "default" : "secondary"}
                    >
                      {operador.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => toggleOperador(operador.id, operador.activo)}
                  >
                    {operador.activo ? (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <OperadorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={agregarOperador}
      />

      <ChatbotWidget />
    </Layout>
  );
};

export default Equipo;
