import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { 
  User, 
  Phone, 
  Briefcase, 
  IdCard, 
  LogOut, 
  CheckSquare, 
  MessageSquare, 
  Edit, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';

const Profile = () => {
  const { currentUser, logoutStudent, updateProfile } = useCanteen();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phoneNumber: currentUser?.phoneNumber || '',
    department: currentUser?.department || '',
    receiveWhatsAppNotifications: currentUser?.receiveWhatsAppNotifications !== false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    // Frontend Validations
    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.department.trim()) {
      setErrorMsg('Department is required.');
      return;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      setErrorMsg('Phone Number must be exactly 10 digits.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
        receiveWhatsAppNotifications: formData.receiveWhatsAppNotifications
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg('A connection error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>

        {/* Big Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md orange-glow-sm">
          {currentUser.name.charAt(0)}
        </div>

        <div className="text-center sm:text-left flex-1">
          <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Verified Student
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight mt-2.5 truncate max-w-[280px] sm:max-w-none">
            {currentUser.name}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold tracking-wider uppercase">
            Roll: {currentUser.rollNumber}
          </p>
        </div>

        {!isEditing && (
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <button 
              onClick={() => {
                setFormData({
                  name: currentUser.name,
                  phoneNumber: currentUser.phoneNumber,
                  department: currentUser.department,
                  receiveWhatsAppNotifications: currentUser.receiveWhatsAppNotifications !== false
                });
                setIsEditing(true);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/10"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            
            <button 
              onClick={logoutStudent}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form/Details Panel */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Edit Profile Settings</h3>
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                placeholder="Enter full name"
                required
                disabled={isSaving}
              />
            </div>

            {/* Phone Number Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number (10 digits)</label>
              <input 
                type="text" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                placeholder="e.g. 9876543210"
                required
                disabled={isSaving}
              />
            </div>

            {/* Department Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</label>
              <input 
                type="text" 
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                placeholder="e.g. Computer Science"
                required
                disabled={isSaving}
              />
            </div>

            {/* WhatsApp Preference Toggle */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl mt-2 select-none">
              <input 
                type="checkbox" 
                id="receiveWhatsAppNotifications"
                checked={formData.receiveWhatsAppNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, receiveWhatsAppNotifications: e.target.checked }))}
                className="w-4.5 h-4.5 text-orange-500 border-slate-350 rounded focus:ring-orange-500 accent-orange-500 cursor-pointer"
                disabled={isSaving}
              />
              <label htmlFor="receiveWhatsAppNotifications" className="flex-1 cursor-pointer">
                <p className="text-slate-800 text-xs font-bold">Receive WhatsApp Notifications</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Get notified instantly when your food is prepared and ready for pickup.</p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-4">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setErrorMsg('');
              }}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/10"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Academic & Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Roll number */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <IdCard className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Roll Number</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">{currentUser.rollNumber}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">{currentUser.department}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">{currentUser.phoneNumber}</p>
              </div>
            </div>

            {/* Notification Preference */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 md:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WhatsApp Status Alerts</p>
                <p className="text-slate-800 text-sm font-bold mt-0.5">
                  {currentUser.receiveWhatsAppNotifications !== false ? 'Enabled (Send alerts on order ready)' : 'Disabled (Do not notify)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
