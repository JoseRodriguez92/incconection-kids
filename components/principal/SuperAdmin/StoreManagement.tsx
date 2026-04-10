"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ShoppingCart, TrendingUp, Users, Package } from "lucide-react"

const productosVendidos = [
  { name: "Cuadernos", ventas: 150 },
  { name: "Lápices", ventas: 120 },
  { name: "Uniformes", ventas: 85 },
  { name: "Libros", ventas: 75 },
  { name: "Calculadoras", ventas: 60 },
  { name: "Reglas", ventas: 45 },
  { name: "Borradores", ventas: 40 },
  { name: "Colores", ventas: 35 },
  { name: "Pegamento", ventas: 30 },
  { name: "Tijeras", ventas: 25 },
]

const clientesFrecuentes = [
  { nombre: "María González", grado: "5°A", gastos: "$125.000" },
  { nombre: "Carlos Pérez", grado: "8°B", gastos: "$98.000" },
  { nombre: "Ana Rodríguez", grado: "3°C", gastos: "$87.000" },
  { nombre: "Luis Martínez", grado: "11°A", gastos: "$76.000" },
  { nombre: "Carmen López", grado: "6°B", gastos: "$65.000" },
]

const inventario = [
  { producto: "Cuadernos", stock: 45, minimo: 20, estado: "Disponible" },
  { producto: "Lápices", stock: 12, minimo: 25, estado: "Bajo Stock" },
  { producto: "Uniformes", stock: 8, minimo: 15, estado: "Crítico" },
  { producto: "Libros", stock: 67, minimo: 30, estado: "Disponible" },
  { producto: "Calculadoras", stock: 23, minimo: 10, estado: "Disponible" },
]

export function StoreManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard de Tienda</h2>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ventas del Mes</p>
                <p className="text-2xl font-bold">$2,450,000</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Vendidos</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Disponibles</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productosVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>

        {/* Clientes más frecuentes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Más Fieles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientesFrecuentes.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{cliente.nombre}</div>
                    <div className="text-sm text-muted-foreground">{cliente.grado}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{cliente.gastos}</div>
                    <div className="text-xs text-muted-foreground">Total gastado</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Producto</th>
                  <th className="text-left p-2">Stock Actual</th>
                  <th className="text-left p-2">Stock Mínimo</th>
                  <th className="text-left p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.producto}</td>
                    <td className="p-2">{item.stock}</td>
                    <td className="p-2">{item.minimo}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${item.estado === "Disponible"
                            ? "bg-green-100 text-green-800"
                            : item.estado === "Bajo Stock"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
