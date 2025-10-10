'use client';

import React from 'react';

const CourseCardSkeleton: React.FC = () => {
  return (
    <div 
      style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        animation: 'pulse 2s infinite'
      }}
    >
      {/* Thumbnail Skeleton */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(90deg, var(--surface-variant) 25%, var(--border) 50%, var(--surface-variant) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />

      {/* Content Skeleton */}
      <div style={{ 
        padding: '20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Category & Level Skeleton */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            height: '24px',
            width: '80px',
            background: 'var(--surface-variant)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            height: '24px',
            width: '70px',
            background: 'var(--surface-variant)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }} />
        </div>

        {/* Title Skeleton */}
        <div style={{
          height: '20px',
          width: '90%',
          background: 'var(--surface-variant)',
          borderRadius: '4px',
          marginBottom: '4px',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '20px',
          width: '70%',
          background: 'var(--surface-variant)',
          borderRadius: '4px',
          animation: 'pulse 2s infinite'
        }} />

        {/* Description Skeleton */}
        <div style={{
          height: '16px',
          width: '100%',
          background: 'var(--surface-variant)',
          borderRadius: '4px',
          marginBottom: '4px',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '16px',
          width: '85%',
          background: 'var(--surface-variant)',
          borderRadius: '4px',
          animation: 'pulse 2s infinite'
        }} />

        {/* Stats Skeleton */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <div style={{
            height: '16px',
            width: '80px',
            background: 'var(--surface-variant)',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            height: '16px',
            width: '90px',
            background: 'var(--surface-variant)',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }} />
        </div>

        {/* Price and Action Skeleton */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{
            height: '24px',
            width: '100px',
            background: 'var(--surface-variant)',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            height: '36px',
            width: '120px',
            background: 'var(--surface-variant)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseCardSkeleton;


