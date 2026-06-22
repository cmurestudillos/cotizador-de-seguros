import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Header } from './components/Header';
import { Formulario } from './components/Formulario';
import { Resumen } from './components/Resumen';
import { Resultado } from './components/Resultado';
import { HistorialPresupuestos } from './components/HistorialPresupuestos';
import { ComparadorPresupuestos } from './components/ComparadorPresupuestos';
import Spinner from './components/Spinner/Spinner';
import { useInsuranceCalculator } from './hooks/useInsuranceCalculator';
import { usePresupuestosStorage } from './hooks/usePresupuestosStorage';
import type { Presupuesto, DatosSeguro } from './types';
import Footer from './components/Footer';

const Contenedor = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
`;

const ContenedorFormulario = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: #00838f;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
`;

const TabsContainer = styled.div`
  margin-top: 2rem;
`;

const TabsHeader = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
  position: relative;

  ${props =>
    props.active
      ? `
    background: linear-gradient(135deg, #00838F 0%, #26C6DA 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 131, 143, 0.3);
  `
      : `
    background: #f5f5f5;
    color: #666;
    &:hover {
      background: #e0e0e0;
      color: #333;
    }
  `}
`;

const TabContent = styled.div`
  min-height: 200px;
`;

const Notificacion = styled.div<{ tipo: 'exito' | 'info' | 'advertencia' }>`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  position: relative;
  animation: slideInFromTop 0.3s ease-out;

  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${props => {
    switch (props.tipo) {
      case 'exito':
        return `
          background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
          color: white;
        `;
      case 'advertencia':
        return `
          background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
          color: white;
        `;
      default:
        return `
          background: linear-gradient(135deg, #2196F3 0%, #03DAC6 100%);
          color: white;
        `;
    }
  }}
`;

const BotonCerrarNotificacion = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const ContadorHistorial = styled.span<{ visible: boolean }>`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transform: scale(${props => (props.visible ? 1 : 0)});
  transition: transform 0.3s ease;
`;

const AccionesResultado = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const BotonAccion = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
        `;
      case 'secondary':
        return `
          background: #e0e0e0;
          color: #333;
          &:hover { background: #d0d0d0; transform: translateY(-1px); }
        `;
      default:
        return `
          background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); }
        `;
    }
  }}
`;

const AppFinal: React.FC = () => {
  // Hook principal para gestión de presupuestos
  const presupuestosHook = usePresupuestosStorage();
  const {
    presupuestos,
    agregarPresupuesto,
    eliminarPresupuesto,
    toggleFavorito,
    limpiarHistorial,
    exportarCSV,
    recargarPresupuestos,
  } = presupuestosHook;

  // Hook para cálculos (sin gestión de almacenamiento)
  const { resumen, loading, procesarCotizacion, resetear, editarPresupuesto } = useInsuranceCalculator();
  const { cotizacion, datos } = resumen;

  const [tabActiva, setTabActiva] = useState<'nuevo' | 'historial'>('nuevo');
  const [presupuestosComparar, setPresupuestosComparar] = useState<Presupuesto[]>([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<DatosSeguro | undefined>();
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'exito' | 'info' | 'advertencia';
  } | null>(null);
  const [presupuestoRecienCreado, setPresupuestoRecienCreado] = useState(false);
  const [contadorHistorial, setContadorHistorial] = useState(0);

  // Función para mostrar notificación temporal
  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'info' | 'advertencia', duracion = 4000) => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), duracion);
  };

  const cerrarNotificacion = () => {
    setNotificacion(null);
  };

  const handleSubmitFormulario = async (datos: DatosSeguro, notas?: string) => {
    // Primero calculamos
    const resultado = await procesarCotizacion(datos);

    if (!modoEdicion && resultado) {
      // Guardar en el historial solo para nuevos presupuestos
      agregarPresupuesto(resultado.cotizacion, resultado.datos, notas);

      setPresupuestoRecienCreado(true);
      setContadorHistorial(prev => prev + 1);
      mostrarNotificacion('✅ ¡Presupuesto creado y guardado exitosamente!', 'exito', 5000);
    } else if (modoEdicion) {
      // Solo recalcular para edición, no guardar uno nuevo
      mostrarNotificacion('🔄 Presupuesto recalculado exitosamente', 'exito');
      setModoEdicion(false);
      setDatosEdicion(undefined);
    }
  };

  const handleEditarPresupuesto = (datos: DatosSeguro) => {
    setDatosEdicion(datos);
    setModoEdicion(true);
    setTabActiva('nuevo');
    editarPresupuesto(datos);

    mostrarNotificacion('✏️ Presupuesto cargado para edición', 'info', 3000);
  };

  const handleCompararPresupuestos = (presupuestosPorComparar: Presupuesto[]) => {
    setPresupuestosComparar(presupuestosPorComparar);
  };

  const cerrarComparador = () => {
    setPresupuestosComparar([]);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setDatosEdicion(undefined);
    resetear();
    mostrarNotificacion('❌ Edición cancelada', 'advertencia', 2000);
  };

  const crearNuevaCoitizacion = () => {
    resetear();
    setPresupuestoRecienCreado(false);
    setModoEdicion(false);
    setDatosEdicion(undefined);
    mostrarNotificacion('📝 Formulario listo para nueva cotización', 'info', 2000);
  };

  const irAHistorial = () => {
    setTabActiva('historial');
    setContadorHistorial(0);
    setPresupuestoRecienCreado(false);
    // Recargar presupuestos para asegurar sincronización
    setTimeout(() => {
      recargarPresupuestos();
    }, 100);
  };

  const imprimirPresupuesto = () => {
    const contenidoImpresion = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cotización de Seguro</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #00838F; 
              padding-bottom: 20px; 
              margin-bottom: 20px;
            }
            .detalles { 
              margin: 20px 0; 
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .precio { 
              font-size: 28px; 
              font-weight: bold; 
              color: #00838F; 
              text-align: center; 
              margin: 30px 0; 
              padding: 20px;
              border: 2px solid #00838F;
              border-radius: 8px;
            }
            .nota { 
              font-size: 12px; 
              color: #666; 
              margin-top: 20px; 
              padding: 15px;
              background: #fff3cd;
              border-radius: 4px;
            }
            h1 { color: #00838F; margin: 0; }
            p { margin: 8px 0; }
            strong { color: #00695C; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛡️ Cotización de Seguro de Vehículo</h1>
            <p>Fecha de cotización: ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</p>
          </div>
          <div class="detalles">
            <h3>📋 Detalles del Vehículo</h3>
            <p><strong>🚗 Marca:</strong> ${datos.marca.charAt(0).toUpperCase() + datos.marca.slice(1)}</p>
            <p><strong>📅 Año:</strong> ${datos.year}</p>
            <p><strong>📊 Plan:</strong> ${datos.plan.charAt(0).toUpperCase() + datos.plan.slice(1)}</p>
          </div>
          <div class="precio">
            💰 Prima Anual: €${cotizacion}
          </div>
          <div class="nota">
            <strong>ℹ️ Información importante:</strong><br />
            • Esta cotización es válida por 30 días<br />
            • Los precios pueden variar según las condiciones específicas de la póliza<br />
            • Pago mensual aproximado: €${(cotizacion / 12).toFixed(2)}<br />
            • Generado por Cotizador de Seguros
          </div>
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    }
  };

  return (
    <Contenedor>
      <Header titulo="Cotizador de Seguros" />

      {notificacion && (
        <Notificacion tipo={notificacion.tipo}>
          <span>{notificacion.mensaje}</span>
          <BotonCerrarNotificacion onClick={cerrarNotificacion}>×</BotonCerrarNotificacion>
        </Notificacion>
      )}

      <TabsContainer>
        <TabsHeader>
          <Tab active={tabActiva === 'nuevo'} onClick={() => setTabActiva('nuevo')}>
            {modoEdicion ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'}
          </Tab>
          <Tab
            active={tabActiva === 'historial'}
            onClick={() => setTabActiva('historial')}
            style={{ position: 'relative' }}>
            📊 Historial & Comparar ({presupuestos.length})
            <ContadorHistorial visible={contadorHistorial > 0 && tabActiva !== 'historial'}>
              {contadorHistorial > 9 ? '9+' : contadorHistorial}
            </ContadorHistorial>
          </Tab>
        </TabsHeader>

        <TabContent>
          {tabActiva === 'nuevo' && (
            <ContenedorFormulario>
              <Formulario
                onSubmit={handleSubmitFormulario}
                loading={loading}
                datosIniciales={datosEdicion}
                modoEdicion={modoEdicion}
              />

              {loading && (
                <LoadingOverlay>
                  <Spinner />
                  <LoadingText>
                    {modoEdicion ? 'Recalculando presupuesto...' : 'Calculando tu cotización...'}
                  </LoadingText>
                </LoadingOverlay>
              )}

              {!loading && datos.marca && <Resumen datos={datos} />}

              {!loading && cotizacion > 0 && (
                <div>
                  <Resultado cotizacion={cotizacion} mostrarDetalles={true} mostrarBotones={false} />

                  <AccionesResultado>
                    <BotonAccion onClick={imprimirPresupuesto}>🖨️ Imprimir Cotización</BotonAccion>

                    <BotonAccion variant="secondary" onClick={modoEdicion ? cancelarEdicion : crearNuevaCoitizacion}>
                      {modoEdicion ? '❌ Cancelar Edición' : '🔄 Nueva Cotización'}
                    </BotonAccion>

                    {presupuestoRecienCreado && (
                      <BotonAccion variant="success" onClick={irAHistorial}>
                        📊 Ver en Historial ({presupuestos.length})
                      </BotonAccion>
                    )}
                  </AccionesResultado>
                </div>
              )}
            </ContenedorFormulario>
          )}

          {tabActiva === 'historial' && (
            <HistorialPresupuestos
              presupuestos={presupuestos}
              onEditarPresupuesto={handleEditarPresupuesto}
              onCompararPresupuestos={handleCompararPresupuestos}
              onEliminarPresupuesto={eliminarPresupuesto}
              onToggleFavorito={toggleFavorito}
              onLimpiarHistorial={limpiarHistorial}
              onExportarCSV={exportarCSV}
              onRecargar={recargarPresupuestos}
            />
          )}
        </TabContent>
      </TabsContainer>

      {/* Modal de comparación */}
      {presupuestosComparar.length > 0 && (
        <ComparadorPresupuestos presupuestos={presupuestosComparar} onCerrar={cerrarComparador} />
      )}
      <Footer />
    </Contenedor>
  );
};

export default AppFinal;
