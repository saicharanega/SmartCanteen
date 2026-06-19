import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { UserPlus, UserCheck, Key, ShieldAlert, Loader2, CheckCircle2, ListFilter, ChefHat, CreditCard, Search, History, RefreshCcw, Phone, Edit, X } from 'lucide-react';

const StaffManagement = () => {
  // Navigation tabs: 'staff' (Registration catalog) or 'resets' (Password resets tool)
  const [activeTab, setActiveTab] = useState('staff');

  // ----------------------------------------------------
  // TAB 1: STAFF REGISTRATION DATA STATES
  // ----------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier'); // cashier, kitchen
  
  // Registration feedback
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  
  // Staff list
  const [staffList, setStaffList] = useState([]);
  const [fetchingStaff, setFetchingStaff] = useState(false);

  // ----------------------------------------------------
  // TAB 2: PASSWORD RESETS DATA STATES
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundUser, setFoundUser] = useState(null);

  const [tempPassword, setTempPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const [resetLogs, setResetLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  // ----------------------------------------------------
  // STAFF EDITING DATA STATES
  // ----------------------------------------------------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ----------------------------------------------------
  // API INVOCATIONS
  // ----------------------------------------------------
  
  // Fetch cashier & kitchen workers list
  const fetchStaff = async () => {
    setFetchingStaff(true);
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`${API_URL}/api/admin/staff`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error('Failed to retrieve staff:', err);
    } finally {
      setFetchingStaff(false);
    }
  };

  // Fetch password reset logs
  const fetchResetLogs = async () => {
    setFetchingLogs(true);
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`${API_URL}/api/admin/password-reset/logs`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setResetLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to retrieve logs:', err);
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staff') {
      fetchStaff();
    } else {
      fetchResetLogs();
    }
  }, [activeTab]);

  // Create Staff account
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!fullName.trim()) {
      setRegError('Full Name is required.');
      return;
    }
    if (!username.trim()) {
      setRegError('Username is required.');
      return;
    }
    if (!phoneNumber.trim()) {
      setRegError('Phone Number is required.');
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setRegError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!password.trim()) {
      setRegError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setRegLoading(true);

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`${API_URL}/api/admin/staff/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password,
          role,
          name: fullName.trim(),
          phoneNumber: phoneNumber.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setRegSuccess(`Staff account for "${fullName}" registered successfully!`);
        setFullName('');
        setUsername('');
        setPhoneNumber('');
        setPassword('');
        setRole('cashier');
        fetchStaff();
      } else {
        setRegError(data.message || 'Failed to create account.');
      }
    } catch (err) {
      setRegError('Server connection error.');
    } finally {
      setRegLoading(false);
    }
  };

  const openEditModal = (staffMember) => {
    setEditingStaffId(staffMember._id);
    setEditName(staffMember.name || '');
    setEditPhoneNumber(staffMember.phoneNumber || '');
    setEditUsername(staffMember.username || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    
    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }
    if (!editPhoneNumber.trim() || !/^\d{10}$/.test(editPhoneNumber)) {
      setEditError('Phone number must be exactly 10 digits');
      return;
    }
    if (!editUsername.trim()) {
      setEditError('Username is required');
      return;
    }

    setEditLoading(true);
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/admin/staff/${editingStaffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          phoneNumber: editPhoneNumber.trim(),
          username: editUsername.trim().toLowerCase()
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        fetchStaff();
      } else {
        setEditError(data.message || 'Failed to update staff member.');
      }
    } catch (err) {
      setEditError('Connection to server failed.');
    } finally {
      setEditLoading(false);
    }
  };

  // Search User for Password Reset
  const handleSearchUser = async (e) => {
    e.preventDefault();
    setSearchError('');
    setFoundUser(null);
    setResetSuccess('');
    setResetError('');

    if (!searchQuery.trim()) return;

    setSearchLoading(true);

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/admin/password-reset/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setFoundUser(data.user);
        // Prefill temporary password
        setTempPassword('temp_' + Math.random().toString(36).substring(2, 8));
      } else {
        setSearchError(data.message || 'User not found.');
      }
    } catch (err) {
      setSearchError('Connection to server failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Execute Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!tempPassword.trim()) {
      setResetError('Temporary password is required.');
      return;
    }

    setResetLoading(true);

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`${API_URL}/api/admin/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          userId: foundUser.userId,
          tempPassword: tempPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccess(`Password for user "${foundUser.username}" has been reset successfully. Temporary password is: "${data.tempPassword}" (Note: Copy this now; it will not be shown again!)`);
        setFoundUser(null);
        setSearchQuery('');
        fetchResetLogs();
      } else {
        setResetError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setResetError('Server connection error.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Navigation tabs header */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
            activeTab === 'staff'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Staff Directory & Creation
        </button>
        <button
          onClick={() => setActiveTab('resets')}
          className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
            activeTab === 'resets'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Password Reset Tool
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB 1: STAFF DIRECTORY & CREATION
          ---------------------------------------------------- */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Account Creation Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="border-b border-slate-50 pb-4 mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                <UserPlus className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none">Register Canteen Staff</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Save cashier or kitchen worker accounts</p>
              </div>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setRegError(''); }}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    disabled={regLoading}
                    required
                  />
                  <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setRegError(''); }}
                    placeholder="e.g. cashier_ramesh"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    disabled={regLoading}
                    required
                  />
                  <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); setRegError(''); }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    disabled={regLoading}
                    required
                  />
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Initial Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setRegError(''); }}
                    placeholder="Initial login password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    disabled={regLoading}
                    required
                  />
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Staff Authorization Portal
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all cursor-pointer"
                  disabled={regLoading}
                >
                  <option value="cashier">💰 Cashier Portal</option>
                  <option value="kitchen">👨‍🍳 Kitchen Portal</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 border-none"
                disabled={regLoading}
              >
                {regLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Staff</span>
                )}
              </button>
            </form>
          </div>

          {/* Staff Accounts Ledger table list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                    <ListFilter className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-none">Registered Staff Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Canteen crew profile logs</p>
                  </div>
                </div>
                {fetchingStaff && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-3.5 px-5">Staff Member</th>
                      <th className="py-3.5 px-5">Username</th>
                      <th className="py-3.5 px-5">Phone Number</th>
                      <th className="py-3.5 px-5">Role</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {staffList && staffList.length > 0 ? (
                      staffList.map((staffMember) => (
                        <tr key={staffMember._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-800">
                            {staffMember.name || 'Not Available'}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-600">
                            {staffMember.username}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">
                            {staffMember.phoneNumber || 'Not Available'}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border ${
                              staffMember.role === 'kitchen' 
                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {staffMember.role === 'kitchen' ? (
                                <>
                                  <ChefHat className="w-3 h-3 stroke-[2.5]" />
                                  <span>Kitchen</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3 h-3 stroke-[2.5]" />
                                  <span>Cashier</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => openEditModal(staffMember)}
                              className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Edit Staff Member"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold">
                          No staff accounts registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: PASSWORD RESETS TOOL
          ---------------------------------------------------- */}
      {activeTab === 'resets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          {/* User Reset Search Input Form (Left - Span 1) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-50 pb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none">Find User Profile</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Search username or student roll</p>
              </div>
            </div>

            <form onSubmit={handleSearchUser} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 22BD1A0501 or cashier1"
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  disabled={searchLoading}
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 p-1 text-slate-450 hover:text-orange-500 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <Search className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
              {searchError && <p className="text-rose-600 text-xs font-semibold pl-1">⚠ {searchError}</p>}
            </form>

            {/* Found user profile card & Reset Form */}
            {foundUser ? (
              <div className="p-4 bg-orange-50/20 border border-orange-100 rounded-2xl flex flex-col gap-4 animate-scale-up text-left">
                <div>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-extrabold uppercase rounded-md border border-orange-150">
                    User Details
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">{foundUser.name}</h4>
                  <p className="text-slate-500 font-mono text-xs mt-0.5">{foundUser.username.toUpperCase()}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">{foundUser.role} Account</p>
                </div>

                <form onSubmit={handleResetPassword} className="border-t border-orange-100/50 pt-4 flex flex-col gap-3.5">
                  {resetError && <p className="text-rose-600 text-xs font-semibold">⚠ {resetError}</p>}
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 pl-0.5">
                      New Temporary Password
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="Initial temp password"
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs font-semibold outline-none transition-all font-mono"
                        disabled={resetLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setTempPassword('temp_' + Math.random().toString(36).substring(2, 8))}
                        className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                        title="Generate Password"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Execute Reset</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                Look up a user account above to configure passwords.
              </div>
            )}
          </div>

          {/* Reset Logs Audit Ledger (Right - Span 2) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-none">Password Reset Audit Logs</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Audit ledger of reset operations</p>
                  </div>
                </div>
                {fetchingLogs && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>

              {resetSuccess && (
                <div className="m-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-3.5 px-5">Target Username</th>
                      <th className="py-3.5 px-5">Password Status</th>
                      <th className="py-3.5 px-5">Date Reset</th>
                      <th className="py-3.5 px-5">System Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {resetLogs && resetLogs.length > 0 ? (
                      resetLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-800 font-mono">
                            {log.targetUsername.toUpperCase()}
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 italic font-medium">
                            Secure (Masked)
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 font-medium">
                            {new Date(log.resetAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded-md border border-orange-100">
                              System Logged
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-400 font-semibold">
                          No password reset events logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-scale-up text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <h4 className="font-extrabold text-slate-800 text-lg">
                Edit Staff Profile
              </h4>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditStaffSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  disabled={editLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => { setEditUsername(e.target.value); setEditError(''); }}
                  placeholder="e.g. cashier_ramesh"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  disabled={editLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => { setEditPhoneNumber(e.target.value); setEditError(''); }}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                  disabled={editLoading}
                  required
                />
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-xl text-xs transition-all cursor-pointer border-none bg-transparent"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer border-none"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
