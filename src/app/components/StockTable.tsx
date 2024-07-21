import React from 'react';

interface StockTableProps {
  data: any[];
}

const StockTable: React.FC<StockTableProps> = ({ data }) => {
  return (
    <table className="min-w-full bg-gray-800 text-white">
      <thead>
        <tr>
          <th className="py-2 px-4">Price</th>
          <th className="py-2 px-4">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} className="border-t border-gray-700">
            <td className="py-2 px-4">{entry.price}</td>
            <td className="py-2 px-4">{new Date(entry.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StockTable;
