import { useState, useCallback } from 'react';
import { obtenerDiferenciaYear, calcularMarca, obtenerPlan } from '../helpers/helper';
import type { ResumenSeguro, DatosSeguro, Marca, Plan } from '../types';

export const useInsuranceCalculator = () => {
  const [resumen, setResumen] = useState<ResumenSeguro>({
    cotizacion: 0,
    datos: {
      marca: '',
      year: '',
      plan: '',
    },
  });
  const [loading, setLoading] = useState(false);

  const calcularSeguro = useCallback(async (datos: DatosSeguro): Promise<number> => {
    let resultado = 2000;

    const diferencia = obtenerDiferenciaYear(parseInt(datos.year));
    resultado -= (diferencia * 3 * resultado) / 100;

    resultado = calcularMarca(datos.marca as Marca) * resultado;

    const incrementoPlan = obtenerPlan(datos.plan as Plan);
    return parseFloat((incrementoPlan * resultado).toFixed(2));
  }, []);

  const procesarCotizacion = useCallback(
    async (datos: DatosSeguro) => {
      setLoading(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cotizacion = await calcularSeguro(datos);

        setResumen({
          cotizacion,
          datos,
        });

        return { cotizacion, datos }; // Retorna los datos para que App los guarde
      } finally {
        setLoading(false);
      }
    },
    [calcularSeguro]
  );

  const resetear = useCallback(() => {
    setResumen({
      cotizacion: 0,
      datos: { marca: '', year: '', plan: '' },
    });
  }, []);

  const editarPresupuesto = useCallback(
    async (datos: DatosSeguro) => {
      const cotizacion = await calcularSeguro(datos);
      setResumen({ cotizacion, datos });
    },
    [calcularSeguro]
  );

  return {
    resumen,
    loading,
    procesarCotizacion,
    resetear,
    editarPresupuesto,
  };
};
