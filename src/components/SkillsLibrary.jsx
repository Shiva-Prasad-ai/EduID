import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Target, Plus, ChevronDown, ChevronRight, Edit3, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Massive Skill Data Array mapped to Devicons
const SKILLS_DATA = [
  { id: 'c', name: 'C', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg' },
  { id: 'cpp', name: 'C++', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg' },
  { id: 'csharp', name: 'C#', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg' },
  { id: 'java', name: 'Java', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
  { id: 'python', name: 'Python', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
  { id: 'typescript', name: 'TypeScript', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { id: 'go', name: 'Go', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg' },
  { id: 'rust', name: 'Rust', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg' },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg' },
  { id: 'swift', name: 'Swift', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg' },
  { id: 'php', name: 'PHP', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg' },
  { id: 'ruby', name: 'Ruby', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ruby/ruby-original.svg' },
  { id: 'scala', name: 'Scala', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scala/scala-original.svg' },
  { id: 'dart', name: 'Dart', category: 'Programming Languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg' },
  
  { id: 'html5', name: 'HTML5', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
  { id: 'css3', name: 'CSS3', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
  { id: 'tailwindcss', name: 'Tailwind CSS', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg' },
  { id: 'react', name: 'React', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
  { id: 'angular', name: 'Angular', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { id: 'vuejs', name: 'Vue.js', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg' },
  { id: 'svelte', name: 'Svelte', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg' },
  
  { id: 'nodejs', name: 'Node.js', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { id: 'express', name: 'Express.js', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
  { id: 'django', name: 'Django', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg' },
  { id: 'flask', name: 'Flask', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg' },
  { id: 'springboot', name: 'Spring Boot', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg' },
  { id: 'laravel', name: 'Laravel', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },
  { id: 'aspnet', name: 'ASP.NET', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
  
  { id: 'mysql', name: 'MySQL', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
  { id: 'sqlite', name: 'SQLite', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg' },
  { id: 'firebase', name: 'Firebase', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg' },
  { id: 'redis', name: 'Redis', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg' },
  { id: 'oracle', name: 'Oracle', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg' },
  
  { id: 'docker', name: 'Docker', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg' },
  { id: 'git', name: 'Git', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
  { id: 'github', name: 'GitHub', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
  { id: 'gitlab', name: 'GitLab', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gitlab/gitlab-original.svg' },
  { id: 'jenkins', name: 'Jenkins', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg' },
  { id: 'githubactions', name: 'GitHub Actions', category: 'DevOps', fallback: '🐙' },
  
  { id: 'aws', name: 'AWS', category: 'Cloud', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
  { id: 'azure', name: 'Azure', category: 'Cloud', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg' },
  { id: 'googlecloud', name: 'Google Cloud', category: 'Cloud', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg' },
  { id: 'vercel', name: 'Vercel', category: 'Cloud', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg' },
  { id: 'netlify', name: 'Netlify', category: 'Cloud', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/netlify/netlify-original.svg' },
  
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI / Machine Learning', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg' },
  { id: 'pytorch', name: 'PyTorch', category: 'AI / Machine Learning', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg' },
  { id: 'opencv', name: 'OpenCV', category: 'AI / Machine Learning', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg' },
  { id: 'huggingface', name: 'Hugging Face', category: 'AI / Machine Learning', fallback: '🤗' },
  { id: 'ollama', name: 'Ollama', category: 'AI / Machine Learning', fallback: '🦙' },
  { id: 'langchain', name: 'LangChain', category: 'AI / Machine Learning', fallback: '🦜' },
  { id: 'scikitlearn', name: 'Scikit-learn', category: 'AI / Machine Learning', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg' },
  
  { id: 'flutter', name: 'Flutter', category: 'Mobile Development', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg' },
  { id: 'reactnative', name: 'React Native', category: 'Mobile Development', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { id: 'android', name: 'Android', category: 'Mobile Development', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg' },
  { id: 'swiftui', name: 'SwiftUI', category: 'Mobile Development', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg' },
  
  { id: 'kalilinux', name: 'Kali Linux', category: 'Cyber Security', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kalilinux/kalilinux-original.svg' },
  { id: 'wireshark', name: 'Wireshark', category: 'Cyber Security', fallback: '🦈' },
  { id: 'burpsuite', name: 'Burp Suite', category: 'Cyber Security', fallback: '🛡️' },
  { id: 'metasploit', name: 'Metasploit', category: 'Cyber Security', fallback: '⚔️' },
  { id: 'nmap', name: 'Nmap', category: 'Cyber Security', fallback: '👁️' },
  { id: 'owasp', name: 'OWASP', category: 'Cyber Security', fallback: '🌐' }
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(SKILLS_DATA.map(s => s.category)))];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SkillIcon = ({ skill, className = "w-10 h-10" }) => {
  if (skill.icon) {
    return <img src={skill.icon} alt={skill.name} className={`${className} object-contain`} />;
  }
  return <div className={`${className} flex items-center justify-center text-3xl`}>{skill.fallback}</div>;
};

const SkillsLibrary = () => {
  // Main state
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [tempSelected, setTempSelected] = useState([]); // Array of IDs currently selected in modal

  // Popover state
  const [activePopoverId, setActivePopoverId] = useState(null);
  const popoverRef = useRef(null);

  // Fetch skills from MongoDB on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/skills`);
        if (!response.ok) throw new Error('Failed to fetch skills from database');
        const data = await response.json();
        
        // Map backend model to frontend expected format
        setSelectedSkills(data.map(item => ({
          _id: item._id, // MongoDB internal ID
          id: item.skillId, // Local devicon mapper ID
          level: item.level,
          verified: item.verifiedStatus,
          dateAdded: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActivePopoverId(null);
      }
    };
    if (activePopoverId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopoverId]);

  // Derived filtered skills
  const filteredSkills = useMemo(() => {
    return SKILLS_DATA.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            skill.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || skill.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleOpenAddModal = () => {
    setTempSelected(selectedSkills.map(s => s.id));
    setSearchQuery('');
    setActiveCategory('All');
    setIsAddModalOpen(true);
  };

  const handleToggleTempSelection = (id) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter(sId => sId !== id));
    } else {
      setTempSelected([...tempSelected, id]);
    }
  };

  const handleSaveModal = async () => {
    setIsAddModalOpen(false); // Optimistically close modal
    setIsLoading(true);

    try {
      // 1. Identify skills to add and skills to remove based on tempSelected vs selectedSkills
      const currentIds = selectedSkills.map(s => s.id);
      const idsToAdd = tempSelected.filter(id => !currentIds.includes(id));
      const skillsToRemove = selectedSkills.filter(s => !tempSelected.includes(s.id));

      // 2. Process Deletions
      for (const skill of skillsToRemove) {
        if (skill._id) {
          await fetch(`${API_BASE_URL}/api/skills/${skill._id}`, { method: 'DELETE' });
        }
      }

      // 3. Process Additions
      for (const id of idsToAdd) {
        await fetch(`${API_BASE_URL}/api/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: id, level: 'Beginner', verifiedStatus: 'Self Added' })
        });
      }

      // 4. Refetch final state from DB to guarantee sync
      const response = await fetch(`${API_BASE_URL}/api/skills`);
      const data = await response.json();
      setSelectedSkills(data.map(item => ({
        _id: item._id,
        id: item.skillId,
        level: item.level,
        verified: item.verifiedStatus,
        dateAdded: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      })));
    } catch (err) {
      console.error('Error saving skills to database:', err);
      setError('Sync failed. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSkillLevel = async (id, newLevel) => {
    const skill = selectedSkills.find(s => s.id === id);
    if (!skill || !skill._id) return;
    
    // Optimistic UI update
    setSelectedSkills(selectedSkills.map(s => s.id === id ? { ...s, level: newLevel } : s));
    setActivePopoverId(null);
    
    try {
      await fetch(`${API_BASE_URL}/api/skills/${skill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel })
      });
    } catch (err) {
      console.error('Failed to update skill level:', err);
    }
  };

  const handleRemoveSkill = async (id) => {
    const skill = selectedSkills.find(s => s.id === id);
    if (!skill || !skill._id) return;

    // Optimistic UI update
    setSelectedSkills(selectedSkills.filter(s => s.id !== id));
    setActivePopoverId(null);

    try {
      await fetch(`${API_BASE_URL}/api/skills/${skill._id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Skills Library</h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-gray-400">Career</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-600 font-medium">Skills</span>
          </div>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-mint to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white px-5 py-2.5 rounded-[14px] font-semibold shadow-[0_4px_14px_rgba(46,196,166,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(46,196,166,0.23)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Skills
        </button>
      </div>

      {/* Dashboard Selected Skills View */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-premium border border-white/80 p-8 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-mint/30 border-t-mint rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Syncing with database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 font-bold mb-2">Connection Error</div>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : selectedSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No skills selected</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Build your technology catalog. Click the button above to add your official skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {selectedSkills.map(sel => {
              const skillData = SKILLS_DATA.find(s => s.id === sel.id);
              if (!skillData) return null;
              
              const isPopoverOpen = activePopoverId === sel.id;
              
              return (
                <div key={sel.id} className="relative group">
                  <div 
                    onClick={() => setActivePopoverId(isPopoverOpen ? null : sel.id)}
                    className="flex flex-col items-center justify-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1 relative"
                  >
                    <SkillIcon skill={skillData} className="w-12 h-12 mb-3 transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-bold text-gray-800 text-sm text-center line-clamp-1">{skillData.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{sel.level}</span>
                    
                    {/* Verification Badge */}
                    {sel.verified === 'Institution Verified' && <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-3 right-3 shadow-sm bg-white rounded-full" title="Institution Verified" />}
                    {sel.verified === 'AI Recommended' && <Sparkles className="w-4 h-4 text-purple-500 absolute top-3 right-3 shadow-sm bg-white rounded-full" title="AI Recommended" />}
                  </div>

                  {/* Level Popover */}
                  {isPopoverOpen && (
                    <div ref={popoverRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 p-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Set Skill Level</div>
                      <div className="space-y-1">
                        {SKILL_LEVELS.map(level => (
                          <button 
                            key={level} 
                            onClick={() => handleUpdateSkillLevel(sel.id, level)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${sel.level === level ? 'bg-soft-mint text-mint' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button onClick={() => handleRemoveSkill(sel.id)} className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Remove Skill
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Screen Add Skills Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-50/95 backdrop-blur-md animate-in fade-in flex flex-col">
          {/* Modal Header */}
          <div className="h-20 bg-white border-b border-gray-200 px-6 sm:px-10 flex items-center justify-between shrink-0 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Target className="w-6 h-6 text-mint" />
              Technology Library
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-500 hidden sm:inline-block">
                {tempSelected.length} selected
              </span>
              <button onClick={handleSaveModal} className="bg-mint hover:bg-teal-500 text-white px-6 py-2 rounded-xl font-semibold shadow-sm transition-colors">
                Save & Close
              </button>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 text-gray-500 rounded-full transition-colors ml-2">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white border-b border-gray-200 px-6 sm:px-10 py-4 shrink-0 space-y-4">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search technologies, languages, or tools..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(category => (
                <button 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === category ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
            {filteredSkills.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-medium">
                No technologies found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                {filteredSkills.map(skill => {
                  const isSelected = tempSelected.includes(skill.id);
                  return (
                    <div 
                      key={skill.id}
                      onClick={() => handleToggleTempSelection(skill.id)}
                      className={`relative group bg-white rounded-[20px] p-4 flex flex-col items-center justify-center aspect-square cursor-pointer transition-all duration-200 ease-out border-2 
                        ${isSelected ? 'border-mint shadow-[0_8px_24px_rgba(46,196,166,0.15)] scale-[1.02]' : 'border-transparent hover:border-gray-200 hover:shadow-md hover:-translate-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}
                      `}
                    >
                      <SkillIcon skill={skill} className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-gray-700 text-[11px] text-center w-full truncate">{skill.name}</span>
                      
                      {/* Selection Checkmark Overlay */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-mint text-white rounded-full p-0.5 animate-in zoom-in-50 duration-200">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsLibrary;
