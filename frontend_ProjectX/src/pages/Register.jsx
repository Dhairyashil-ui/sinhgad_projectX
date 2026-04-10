import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Briefcase, AlertCircle, Flame,
  ArrowRight, ShieldAlert, CheckCircle, ArrowLeft,
  CreditCard, MapPin, Building2
} from 'lucide-react';
import { registerUser } from '../utils/api';
import { getDeviceId, getDeviceBrand } from '../utils/deviceInfo';
import './Login.css';

export default function Register() {
  const [role, setRole]     = useState('customer');
  const [form, setForm]     = useState({
    name: '', email: '', password: '',
    businessName: '', gstin: '', pan: '', fssai: '',
    bankDetails: '', addressProof: '', upiId: ''
  });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('projectx_token');
    const r     = localStorage.getItem('projectx_role');
    if (token && r) {
      if (r === 'super_admin') navigate('/super-admin');
      else if (r === 'admin')  navigate('/admin');
      else                     navigate('/customer');
    }
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault(); setError(null);
    if (!form.name || !form.email || !form.password)
      return setError('Name, email, and password are required.');
    if (role === 'admin') {
      if (!form.businessName) return setError('Business Name is required.');
      if (!form.gstin)        return setError('GSTIN is mandatory for sellers.');
      if (!form.pan)          return setError('PAN is mandatory for sellers.');
      if (!form.fssai)        return setError('FSSAI License number is mandatory.');
      if (!form.bankDetails)  return setError('Bank Account Details are required for payouts.');
      if (!form.upiId)        return setError('UPI ID is required for payouts.');
      if (!form.addressProof) return setError('Address Proof is required.');
    }
    setLoading(true);
    try {
      const res = await registerUser({ ...form, role, deviceId: getDeviceId(), deviceBrand: getDeviceBrand() });
      setSuccess(res.data.message);
      if (role === 'customer' && res.data.token) {
        localStorage.setItem('projectx_token', res.data.token);
        localStorage.setItem('projectx_role', res.data.role);
        setTimeout(() => navigate('/customer'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── helpers ── */
  const Field = ({ label, icon: Icon, id, type = 'text', placeholder, value, onChange, mono }) => (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon"><Icon size={14} /></span>
        <input id={id} type={type} className={`auth-input${mono ? ' auth-otp-input' : ''}`}
          placeholder={placeholder} value={value} onChange={onChange} />
      </div>
    </div>
  );

  const TextareaField = ({ label, id, placeholder, value, onChange }) => (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <textarea id={id} rows={2} className="auth-input"
        style={{ height: 'auto', paddingTop: '0.65rem', paddingBottom: '0.65rem', resize: 'vertical', paddingLeft: '1rem' }}
        placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="auth-page">
      {/* ── Left Panel ─────────────────────── */}
      <div className="auth-panel">
        <img src="/auth-banner.png" alt="QuickBite" />
        <div className="auth-panel-overlay">
        </div>
      </div>

      {/* ── Right Form ─────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-form-box" style={{ maxWidth: role === 'admin' ? '540px' : '380px' }}>
          
          <div className="auth-brand-row">
            <div className="auth-brand-dot"><Flame size={18} color="#fff" strokeWidth={2.5} /></div>
            <span className="auth-brand-label">QuickBite</span>
          </div>

          <h1 className="auth-heading">Create an account</h1>
          <p className="auth-sub">Set up your profile to customize your experience.</p>

          <div className="auth-role-toggle">
            <button type="button" className={`auth-role-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
              <User size={15} /> Customer
            </button>
            <button type="button" className={`auth-role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
              <Building2 size={15} /> Restaurant Partner
            </button>
          </div>

          {error && (
            <div className="auth-alert error">
              <AlertCircle size={15} /><span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="auth-success-circle">
                <CheckCircle size={34} color="#16a34a" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: '#111' }}>
                {role === 'admin' ? 'Application Submitted!' : 'Account Created!'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{success}</p>
              {role === 'admin' && (
                <button className="btn-auth-secondary" onClick={() => navigate('/')} style={{ marginTop: 0 }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="auth-row-2">
                <Field label="Full Name" icon={User} id="name" placeholder="E.g. Aman" value={form.name} onChange={set('name')} />
                <Field label="Email Address" icon={Mail} id="email" type="email" placeholder="aman@company.com" value={form.email} onChange={set('email')} />
              </div>
              <Field label="Password" icon={Lock} id="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />

              {role === 'admin' && (
                <>
                  <div className="auth-section-title">Business Registration</div>
                  <Field label="Restaurant / Legal Entity Name" icon={Building2} id="businessName" placeholder="Spice Garden Pvt Ltd." value={form.businessName} onChange={set('businessName')} />
                  
                  <div className="auth-row-2">
                    <Field label="GSTIN Number" icon={Briefcase} id="gstin" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))} />
                    <Field label="PAN Card" icon={CreditCard} id="pan" placeholder="ABCDE1234F" value={form.pan} onChange={e => setForm(f => ({ ...f, pan: e.target.value.toUpperCase() }))} />
                  </div>

                  <div className="auth-row-2">
                    <Field label="FSSAI License No." icon={ShieldAlert} id="fssai" placeholder="14-digit FSSAI" value={form.fssai} onChange={set('fssai')} />
                    <Field label="Payout UPI ID" icon={CreditCard} id="upiId" placeholder="merchant@upi" value={form.upiId} onChange={set('upiId')} />
                  </div>

                  <div className="auth-row-2">
                    <TextareaField label="Exact Bank Details" id="bankDetails" placeholder="Bank Name, A/C Number, IFSC Code" value={form.bankDetails} onChange={set('bankDetails')} />
                    <TextareaField label="Warehouse / Premises Address" id="addressProof" placeholder="Attach full operating address proof" value={form.addressProof} onChange={set('addressProof')} />
                  </div>
                </>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn-auth-primary" disabled={loading}>
                  {loading
                    ? <><div className="auth-spinner" /> Processing…</>
                    : <>{role === 'admin' ? 'Submit Registration' : 'Create Account'} <ArrowRight size={15} /></>}
                </button>
              </div>

              <div className="auth-divider" style={{ margin: '1.5rem 0' }}>already have an account?</div>

              <button type="button" className="btn-auth-secondary" style={{ marginTop: 0 }} onClick={() => navigate('/')}>
                Sign in instead
              </button>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <ShieldAlert size={12} /> Google Workspace Level Security &nbsp;·&nbsp; Protected by reCAPTCHA
          </div>
        </div>
      </div>
    </div>
  );
}
