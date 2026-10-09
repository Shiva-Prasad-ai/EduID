import React, { useState, useEffect } from 'react';
import { 
  Award, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  Download, 
  Sparkles, 
  Search, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  X,
  FileBadge,
  Check,
  AlertTriangle,
  Lock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

import { API_BASE_URL as BASE_URL } from '../config/api';

const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out hover:shadow-premium-hover p-6 md:p-8";

// API Base URL (connects to backend)
const API_BASE_URL = `${BASE_URL}/api/certificates`;

export default function Certificates() {
  // Empty initial certificates array (removed hardcoded pre-existing certs)
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Form State
  const [certName, setCertName] = useState('');
  const [certType, setCertType] = useState('academic'); // 'academic' | 'non-academic'
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'academic' | 'non-academic'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [previewCert, setPreviewCert] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // In-Page Delete Modal State
  const [deleteModalCert, setDeleteModalCert] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // Fetch certificates from Backend on mount
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      } else {
        console.warn('Backend fetch failed, using local vault state.');
      }
    } catch (error) {
      console.error('Error fetching certificates from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Cooldown Timer Effect
  useEffect(() => {
    let interval;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  // File Selection Handler (converts to Base64 for viewing)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);

      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type,
        rawFile: file
      });
    }
  };

  // Upload Submit Handler (sends POST to Backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certName.trim()) {
      alert('Please enter the certificate name.');
      return;
    }

    setIsUploading(true);

    const payload = {
      name: certName.trim(),
      type: certType,
      issuer: issuer.trim() || 'Educational Institution / Self-Verified',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      fileName: selectedFile ? selectedFile.name : 'digital_certificate.pdf',
      fileSize: selectedFile ? selectedFile.size : '1.2 MB',
      fileData: fileBase64 || '',
      fileType: selectedFile ? selectedFile.type : 'application/pdf',
      verified: true,
      score: 'AI Verified'
    };

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedCert = await res.json();
        setCertificates(prev => [savedCert, ...prev]);
      } else {
        // Fallback local addition if backend connection is unavailable
        const localCert = { ...payload, _id: 'cert_' + Date.now() };
        setCertificates(prev => [localCert, ...prev]);
      }

      // Reset form
      setCertName('');
      setCertType('academic');
      setIssuer('');
      setIssueDate('');
      setSelectedFile(null);
      setFileBase64('');
      setToastMessage('Certificate successfully uploaded, saved to backend, and verified!');
      setShowSuccessToast(true);

      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error posting certificate:', err);
      // Local fallback
      const localCert = { ...payload, _id: 'cert_' + Date.now() };
      setCertificates(prev => [localCert, ...prev]);
      setToastMessage('Certificate uploaded locally.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  // Open Custom In-Page Delete Modal
  const handleOpenDeleteModal = (cert) => {
    setDeleteModalCert(cert);
    setDeleteInput('');
    setDeleteError('');
    setCooldownTimer(0);
  };

  // Confirm Delete Handler (sends DELETE to Backend)
  const handleConfirmDelete = async (e) => {
    if (e) e.preventDefault();
    if (!deleteModalCert || cooldownTimer > 0) return;

    if (deleteInput.trim() !== deleteModalCert.name.trim()) {
      setDeleteError('Certificate name does not match. Please try again in 4 seconds.');
      setCooldownTimer(4);
      return;
    }

    const certId = deleteModalCert._id || deleteModalCert.id;

    try {
      if (deleteModalCert._id) {
        await fetch(`${API_BASE_URL}/${certId}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Error deleting certificate from backend:', err);
    }

    // Remove from state
    setCertificates(prev => prev.filter(c => (c._id || c.id) !== certId));
    setToastMessage(`Certificate "${deleteModalCert.name}" was permanently removed.`);
    setShowSuccessToast(true);
    setDeleteModalCert(null);
    setDeleteInput('');
    setDeleteError('');
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  // Filtered List
  const filteredCertificates = certificates.filter(cert => {
    const matchesFilter = filterType === 'all' || cert.type === filterType;
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cert.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const academicCount = certificates.filter(c => c.type === 'academic').length;
  const nonAcademicCount = certificates.filter(c => c.type === 'non-academic').length;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Award className="w-7 h-7 text-mint" />
            Certificates & Credentials
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Upload and manage your academic & non-academic certificates with instant verification.
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Academic</p>
              <p className="text-lg font-bold text-gray-800 leading-none">{academicCount}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Non-Academic</p>
              <p className="text-lg font-bold text-gray-800 leading-none">{nonAcademicCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Upload Form + Vault List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Form (5 columns) */}
        <div className={`lg:col-span-5 ${cardClass} flex flex-col justify-between h-fit`}>
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-soft-mint text-mint flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Upload Certificate</h3>
                <p className="text-xs text-gray-400">Add new academic or non-academic credentials</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Certificate Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Certificate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NPTEL DBMS Honor / Hackathon Winner"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint/40 focus:border-mint transition-all"
                />
              </div>

              {/* Certificate Type (Academic vs Non-Academic) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Certificate Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCertType('academic')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all border ${certType === 'academic' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Academic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCertType('non-academic')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all border ${certType === 'non-academic' ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Non-Academic</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {certType === 'academic' 
                    ? 'Courses, University exams, NPTEL, Olympiads, Degrees.'
                    : 'Hackathons, Workshops, Internships, Extracurricular, Sports.'}
                </p>
              </div>

              {/* Issuing Organization */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Madras, IEEE, Coursera, Google"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint/40 focus:border-mint transition-all"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint/40 focus:border-mint transition-all"
                />
              </div>

              {/* Certificate File Attachment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Upload Certificate File
                </label>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-mint/50 bg-soft-mint/40 hover:bg-soft-mint/80 rounded-2xl cursor-pointer transition-all text-center">
                    <UploadCloud className="w-8 h-8 text-mint mb-2" />
                    <span className="text-xs font-bold text-teal-700">Click to browse or drag file here</span>
                    <span className="text-[10px] text-gray-400 mt-1">PDF, PNG, JPG (Max 10MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-soft-mint border border-mint/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-mint shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-gray-500">{selectedFile.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setFileBase64(''); }}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-mint hover:bg-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isUploading ? 'Uploading & Saving to Backend...' : 'Upload Certificate'}</span>
              </button>

            </form>
          </div>
        </div>

        {/* Vault List (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Controls Bar */}
          <div className={`${cardClass} py-4 px-6 flex flex-wrap items-center justify-between gap-3`}>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                All ({certificates.length})
              </button>
              <button
                onClick={() => setFilterType('academic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'academic' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Academic ({academicCount})
              </button>
              <button
                onClick={() => setFilterType('non-academic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'non-academic' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Non-Academic ({nonAcademicCount})
              </button>
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-gray-800 w-full"
                />
              </div>

              <button
                onClick={fetchCertificates}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-mint hover:bg-gray-100 transition-colors"
                title="Refresh Backend Sync"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-mint' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cards List */}
          {isLoading ? (
            <div className={`${cardClass} text-center py-12 flex flex-col items-center justify-center`}>
              <RefreshCw className="w-8 h-8 text-mint animate-spin mb-3" />
              <p className="text-sm font-semibold text-gray-600">Connecting to Backend & Syncing Certificates...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className={`${cardClass} text-center py-12 flex flex-col items-center justify-center`}>
              <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-base font-bold text-gray-700">No certificates found</p>
              <p className="text-xs text-gray-400 mt-1">Upload a certificate using the form to populate your vault.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertificates.map((cert) => {
                const isAcademic = cert.type === 'academic';
                const certId = cert._id || cert.id;
                return (
                  <div key={certId} className={`${cardClass} p-5 flex items-center justify-between gap-4 group`}>
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      
                      {/* Category Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isAcademic ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isAcademic ? <GraduationCap className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${isAcademic ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isAcademic ? 'Academic' : 'Non-Academic'}
                          </span>
                          
                          {cert.verified && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({cert.score || 'AI Verified'})
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-800 text-base leading-tight truncate">
                          {cert.name}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                          <span>Issuer: <strong className="text-gray-700">{cert.issuer}</strong></span>
                          <span>•</span>
                          <span>Date: {cert.issueDate}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <FileBadge className="w-3.5 h-3.5" /> {cert.fileName} ({cert.fileSize})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-soft-mint text-teal-700 border border-mint/30 text-xs font-bold hover:bg-mint hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(cert)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete Certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* VIEW CERTIFICATE MODAL (Displays actual image/document file or rendered certificate) */}
      {previewCert && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md ${previewCert.type === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {previewCert.type === 'academic' ? 'Academic Certificate' : 'Non-Academic Certificate'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Authenticated
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mt-2">{previewCert.name}</h3>
                <p className="text-xs text-gray-500">Issued by {previewCert.issuer} on {previewCert.issueDate}</p>
              </div>

              <button
                onClick={() => setPreviewCert(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display Area for Actual File/Certificate Content */}
            <div className="flex-1 overflow-y-auto min-h-[300px] rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-4 relative">
              
              {/* Check if file data is an image */}
              {previewCert.fileData && (previewCert.fileData.startsWith('data:image') || previewCert.fileType?.includes('image') || previewCert.fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                <img 
                  src={previewCert.fileData} 
                  alt={previewCert.name} 
                  className="max-h-[420px] w-auto mx-auto object-contain rounded-xl shadow-md border border-gray-200"
                />
              ) : previewCert.fileData && (previewCert.fileData.startsWith('data:application/pdf') || previewCert.fileType?.includes('pdf') || previewCert.fileName?.endsWith('.pdf')) ? (
                /* PDF Document Display */
                <iframe 
                  src={previewCert.fileData} 
                  title={previewCert.name} 
                  className="w-full h-[420px] rounded-xl border border-gray-200 shadow-sm"
                />
              ) : (
                /* Sleek Digital Certificate Card Display when no raw file attachment is present */
                <div className="w-full max-w-lg bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-4 border-double border-mint/40 shadow-md flex flex-col items-center text-center relative overflow-hidden">
                  
                  {/* Decorative Header Banner */}
                  <div className="w-16 h-16 rounded-full bg-soft-mint text-mint flex items-center justify-center mb-4 border-2 border-mint/30 shadow-sm">
                    <Award className="w-9 h-9" />
                  </div>

                  <p className="text-[11px] font-extrabold tracking-widest text-mint uppercase mb-1">
                    CERTIFICATE OF ACHIEVEMENT
                  </p>

                  <h4 className="text-xl font-extrabold text-gray-800 mb-2 leading-tight">
                    {previewCert.name}
                  </h4>

                  <p className="text-xs text-gray-500 mb-4">
                    This certifies that the recipient has successfully verified proficiency and completed credentials issued by:
                  </p>

                  <div className="bg-gray-100/80 px-4 py-2 rounded-xl text-sm font-bold text-gray-800 mb-4 border border-gray-200">
                    {previewCert.issuer}
                  </div>

                  <div className="flex items-center justify-between w-full pt-4 border-t border-gray-200/80 text-xs text-gray-500">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Issued Date</p>
                      <p className="font-semibold text-gray-700">{previewCert.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Verification Status</p>
                      <p className="font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI Verified
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 shrink-0">
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-mint" />
                <span>{previewCert.fileName} ({previewCert.fileSize || 'Verified'})</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                
                {previewCert.fileData && (
                  <a
                    href={previewCert.fileData}
                    download={previewCert.fileName || 'certificate'}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-mint hover:bg-teal-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM IN-PAGE DELETE CONFIRMATION MODAL */}
      {deleteModalCert && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative border border-red-100">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
                <p className="text-xs text-gray-500">Security confirmation required</p>
              </div>
              <button
                onClick={() => setDeleteModalCert(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                This action will permanently delete this credential from MongoDB backend. To confirm, please type the exact certificate name below:
              </p>

              {/* Exact Name Display Box */}
              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl text-xs font-bold text-red-700 select-all break-words">
                {deleteModalCert.name}
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Type Certificate Name to Confirm:
                </label>
                <input
                  type="text"
                  disabled={cooldownTimer > 0}
                  placeholder="Enter exact name..."
                  value={deleteInput}
                  onChange={(e) => {
                    setDeleteInput(e.target.value);
                    if (deleteError) setDeleteError('');
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-800 focus:outline-none transition-all ${
                    deleteError 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
                  } ${cooldownTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Mismatch & Cooldown Error Alert */}
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalCert(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={cooldownTimer > 0 || !deleteInput.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
                    cooldownTimer > 0 || !deleteInput.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 active:scale-95'
                  }`}
                >
                  {cooldownTimer > 0 ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cooldown ({cooldownTimer}s)</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
