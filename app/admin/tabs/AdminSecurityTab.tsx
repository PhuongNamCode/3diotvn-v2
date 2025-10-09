'use client';

import { useState, useEffect } from 'react';

interface SecurityFormData {
  currentUsername: string;
  currentPassword: string;
  newUsername: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormData {
  username: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  username: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  isCurrent?: boolean;
}

export default function AdminSecurityTab() {
  const [activeSection, setActiveSection] = useState<'credentials' | 'sessions' | 'reset'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showResetPasswords, setShowResetPasswords] = useState({
    new: false,
    confirm: false
  });
  const [currentResetCode, setCurrentResetCode] = useState('');
  const [resetCodeLoading, setResetCodeLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionLoggingOut, setSessionLoggingOut] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SecurityFormData>({
    currentUsername: '',
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [resetFormData, setResetFormData] = useState<ResetPasswordFormData>({
    username: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch current reset code
  useEffect(() => {
    const fetchResetCode = async () => {
      setResetCodeLoading(true);
      try {
        const response = await fetch('/api/admin/reset-code');
        const result = await response.json();
        if (result.success) {
          setCurrentResetCode(result.data.resetCode);
        }
      } catch (error) {
        console.error('Error fetching reset code:', error);
      } finally {
        setResetCodeLoading(false);
      }
    };
    
    fetchResetCode();
  }, []);

  // Fetch sessions
  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await fetch('/api/admin/sessions');
      const result = await response.json();
      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Fetch sessions when sessions tab is active
  useEffect(() => {
    if (activeSection === 'sessions') {
      fetchSessions();
    }
  }, [activeSection]);

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminUser');
    window.location.href = '/admin';
  };

  // Logout all sessions
  const logoutAllSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sessions?clearAll=true', {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          logout();
        }, 1500);
      } else {
        setError(result.error || 'Không thể đăng xuất tất cả phiên');
      }
    } catch (error) {
      setError('Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout specific session
  const logoutSession = async (sessionId: string) => {
    setSessionLoggingOut(sessionId);
    try {
      const response = await fetch(`/api/admin/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        fetchSessions(); // Refresh sessions list
      } else {
        setError(result.error || 'Không thể đăng xuất phiên');
      }
    } catch (error) {
      setError('Không thể kết nối đến server');
    } finally {
      setSessionLoggingOut(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.currentUsername || !formData.currentPassword || !formData.newUsername || !formData.newPassword) {
      return 'Vui lòng điền đầy đủ thông tin';
    }

    if (formData.newUsername.length < 3) {
      return 'Username mới phải có ít nhất 3 ký tự';
    }

    if (formData.newPassword.length < 3) {
      return 'Password mới phải có ít nhất 3 ký tự';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'Password xác nhận không khớp';
    }

    return null;
  };

  const validateResetForm = (): string | null => {
    if (!resetFormData.username || !resetFormData.resetCode || !resetFormData.newPassword || !resetFormData.confirmPassword) {
      return 'Vui lòng điền đầy đủ thông tin';
    }

    if (resetFormData.newPassword.length < 3) {
      return 'Password mới phải có ít nhất 3 ký tự';
    }

    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      return 'Password xác nhận không khớp';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUsername: formData.currentUsername,
          currentPassword: formData.currentPassword,
          newUsername: formData.newUsername,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || 'Thông tin đăng nhập đã được cập nhật thành công! Bạn sẽ được đăng xuất trong 2 giây...');
        setFormData({
          currentUsername: '',
          currentPassword: '',
          newUsername: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Auto logout after successful credential change
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        setError(result.error || 'Có lỗi xảy ra khi cập nhật thông tin đăng nhập');
      }
    } catch (error) {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateResetForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: resetFormData.username,
          resetCode: resetFormData.resetCode,
          newPassword: resetFormData.newPassword,
          confirmPassword: resetFormData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message || 'Password đã được reset thành công!');
        setResetFormData({
          username: '',
          resetCode: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Auto logout after successful reset
        setTimeout(() => {
          localStorage.removeItem('adminUser');
          window.location.href = '/admin';
        }, 2000);
      } else {
        setError(result.error || 'Có lỗi xảy ra khi reset password');
      }
    } catch (error) {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currentUsername: '',
      currentPassword: '',
      newUsername: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const resetResetForm = () => {
    setResetFormData({
      username: '',
      resetCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="admin-security-page">
      <div className="security-header">
        <h2><i className="fas fa-shield-alt"></i> Bảo mật Admin</h2>
        <p>Quản lý thông tin đăng nhập và bảo mật tài khoản admin</p>
      </div>

      <div className="security-nav">
        <button
          className={`security-nav-item ${activeSection === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveSection('credentials')}
        >
          <i className="fas fa-key"></i>
          <span>Thông tin đăng nhập</span>
        </button>
        <button
          className={`security-nav-item ${activeSection === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveSection('sessions')}
        >
          <i className="fas fa-desktop"></i>
          <span>Phiên làm việc</span>
        </button>
        <button
          className={`security-nav-item ${activeSection === 'reset' ? 'active' : ''}`}
          onClick={() => setActiveSection('reset')}
        >
          <i className="fas fa-redo"></i>
          <span>Reset Password</span>
        </button>
      </div>

      {activeSection === 'credentials' && (
        <div className="security-content">
          <div className="security-card">
            <div className="card-header">
              <h3><i className="fas fa-key"></i> Thay đổi thông tin đăng nhập</h3>
              <p>Cập nhật username và password cho tài khoản admin</p>
            </div>

            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="security-form">
              <div className="form-section">
                <h4><i className="fas fa-lock"></i> Thông tin hiện tại</h4>

                <div className="form-group">
                  <label htmlFor="currentUsername">Username hiện tại *</label>
                  <input
                    type="text"
                    id="currentUsername"
                    value={formData.currentUsername}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, currentUsername: e.target.value }));
                      if (error) setError('');
                      if (success) setSuccess('');
                    }}
                    placeholder="Nhập username hiện tại"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentPassword">Password hiện tại *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, currentPassword: e.target.value }));
                        if (error) setError('');
                        if (success) setSuccess('');
                      }}
                      placeholder="Nhập password hiện tại"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      disabled={isLoading}
                    >
                      <i className={`fas fa-${showPasswords.current ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4><i className="fas fa-unlock"></i> Thông tin mới</h4>

                <div className="form-group">
                  <label htmlFor="newUsername">Username mới *</label>
                  <input
                    type="text"
                    id="newUsername"
                    value={formData.newUsername}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, newUsername: e.target.value }));
                      if (error) setError('');
                      if (success) setSuccess('');
                    }}
                    placeholder="Nhập username mới (tối thiểu 3 ký tự)"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Password mới *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                        if (error) setError('');
                        if (success) setSuccess('');
                      }}
                      placeholder="Nhập password mới (tối thiểu 3 ký tự)"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      disabled={isLoading}
                    >
                      <i className={`fas fa-${showPasswords.new ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận password mới *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        if (error) setError('');
                        if (success) setSuccess('');
                      }}
                      placeholder="Nhập lại password mới"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      disabled={isLoading}
                    >
                      <i className={`fas fa-${showPasswords.confirm ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <i className="fas fa-undo"></i>
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Cập nhật thông tin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="security-info-card">
            <h4><i className="fas fa-info-circle"></i> Lưu ý bảo mật</h4>
            <ul>
              <li><i className="fas fa-check"></i> Username phải có ít nhất 3 ký tự</li>
              <li><i className="fas fa-check"></i> Password phải có ít nhất 3 ký tự</li>
              <li><i className="fas fa-check"></i> Sau khi đổi thông tin, bạn cần đăng nhập lại</li>
              <li><i className="fas fa-check"></i> Thông tin đăng nhập được mã hóa an toàn</li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'sessions' && (
        <div className="security-content">
          <div className="security-card">
            <div className="card-header">
              <h3><i className="fas fa-desktop"></i> Quản lý phiên làm việc</h3>
              <p>Quản lý tất cả các phiên đăng nhập admin</p>
            </div>

            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="sessions-actions">
              <button
                className="btn-primary"
                onClick={logoutAllSessions}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt"></i>
                    Đăng xuất tất cả phiên
                  </>
                )}
              </button>
            </div>

            <div className="sessions-info">
              {sessionsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)' }}></i>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải danh sách phiên...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="fas fa-info-circle" style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}></i>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Không có phiên đăng nhập nào</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="session-item">
                    <div className="session-details">
                      <div className="session-title">
                        <i className="fas fa-user"></i>
                        {session.username}
                      </div>
                      <div className="session-meta">
                        <span><i className="fas fa-clock"></i> Tạo: {new Date(session.createdAt).toLocaleString('vi-VN')}</span>
                        <span><i className="fas fa-globe"></i> Browser: {session.userAgent.split(' ')[0]}</span>
                        {session.lastActivity && (
                          <span><i className="fas fa-history"></i> Hoạt động: {new Date(session.lastActivity).toLocaleString('vi-VN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="session-actions">
                      <div className="session-status active">
                        {session.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </div>
                      <button
                        className="btn-secondary"
                        onClick={() => logoutSession(session.id)}
                        disabled={sessionLoggingOut === session.id || isLoading}
                        style={{ marginLeft: '1rem' }}
                      >
                        {sessionLoggingOut === session.id ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times"></i>
                            Đăng xuất
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="security-info-card">
            <h4><i className="fas fa-info-circle"></i> Thông tin phiên</h4>
            <ul>
              <li><i className="fas fa-check"></i> Phiên được bảo mật bằng token</li>
              <li><i className="fas fa-check"></i> Có thể đăng xuất từng phiên hoặc tất cả</li>
              <li><i className="fas fa-check"></i> Theo dõi trình duyệt và thời gian</li>
              <li><i className="fas fa-check"></i> Tự động hết hạn sau thời gian không hoạt động</li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'reset' && (
        <div className="security-content">
          <div className="security-card">
            <div className="card-header">
              <h3><i className="fas fa-redo"></i> Reset Password Admin</h3>
              <p>Sử dụng khi quên password admin. Cần có mã reset hợp lệ.</p>
            </div>

            <div className="reset-info-box">
              <h4><i className="fas fa-info-circle"></i> Thông tin quan trọng</h4>
              <div className="reset-code-info">
                <strong>Mã Reset hiện tại:</strong>
                {resetCodeLoading ? (
                  <code className="reset-code">
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                  </code>
                ) : (
                  <code className="reset-code">{currentResetCode}</code>
                )}
                <small>Thay đổi mã reset trong file .env với biến ADMIN_RESET_CODE</small>
              </div>
            </div>

            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="security-form">
              <div className="form-section">
                <h4><i className="fas fa-user"></i> Thông tin xác thực</h4>

                <div className="form-group">
                  <label htmlFor="resetUsername">Username Admin *</label>
                  <input
                    type="text"
                    id="resetUsername"
                    value={resetFormData.username}
                    onChange={(e) => {
                      setResetFormData(prev => ({ ...prev, username: e.target.value }));
                      if (error) setError("");
                      if (success) setSuccess("");
                    }}
                    placeholder="Nhập username admin"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="resetCode">Mã Reset *</label>
                  <input
                    type="text"
                    id="resetCode"
                    value={resetFormData.resetCode}
                    onChange={(e) => {
                      setResetFormData(prev => ({ ...prev, resetCode: e.target.value }));
                      if (error) setError("");
                      if (success) setSuccess("");
                    }}
                    placeholder="Nhập mã reset"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4><i className="fas fa-key"></i> Password mới</h4>

                <div className="form-group">
                  <label htmlFor="resetNewPassword">Password mới *</label>
                  <div className="password-field">
                    <input
                      type={showResetPasswords.new ? "text" : "password"}
                      id="resetNewPassword"
                      value={resetFormData.newPassword}
                      onChange={(e) => {
                        setResetFormData(prev => ({ ...prev, newPassword: e.target.value }));
                        if (error) setError("");
                        if (success) setSuccess("");
                      }}
                      placeholder="Nhập password mới (tối thiểu 3 ký tự)"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowResetPasswords(prev => ({ ...prev, new: !prev.new }))}
                      disabled={isLoading}
                    >
                      <i className={`fas fa-${showResetPasswords.new ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="resetConfirmPassword">Xác nhận password mới *</label>
                  <div className="password-field">
                    <input
                      type={showResetPasswords.confirm ? "text" : "password"}
                      id="resetConfirmPassword"
                      value={resetFormData.confirmPassword}
                      onChange={(e) => {
                        setResetFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        if (error) setError("");
                        if (success) setSuccess("");
                      }}
                      placeholder="Nhập lại password mới"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowResetPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      disabled={isLoading}
                    >
                      <i className={`fas fa-${showResetPasswords.confirm ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetResetForm}
                  disabled={isLoading}
                >
                  <i className="fas fa-undo"></i>
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo"></i>
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="security-info-card">
            <h4><i className="fas fa-exclamation-triangle"></i> Cảnh báo bảo mật</h4>
            <ul>
              <li><i className="fas fa-warning"></i> Chỉ sử dụng khi thực sự quên password</li>
              <li><i className="fas fa-warning"></i> Mã reset sẽ được thay đổi định kỳ</li>
              <li><i className="fas fa-warning"></i> Sau khi reset, bạn sẽ bị đăng xuất tự động</li>
              <li><i className="fas fa-warning"></i> Không chia sẻ mã reset với người khác</li>
              <li><i className="fas fa-warning"></i> Liên hệ developer nếu cần thay đổi mã reset</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}