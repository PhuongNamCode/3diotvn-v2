"use client";

import { useState } from "react";

interface AdminLoginTabProps {
  onLogin: (adminData: { name: string; email: string; role: string; avatar: string }) => void;
}

export default function AdminLoginTab({ onLogin }: AdminLoginTabProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Authenticate with API
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const result = await response.json();

      if (result.success) {
        onLogin({
          name: result.data.name || "Admin User",
          email: result.data.email || "admin@3diot.vn",
          role: result.data.role || "Super Admin",
          avatar: result.data.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        });
      } else {
        setError(result.error || "Thông tin đăng nhập không chính xác!");
      }
    } catch (err) {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="login-title">Admin Dashboard</h1>
          <p className="login-subtitle">3DIoT Management System</p>
        </div>

        <div className="demo-credentials">
          <h4><i className="fas fa-key"></i> Demo Credentials</h4>
          <p><strong>Username:</strong> admin<br /><strong>Password:</strong> admin123</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                disabled={isLoading}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="checkbox-group">
            <input type="checkbox" id="rememberMe" name="rememberMe" />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <i className="fas fa-info-circle"></i>
            Chỉ dành cho quản trị viên hệ thống
          </p>
        </div>
      </div>
    </div>
  );
}
