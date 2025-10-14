"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function YouTubeAuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'unknown_error');
  }, [searchParams]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'access_denied':
        return {
          title: 'Truy cập bị từ chối',
          message: 'Bạn đã hủy quá trình xác thực YouTube. Vui lòng thử lại nếu bạn muốn xem video.',
          icon: 'fas fa-times-circle'
        };
      case 'missing_code':
        return {
          title: 'Thiếu mã xác thực',
          message: 'Không nhận được mã xác thực từ YouTube. Vui lòng thử lại.',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'missing_state':
        return {
          title: 'Thiếu thông tin trạng thái',
          message: 'Không nhận được thông tin trạng thái. Vui lòng thử lại.',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'invalid_state':
        return {
          title: 'Thông tin trạng thái không hợp lệ',
          message: 'Thông tin trạng thái không hợp lệ. Vui lòng thử lại.',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'callback_failed':
        return {
          title: 'Lỗi xử lý xác thực',
          message: 'Có lỗi xảy ra trong quá trình xử lý xác thực. Vui lòng thử lại.',
          icon: 'fas fa-exclamation-triangle'
        };
      default:
        return {
          title: 'Lỗi xác thực YouTube',
          message: 'Có lỗi xảy ra trong quá trình xác thực YouTube. Vui lòng thử lại.',
          icon: 'fas fa-exclamation-triangle'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
        <div className="error-icon mb-6">
          <i className={`${errorInfo.icon} text-6xl text-red-500`}></i>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {errorInfo.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          {errorInfo.message}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </button>
          
          <Link
            href="/my-courses"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            <i className="fas fa-graduation-cap mr-2"></i>
            Về trang khóa học
          </Link>
          
          <Link
            href="/"
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            <i className="fas fa-home mr-2"></i>
            Về trang chủ
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Cần hỗ trợ?
          </p>
          <a
            href="mailto:support@3diot.vn"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            <i className="fas fa-envelope mr-1"></i>
            support@3diot.vn
          </a>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeAuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải...</p>
        </div>
      </div>
    }>
      <YouTubeAuthErrorContent />
    </Suspense>
  );
}
