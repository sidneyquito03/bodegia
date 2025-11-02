import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listTransaccionesFiados, listTransaccionesFiadosPaged, type TransaccionFiado } from "@/services/fiados"; 
    
const HistorialFiados = () => {
  const [transacciones, setTransacciones] = useState<TransaccionFiado[]>([]);
  const [loading, setLoading] = useState(true);

    // filtros
  const [filtro, setFiltro] = useState<"todos" | "fiado" | "pago">("todos");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>("");     // YYYY-MM-DD

  // paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTransacciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, from, to, page, limit]);

 async function fetchTransacciones() {
    try {
      setLoading(true);
      const tipo = filtro === "todos" ? undefined : filtro;
      const res = await listTransaccionesFiadosPaged({
        tipo, from: from || undefined, to: to || undefined, page, limit,
      });
      res.items.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      setTransacciones(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      setTransacciones([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const totalFiado = useMemo(
    () => transacciones.filter(t => t.tipo === "fiado").reduce((s, t) => s + Number(t.monto || 0), 0),
    [transacciones]
  );
  const totalPagado = useMemo(
    () => transacciones.filter(t => t.tipo === "pago").reduce((s, t) => s + Number(t.monto || 0), 0),
    [transacciones]
  );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    function resetToFirstPageAndFetch() {
    setPage(1);
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Historial de Fiados</h1>
          <p className="text-muted-foreground mt-1">Registro completo de transacciones</p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fiado</p>
                <p className="text-2xl font-bold text-destructive">S/. {totalFiado.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">S/. {totalPagado.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtro */}
    <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select
                value={filtro}
                onValueChange={(v: any) => { setFiltro(v); resetToFirstPageAndFetch(); }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las transacciones</SelectItem>
                  <SelectItem value="fiado">Solo fiados</SelectItem>
                  <SelectItem value="pago">Solo pagos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Desde</label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); resetToFirstPageAndFetch(); }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hasta</label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); resetToFirstPageAndFetch(); }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Por página</label>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => { setLimit(Number(v)); resetToFirstPageAndFetch(); }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Historial */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Transacciones</h2>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando...</p>
          ) : transacciones.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay transacciones registradas</p>
          ) : (
            <div className="space-y-3">
              {transacciones.map((t) => {
                const clienteNombre =
                  t.cliente?.nombre ??
                  (t as any).clientes?.nombre ??
                  (t as any).cliente_nombre ??
                  "Cliente desconocido";

                const metodo = (t as any).metodo_pago ?? (t as any).metodoPago;
                const ref = (t as any).referencia ?? (t as any).referencia_transaccion;

                return (
                  <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={t.tipo === "fiado" ? "destructive" : "default"}>
                          {t.tipo === "fiado" ? "📤 Fiado" : "💰 Pago"}
                        </Badge>
                        <span className="font-medium">{clienteNombre}</span>
                      </div>
                      {t.descripcion && (
                        <p className="text-sm text-muted-foreground mb-1">{t.descripcion}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(t.created_at), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                        </span>
                        {metodo && <Badge variant="outline" className="text-xs">{metodo}</Badge>}
                        {ref && <span className="text-xs">Ref: {ref}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${t.tipo === "fiado" ? "text-destructive" : "text-green-600"}`}>
                        {t.tipo === "fiado" ? "+" : "-"} S/. {Number(t.monto).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages} — {total} transacciones
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ChatbotWidget />
    </Layout>
  );
};

export default HistorialFiados;
