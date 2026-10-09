import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  Briefcase, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Code, 
  Heart, 
  Trophy, 
  ShieldCheck, 
  ChevronRight,
  AlertTriangle,
  Clock
} from 'lucide-react';

import { API_BASE_URL as BASE_URL } from '../config/api';

const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out hover:shadow-premium-hover hover:-translate-y-1 p-6 md:p-8";
const API_BASE_URL = `${BASE_URL}/api/clubs`;

export default function ClubsAndActivities() {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({
    clubName: '',
    designation: '',
    duration: '',
    category: 'Technical',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalClub, setDeleteModalClub] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Clubs from API with Caching
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      // Load from cache first for instant load
      const cached = sessionStorage.getItem('eduid_cache_clubs');
      if (cached) {
        try {
          setClubs(JSON.parse(cached));
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
          setClubs(list);
          sessionStorage.setItem('eduid_cache_clubs', JSON.stringify(list));
          setErrorMessage('');
        } else {
          setErrorMessage('Unable to sync clubs from server right now. Showing saved entries.');
        }
      } catch (err) {
        console.error('Error connecting to backend server:', err);
        setErrorMessage('Offline or server disconnected. Showing saved club activities.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClub(null);
    setFormData({
      clubName: '',
      designation: '',
      duration: '',
      category: 'Technical',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (club) => {
    setEditingClub(club);
    setFormData({
      clubName: club.clubName || '',
      designation: club.designation || '',
      duration: club.duration || '',
      category: club.category || 'Technical',
      description: club.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clubName.trim() || !formData.designation.trim() || !formData.duration.trim() || !formData.description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingClub) {
        // Edit existing club
        const res = await fetch(`${API_BASE_URL}/${editingClub._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setClubs(prev => prev.map(c => c._id === editingClub._id ? updated : c));
          showToast(`Successfully updated "${formData.clubName}"!`);
        } else {
          const errData = await res.json();
          alert(`Failed to update: ${errData.message || 'Server error'}`);
        }
      } else {
        // Add new club
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newEntry = await res.json();
          setClubs(prev => [newEntry, ...prev]);
          showToast(`Successfully added "${formData.clubName}"!`);
        } else {
          const errData = await res.json();
          alert(`Failed to add: ${errData.message || 'Server error'}`);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving club activity:', err);
      alert('Error connecting to backend server. Please verify backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalClub) return;
    const targetId = deleteModalClub._id;

    try {
      const res = await fetch(`${API_BASE_URL}/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        setClubs(prev => prev.filter(c => c._id !== targetId));
        showToast(`Deleted "${deleteModalClub.clubName}"`);
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error deleting club:', err);
      alert('Error connecting to backend server.');
    } finally {
      setDeleteModalClub(null);
    }
  };

  const categoryIcons = {
    Technical: <Code className="w-5 h-5 text-teal-600" />,
    Leadership: <Award className="w-5 h-5 text-indigo-600" />,
    Cultural: <Sparkles className="w-5 h-5 text-purple-600" />,
    Sports: <Trophy className="w-5 h-5 text-amber-600" />,
    'Social Service': <Heart className="w-5 h-5 text-rose-600" />,
    Other: <Users className="w-5 h-5 text-slate-600" />
  };

  const categoryColors = {
    Technical: 'bg-teal-50 text-teal-700 border-teal-200',
    Leadership: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Cultural: 'bg-purple-50 text-purple-700 border-purple-200',
    Sports: 'bg-amber-50 text-amber-700 border-amber-200',
    'Social Service': 'bg-rose-50 text-rose-700 border-rose-200',
    Other: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const categoriesList = ['All', 'Technical', 'Leadership', 'Cultural', 'Sports', 'Social Service', 'Other'];

  const filteredClubs = clubs.filter(club => {
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      club.clubName.toLowerCase().includes(q) ||
      club.designation.toLowerCase().includes(q) ||
      club.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
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
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-indigo-50/50 backdrop-blur-xl rounded-[28px] p-8 border border-white/80 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint shrink-0 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Clubs & Activities</h1>
              <span className="bg-mint/10 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-mint/20">
                {clubs.length} Listed
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              Manage your student organization memberships, leadership designations, active durations, and key activity accomplishments.
            </p>
          </div>
        </div>

        {/* Add Activity Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 hover:-translate-y-0.5 cursor-pointer z-10"
        >
          <Plus className="w-5 h-5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-lg p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 font-semibold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search club, role, description..."
            className="w-full bg-gray-50 border border-gray-200/90 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
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

      {/* Clubs Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className={`${cardClass} animate-pulse space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
              <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
              <div className="h-4 w-28 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center text-center py-16 px-4`}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Club Activities Found</h3>
          <p className="text-gray-500 text-xs max-w-md mb-6">
            {searchQuery || selectedCategory !== 'All' 
              ? 'No activities match your current search or category filter.'
              : 'Add your club memberships, leadership roles, and campus activity contributions.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Club Activity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map((club) => (
            <div key={club._id} className={`${cardClass} flex flex-col justify-between relative group`}>
              
              <div>
                {/* Card Header: Category Icon, Name, Category Pill, Actions */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                      {categoryIcons[club.category] || <Users className="w-5 h-5 text-teal-600" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate leading-tight">
                        {club.clubName}
                      </h3>
                      <p className="text-sm font-semibold text-teal-600 mt-0.5 truncate">
                        {club.designation}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Category Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${categoryColors[club.category] || categoryColors.Other}`}>
                      {club.category || 'Technical'}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(club)}
                      className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Activity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModalClub(club)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold mb-4 border border-slate-200/60">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{club.duration}</span>
                </div>

                {/* Description / What You Did */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Contributions & Accomplishments</p>
                  {club.description.split('\n').map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {line.trim().startsWith('•') || line.trim().startsWith('-') ? (
                        <span className="text-slate-600 leading-relaxed">{line}</span>
                      ) : (
                        <span className="leading-relaxed">{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-teal-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Verified Club Experience
                </span>
                <span className="text-[11px] text-slate-400 font-medium">EduID Activity Records</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingClub ? 'Edit Club Activity' : 'Add Club Activity'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Specify club details, designation, duration, and achievements</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Club Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Club / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding & Open Source Club, IEEE Student Branch"
                  value={formData.clubName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clubName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
                />
              </div>

              {/* Designation & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Lead, President, Coordinator"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Social Service">Social Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aug 2024 - Present, Jan 2024 - May 2025, 1 Year"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
                />
              </div>

              {/* Description / What You Did */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description (What you did & accomplishments) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your responsibilities, events organized, projects built, or contributions made..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all custom-scrollbar leading-relaxed"
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
                      <span>{editingClub ? 'Update Activity' : 'Save Activity'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalClub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Activity Record?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteModalClub.clubName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModalClub(null)}
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
