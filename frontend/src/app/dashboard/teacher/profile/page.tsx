'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { apiFetch } from '../../../../utils/api';
import { TeacherProfileData } from '../../../../types/university';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    const res = await apiFetch<TeacherProfileData>('/teachers/me');
    if (res.success && res.data) {
      setProfile(res.data);
      setPhone(res.data.phone || '');
      setAddress(res.data.address || '');
      setSpecialization(res.data.specialization || '');
      setQualification(res.data.qualification || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await apiFetch<TeacherProfileData>('/teachers/me', {
      method: 'PUT',
      body: JSON.stringify({
        phone: phone.trim(),
        address: address.trim(),
        specialization: specialization.trim(),
        qualification: qualification.trim(),
      }),
    });

    setSaving(false);

    if (res.success && res.data) {
      setProfile(res.data);
      setSuccessMessage('Faculty profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.message || 'Failed to update profile.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardShell role="teacher" title="Faculty Profile">
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Faculty Academic Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View official university appointments and update contact & research credentials
            </p>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-sm">Loading profile data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Official Locked Credentials */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                    {profile?.user?.firstName?.[0]}
                    {profile?.user?.lastName?.[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {profile?.user?.firstName} {profile?.user?.lastName}
                    </h2>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {profile?.designation}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {profile?.teacherId}
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    Institutional Record
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Department</span>
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        {profile?.department?.name || 'Department of Computer Science'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Official Email</span>
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        {profile?.user?.email}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Employment Status</span>
                      <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 capitalize mt-0.5">
                        {profile?.employmentStatus || 'Active'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Joining Date</span>
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {profile?.joiningDate
                          ? new Date(profile.joiningDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Contact & Research Credentials */}
              <div className="lg:col-span-2">
                <form
                  onSubmit={handleSave}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Academic & Contact Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      You can modify your phone, address, qualification, and research specialization
                    </p>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Highest Qualification
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          placeholder="e.g. Ph.D. in Computer Engineering, Stanford University"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Research Specialization
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Distributed Systems, Cloud Architecture, ML Systems"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Campus Office / Residential Address
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <textarea
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Faculty Office 302, Academic Block B..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
