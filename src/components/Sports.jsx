import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  UploadCloud, 
  Eye, 
  Download, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';

import { API_BASE_URL as BASE_URL } from '../config/api';

const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out hover:shadow-premium-hover hover:-translate-y-1 p-6 md:p-8";
const API_BASE_URL = `${BASE_URL}/api/sports`;

const predefinedSportsList = [
  'Cricket',
  'Football',
  'Basketball',
  'Badminton',
  'Tennis',
  'Volleyball',
  'Table Tennis',
  'Chess',
  'Athletics',
  'Swimming',
  'Martial Arts',
  'Gymnastics',
  'Cycling',
  'Other'
];

const levelColors = {
  'International': 'bg-purple-100 text-purple-800 border-purple-300',
  'National': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'State': 'bg-amber-100 text-amber-800 border-amber-300',
  'District': 'bg-teal-100 text-teal-800 border-teal-300',
  'School / College': 'bg-emerald-100 text-emerald-800 border-emerald-300'
};

export default function Sports() {
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    sportName: '',
    participationLevel: '',
    description: '',
    proofFileName: '',
    proofBase64: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for Proof & Deletion
  const [previewProof, setPreviewProof] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Sports Records from API with Caching
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSports = async () => {
      // Load from cache first for instant response
      const cached = sessionStorage.getItem('eduid_cache_sports');
      if (cached) {
        try {
          setSports(JSON.parse(cached));
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
          setSports(list);
          sessionStorage.setItem('eduid_cache_sports', JSON.stringify(list));
          setErrorMessage('');
        } else {
          setErrorMessage('Unable to sync sports records from server right now. Showing saved entries.');
        }
      } catch (err) {
        console.error('Error connecting to sports backend:', err);
        setErrorMessage('Offline or server disconnected. Showing saved sports achievements.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSports();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormData({
      sportName: '',
      participationLevel: '',
      description: '',
      proofFileName: '',
      proofBase64: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingEntry(item);
    setFormData({
      sportName: item.sportName || '',
      participationLevel: item.participationLevel || '',
      description: item.description || '',
      proofFileName: item.proofFileName || '',
      proofBase64: item.proofBase64 || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please select a smaller document.');
      return;
    }

    if (file.type.startsWith('image/')) {
      // Optimize & convert image to WebP format to reduce server load
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        setFormData(prev => ({
          ...prev,
          proofFileName: file.name.replace(/\.[^/.]+$/, '') + '.webp',
          proofBase64: webpDataUrl
        }));
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          proofFileName: file.name,
          proofBase64: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sportName.trim()) {
      alert('Please enter a Sport Name.');
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
          setSports(prev => prev.map(s => s._id === editingEntry._id ? updated : s));
          showToast(`Updated "${payload.sportName}" record!`);
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
          setSports(prev => [newDoc, ...prev]);
          showToast(`Added "${payload.sportName}" record!`);
        } else {
          const errData = await res.json();
          alert(`Failed to add: ${errData.message || 'Server error'}`);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving sports entry:', err);
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
        setSports(prev => prev.filter(s => s._id !== targetId));
        showToast(`Deleted "${deleteModalItem.sportName}" record`);
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error deleting sports record:', err);
      alert('Error connecting to backend server.');
    } finally {
      setDeleteModalItem(null);
    }
  };

  const filteredSports = sports.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.sportName.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.participationLevel && s.participationLevel.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/60 backdrop-blur-xl rounded-[28px] p-8 border border-white/80 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Sports Profile</h1>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                {sports.length} Records
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              Document your sports participation, descriptions, and optional certificates on EduID.
            </p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 hover:-translate-y-0.5 cursor-pointer z-10"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sports Record</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sport name, level, or description..."
            className="w-full bg-gray-50 border border-gray-200/90 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
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

      {/* Sports Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className={`${cardClass} animate-pulse space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-4 w-28 bg-slate-200 rounded-lg"></div>
              <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredSports.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center text-center py-16 px-4`}>
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 border border-teal-100">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Sports Records Found</h3>
          <p className="text-gray-500 text-xs max-w-md mb-6">
            {searchQuery
              ? 'No sports entries match your search criteria.'
              : 'Add your sports participation and certificates.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Sports Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSports.map((item) => (
            <div key={item._id} className={`${cardClass} flex flex-col justify-between relative group`}>
              
              <div>
                {/* Header: Trophy Icon, Sport Name, Level Badge, Actions */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                      <Trophy className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate leading-tight">
                        {item.sportName}
                      </h3>
                      {item.participationLevel && (
                        <p className="text-xs font-semibold text-teal-700 mt-0.5 truncate">
                          {item.participationLevel} Level
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Participation Level Badge & Edit/Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.participationLevel && (
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${levelColors[item.participationLevel] || 'bg-teal-50 text-teal-800 border-teal-200'}`}>
                        {item.participationLevel}
                      </span>
                    )}
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
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Details</p>
                    <p className="whitespace-pre-line leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Card Bottom Footer: Proof File Button & Verification */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.proofFileName || item.proofBase64 ? (
                  <button
                    onClick={() => setPreviewProof(item)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-teal-600" />
                    <span className="truncate max-w-[160px]">{item.proofFileName || 'Sports Certificate'}</span>
                    <Eye className="w-3.5 h-3.5 ml-0.5 opacity-80 text-teal-600" />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium italic">No certificate uploaded</span>
                )}

                <span className="flex items-center gap-1.5 text-teal-600 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" /> EduID Athletic Record
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Sports Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingEntry ? 'Edit Sports Record' : 'Add Sports Record'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Record your sport name, participation level, description, and certificate</p>
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
              
              {/* Name of Sport & Participation Level (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Name of Sport *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basketball, Football, Cricket, Badminton..."
                    value={formData.sportName}
                    onChange={(e) => setFormData(prev => ({ ...prev, sportName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Participation Level <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.participationLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, participationLevel: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  >
                    <option value="">None / Unspecified</option>
                    <option value="School / College">School / College</option>
                    <option value="District">District</option>
                    <option value="State">State</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your sports journey, match highlights, or training details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all custom-scrollbar leading-relaxed"
                />
              </div>

              {/* Certificate / Proof Upload (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certificate Document <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50 rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2">
                    <UploadCloud className="w-5 h-5 text-teal-600" />
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {formData.proofFileName || 'Upload Certificate (PDF, PNG, JPG)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.proofFileName && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, proofFileName: '', proofBase64: '' }))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove File"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
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

      {/* Proof Preview Modal */}
      {previewProof && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-base">{previewProof.sportName} - Certificate Document</h3>
              </div>
              <button
                onClick={() => setPreviewProof(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-[260px] bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center mb-6">
              {previewProof.proofBase64 && previewProof.proofBase64.startsWith('data:image') ? (
                <img src={previewProof.proofBase64} alt="Sports Certificate Document" className="max-h-80 rounded-lg object-contain shadow-md" />
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{previewProof.proofFileName || 'Official Sports Certificate'}</h4>
                  <p className="text-xs text-slate-500 max-w-sm">Verified certificate of athletic participation.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> EduID Verified Document
              </span>
              {previewProof.proofBase64 ? (
                <a
                  href={previewProof.proofBase64}
                  download={previewProof.proofFileName || 'Sports_Certificate.png'}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-700 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Certificate
                </a>
              ) : (
                <button
                  onClick={() => setPreviewProof(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  Close Preview
                </button>
              )}
            </div>
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Sports Record?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteModalItem.sportName}"</span>? This action cannot be undone.
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
