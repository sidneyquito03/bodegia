import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const Configuracion = () => {
  const categorias = ["Bebidas", "Panadería", "Lácteos", "Abarrotes", "Limpieza", "Snacks"];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Personaliza tu experiencia</p>
        </div>

        <Tabs defaultValue="negocio" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="negocio">Mi Negocio</TabsTrigger>
            <TabsTrigger value="cuenta">Mi Cuenta</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="negocio">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-6">Información del Negocio</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="nombre-negocio">Nombre del Negocio</Label>
                  <Input id="nombre-negocio" defaultValue="Bodega San José" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" defaultValue="Av. Los Pinos 456, Lima" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" defaultValue="987 654 321" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input id="ruc" defaultValue="20123456789" />
                </div>
                <Button className="mt-4">Guardar Cambios</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cuenta">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-6">Mi Cuenta</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" defaultValue="Juan Pérez García" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="juan@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input id="celular" defaultValue="987 654 321" />
                </div>
                <Button className="mt-4">Actualizar Perfil</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categorias">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-6">Categorías de Productos</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {categorias.map((categoria) => (
                    <Badge 
                      key={categoria} 
                      variant="outline" 
                      className="text-sm py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {categoria}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 max-w-md">
                  <Input placeholder="Nueva categoría..." />
                  <Button>Agregar</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ChatbotWidget />
    </Layout>
  );
};

export default Configuracion;
