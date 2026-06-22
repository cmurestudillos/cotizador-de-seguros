import React, { useState } from 'react';
import styled from '@emotion/styled';
import { primerMayuscula } from '../helpers/helper';
import type { Presupuesto, FiltrosPresupuesto, DatosSeguro } from '../types';

interface HistorialProps {
  presupuestos: Presupuesto[];
  onEditarPresupuesto: (datos: DatosSeguro) => void;
  onCompararPresupuestos: (presupuestos: Presupuesto[]) => void;
  onEliminarPresupuesto: (id: string) => void;
  onToggleFavorito: (id: string) => void;
  onLimpiarHistorial: () => void;
  onExportarCSV: () => void;
  onRecargar: () => void;
}

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Titulo = styled.h2`
  color: #00838f;
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Acciones = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BotonAccion = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #00838F;
          color: white;
          &:hover { background: #26C6DA; }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #d32f2f; }
        `;
      default:
        return `
          background: #e0e0e0;
          color: #333;
          &:hover { background: #d0d0d0; }
        `;
    }
  }}
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const ListaPresupuestos = styled.div`
  display: grid;
  gap: 1rem;
`;

const ItemPresupuesto = styled.div<{ seleccionado?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid ${props => (props.seleccionado ? '#00838F' : '#e0e0e0')};
  border-radius: 8px;
  transition: all 0.3s ease;
  background: ${props => (props.seleccionado ? '#f0f9fa' : 'white')};

  &:hover {
    border-color: #00838f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 131, 143, 0.15);
  }
`;

const InfoPresupuesto = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  align-items: center;
`;

const Dato = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const Valor = styled.span`
  font-weight: 600;
  color: #333;
`;

const Precio = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #00838f;
  text-align: right;
`;

const AccionesItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BotonPequeno = styled.button<{ variant?: 'edit' | 'delete' | 'favorite' }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;

  ${props => {
    switch (props.variant) {
      case 'edit':
        return `background: #2196F3; color: white; &:hover { background: #1976D2; }`;
      case 'delete':
        return `background: #f44336; color: white; &:hover { background: #d32f2f; }`;
      case 'favorite':
        return `background: #FF9800; color: white; &:hover { background: #F57C00; }`;
      default:
        return `background: #e0e0e0; color: #333; &:hover { background: #d0d0d0; }`;
    }
  }}
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  accent-color: #00838f;
`;

const NoPresupuestos = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const EstadisticasRapidas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Estadistica = styled.div`
  text-align: center;
  padding: 0.5rem;
`;

const NumeroEstadistica = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00838f;
`;

const LabelEstadistica = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const HistorialPresupuestos: React.FC<HistorialProps> = ({
  presupuestos,
  onEditarPresupuesto,
  onCompararPresupuestos,
  onEliminarPresupuesto,
  onToggleFavorito,
  onLimpiarHistorial,
  onExportarCSV,
  onRecargar,
}) => {
  const [filtros, setFiltros] = useState<FiltrosPresupuesto>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const presupuestosFiltrados = presupuestos.filter(presupuesto => {
    if (filtros.marca && presupuesto.datos.marca !== filtros.marca) return false;
    if (filtros.plan && presupuesto.datos.plan !== filtros.plan) return false;
    if (filtros.favoritos && !presupuesto.favorito) return false;
    if (filtros.fechaDesde && presupuesto.fecha < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && presupuesto.fecha > filtros.fechaHasta) return false;
    return true;
  });

  const handleFiltroChange = (campo: keyof FiltrosPresupuesto, valor: string | boolean) => {
    setFiltros(prev => ({ ...prev, [campo]: valor || undefined }));
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const compararSeleccionados = () => {
    const presupuestosParaComparar = presupuestos.filter(p => seleccionados.includes(p.id));
    onCompararPresupuestos(presupuestosParaComparar);
  };

  // Estadísticas rápidas
  const promedioPrecios =
    presupuestos.length > 0
      ? (presupuestos.reduce((sum, p) => sum + p.cotizacion, 0) / presupuestos.length).toFixed(2)
      : '0';
  const precioMinimo = presupuestos.length > 0 ? Math.min(...presupuestos.map(p => p.cotizacion)).toFixed(2) : '0';
  const precioMaximo = presupuestos.length > 0 ? Math.max(...presupuestos.map(p => p.cotizacion)).toFixed(2) : '0';

  if (presupuestos.length === 0) {
    return (
      <Container>
        <NoPresupuestos>
          📋 No tienes presupuestos guardados aún
          <br />
          <small>Los presupuestos se guardan automáticamente cuando realizas una cotización</small>
        </NoPresupuestos>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Titulo>📊 Historial de Presupuestos ({presupuestos.length})</Titulo>
        <Acciones>
          <BotonAccion onClick={() => setMostrarFiltros(!mostrarFiltros)}>🔍 Filtros</BotonAccion>
          <BotonAccion variant="primary" onClick={onExportarCSV}>
            📥 Exportar CSV
          </BotonAccion>
          {seleccionados.length >= 2 && (
            <BotonAccion variant="primary" onClick={compararSeleccionados}>
              ⚖️ Comparar ({seleccionados.length})
            </BotonAccion>
          )}
          <BotonAccion onClick={onRecargar}>🔄 Recargar</BotonAccion>
          <BotonAccion variant="danger" onClick={onLimpiarHistorial}>
            🗑️ Limpiar Todo
          </BotonAccion>
        </Acciones>
      </Header>

      {presupuestos.length > 0 && (
        <EstadisticasRapidas>
          <Estadistica>
            <NumeroEstadistica>€{promedioPrecios}</NumeroEstadistica>
            <LabelEstadistica>Promedio</LabelEstadistica>
          </Estadistica>
          <Estadistica>
            <NumeroEstadistica>€{precioMinimo}</NumeroEstadistica>
            <LabelEstadistica>Mínimo</LabelEstadistica>
          </Estadistica>
          <Estadistica>
            <NumeroEstadistica>€{precioMaximo}</NumeroEstadistica>
            <LabelEstadistica>Máximo</LabelEstadistica>
          </Estadistica>
          <Estadistica>
            <NumeroEstadistica>{presupuestos.filter(p => p.favorito).length}</NumeroEstadistica>
            <LabelEstadistica>Favoritos</LabelEstadistica>
          </Estadistica>
        </EstadisticasRapidas>
      )}

      {mostrarFiltros && (
        <Filtros>
          <div>
            <Label htmlFor="filtro-marca">Marca:</Label>
            <Select
              id="filtro-marca"
              value={filtros.marca || ''}
              onChange={e => handleFiltroChange('marca', e.target.value)}>
              <option value="">Todas</option>
              <option value="americano">Americano</option>
              <option value="europeo">Europeo</option>
              <option value="asiatico">Asiático</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="filtro-plan">Plan:</Label>
            <Select
              id="filtro-plan"
              value={filtros.plan || ''}
              onChange={e => handleFiltroChange('plan', e.target.value)}>
              <option value="">Todos</option>
              <option value="basico">Básico</option>
              <option value="completo">Completo</option>
            </Select>
          </div>
          <div>
            <Label>
              <Checkbox
                type="checkbox"
                checked={filtros.favoritos || false}
                onChange={e => handleFiltroChange('favoritos', e.target.checked)}
              />
              Solo favoritos
            </Label>
          </div>
        </Filtros>
      )}

      <ListaPresupuestos>
        {presupuestosFiltrados.map(presupuesto => (
          <ItemPresupuesto key={presupuesto.id} seleccionado={seleccionados.includes(presupuesto.id)}>
            <div>
              <Checkbox
                type="checkbox"
                checked={seleccionados.includes(presupuesto.id)}
                onChange={() => toggleSeleccion(presupuesto.id)}
              />
            </div>

            <InfoPresupuesto>
              <Dato>
                📅 <Valor>{presupuesto.fecha.toLocaleDateString()}</Valor>
              </Dato>
              <Dato>
                🚗 <Valor>{primerMayuscula(presupuesto.datos.marca)}</Valor>
              </Dato>
              <Dato>
                📊 <Valor>{primerMayuscula(presupuesto.datos.plan)}</Valor>
              </Dato>
              <Dato>
                🗓️ <Valor>{presupuesto.datos.year}</Valor>
              </Dato>
              {presupuesto.notas && (
                <Dato style={{ gridColumn: '1 / -1' }}>
                  📝 <Valor>{presupuesto.notas}</Valor>
                </Dato>
              )}
            </InfoPresupuesto>

            <div>
              <Precio>
                {presupuesto.favorito && '⭐'} €{presupuesto.cotizacion}
              </Precio>
              <AccionesItem>
                <BotonPequeno variant="edit" onClick={() => onEditarPresupuesto(presupuesto.datos)}>
                  ✏️
                </BotonPequeno>
                <BotonPequeno variant="favorite" onClick={() => onToggleFavorito(presupuesto.id)}>
                  {presupuesto.favorito ? '💔' : '❤️'}
                </BotonPequeno>
                <BotonPequeno variant="delete" onClick={() => onEliminarPresupuesto(presupuesto.id)}>
                  🗑️
                </BotonPequeno>
              </AccionesItem>
            </div>
          </ItemPresupuesto>
        ))}
      </ListaPresupuestos>
    </Container>
  );
};
