import React from 'react';
import { FileText, Plus } from 'lucide-react';

const Contracts: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} />
          New Contract
        </button>
      </div>
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <FileText className="text-slate-400 mx-auto mb-2" size={32} />
        <p className="text-slate-400">No contracts found</p>
      </div>
    </div>
  );
};

export default Contracts;