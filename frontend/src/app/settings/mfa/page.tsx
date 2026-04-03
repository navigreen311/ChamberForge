'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface MFAStatus {
  mfa_enabled: boolean;
}

interface MFASetupData {
  secret: string;
  provisioning_uri: string;
  qr_code_base64: string;
}

interface MFAEnableResult {
  enabled: boolean;
  backup_codes: string[];
}

export default function MFASettingsPage() {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get<MFAStatus>('/api/v1/mfa/status');
      setStatus(data);
    } catch {
      setError('Failed to load MFA status');
    }
  };

  const handleSetup = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post<MFASetupData>('/api/v1/mfa/setup');
      setSetupData(data);
    } catch {
      setError('Failed to generate MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post<MFAEnableResult>('/api/v1/mfa/verify', {
        code,
      });
      setBackupCodes(data.backup_codes);
      setSetupData(null);
      setCode('');
      setSuccess('MFA enabled successfully. Save your backup codes below.');
      await fetchStatus();
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/v1/mfa/disable', { code: disableCode });
      setDisableCode('');
      setBackupCodes([]);
      setSuccess('MFA has been disabled.');
      await fetchStatus();
    } catch {
      setError('Invalid code. MFA was not disabled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="font-display text-2xl font-bold text-white">
        Multi-Factor Authentication
      </h1>
      <p className="text-sm text-chamber-400">
        Add an extra layer of security to your account with TOTP-based
        two-factor authentication.
      </p>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 px-4 py-2.5 text-sm text-green-300">
          {success}
        </div>
      )}

      {/* Status display */}
      {status && (
        <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Status</h2>
              <p className="text-sm text-chamber-400">
                {status.mfa_enabled
                  ? 'MFA is enabled on your account'
                  : 'MFA is not enabled'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status.mfa_enabled
                  ? 'bg-green-900/50 text-green-300'
                  : 'bg-chamber-800 text-chamber-400'
              }`}
            >
              {status.mfa_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      )}

      {/* Setup flow (when MFA is not enabled) */}
      {status && !status.mfa_enabled && !setupData && (
        <Button
          variant="primary"
          size="md"
          loading={loading}
          onClick={handleSetup}
        >
          Set up MFA
        </Button>
      )}

      {/* QR code and verification */}
      {setupData && (
        <div className="space-y-4 rounded-xl border border-chamber-800 bg-chamber-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Scan QR Code with your authenticator app
          </h2>
          <div className="flex justify-center rounded-lg bg-white p-4">
            <img
              src={`data:image/png;base64,${setupData.qr_code_base64}`}
              alt="MFA QR Code"
              width={200}
              height={200}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-chamber-500">
              Or enter this secret manually:
            </p>
            <code className="mt-1 inline-block rounded bg-chamber-800 px-3 py-1 font-mono text-sm text-gold-400">
              {setupData.secret}
            </code>
          </div>
          <div className="space-y-2">
            <Input
              label="Verification code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleVerify}
              className="w-full"
            >
              Verify and Enable
            </Button>
          </div>
        </div>
      )}

      {/* Backup codes display */}
      {backupCodes.length > 0 && (
        <div className="space-y-3 rounded-xl border border-gold-800 bg-gold-900/10 p-6">
          <h2 className="text-lg font-semibold text-gold-400">
            Backup Codes
          </h2>
          <p className="text-sm text-chamber-400">
            Save these codes in a secure location. Each code can only be used
            once.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((bc) => (
              <code
                key={bc}
                className="rounded bg-chamber-800 px-3 py-2 text-center font-mono text-sm text-white"
              >
                {bc}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Disable flow (when MFA is enabled) */}
      {status?.mfa_enabled && (
        <div className="space-y-3 rounded-xl border border-red-900/50 bg-chamber-900 p-6">
          <h2 className="text-lg font-semibold text-white">Disable MFA</h2>
          <p className="text-sm text-chamber-400">
            Enter your current TOTP code to disable multi-factor
            authentication.
          </p>
          <Input
            label="Current TOTP code"
            type="text"
            placeholder="Enter 6-digit code"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            maxLength={6}
          />
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleDisable}
            className="w-full bg-red-700 hover:bg-red-600"
          >
            Disable MFA
          </Button>
        </div>
      )}
    </div>
  );
}
