"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X, Eye } from "lucide-react"

export function StudentCSVContent() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const csvData = [
    {
      row: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      grade: "10°A",
      status: "Válido",
      errors: [],
    },
    {
      row: 2,
      name: "Carlos Rodríguez",
      document: "",
      grade: "11°B",
      status: "Error",
      errors: ["Documento requerido"],
    },
    {
      row: 3,
      name: "María López Martínez",
      document: "1122334455",
      grade: "9°C",
      status: "Válido",
      errors: [],
    },
    {
      row: 4,
      name: "",
      document: "5544332211",
      grade: "10°B",
      status: "Error",
      errors: ["Nombre requerido"],
    },
  ]

  const validRecords = csvData.filter((record) => record.status === "Válido").length
  const errorRecords = csvData.filter((record) => record.status === "Error").length

  const handleUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Registro por CSV</h2>
          <p className="text-muted-foreground">Importa múltiples estudiantes desde un archivo CSV</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver Ejemplo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="validate">Validar Datos</TabsTrigger>
          <TabsTrigger value="import">Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instrucciones para el Archivo CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Formato Requerido:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Archivo en formato .csv</li>
                    <li>• Codificación UTF-8</li>
                    <li>• Separador: coma (,)</li>
                    <li>• Primera fila debe contener encabezados</li>
                    <li>• Máximo 500 registros por archivo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Columnas Obligatorias:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• nombres</li>
                    <li>• apellidos</li>
                    <li>• tipo_documento</li>
                    <li>• numero_documento</li>
                    <li>• grado</li>
                    <li>• acudiente_nombre</li>
                    <li>• acudiente_telefono</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zona de carga */}
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivo CSV</CardTitle>
              <CardDescription>Arrastra tu archivo aquí o haz clic para seleccionar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Arrastra tu archivo CSV aquí</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionar desde tu computador</p>
                </div>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Subiendo..." : "Seleccionar Archivo"}
                </Button>
              </div>

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subiendo archivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadComplete && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Archivo subido exitosamente. Procede a la validación de datos.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          {/* Resumen de validación */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{csvData.length}</div>
                <div className="text-sm text-muted-foreground">Total Registros</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{validRecords}</div>
                <div className="text-sm text-muted-foreground">Registros Válidos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{errorRecords}</div>
                <div className="text-sm text-muted-foreground">Con Errores</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de validación */}
          <Card>
            <CardHeader>
              <CardTitle>Validación de Datos</CardTitle>
              <CardDescription>Revisa y corrige los errores antes de importar</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fila</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Errores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((record) => (
                    <TableRow key={record.row}>
                      <TableCell>{record.row}</TableCell>
                      <TableCell>{record.name || <span className="text-red-500">Faltante</span>}</TableCell>
                      <TableCell>{record.document || <span className="text-red-500">Faltante</span>}</TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "Válido" ? "default" : "destructive"}>
                          {record.status === "Válido" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.errors.length > 0 ? (
                          <div className="text-sm text-red-600">{record.errors.join(", ")}</div>
                        ) : (
                          <span className="text-green-600 text-sm">Sin errores</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {errorRecords > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Se encontraron {errorRecords} registro(s) con errores. Corrige los errores antes de continuar con la
                importación.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirmar Importación</CardTitle>
              <CardDescription>Revisa el resumen antes de importar los estudiantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Resumen de Importación:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• {validRecords} estudiantes serán registrados</li>
                    <li>• Se asignarán automáticamente los códigos estudiantiles</li>
                    <li>• Se enviarán notificaciones a los acudientes</li>
                    <li>• Se generarán las credenciales de acceso</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Configuración:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Estado inicial: Prematriculado</li>
                    <li>• Año académico: 2024</li>
                    <li>• Período: Primer semestre</li>
                    <li>• Sede: Principal</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" disabled={errorRecords > 0}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Importación
                </Button>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
