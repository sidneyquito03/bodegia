import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Search, Plus, Minus, Trash2, Mic, MicOff, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventario } from "@/hooks/useInventario";
import { useVentas, ItemVenta } from "@/hooks/useVentas";
import { useFiados } from "@/hooks/useFiados";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POS = () => {
  const { productos } = useInventario();
  const { registrarVenta, loading } = useVentas();
  const { clientes } = useFiados();
  const { toast } = useToast();
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fiadoDialogOpen, setFiadoDialogOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [modoEscaneo, setModoEscaneo] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scanBufferRef = useRef<string>('');

  useEffect(() => {
    // Inicializar reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setSearchTerm(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setEscuchando(false);
        toast({
          title: "Error",
          description: "No se pudo activar el reconocimiento de voz",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setEscuchando(false);
      };
    }

    // Listener para escaneo de código de barras
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!modoEscaneo) return;

      if (e.key === 'Enter') {
        if (scanBufferRef.current) {
          buscarPorCodigo(scanBufferRef.current);
          scanBufferRef.current = '';
        }
      } else {
        scanBufferRef.current += e.key;
        setTimeout(() => {
          scanBufferRef.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [modoEscaneo]);

  const toggleVoz = () => {
    if (!recognitionRef.current) {
      toast({
        title: "No disponible",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      });
      return;
    }

    if (escuchando) {
      recognitionRef.current.stop();
      setEscuchando(false);
    } else {
      recognitionRef.current.start();
      setEscuchando(true);
      toast({
        title: "Escuchando...",
        description: "Di el nombre del producto que buscas",
      });
    }
  };

  const buscarPorCodigo = (codigo: string) => {
    const producto = productos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase());
    if (producto) {
      agregarAlCarrito(producto);
      toast({
        title: "Producto agregado",
        description: `${producto.nombre} añadido al carrito`,
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró producto con código: ${codigo}`,
        variant: "destructive",
      });
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agregarAlCarrito = (producto: any) => {
    const existe = carrito.find(item => item.producto_id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio_venta
      }]);
    }
  };

  const actualizarCantidad = (producto_id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.producto_id !== producto_id));
    } else {
      setCarrito(carrito.map(item =>
        item.producto_id === producto_id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const eliminarDelCarrito = (producto_id: string) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id));
  };

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const handleCobrar = async () => {
    if (carrito.length === 0) return;
    const success = await registrarVenta(carrito, 'efectivo');
    if (success) {
      setCarrito([]);
    }
  };

  const handleFiar = async () => {
    if (carrito.length === 0 || !clienteSeleccionado) return;
    const success = await registrarVenta(carrito, 'fiado', clienteSeleccionado);
    if (success) {
      setCarrito([]);
      setFiadoDialogOpen(false);
      setClienteSeleccionado('');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground mt-1">Registra ventas rápidamente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Catálogo - 3 columnas */}
          <Card className="lg:col-span-3 p-6 shadow-card">
            <div className="space-y-4">
              {/* Buscador con voz y escáner */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar producto o escanear código..." 
                      className="pl-10 h-12 text-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant={escuchando ? "default" : "outline"}
                    size="icon"
                    className="h-12 w-12"
                    onClick={toggleVoz}
                  >
                    {escuchando ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={modoEscaneo ? "default" : "outline"}
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => {
                      setModoEscaneo(!modoEscaneo);
                      toast({
                        title: modoEscaneo ? "Modo escáner desactivado" : "Modo escáner activado",
                        description: modoEscaneo ? "Usa el teclado normalmente" : "Escanea productos con el lector",
                      });
                    }}
                  >
                    <Barcode className="h-5 w-5" />
                  </Button>
                </div>
                {escuchando && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    🎤 Escuchando...
                  </p>
                )}
                {modoEscaneo && (
                  <p className="text-sm text-muted-foreground">
                    📷 Modo escáner activo - Escanea un código de barras
                  </p>
                )}
              </div>

              {/* Grid de productos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {productosFiltrados.map((producto) => (
                  <Card 
                    key={producto.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {(producto as any).imagen_url ? (
                        <img 
                          src={(producto as any).imagen_url} 
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {producto.nombre}
                    </h3>
                    <Badge variant="outline" className="text-xs mb-2">
                      {producto.categoria}
                    </Badge>
                    <p className="text-lg font-bold text-primary">
                      S/. {producto.precio_venta.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {producto.stock}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Carrito - 2 columnas */}
          <Card className="lg:col-span-2 p-6 shadow-card lg:sticky lg:top-8 h-fit">
            <h2 className="text-xl font-semibold mb-4">Carrito</h2>
            
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.producto_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        S/. {item.precio.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.producto_id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => eliminarDelCarrito(item.producto_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">S/. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary">S/. {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button 
                className="h-12" 
                onClick={handleCobrar}
                disabled={carrito.length === 0 || loading}
              >
                Cobrar
              </Button>
              <Button 
                variant="outline" 
                className="h-12"
                onClick={() => setFiadoDialogOpen(true)}
                disabled={carrito.length === 0 || loading}
              >
                Fiar
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setCarrito([])}
              disabled={carrito.length === 0}
            >
              Cancelar
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={fiadoDialogOpen} onOpenChange={setFiadoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(cliente => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - Deuda: S/. {cliente.deuda_total.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFiadoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFiar} disabled={!clienteSeleccionado || loading}>
                Confirmar Fiado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatbotWidget />
    </Layout>
  );
};

export default POS;
