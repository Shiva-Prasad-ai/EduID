import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import DateRangePicker from './components/DateRangePicker';
import SkillsLibrary from './components/SkillsLibrary';
import Certificates from './components/Certificates';
import ClubsAndActivities from './components/ClubsAndActivities';
import Volunteer from './components/Volunteer';
import Sports from './components/Sports';



import { 
  LayoutDashboard, User, FileText, CheckCircle, BookOpen, GraduationCap, 
  FolderOpen, Award, Trophy, Users, Heart, Target, Briefcase, File, Clock, 
  Bell, Settings, LogOut, Search, ChevronDown, ChevronRight, Copy, CheckCircle2, 
  CalendarDays, Activity, Code, Sparkles, X, Zap, Camera, AlertCircle, 
  Phone, Mail, MapPin, Droplet, Calendar, UserCheck, Edit3, Eye, FileBadge,
  ShieldCheck, ArrowUpRight, BarChart2, MailIcon, MessageSquare, Menu, Plus, Trash2, Brain
} from 'lucide-react';
import { LimelightNav } from '@/components/ui/limelight-nav';
import AICareerAdvisor from './components/AICareerAdvisor';
import LoginPage from './components/LoginPage';
import { API_BASE_URL } from './config/api';



const headerNavTabs = ['dashboard', 'profile', 'academics', 'certificates', 'skills', 'projects'];
const headerNavItems = [
  { id: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { id: 'profile', icon: <User />, label: 'Profile' },
  { id: 'academics', icon: <BookOpen />, label: 'Academics' },
  { id: 'certificates', icon: <FileBadge />, label: 'Certificates' },
  { id: 'skills', icon: <Target />, label: 'Skills' },
  { id: 'projects', icon: <FolderOpen />, label: 'Projects' },
];


const cardClass = "bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 transition-all duration-500 ease-out hover:shadow-premium-hover hover:-translate-y-1 p-6 md:p-8";

const SidebarItem = ({ icon: Icon, label, isActive, notification, badge, hasArrow, onClick }) => (
  <a 
    href="#" 
    onClick={(e) => { e.preventDefault(); onClick(); }} 
    className={`relative flex items-center justify-between px-4 py-2.5 mx-3 mb-1 rounded-xl transition-all duration-300 ease-out overflow-hidden ${
      isActive 
        ? 'bg-soft-mint/90 text-teal-800 font-bold shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-900 font-medium'
    }`}
  >
    <div className="flex items-center gap-3 min-w-0 z-10">
      <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-mint' : 'text-gray-400'}`} />
      <span className="text-sm tracking-wide whitespace-nowrap truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2 shrink-0 z-10">
      {badge && <span className="bg-mint/10 text-mint text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
      {notification && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm"></div>}
      {hasArrow && <ChevronRight className="w-4 h-4 text-gray-400" />}
    </div>
    {isActive && (
      <>
        {/* Right Spotlight Indicator Bar */}
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-mint rounded-l-full shadow-[-10px_0_18px_var(--primary)] z-20" />
        {/* Right-to-Left Spotlight Cone Light Effect */}
        <div className="absolute right-0 top-0 bottom-0 w-full [clip-path:polygon(0%_0%,100%_25%,100%_75%,0%_100%)] bg-gradient-to-l from-mint/35 via-mint/15 to-transparent pointer-events-none z-10 animate-in fade-in duration-300" />
      </>
    )}
  </a>
);

// Stat Card Component (used in dashboard)
const StatCard = ({ icon: Icon, title, value, subValue, subLabel, colorClass, sparklineColor, progress }) => (
  <div className={`flex flex-col justify-between ${cardClass}`}>
    <div className="flex items-center gap-4 mb-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subValue && <span className="text-xs text-gray-400 font-medium">{subValue}</span>}
        </div>
      </div>
    </div>
    <div className="flex items-end justify-between mt-auto">
      <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{subLabel}</span>
      <svg className="w-20 h-8 opacity-90" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0,25 Q20,10 40,20 T80,10 T100,20" fill="none" stroke={sparklineColor} strokeWidth="2" strokeLinecap="round" />
        {progress && (
           <line x1="0" y1="28" x2={progress} y2="28" stroke={sparklineColor} strokeWidth="4" strokeLinecap="round" />
        )}
      </svg>
    </div>
  </div>
);

// Utility to crop image from canvas
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => { image.onload = resolve; });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => {
    canvas.toBlob((file) => resolve(URL.createObjectURL(file)), 'image/webp', 0.85);
  });
};

const DashboardSkeleton = () => {
  const cardClass = "bg-white rounded-2xl shadow-sm border border-gray-200 p-6";
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="mb-2">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hero Card Skeleton */}
        <div className={`xl:col-span-2 ${cardClass} flex flex-col md:flex-row gap-8`}>
          <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="flex-1 flex flex-col">
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 mt-2">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                  </div>
               ))}
            </div>
          </div>
        </div>
        
        {/* Quick Summary Skeleton */}
        <div className={`${cardClass} flex flex-col`}>
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-5"></div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyEduID = () => {
    const idToCopy = currentUser?.formattedEduId || currentUser?.eduId || "EU-KA-2026-001";
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projectsRes, internshipsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`),
          fetch(`${API_BASE_URL}/api/projects`),
          fetch(`${API_BASE_URL}/api/internships`)
        ]);
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profilePicBase64) setProfilePic(profileData.profilePicBase64);
        }
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.map(p => ({ ...p, id: p._id })));
        }
        
        if (internshipsRes.ok) {
          const internshipsData = await internshipsRes.json();
          setInternships(internshipsData.map(i => ({ ...i, id: i._id })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80');
  
  const [projects, setProjects] = useState([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectFormData, setProjectFormData] = useState({ name: '', description: '', link: '' });
  
  const [academicInfo, setAcademicInfo] = useState({
    universityName: 'Visvesvaraya Technological University',
    collegeName: 'Bengaluru City University',
    department: 'Computer Science',
    course: 'B.Tech',
    specialization: 'Information Science',
    semester: '3',
    section: 'A',
    batch: '2024 - 2028',
    admissionDate: '20 August 2024',
    expectedGraduation: 'May 2028',
    cgpa: '8.72',
    creditsEarned: '58 / 120',
    attendance: '94%',
    status: 'Active'
  });
  const [isEditAcademicsModalOpen, setIsEditAcademicsModalOpen] = useState(false);
  const [academicFormData, setAcademicFormData] = useState({});
  
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectFormData({ name: '', description: '', link: '' });
    setIsAddProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectFormData({ name: project.name, description: project.description, link: project.link });
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleSaveProject = async () => {
    if (projectFormData.name.trim() === '') return;
    try {
      if (editingProjectId) {
        const res = await fetch(`${API_BASE_URL}/api/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectFormData)
        });
        const updated = await res.json();
        setProjects(projects.map(p => p.id === editingProjectId ? { ...updated, id: updated._id } : p));
      } else {
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectFormData)
        });
        const saved = await res.json();
        setProjects([...projects, { ...saved, id: saved._id }]);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
    setIsAddProjectModalOpen(false);
    setEditingProjectId(null);
  };

  const [internships, setInternships] = useState([]);
  const [isAddInternshipModalOpen, setIsAddInternshipModalOpen] = useState(false);
  const [editingInternshipId, setEditingInternshipId] = useState(null);
  const [internshipFormData, setInternshipFormData] = useState({ role: '', company: '', startDate: null, endDate: null, description: '' });

  const handleOpenAddInternship = () => {
    setEditingInternshipId(null);
    setInternshipFormData({ role: '', company: '', startDate: null, endDate: null, description: '' });
    setIsAddInternshipModalOpen(true);
  };

  const handleOpenEditInternship = (internship) => {
    setEditingInternshipId(internship.id);
    setInternshipFormData({ 
      role: internship.role, 
      company: internship.company, 
      startDate: internship.startDate ? new Date(internship.startDate) : null, 
      endDate: internship.endDate ? new Date(internship.endDate) : null, 
      description: internship.description 
    });
    setIsAddInternshipModalOpen(true);
  };

  const handleDeleteInternship = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/internships/${id}`, { method: 'DELETE' });
      setInternships(internships.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete internship:', err);
    }
  };

  const handleSaveInternship = async () => {
    if (internshipFormData.role.trim() === '' || internshipFormData.company.trim() === '') return;
    try {
      if (editingInternshipId) {
        const res = await fetch(`${API_BASE_URL}/api/internships/${editingInternshipId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(internshipFormData)
        });
        const updated = await res.json();
        setInternships(internships.map(i => i.id === editingInternshipId ? { ...updated, id: updated._id } : i));
      } else {
        const res = await fetch(`${API_BASE_URL}/api/internships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(internshipFormData)
        });
        const saved = await res.json();
        setInternships([...internships, { ...saved, id: saved._id }]);
      }
    } catch (err) {
      console.error('Failed to save internship:', err);
    }
    setIsAddInternshipModalOpen(false);
    setEditingInternshipId(null);
  };
  
  const [fileError, setFileError] = useState('');
  
  // Crop states
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
        setFileError('Invalid file type! Allowed formats: PNG, JPEG, WebP, AVIF.');
        setTimeout(() => setFileError(''), 4000);
        e.target.value = '';
        return;
      }
      setImageToCrop(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Convert blob URL to Base64
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        // Save to Database
        try {
          await fetch(`${API_BASE_URL}/api/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilePicBase64: base64data })
          });
        } catch (apiErr) {
          console.error("Failed to save profile pic to DB:", apiErr);
        }
        
        setProfilePic(base64data);
        setImageToCrop(null);
      };
        } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setUserRole(user.role);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] w-full bg-slate-50 bg-gradient-to-br from-indigo-50/40 via-slate-50 to-teal-50/40 font-sans text-gray-800 overflow-hidden relative">
      
      {fileError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100 shadow-lg animate-in slide-in-from-top-4 fade-in">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">{fileError}</span>
        </div>
      )}

      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 relative">
            <button 
              onClick={() => setIsAddProjectModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({...projectFormData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
                  placeholder="e.g. E-Commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none"
                  rows="3"
                  placeholder="What did you build?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Link (Optional)</label>
                <input 
                  type="text" 
                  value={projectFormData.link}
                  onChange={(e) => setProjectFormData({...projectFormData, link: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-3">
              <button 
                onClick={() => setIsAddProjectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProject}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-mint hover:bg-teal-500 shadow-sm transition-colors"
              >
                {editingProjectId ? 'Save Changes' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddInternshipModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in py-8 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-gray-800">{editingInternshipId ? 'Edit Internship' : 'Add New Internship'}</h3>
              <button 
                onClick={() => setIsAddInternshipModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role Title</label>
                <input 
                  type="text" 
                  value={internshipFormData.role}
                  onChange={(e) => setInternshipFormData({...internshipFormData, role: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={internshipFormData.company}
                  onChange={(e) => setInternshipFormData({...internshipFormData, company: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
                  placeholder="e.g. Google, Microsoft, TechCorp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Internship Duration</label>
                <DateRangePicker 
                  startDate={internshipFormData.startDate} 
                  endDate={internshipFormData.endDate} 
                  onChange={(start, end) => setInternshipFormData({...internshipFormData, startDate: start, endDate: end})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  value={internshipFormData.description}
                  onChange={(e) => setInternshipFormData({...internshipFormData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none"
                  rows="3"
                  placeholder="What did you do during this internship?"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl mt-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAddInternshipModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveInternship}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-mint hover:bg-teal-500 shadow-sm transition-colors"
                >
                  {editingInternshipId ? 'Save Changes' : 'Save Internship'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditAcademicsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in py-8 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-100 relative">
            <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-gray-800">Edit Academic Information</h3>
              <button 
                onClick={() => setIsEditAcademicsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: 'universityName', label: 'University Name', placeholder: 'e.g. VTU' },
                  { key: 'collegeName', label: 'College Name', placeholder: 'e.g. Bengaluru City University' },
                  { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
                  { key: 'course', label: 'Course', placeholder: 'e.g. B.Tech' },
                  { key: 'specialization', label: 'Branch/Specialization', placeholder: 'e.g. Information Science' },
                  { key: 'semester', label: 'Semester', placeholder: 'e.g. 3' },
                  { key: 'section', label: 'Section', placeholder: 'e.g. A' },
                  { key: 'batch', label: 'Batch (e.g. 2025–2028)', placeholder: 'e.g. 2025 - 2028' },
                  { key: 'admissionDate', label: 'Admission Date', placeholder: 'e.g. 20 August 2025' },
                  { key: 'expectedGraduation', label: 'Expected Graduation Year', placeholder: 'e.g. May 2028' },
                  { key: 'cgpa', label: 'Current CGPA', placeholder: 'e.g. 8.72' },
                  { key: 'creditsEarned', label: 'Credits Earned', placeholder: 'e.g. 58 / 120' },
                  { key: 'attendance', label: 'Attendance Percentage', placeholder: 'e.g. 94%' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input 
                      type="text" 
                      value={academicFormData[field.key] || ''}
                      onChange={(e) => setAcademicFormData({...academicFormData, [field.key]: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Status</label>
                  <select 
                    value={academicFormData.status || ''}
                    onChange={(e) => setAcademicFormData({...academicFormData, status: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all appearance-none"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 shrink-0 flex items-center gap-3 sticky bottom-0 bg-white rounded-b-3xl z-10">
              <button 
                onClick={() => setIsEditAcademicsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAcademicInfo(academicFormData);
                  setIsEditAcademicsModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-mint hover:bg-teal-500 shadow-sm transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {imageToCrop && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/90 backdrop-blur-sm animate-in fade-in">
          <div className="flex-1 relative w-full max-w-4xl mx-auto h-[70vh] mt-10">
            <Cropper
              image={imageToCrop} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
            />
          </div>
          <div className="h-32 bg-white rounded-t-3xl p-8 flex items-center justify-between max-w-4xl mx-auto w-full mt-auto shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
             <div className="flex items-center gap-4 flex-1">
               <span className="text-sm font-semibold text-gray-500">Zoom</span>
               <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mint" />
             </div>
             <div className="flex items-center gap-4">
               <button onClick={() => setImageToCrop(null)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">Cancel</button>
               <button onClick={saveCrop} className="px-6 py-2.5 rounded-xl font-medium bg-mint text-white hover:bg-teal-500 shadow-sm transition-colors flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Apply Crop
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 flex-shrink-0">
        <div className="flex items-center gap-8">
           {/* Logo */}
           <div className="flex items-center gap-3 shrink-0">
             <div className="text-mint">
               <GraduationCap className="w-9 h-9" />
             </div>
             <span className="text-2xl font-bold text-gray-800 tracking-tight">EduID</span>
           </div>
           
           {/* Menu Toggle & Search */}
           <div className="flex items-center gap-2 sm:gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg mr-0 sm:mr-2">
                <Menu className="w-5 h-5"/>
             </button>
             <div className="relative hidden md:flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything..." 
                  className="w-64 lg:w-80 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" 
                />
             </div>
           </div>
        </div>

        
        {/* Profile / Notifications */}
        <div className="flex items-center gap-6 pr-2">
          <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
             <Bell className="w-5 h-5" />
             <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">3</span>
          </button>
          <div className="relative pl-6 border-l border-gray-200" ref={dropdownRef}>
            <div onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{currentUser?.name || 'Ananya Raj'}</p>
                <p className="text-[11px] text-gray-500 font-medium">{currentUser?.role || 'Student'}</p>
              </div>
              <img src={profilePic} alt={currentUser?.name || "User"} className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-mint/30 transition-all" />
            </div>
            
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-4 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Settings className="w-4 h-4 text-gray-400" /> Account settings
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setIsAuthenticated(false); 
                    setCurrentUser(null);
                    setIsProfileDropdownOpen(false); 
                  }} 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Log out
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT COLUMN: Collapsible Sidebar */}
        <aside className={`absolute md:relative left-0 top-0 bottom-0 bg-white/60 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.03)] flex flex-col h-full z-40 transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] md:w-0 -translate-x-full md:translate-x-0 border-none md:border-none'}`}>
          <div className="w-[260px] py-4 overflow-y-auto custom-scrollbar h-full space-y-0.5">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            
            <div className="mt-6 mb-2 px-7">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academics</p>
            </div>
            <SidebarItem icon={BookOpen} label="Academics" hasArrow={true} isActive={activeTab === 'academics'} onClick={() => setActiveTab('academics')} />
            <SidebarItem icon={CheckCircle} label="Attendance" isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
            <SidebarItem icon={FileText} label="Assignments" isActive={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} />
            <SidebarItem icon={FileBadge} label="Marksheets" isActive={activeTab === 'marksheets'} onClick={() => setActiveTab('marksheets')} />

            <div className="mt-6 mb-2 px-7">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Achievements</p>
            </div>
            <SidebarItem icon={FileBadge} label="Certificates" isActive={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')} />
            <SidebarItem icon={Users} label="Club and Activities" isActive={activeTab === 'clubs'} onClick={() => setActiveTab('clubs')} />
            <SidebarItem icon={Heart} label="Volunteer" isActive={activeTab === 'volunteer'} onClick={() => setActiveTab('volunteer')} />
            <SidebarItem icon={Trophy} label="Sports" isActive={activeTab === 'sports'} onClick={() => setActiveTab('sports')} />

            <div className="mt-6 mb-2 px-7">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Career</p>
            </div>
            <SidebarItem icon={Target} label="Skills" isActive={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
            <SidebarItem icon={FolderOpen} label="Projects" isActive={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
            <SidebarItem icon={Briefcase} label="Internships" isActive={activeTab === 'internships'} onClick={() => setActiveTab('internships')} />

            <div className="mt-6 mb-2 px-7">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Others</p>
            </div>
            <SidebarItem icon={Brain} label="Jade AI" isActive={activeTab === 'eduai'} onClick={() => setActiveTab('eduai')} />
            <SidebarItem icon={MessageSquare} label="Messages" badge="2" isActive={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
            <SidebarItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </aside>

        {/* MIDDLE COLUMN: Main Dashboard */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 transition-all duration-300">
            
            {isLoading ? (
               <DashboardSkeleton />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
                    
                    {/* Top Profile Banner */}
                    <div className="bg-indigo-50/40 backdrop-blur-md rounded-[24px] border border-indigo-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                      {/* Watermark logo on the right */}
                      <div className="absolute -right-8 -top-8 opacity-[0.03] pointer-events-none">
                        <ShieldCheck className="w-64 h-64 text-indigo-900" />
                      </div>

                      {/* Left: Identity */}
                      <div className="flex items-center gap-6 z-10 w-full md:w-auto mb-6 md:mb-0">
                        <div className="relative shrink-0 w-28 h-28">
                          <img src={profilePic} alt={currentUser?.name || "Ananya Raj"} className="w-full h-full rounded-full object-cover border-4 border-white shadow-sm" />
                          <label className="absolute bottom-0 right-0 bg-indigo-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-indigo-600 transition-colors cursor-pointer" title="Update Profile Picture">
                            <Camera className="w-3.5 h-3.5" />
                            <input type="file" className="hidden" onChange={handleProfilePicChange} />
                          </label>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl font-extrabold text-slate-800">{currentUser?.name || "Ananya Raj"}</h2>
                          <div 
                            className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2 cursor-pointer hover:text-indigo-800 transition-colors group"
                            onClick={handleCopyEduID}
                            title="Click to copy unique EduID"
                          >
                            <span className="font-mono tracking-tight font-bold">{currentUser?.formattedEduId || currentUser?.eduId || "EU-KA-2026-001"}</span>
                            {copied ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 text-sm text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-slate-400" />
                              <span>{currentUser?.department || academicInfo.specialization || "BCA - 2nd Year"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{currentUser?.institution || academicInfo.collegeName || "Bengaluru City University"}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> DB Verified
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              Format: EU-{currentUser?.state || 'KA'}-{currentUser?.year || 2026}-001
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Info Grid */}
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 z-10 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-semibold">Date of Birth</span>
                          <span className="text-sm font-semibold text-slate-800">12 May 2005</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-semibold">Gender</span>
                          <span className="text-sm font-semibold text-slate-800">Female</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-semibold">Email</span>
                          <span className="text-sm font-semibold text-slate-800">ananya.raj@gmail.com</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500 font-semibold">Phone</span>
                          <span className="text-sm font-semibold text-slate-800">+91 98765 43210</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                      
                      {/* Card 1: CGPA */}
                      <div className={`${cardClass} !p-4 flex flex-col justify-between h-36`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500">CGPA</span>
                            <span className="text-xl font-bold text-slate-800 leading-tight">8.74</span>
                            <span className="text-[10px] text-slate-400 font-medium">Out of 10</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <svg className="w-full h-8 opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path d="M0,25 Q15,15 30,20 T60,10 T80,15 T100,5" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Card 2: Credits Completed */}
                      <div className={`${cardClass} !p-4 flex flex-col justify-between h-36`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500">Credits Completed</span>
                            <span className="text-xl font-bold text-slate-800 leading-tight">44 <span className="text-sm text-slate-400 font-medium">/ 84</span></span>
                            <span className="text-[10px] text-blue-600 font-bold">52%</span>
                          </div>
                        </div>
                        <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '52%' }}></div>
                        </div>
                      </div>

                      {/* Card 3: Attendance */}
                      <div className={`${cardClass} !p-4 flex flex-col justify-between h-36`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500">Attendance</span>
                            <span className="text-xl font-bold text-slate-800 leading-tight">92%</span>
                            <span className="text-[10px] text-slate-400 font-medium">This Semester</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <svg className="w-full h-8 opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path d="M0,20 Q15,25 30,15 T60,20 T80,10 T100,15" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Card 4: Skill Score */}
                      <div className={`${cardClass} !p-4 flex flex-col justify-between h-36`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <Code className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500">Skill Score (AI)</span>
                            <span className="text-xl font-bold text-slate-800 leading-tight">85%</span>
                            <span className="text-[10px] text-slate-400 font-medium">Advanced</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <svg className="w-full h-8 opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path d="M0,25 Q20,15 40,20 T70,10 T90,5 T100,5" fill="none" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
            
            {activeTab === 'profile' && (
              <div className="flex flex-col w-full">
                {/* Profile Header & Breadcrumbs */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-gray-400">Dashboard</span>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-600 font-medium">Profile</span>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Photo Edit Card */}
                  <div className={`${cardClass} flex flex-col items-center justify-center shrink-0 w-full lg:w-72`}>
                    <div className="relative group w-40 h-40 mb-4">
                      <img src={profilePic} alt="John Doe" className="w-full h-full rounded-2xl object-cover border border-gray-100 shadow-sm transition-opacity" />
                      <label className="absolute -bottom-3 -right-3 bg-mint hover:bg-teal-500 text-white p-3 rounded-xl shadow-lg cursor-pointer transition-colors" title="Update Profile Picture">
                        <Camera className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={handleProfilePicChange} />
                      </label>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">John Doe</h3>
                    <p className="text-sm font-medium text-gray-500">Student</p>
                  </div>

                  {/* Personal Info */}
                  <div className={`${cardClass} flex-1 w-full`}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
                      <button className="text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5">
                        Edit
                      </button>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Full Name</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: John Doe</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Date of Birth</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: 12 March 2006</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Gender</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: Male</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Nationality</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: Indian</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Blood Group</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: O+</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Father's Name</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: Robert Doe</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Mother's Name</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: Emily Doe</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-gray-500 font-medium">Guardian Contact</span>
                        <span className="col-span-2 text-gray-800 font-semibold">: +91 98765 43211</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-5 border-t border-gray-100 flex justify-center">
                      <button className="text-xs font-semibold text-mint bg-soft-mint px-4 py-1.5 rounded-lg hover:bg-mint/20 transition-colors">View More</button>
                    </div>
                </div>
              </div>
              </div>
            )}

            {activeTab === 'academics' && (
              <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">Academics</h2>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-gray-400">Dashboard</span>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-600 font-medium">Academics</span>
                  </div>
                </div>

                <div className={`${cardClass}`}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-gray-800">Academic Information</h3>
                      <button 
                        onClick={() => {
                          setAcademicFormData(academicInfo);
                          setIsEditAcademicsModalOpen(true);
                        }}
                        className="text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </button>
                    </div>
                    
                    {Object.values(academicInfo).every(v => !v || v.trim() === '') ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500 text-sm mb-4">No academic information added yet.</p>
                        <button 
                          onClick={() => {
                            setAcademicFormData(academicInfo);
                            setIsEditAcademicsModalOpen(true);
                          }}
                          className="text-sm font-semibold text-mint bg-soft-mint px-4 py-2 rounded-xl hover:bg-mint/20 transition-colors"
                        >
                          Add Academic Details
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-12 text-sm">
                        {academicInfo.universityName && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">University Name</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.universityName}</span>
                          </div>
                        )}
                        {academicInfo.collegeName && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">College Name</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.collegeName}</span>
                          </div>
                        )}
                        {academicInfo.department && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Department</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.department}</span>
                          </div>
                        )}
                        {academicInfo.course && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Course</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.course}</span>
                          </div>
                        )}
                        {academicInfo.specialization && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Branch/Specialization</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.specialization}</span>
                          </div>
                        )}
                        {academicInfo.semester && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Semester</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.semester}</span>
                          </div>
                        )}
                        {academicInfo.section && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Section</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.section}</span>
                          </div>
                        )}
                        {academicInfo.batch && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Batch</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.batch}</span>
                          </div>
                        )}
                        {academicInfo.admissionDate && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Admission Date</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.admissionDate}</span>
                          </div>
                        )}
                        {academicInfo.expectedGraduation && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Expected Graduation Year</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.expectedGraduation}</span>
                          </div>
                        )}
                        {academicInfo.cgpa && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Current CGPA</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.cgpa}</span>
                          </div>
                        )}
                        {academicInfo.creditsEarned && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Credits Earned</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.creditsEarned}</span>
                          </div>
                        )}
                        {academicInfo.attendance && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-3">
                            <span className="text-gray-500 font-medium">Attendance Percentage</span>
                            <span className="text-gray-800 font-semibold sm:col-span-2">{academicInfo.attendance}</span>
                          </div>
                        )}
                        {academicInfo.status && (
                          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 items-center">
                            <span className="text-gray-500 font-medium">Academic Status</span>
                            <div className="sm:col-span-2">
                              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded border ${academicInfo.status.toLowerCase() === 'active' ? 'bg-soft-mint text-mint border-mint/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {academicInfo.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-gray-400">Dashboard</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="text-gray-600 font-medium">Projects</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenAddProject}
                    className="bg-gradient-to-r from-mint to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white px-5 py-2.5 rounded-[14px] font-semibold shadow-[0_4px_14px_rgba(46,196,166,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(46,196,166,0.23)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Project
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className={`${cardClass} flex flex-col items-center justify-center py-16 text-center mt-4`}>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No projects yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm">You haven't added any projects to your portfolio yet. Click the button above to add your first project.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className={`${cardClass} flex flex-col`}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noreferrer" className="text-mint bg-soft-mint p-1.5 rounded-lg hover:bg-mint/20 transition-colors">
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-5 flex-1 leading-relaxed">{project.description}</p>
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                           <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider border border-gray-100">Project</span>
                           <div className="flex items-center gap-2">
                             <button onClick={() => handleOpenEditProject(project)} className="text-gray-400 hover:text-mint transition-colors p-1" title="Edit">
                               <Edit3 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDeleteProject(project.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'internships' && (
              <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Internships</h2>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-gray-400">Career</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="text-gray-600 font-medium">Internships</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenAddInternship}
                    className="bg-gradient-to-r from-mint to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white px-5 py-2.5 rounded-[14px] font-semibold shadow-[0_4px_14px_rgba(46,196,166,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(46,196,166,0.23)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Internship
                  </button>
                </div>

                {internships.length === 0 ? (
                  <div className={`${cardClass} flex flex-col items-center justify-center py-16 text-center mt-4`}>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No internships yet</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm">You haven't added any internships to your profile yet. Click the button above to add your first internship experience.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {internships.map((internship) => (
                      <div key={internship.id} className={`${cardClass} flex flex-col`}>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-gray-800">{internship.role}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-mint font-semibold text-sm mb-2">
                           <Briefcase className="w-4 h-4" /> {internship.company}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4 font-medium">
                           <CalendarDays className="w-3.5 h-3.5" /> 
                           {internship.startDate && internship.endDate ? 
                             `${new Date(internship.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(internship.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${Math.ceil(Math.abs(new Date(internship.endDate) - new Date(internship.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days)` 
                             : 'Duration not specified'}
                        </div>
                        <p className="text-sm text-gray-600 mb-5 flex-1 leading-relaxed">{internship.description}</p>
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                           <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider border border-gray-100">Internship</span>
                           <div className="flex items-center gap-2">
                             <button onClick={() => handleOpenEditInternship(internship)} className="text-gray-400 hover:text-mint transition-colors p-1" title="Edit">
                               <Edit3 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDeleteInternship(internship.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <SkillsLibrary />
            )}

            {activeTab === 'certificates' && (
              <Certificates />
            )}

            {activeTab === 'clubs' && (
              <ClubsAndActivities />
            )}

            {activeTab === 'volunteer' && (
              <Volunteer />
            )}

            {activeTab === 'sports' && (
              <Sports />
            )}

            {activeTab === 'eduai' && (
              <AICareerAdvisor 
                profileContext={{
                  name: currentUser?.name || 'Ananya Raj',
                  eduId: currentUser?.formattedEduId || currentUser?.eduId || 'EU-KA-2026-001',
                  university: currentUser?.institution || academicInfo.universityName,
                  degree: currentUser?.department || 'BCA - 2nd Year',
                  cgpa: currentUser?.cgpa || academicInfo.cgpa,
                  attendance: currentUser?.attendance || academicInfo.attendance
                }}
              />
            )}

            {/* Fallback for other tabs */}
            {!['dashboard', 'profile', 'academics', 'projects', 'internships', 'skills', 'certificates', 'clubs', 'volunteer', 'sports', 'eduai'].includes(activeTab) && (
              <div className={`${cardClass} flex flex-col items-center justify-center text-center min-h-[400px] w-full mt-10 animate-in fade-in duration-500`}>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</h3>
                <p className="text-gray-500 font-medium text-sm">This section is not fully implemented yet.</p>
              </div>
            )}
            </>
           )}

        </main>
      </div>

    </div>
  );
};

export default App;
