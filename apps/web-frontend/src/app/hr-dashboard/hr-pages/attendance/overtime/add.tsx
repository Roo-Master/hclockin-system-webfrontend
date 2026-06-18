import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, X, Check, Loader2, Clock, DollarSign } from 'lucide-react';
import { attendanceService } from '../../../../../services/hr-services/attendanceService';

const Toast = ({ message, type, onClose }: any) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-100 text-green-700 border border-green-300',
    error: 'bg-red-100 text-red-700 border border-red-300',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    info: 'bg-blue-100 text-blue-700 border border-blue-300',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} max-w-md`}>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-70">✕</button>
    </div>
  );
};

export default function AddOvertimeRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    hours: '',
    reason: '',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.createOvertime({
        ...formData,
        hours: parseFloat(formData.hours),
        status: 'pending'
      });
      showToast('✅ Overtime request submitted successfully!', 'success');
      setTimeout(() => router.push('/attendance/overtime'), 1000);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit overtime request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto">
        <button 
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overtime
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Overtime</h1>
              <p className="text-gray-500 mt-1">Submit a new overtime request</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select 
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Employee</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Employee list will load from the database</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label>
              <input 
                type="number" 
                required
                step="0.5"
                min="0.5"
                max="12"
                placeholder="Enter overtime hours"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: e.target.value})}
                className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
              />
              <p className="text-xs text-gray-400 mt-1">Enter hours in 0.5 increments (e.g., 1.5, 2.0, 3.5)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea 
                required
                rows={4}
                placeholder="Explain why overtime is needed..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500 resize-none" 
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Overtime Policy</p>
                <p className="text-xs text-blue-600 mt-1">
                  Overtime requests must be approved by a manager. 
                  Maximum 12 hours per day. Requests submitted after 5 PM will be reviewed next business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
