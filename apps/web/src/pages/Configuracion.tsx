import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Loader2, Save, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


// Importamos los tipos y las funciones de simulación
import { 
    NegocioConfig, 
    CuentaConfig, 
    getConfigData, 
    saveNegocioConfig, 
    saveCuentaConfig
} from "@/services/configuracion"; 


// --- VALORES INICIALES PARA LOS ESTADOS ---
const initialNegocioState: NegocioConfig = { nombre: '', direccion: '', telefono: '', ruc: '' };
const initialCuentaState: CuentaConfig = { nombreCompleto: '', email: '', celular: '' };


const Configuracion = () => {
    const { toast } = useToast();
    
    // Estados para la data
    const [negocioData, setNegocioData] = useState<NegocioConfig>(initialNegocioState);
    const [cuentaData, setCuentaData] = useState<CuentaConfig>(initialCuentaState);

    // Estados para la carga y guardado
    const [loading, setLoading] = useState(true);
    const [savingNegocio, setSavingNegocio] = useState(false);
    const [savingCuenta, setSavingCuenta] = useState(false);


    // --- EFECTO DE CARGA INICIAL ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getConfigData();
                setNegocioData(data.negocio);
                setCuentaData(data.cuenta);
            } catch (error) {
                toast({ title: "Error", description: "No se pudo cargar la configuración inicial.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);



    // --- MANEJO DE ENVÍO DE FORMULARIOS ---


    const handleSaveNegocio = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingNegocio(true);
        try {
            await saveNegocioConfig(negocioData);
            toast({ title: "Guardado exitoso", description: "La información del negocio ha sido actualizada." });
        } catch (error) {
            toast({ title: "Error", description: "Fallo al guardar la información del negocio.", variant: "destructive" });
        } finally {
            setSavingNegocio(false);
        }
    };


    const handleSaveCuenta = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingCuenta(true);
        try {
            await saveCuentaConfig(cuentaData);
            toast({ title: "Guardado exitoso", description: "Tu información de cuenta ha sido actualizada." });
        } catch (error) {
            toast({ title: "Error", description: "Fallo al actualizar tu cuenta.", variant: "destructive" });
        } finally {
            setSavingCuenta(false);
        }
    };



    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span className="text-lg text-muted-foreground">Cargando configuración...</span>
                </div>
            </Layout>
        );
    }


    return (
        <Layout>
            <div className="space-y-6 max-w-4xl mx-auto pb-8">
                {/* Header */}
                <div className="border-b pb-6">
                    <h1 className="text-3xl font-bold mb-2">Configuración</h1>
                    <p className="text-muted-foreground">Personaliza y administra la información de tu sistema</p>
                </div>


                <Tabs defaultValue="negocio" className="space-y-6">
                    <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="negocio" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Mi Negocio
                        </TabsTrigger>
                        <TabsTrigger value="cuenta" className="gap-2">
                            <User className="h-4 w-4" />
                            Mi Cuenta
                        </TabsTrigger>
                    </TabsList>


                    {/* --- PESTAÑA: MI NEGOCIO --- */}
                    <TabsContent value="negocio" className="space-y-4">
                        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">Información del Negocio</h2>
                            </div>
                            
                            <form onSubmit={handleSaveNegocio} className="space-y-5 max-w-2xl">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre-negocio" className="font-medium">Nombre del Negocio</Label>
                                    <Input 
                                        id="nombre-negocio" 
                                        value={negocioData.nombre} 
                                        onChange={(e) => setNegocioData({...negocioData, nombre: e.target.value})}
                                        disabled={savingNegocio}
                                        placeholder="Ej: Mi Bodega"
                                        className="transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion" className="font-medium">Dirección</Label>
                                    <Input 
                                        id="direccion" 
                                        value={negocioData.direccion}
                                        onChange={(e) => setNegocioData({...negocioData, direccion: e.target.value})}
                                        disabled={savingNegocio}
                                        placeholder="Ej: Av. Principal 123"
                                        className="transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono" className="font-medium">Teléfono</Label>
                                        <Input 
                                            id="telefono" 
                                            value={negocioData.telefono}
                                            onChange={(e) => setNegocioData({...negocioData, telefono: e.target.value})}
                                            disabled={savingNegocio}
                                            placeholder="Ej: +51 987 654 321"
                                            className="transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ruc" className="font-medium">RUC</Label>
                                        <Input 
                                            id="ruc" 
                                            value={negocioData.ruc}
                                            onChange={(e) => setNegocioData({...negocioData, ruc: e.target.value})}
                                            disabled={savingNegocio}
                                            placeholder="Ej: 20123456789"
                                            className="transition-all"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit"
                                    className="mt-6 gap-2 min-w-[180px]" 
                                    disabled={savingNegocio}
                                >
                                    {savingNegocio && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {savingNegocio ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>


                    {/* --- PESTAÑA: MI CUENTA --- */}
                    <TabsContent value="cuenta" className="space-y-4">
                        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold">Credenciales y Perfil</h2>
                            </div>

                            <form onSubmit={handleSaveCuenta} className="space-y-5 max-w-2xl">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="font-medium">Nombre Completo</Label>
                                    <Input 
                                        id="nombre" 
                                        value={cuentaData.nombreCompleto}
                                        onChange={(e) => setCuentaData({...cuentaData, nombreCompleto: e.target.value})}
                                        disabled={savingCuenta}
                                        placeholder="Tu nombre completo"
                                        className="transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-medium">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={cuentaData.email}
                                        onChange={(e) => setCuentaData({...cuentaData, email: e.target.value})}
                                        disabled={savingCuenta}
                                        placeholder="tu.email@ejemplo.com"
                                        className="transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="celular" className="font-medium">Celular</Label>
                                    <Input 
                                        id="celular" 
                                        value={cuentaData.celular}
                                        onChange={(e) => setCuentaData({...cuentaData, celular: e.target.value})}
                                        disabled={savingCuenta}
                                        placeholder="+51 987 654 321"
                                        className="transition-all"
                                    />
                                </div>

                                <Button 
                                    type="submit"
                                    className="mt-6 gap-2 min-w-[180px]" 
                                    disabled={savingCuenta}
                                >
                                    {savingCuenta && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {savingCuenta ? 'Actualizando...' : 'Actualizar Perfil'}
                                </Button>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>


            <ChatbotWidget />
        </Layout>
    );
};


export default Configuracion;
