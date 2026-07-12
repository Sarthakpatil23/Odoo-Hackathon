import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function OrganizationSetup() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Data States
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Loading States
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // Employee Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals & Action States
  // A. Departments
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    headId: '',
    parentId: '',
    status: 'Active',
  });
  const [isDeptConfirmOpen, setIsDeptConfirmOpen] = useState(false);
  const [deptToDeactivate, setDeptToDeactivate] = useState(null);

  // B. Categories
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }]);
  const [isCatConfirmOpen, setIsCatConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  // C. Employees
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [targetEmp, setTargetEmp] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [isEmpConfirmOpen, setIsEmpConfirmOpen] = useState(false);
  const [empToToggle, setEmpToToggle] = useState(null);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load departments.');
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const response = await api.get('/asset-categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load asset categories.');
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchEmployees = async (search = searchQuery, role = roleFilter) => {
    setLoadingEmps(true);
    try {
      const params = {};
      if (role) params.role = role;
      if (search) params.search = search;

      const response = await api.get('/employees', { params });
      setEmployees(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load employees.');
    } finally {
      setLoadingEmps(false);
    }
  };

  // Debounced employee search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (activeTab === 'employees') {
        fetchEmployees(searchQuery, roleFilter);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, roleFilter, activeTab]);

  // Initial tab loading
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (activeTab === 'departments') {
      fetchDepartments();
      // Fetch employees too, so we have them for the Department Head dropdown
      fetchEmployees('', '');
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'employees') {
      fetchEmployees();
      fetchDepartments(); // Fetch departments to populate reassignment options
    }
  }, [activeTab]);

  // Helper for displaying temporary messages
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // ─── Department Handlers ───────────────────────────────────────────────────

  const handleOpenDeptModal = (dept = null) => {
    setErrorMsg(null);
    if (dept) {
      setEditingDept(dept);
      setDeptForm({
        name: dept.name,
        headId: dept.headId || '',
        parentId: dept.parentId || '',
        status: dept.status,
      });
    } else {
      setEditingDept(null);
      setDeptForm({
        name: '',
        headId: '',
        parentId: '',
        status: 'Active',
      });
    }
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      showError('Department name is required.');
      return;
    }

    try {
      const payload = {
        name: deptForm.name,
        headId: deptForm.headId || null,
        parentId: deptForm.parentId || null,
        status: deptForm.status,
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        showSuccess(`Department "${deptForm.name}" updated successfully.`);
      } else {
        await api.post('/departments', payload);
        showSuccess(`Department "${deptForm.name}" created successfully.`);
      }
      setIsDeptModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save department.');
    }
  };

  const handleDeactivateDeptConfirm = (dept) => {
    setDeptToDeactivate(dept);
    setIsDeptConfirmOpen(true);
  };

  const handleDeactivateDept = async () => {
    if (!deptToDeactivate) return;
    try {
      await api.patch(`/departments/${deptToDeactivate.id}/deactivate`);
      showSuccess(`Department "${deptToDeactivate.name}" deactivated successfully.`);
      setIsDeptConfirmOpen(false);
      setDeptToDeactivate(null);
      fetchDepartments();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to deactivate department.');
    }
  };

  // ─── Category Handlers ──────────────────────────────────────────────────────

  const handleAddField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const fields = [...customFields];
    fields.splice(index, 1);
    setCustomFields(fields);
  };

  const handleFieldChange = (index, part, val) => {
    const fields = [...customFields];
    fields[index][part] = val;
    setCustomFields(fields);
  };

  const handleOpenCatModal = (cat = null) => {
    setErrorMsg(null);
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      if (cat.fields && typeof cat.fields === 'object') {
        const mapped = Object.entries(cat.fields).map(([k, v]) => ({
          key: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        }));
        setCustomFields(mapped.length ? mapped : [{ key: '', value: '' }]);
      } else {
        setCustomFields([{ key: '', value: '' }]);
      }
    } else {
      setEditingCat(null);
      setCatName('');
      setCustomFields([{ key: '', value: '' }]);
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      showError('Category name is required.');
      return;
    }

    // Convert key-value array to a JSON object
    const fieldsObj = {};
    for (const f of customFields) {
      if (f.key.trim()) {
        // Try parsing value if it looks like a number or boolean
        let parsedVal = f.value.trim();
        if (parsedVal === 'true') parsedVal = true;
        else if (parsedVal === 'false') parsedVal = false;
        else if (!isNaN(parsedVal) && parsedVal !== '') parsedVal = Number(parsedVal);
        fieldsObj[f.key.trim()] = parsedVal;
      }
    }

    try {
      const payload = {
        name: catName.trim(),
        fields: Object.keys(fieldsObj).length ? fieldsObj : null,
      };

      if (editingCat) {
        await api.put(`/asset-categories/${editingCat.id}`, payload);
        showSuccess(`Category "${catName}" updated successfully.`);
      } else {
        await api.post('/asset-categories', payload);
        showSuccess(`Category "${catName}" created successfully.`);
      }
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save category.');
    }
  };

  const handleDeleteCatConfirm = (cat) => {
    setCatToDelete(cat);
    setIsCatConfirmOpen(true);
  };

  const handleDeleteCat = async () => {
    if (!catToDelete) return;
    try {
      await api.delete(`/asset-categories/${catToDelete.id}`);
      showSuccess(`Category "${catToDelete.name}" deleted successfully.`);
      setIsCatConfirmOpen(false);
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      // Handles 409 (in use) or 404 (not found)
      showError(err.response?.data?.error || 'Failed to delete category.');
      setIsCatConfirmOpen(false);
    }
  };

  // ─── Employee Handlers ─────────────────────────────────────────────────────

  const handleOpenPromoteModal = (emp) => {
    setTargetEmp(emp);
    setSelectedRole(emp.role);
    setIsPromoteModalOpen(true);
  };

  const handleSavePromotion = async () => {
    if (!targetEmp) return;
    try {
      await api.patch(`/employees/${targetEmp.id}/promote`, { role: selectedRole });
      showSuccess(`Employee "${targetEmp.name}" updated to role ${selectedRole}.`);
      setIsPromoteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to promote employee.');
    }
  };

  const handleOpenReassignModal = (emp) => {
    setTargetEmp(emp);
    setSelectedDeptId(emp.departmentId || '');
    setIsReassignModalOpen(true);
  };

  const handleSaveReassignment = async () => {
    if (!targetEmp) return;
    try {
      await api.patch(`/employees/${targetEmp.id}/department`, {
        departmentId: selectedDeptId || null,
      });
      showSuccess(`Employee "${targetEmp.name}" reassigned successfully.`);
      setIsReassignModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to reassign department.');
    }
  };

  const handleToggleEmpConfirm = (emp) => {
    setEmpToToggle(emp);
    setIsEmpConfirmOpen(true);
  };

  const handleToggleEmpStatus = async () => {
    if (!empToToggle) return;
    const targetStatus = empToToggle.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/employees/${empToToggle.id}/status`, { status: targetStatus });
      showSuccess(`User status changed to ${targetStatus}.`);
      setIsEmpConfirmOpen(false);
      setEmpToToggle(null);
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update user status.');
      setIsEmpConfirmOpen(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-200">
            Organization Setup
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure departments, asset categories, and assign employee roles.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'departments'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          } rounded-t-xl`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'categories'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          } rounded-t-xl`}
        >
          Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'employees'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          } rounded-t-xl`}
        >
          Employee Directory
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        
        {/* TAB A: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-200">Departments</h2>
              <button
                onClick={() => handleOpenDeptModal(null)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-violet-600/10 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Department
              </button>
            </div>

            {loadingDepts ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm mb-4">No departments found.</p>
                <button
                  onClick={() => handleOpenDeptModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                >
                  Create Your First Department
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Department Head</th>
                      <th className="px-6 py-4 font-semibold">Parent Department</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">{dept.name}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {dept.head ? (
                            <div>
                              <p className="text-slate-200 text-sm">{dept.head.name}</p>
                              <span className="text-xs text-slate-500">{dept.head.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">— Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {dept.parent ? dept.parent.name : <span className="text-slate-600 italic">— None</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                              dept.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                            }`}
                          >
                            {dept.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDeptModal(dept)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
                          >
                            Edit
                          </button>
                          {dept.status === 'Active' && (
                            <button
                              onClick={() => handleDeactivateDeptConfirm(dept)}
                              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/10"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB B: ASSET CATEGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-200">Asset Categories</h2>
              <button
                onClick={() => handleOpenCatModal(null)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-violet-600/10 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            </div>

            {loadingCats ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm mb-4">No asset categories found.</p>
                <button
                  onClick={() => handleOpenCatModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                >
                  Create Your First Category
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Custom Fields</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {categories.map((cat) => {
                      const fieldsSummary = cat.fields && typeof cat.fields === 'object'
                        ? Object.entries(cat.fields)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')
                        : null;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200">{cat.name}</td>
                          <td className="px-6 py-4 text-slate-400 max-w-md truncate">
                            {fieldsSummary ? (
                              <code className="text-xs bg-slate-800/80 px-2 py-1 rounded text-violet-300">
                                {fieldsSummary}
                              </code>
                            ) : (
                              <span className="text-slate-600 italic">— None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenCatModal(cat)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCatConfirm(cat)}
                              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/10"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB C: EMPLOYEE DIRECTORY */}
        {activeTab === 'employees' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-200">Employee Directory</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {/* Search Field */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none placeholder-slate-500 transition-colors"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="AssetManager">Asset Manager</option>
                  <option value="DepartmentHead">Department Head</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            {loadingEmps ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">No employees match the filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Department</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">{emp.name}</td>
                        <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                        <td className="px-6 py-4">
                          {emp.department ? (
                            <span className="text-slate-200">{emp.department}</span>
                          ) : (
                            <span className="text-slate-600 italic">— Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                              emp.role === 'Admin'
                                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                                : emp.role === 'AssetManager'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : emp.role === 'DepartmentHead'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {emp.role === 'AssetManager' ? 'Asset Manager' : emp.role === 'DepartmentHead' ? 'Dept Head' : emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                              emp.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {emp.role !== 'Admin' ? (
                            <>
                              <button
                                onClick={() => handleOpenPromoteModal(emp)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
                              >
                                Promote
                              </button>
                              <button
                                onClick={() => handleOpenReassignModal(emp)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
                              >
                                Reassign Dept
                              </button>
                              <button
                                onClick={() => handleToggleEmpConfirm(emp)}
                                disabled={currentUser?.id === emp.id}
                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                                  emp.status === 'Active'
                                    ? 'bg-red-950/20 hover:bg-red-500/20 text-red-400 border-red-500/10'
                                    : 'bg-emerald-950/20 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-600 italic">No actions allowed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────────── */}

      {/* A1. Add/Edit Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering, human Resources"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Department Head
            </label>
            <select
              value={deptForm.headId}
              onChange={(e) => setDeptForm({ ...deptForm, headId: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
            >
              <option value="">Unassigned</option>
              {employees
                .filter((emp) => emp.status === 'Active')
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Parent Department
            </label>
            <select
              value={deptForm.parentId}
              onChange={(e) => setDeptForm({ ...deptForm, parentId: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
            >
              <option value="">None (Top Level)</option>
              {departments
                // Filter out itself when editing to prevent trivial self-loops
                .filter((d) => !editingDept || d.id !== editingDept.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Status
            </label>
            <select
              value={deptForm.status}
              onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* A2. Confirm Deactivate Department */}
      <Modal
        isOpen={isDeptConfirmOpen}
        onClose={() => setIsDeptConfirmOpen(false)}
        title="Confirm Deactivation"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to deactivate the department{' '}
            <strong className="text-slate-100">"{deptToDeactivate?.name}"</strong>?
          </p>
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-normal">
            <strong>Warning:</strong> Deactivating is a soft delete. Existing assets and users associated with this department will remain linked, but new assignments or associations will be blocked.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeptConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivateDept}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-red-600/10"
            >
              Deactivate Department
            </button>
          </div>
        </div>
      </Modal>

      {/* B1. Add/Edit Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? 'Edit Asset Category' : 'Add Asset Category'}
        size="lg"
      >
        <form onSubmit={handleSaveCat} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electronics, Office furniture, Company Vehicles"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Custom Fields
              </label>
              <button
                type="button"
                onClick={handleAddField}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Field
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Add category-specific parameters (e.g. warrantyPeriodMonths, maintenanceFrequencyMonths). Keys should be camelCase.
            </p>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {customFields.map((field, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Field name (e.g. warranty)"
                    value={field.key}
                    onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Default Value (e.g. 12)"
                    value={field.value}
                    onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    disabled={customFields.length === 1 && !field.key && !field.value}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              {editingCat ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* B2. Confirm Delete Category */}
      <Modal
        isOpen={isCatConfirmOpen}
        onClose={() => setIsCatConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to permanently delete the asset category{' '}
            <strong className="text-slate-100">"{catToDelete?.name}"</strong>?
          </p>
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-normal">
            <strong>Warning:</strong> This action cannot be undone. You can only delete categories that have no assets assigned.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCatConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCat}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-red-600/10"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>

      {/* C1. Promote Employee Modal */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title={`Change Role for ${targetEmp?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
            >
              <option value="Employee">Employee</option>
              <option value="DepartmentHead">Department Head</option>
              <option value="AssetManager">Asset Manager</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              onClick={() => setIsPromoteModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePromotion}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              Update Role
            </button>
          </div>
        </div>
      </Modal>

      {/* C2. Reassign Department Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title={`Reassign Department for ${targetEmp?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Select Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none transition-colors cursor-pointer"
            >
              <option value="">Unassigned (No Department)</option>
              {departments
                .filter((d) => d.status === 'Active')
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReassignment}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              Update Department
            </button>
          </div>
        </div>
      </Modal>

      {/* C3. Confirm Toggle Employee Status */}
      <Modal
        isOpen={isEmpConfirmOpen}
        onClose={() => setIsEmpConfirmOpen(false)}
        title="Confirm User Status Change"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to {empToToggle?.status === 'Active' ? 'deactivate' : 'activate'} the employee{' '}
            <strong className="text-slate-100">"{empToToggle?.name}"</strong>?
          </p>
          {empToToggle?.status === 'Active' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-normal">
              <strong>Note:</strong> Deactivating an account will prevent the employee from logging in or making requests. Active allocations and bookings will remain.
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEmpConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleToggleEmpStatus}
              className={`px-4 py-2 text-white text-sm font-semibold rounded-xl transition-colors shadow-md ${
                empToToggle?.status === 'Active'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/10'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
