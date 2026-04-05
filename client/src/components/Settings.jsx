import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import { userApiService, checkoutService } from '../services/api';

const inputSx = {
  width: '100%',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-1)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '12px 16px',
  outline: 'none',
  transition: 'border-color var(--transition)',
  boxSizing: 'border-box',
  '&::placeholder': { color: 'var(--text-4)' },
  '&:focus': { borderColor: 'var(--emerald)' },
};

const cardSx = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  p: { xs: '20px', sm: '28px' },
  mb: '24px',
};

const btnPrimarySx = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  color: '#fff',
  background: 'var(--emerald)',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '10px 24px',
  cursor: 'pointer',
  transition: 'opacity var(--transition)',
  '&:hover': { opacity: 0.88 },
  '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
};

const btnOutlineSx = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--text-2)',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '10px 24px',
  cursor: 'pointer',
  transition: 'all var(--transition)',
  '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
};

const FeedbackMessage = ({ type, message }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <Box
      sx={{
        background: isError ? 'var(--red-soft)' : 'var(--emerald-soft)',
        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
        borderRadius: 'var(--radius)',
        padding: '10px 14px',
        fontSize: '13px',
        color: isError ? 'var(--red)' : 'var(--emerald)',
        mt: '16px',
      }}
    >
      {message}
    </Box>
  );
};

const Settings = () => {
  const { user, updateUser, logout } = useAuth();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await userApiService.updateProfile({ name: profileName, email: profileEmail });
      updateUser(res.data.user || { name: profileName, email: profileEmail });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      await userApiService.updatePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwMsg({ type: 'success', text: 'Password updated.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await userApiService.deleteAccount();
      logout();
    } catch (err) {
      setDeleteLoading(false);
      alert(err.message || 'Failed to delete account.');
    }
  };

  const isPro = user?.plan === 'pro';

  return (
    <Box>
      <Box
        component="h1"
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--text-1)',
          letterSpacing: '-0.03em',
          mb: '32px',
        }}
      >
        Settings
      </Box>

      {/* Profile */}
      <Box sx={cardSx}>
        <Box sx={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 600, color: 'var(--text-1)', mb: '20px' }}>
          Profile
        </Box>
        <Box component="form" onSubmit={handleProfileSave} sx={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Name
            </Box>
            <Box component="input" type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} sx={inputSx} />
          </Box>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Email
            </Box>
            <Box component="input" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} sx={inputSx} />
          </Box>
          <Box>
            <Box component="button" type="submit" disabled={profileLoading} sx={btnPrimarySx}>
              {profileLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Save Changes'}
            </Box>
          </Box>
          <FeedbackMessage type={profileMsg.type} message={profileMsg.text} />
        </Box>
      </Box>

      {/* Subscription */}
      <Box sx={cardSx}>
        <Box sx={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 600, color: 'var(--text-1)', mb: '16px' }}>
          Subscription
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '16px' }}>
          <Box sx={{ fontSize: '14px', color: 'var(--text-2)' }}>Current plan:</Box>
          <Box
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              color: isPro ? 'var(--emerald)' : 'var(--text-2)',
              background: isPro ? 'var(--emerald-soft)' : 'var(--bg-elevated)',
              border: `1px solid ${isPro ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)'}`,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </Box>
        </Box>

        {!isPro && (
          <Box sx={{ fontSize: '13px', color: 'var(--text-3)', mb: '16px', lineHeight: 1.6 }}>
            Free plan includes limited screener, 5 watchlist slots, basic fund detail, and 2 fund compare.
          </Box>
        )}

        {isPro ? (
          <Box
            component="button"
            onClick={async () => {
              try {
                const res = await checkoutService.createPortal();
                window.location.href = res.data.url;
              } catch { /* portal unavailable */ }
            }}
            sx={btnOutlineSx}
          >
            Manage Subscription
          </Box>
        ) : (
          <Box
            component="a"
            href="/pricing"
            sx={{
              ...btnPrimarySx,
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
            }}
          >
            Upgrade to Pro
          </Box>
        )}
      </Box>

      {/* Security */}
      <Box sx={cardSx}>
        <Box sx={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 600, color: 'var(--text-1)', mb: '20px' }}>
          Security
        </Box>
        <Box component="form" onSubmit={handlePasswordUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Current Password
            </Box>
            <Box component="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required sx={inputSx} />
          </Box>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              New Password
            </Box>
            <Box component="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required sx={inputSx} />
          </Box>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Confirm New Password
            </Box>
            <Box component="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required sx={inputSx} />
          </Box>
          <Box>
            <Box component="button" type="submit" disabled={pwLoading} sx={btnPrimarySx}>
              {pwLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Update Password'}
            </Box>
          </Box>
          <FeedbackMessage type={pwMsg.type} message={pwMsg.text} />
        </Box>
      </Box>

      {/* Danger zone */}
      <Box sx={{ ...cardSx, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <Box sx={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 600, color: 'var(--red)', mb: '12px' }}>
          Danger Zone
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)', mb: '16px' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Box>

        {!deleteConfirm ? (
          <Box
            component="button"
            onClick={() => setDeleteConfirm(true)}
            sx={{
              ...btnOutlineSx,
              color: 'var(--red)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              '&:hover': { borderColor: 'var(--red)', background: 'var(--red-soft)' },
            }}
          >
            Delete Account
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Box sx={{ fontSize: '13px', color: 'var(--red)', fontWeight: 500 }}>Are you sure?</Box>
            <Box
              component="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              sx={{
                ...btnPrimarySx,
                background: 'var(--red)',
              }}
            >
              {deleteLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Yes, delete'}
            </Box>
            <Box
              component="button"
              onClick={() => setDeleteConfirm(false)}
              sx={btnOutlineSx}
            >
              Cancel
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Settings;
