"use client";

import React from 'react';

interface CustomTableProps {
  /** Encabezados de la tabla */
  headers: string[];
  /** Datos de la tabla */
  data: (string | number | boolean | null)[][];
  /** Clase CSS opcional para la tabla */
  className?: string;
}

/**
 * Componente de tabla personalizado que muestra datos en formato tabular
 */
export function CustomTable({ headers, data, className = '' }: CustomTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                    {cell}
                </td>
                ))}
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
}
