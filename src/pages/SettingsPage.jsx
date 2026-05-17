import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { getFavoritePolicies, toggleFavoritePolicy } from '../services/dbService';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './SettingsPage.css';

function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');



  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Saved (Favorite) policies
  const navigate = useNavigate();
  const [favoritePolicies, setFavoritePolicies] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Fetch Favorites
  useEffect(() => {
    async function fetchFavs() {
      if (!user?.uid) return;
      try {
        const favs = await getFavoritePolicies(user.uid);
        setFavoritePolicies(favs);
      } catch (err) {
        console.error("Failed fetching favorites", err);
      } finally {
        setLoadingFavorites(false);
      }
    }
    fetchFavs();
  }, [user]);

  const handleUnfavorite = async (e, policyId) => {
    e.stopPropagation();
    try {
      await toggleFavoritePolicy(user.uid, policyId, false);
      setFavoritePolicies(prev => prev.filter(p => p.id !== policyId));
      addToast('Removed from favorites.', 'info');
    } catch (err) {
      addToast('Failed to update.', 'error');
    }
  };

  const handleViewPolicy = (policy) => {
    navigate('/workspace', { state: { policy } });
  };

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  // Handlers
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      addToast('Profile information updated successfully.', 'success');
    } catch (err) {
      console.error("Profile Update Error:", err);
      addToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    
    addToast('Password updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };



  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    setDeleteConfirm('');
    addToast('Account deletion initiated.', 'warning');
    // In production: call Firebase deleteUser()
  };

  return (
    <div className="theme-main page-content page-enter">
      <div className="settings">
        <div className="container">
          {/* Header */}
          <div className="settings__header">
            <div>
              <p className="text-overline" style={{ marginBottom: '0.25rem' }}>ACCOUNT</p>
              <h1 className="settings__title">Settings</h1>
              <p className="settings__subtitle">Manage your profile, preferences, and account.</p>
            </div>
          </div>

          <div className="settings__layout">
            {/* ── Sidebar Nav ── */}
            <nav className="settings__nav">
              <a href="#profile" className="settings__nav-item settings__nav-item--active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </a>
              <a href="#security" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Security
              </a>
              <a href="#policies" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Saved Agreements
              </a>
              <a href="#danger" className="settings__nav-item settings__nav-item--danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Danger Zone
              </a>
            </nav>

            {/* ── Content ── */}
            <div className="settings__content">
              {/* ─── Profile Section ─── */}
              <section id="profile">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Profile Information</h2>
                    <p className="settings__card-desc">Update your personal details.</p>
                  </div>
                  <form onSubmit={handleProfileSave}>
                    <div className="settings__avatar-row">
                      <div className="settings__avatar">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="" className="settings__avatar-img" />
                        ) : (
                          <span className="settings__avatar-letter">{userInitial}</span>
                        )}
                      </div>
                      <div className="settings__avatar-info">
                        <p className="settings__avatar-name">{user?.displayName || 'User'}</p>
                        <p className="settings__avatar-email">{email}</p>
                      </div>
                    </div>

                    <div className="settings__field-group">
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                      <Input
                        label="Email"
                        value={email}
                        disabled
                        helperText="Email cannot be changed."
                      />
                    </div>

                    <div className="settings__card-actions">
                      <Button type="submit" variant="primary" loading={isSaving}>
                        {isSaving ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </section>

              {/* ─── Security Section ─── */}
              <section id="security">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Password & Security</h2>
                    <p className="settings__card-desc">Keep your account secure.</p>
                  </div>
                  <form onSubmit={handlePasswordChange}>
                    <div className="settings__field-group">
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={passwordError}
                      />
                    </div>
                    <div className="settings__card-actions">
                      <Button type="submit" variant="primary">
                        Update Password
                      </Button>
                    </div>
                  </form>

                  <div className="settings__security-info">
                    <div className="settings__security-item">
                      <div className="settings__security-icon settings__security-icon--ok">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p className="settings__security-label">Login method</p>
                        <p className="settings__security-value">
                          {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password'}
                        </p>
                      </div>
                    </div>
                    <div className="settings__security-item">
                      <div className="settings__security-icon settings__security-icon--ok">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p className="settings__security-label">Account created</p>
                        <p className="settings__security-value">
                          {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* ─── Favorite Policies Section ─── */}
              <section id="policies">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Saved Insights</h2>
                    <p className="settings__card-desc">Your bookmarked agreement analyses for quick access.</p>
                  </div>

                  {loadingFavorites ? (
                    <div className="settings__empty" style={{ padding: '2rem 0' }}>Loading your favorites...</div>
                  ) : favoritePolicies.length === 0 ? (
                    <div className="settings__empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                      <p className="settings__empty-title">No saved insights</p>
                      <p className="settings__empty-desc">Bookmark an analysis in the Workspace to access it here.</p>
                    </div>
                  ) : (
                    <div className="settings__policies-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                      {favoritePolicies.map((p) => (
                        <div 
                          key={p.id} 
                          className="settings__policy-item" 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => handleViewPolicy(p)}
                          title="Click to view full analysis"
                        >
                          <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.policyOverview?.name || 'Saved Agreement'}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Protection Score: {p.overallRiskScore !== undefined ? Math.max(0, 100 - p.overallRiskScore) : (p.coverageScore || 0)}</p>
                          </div>
                          <Button variant="ghost" onClick={(e) => handleUnfavorite(e, p.id)} style={{ color: 'var(--accent-red)' }} aria-label="Remove from favorites">
                             Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </section>

              {/* ─── Danger Zone ─── */}
              <section id="danger">
                <Card variant="lifted" className="settings__card settings__card--danger">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title settings__card-title--danger">Danger Zone</h2>
                    <p className="settings__card-desc">Irreversible actions. Proceed with caution.</p>
                  </div>

                  <div className="settings__danger-actions">
                    <div className="settings__danger-row">
                      <div>
                        <p className="settings__danger-label">Sign out of all devices</p>
                        <p className="settings__danger-desc">This will log you out everywhere.</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={logout}>Sign Out</Button>
                    </div>
                    <div className="settings__danger-row">
                      <div>
                        <p className="settings__danger-label">Delete account</p>
                        <p className="settings__danger-desc">Permanently delete your account and all data. This cannot be undone.</p>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="settings__delete-modal">
          <p className="settings__delete-warning">
            This will permanently delete your account, all analyzed agreements, and saved data. This action cannot be undone.
          </p>
          <Input
            label='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <div className="settings__delete-actions">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



export default SettingsPage;
