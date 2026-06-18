import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-100 font-medium mb-2">General Settings</h3>
          <p className="text-slate-400 text-sm">Configure company settings</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-100 font-medium mb-2">Email Settings</h3>
          <p className="text-slate-400 text-sm">Configure email notifications</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-100 font-medium mb-2">Leave Settings</h3>
          <p className="text-slate-400 text-sm">Configure leave policies</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-slate-100 font-medium mb-2">Attendance Settings</h3>
          <p className="text-slate-400 text-sm">Configure attendance rules</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;