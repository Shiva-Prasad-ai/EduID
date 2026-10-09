import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle
} from 'lucide-react';

import { API_BASE_URL as BASE_URL } from '../config/api';

const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out hover:shadow-premium-hover hover:-translate-y-1 p-6 md:p-8";
const API_BASE_URL = `${BASE_URL}/api/volunteer`;

export default function Volunteer() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    role: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion Modal
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Volunteers from Backend with Caching
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchVolunteers = async () => {
      // Load from cache first for instant response
      const cached = sessionStorage.getItem('eduid_cache_volunteer');
      if (cached) {
        try {
          setVolunteers(JSON.parse(cached));
          setIsLoading(false);
        } catch (e) {
          // invalid cache
        }
      }

      try {
        const res = await fetch(API_BASE_URL);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setVolunteers(list);
          sessionStorage.setItem('eduid_cache_volunteer', JSON.stringify(list));
          setErrorMessage('');
        } else {
          setErrorMessage('Unable to sync volunteer records from server right now. Showing saved entries.');
        }
      } catch (err) {
        console.error('Error connecting to volunteer backend:', err);
        setErrorMessage('Offline or server disconnected. Showing saved volunteer work.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormData({
      organizationName: '',
      role: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingEntry(item);
    setFormData({
      organizationName: item.organizationName || '',
      role: item.role || '',
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organizationName.trim() || !formData.role.trim() || !formData.description.trim()) {
      alert('Please fill out Organization Name, Role, and Description.');
      return;
    }

    setIsSubmitting(true);
    const payload = { ...formData };

    try {
      if (editingEntry) {
        const res = await fetch(`${API_BASE_URL}/${editingEntry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setVolunteers(prev => prev.map(v => v._id === editingEntry._id ? updated : v));
          showToast(`Updated "${payload.organizationName}" record!`);
        } else {
          const errData = await res.json();
          alert(`Failed to update: ${errData.message || 'Server error'}`);
        }
      } else {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newDoc = await res.json();
          setVolunteers(prev => [newDoc, ...prev]);
          showToast(`Added "${payload.organizationName}" record!`);
        } else {
          const errData = await res.json();
          alert(`Failed to add: ${errData.message || 'Server error'}`);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving volunteer entry:', err);
      alert('Error connecting to backend server. Please verify backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    const targetId = deleteModalItem._id;

    try {
      const res = await fetch(`${API_BASE_URL}/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        setVolunteers(prev => prev.filter(v => v._id !== targetId));
        showToast(`Deleted "${deleteModalItem.organizationName}" record`);
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error deleting volunteer record:', err);
      alert('Error connecting to backend server.');
    } finally {
      setDeleteModalItem(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/60 backdrop-blur-xl rounded-[28px] p-8 border border-white/80 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
            <Heart className="w-8 h-8 fill-teal-600/20" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Volunteering & Social Service</h1>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                {volunteers.length} Records
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              Document your volunteer organization name, roles, and service descriptions on EduID.
            </p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 hover:-translate-y-0.5 cursor-pointer z-10"
        >
          <Plus className="w-5 h-5" />
          <span>Add Volunteer Record</span>
        </button>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-800 shadow-xs mb-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-amber-600 hover:text-amber-900 font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Volunteer Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className={`${cardClass} animate-pulse space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-14 w-full bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : volunteers.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center text-center py-16 px-4`}>
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 border border-teal-100">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Volunteer Records Found</h3>
          <p className="text-gray-500 text-xs max-w-md mb-6">
            Add your volunteer experience, organization name, role, and description.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Volunteer Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteers.map((item) => (
            <div key={item._id} className={`${cardClass} flex flex-col justify-between relative group`}>
              
              <div>
                {/* Header: Heart Icon, Organization Name, Role, Actions */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                      <Heart className="w-6 h-6 fill-teal-600/20" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate leading-tight">
                        {item.organizationName}
                      </h3>
                      <p className="text-xs font-bold text-teal-700 mt-0.5 truncate">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModalItem(item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Contribution</p>
                    <p className="whitespace-pre-line leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Volunteer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Heart className="w-5 h-5 fill-teal-600/20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingEntry ? 'Edit Volunteer Record' : 'Add Volunteer Record'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Enter organization name, role, and description</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Organization Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization / Initiative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Literacy Mission, Youth Red Cross..."
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Role / Position *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community Educator, Event Coordinator, Volunteer..."
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Impact *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your volunteer work, key responsibilities, and contributions..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all custom-scrollbar leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingEntry ? 'Update Record' : 'Save Record'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Volunteer Record?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteModalItem.organizationName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex-1"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
