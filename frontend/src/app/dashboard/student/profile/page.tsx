'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { DashboardShell } from '../../../../components/dashboard/DashboardShell';
import { useAuth } from '../../../../context/AuthContext';
import { apiFetch } from '../../../../utils/api';
import { StudentProfileData } from '../../../../types/university';
import {
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  GraduationCap,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const res = await apiFetch<StudentProfileData>('/students/me');
      if (res.success && res.data) {
        setProfile(res.data);
        setPhone(res.data.phone || '');
        setAddress(res.data.address || '');
        setDateOfBirth(
          res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : ''
        );
        setGender(res.data.gender || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await apiFetch<StudentProfileData>('/students/me', {
      method: 'PUT',
      data: {
        phone: phone.trim(),
        address: address.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      },
    });

    if (res.success && res.data) {
      setProfile(res.data);
      setSuccessMessage('Profile contact details updated successfully.');
      await refreshUser();
    } else {
      setErrorMessage(res.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardShell role="student" title="My Academic Profile">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading student profile...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Badge */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-brand-50 dark:ring-slate-800 shrink-0">
                {user?.firstName[0]}{user?.lastName[0]}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {user?.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile?.enrollmentStatus || 'Active Student'}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {profile?.program || 'BS Computer Science'} &bull; Department of{' '}
                  {profile?.department?.name || 'Computer Science'}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
                    Student ID: <strong className="text-slate-800 dark:text-slate-200">{profile?.studentId}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {successMessage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Grid: Immutable University Records & Editable Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Immutable Official Academic Credentials */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Institutional Records (Read-Only)
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <span className="block text-slate-400 font-medium">Student Registration Number</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {profile?.studentId || 'Pending Assignment'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Registered Academic Degree</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {profile?.program || 'BS Computer Science'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Faculty & Department</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {profile?.department?.name || 'Department of Computer Science'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Admission Cohort Year</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {profile?.admissionYear || 2026}
                    </p>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Active Semester Cycle</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {profile?.semester?.name || 'Fall 2026'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Editable Student Contact Information Form */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <UserIcon className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Contact & Personal Information
                  </h3>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="studentPhone"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
                    >
                      Contact Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="studentPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div>
                    <label
                      htmlFor="studentAddress"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
                    >
                      Residential Address
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        id="studentAddress"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street Address, City, Postal Code"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="studentDob"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
                    >
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        id="studentDob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="studentGender"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5"
                    >
                      Gender
                    </label>
                    <select
                      id="studentGender"
                      value={gender}
                      onChange={(e) =>
                        setGender(e.target.value as 'male' | 'female' | 'other')
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60 transition-all shadow-md shadow-brand-500/20"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
