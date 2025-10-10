'use client';

import React, { useState } from 'react';

interface EnhancedSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  levelFilter: string;
  onLevelChange: (level: string) => void;
  categories: string[];
  levels: string[];
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  levelFilter,
  onLevelChange,
  categories,
  levels
}) => {
  const quickFilters = ['IoT', 'Arduino', 'ESP32', 'Python', 'Embedded'];

  const handleQuickFilter = (filter: string) => {
    if (categoryFilter === filter) {
      onCategoryChange('all');
    } else {
      onCategoryChange(filter);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '30px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      {/* Main Search Bar */}
      <div style={{
        marginBottom: '16px'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '16px',
            color: 'var(--text-muted)',
            fontSize: '16px',
            zIndex: 1
          }} />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học, giảng viên, kỹ năng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'var(--background)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          background: categoryFilter === 'all' ? 'var(--accent)' : 'var(--surface-variant)',
          color: categoryFilter === 'all' ? 'white' : 'var(--text-primary)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid transparent'
        }}
        onClick={() => onCategoryChange('all')}
        onMouseEnter={(e) => {
          if (categoryFilter !== 'all') {
            e.currentTarget.style.background = 'var(--accent-secondary)';
            e.currentTarget.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          if (categoryFilter !== 'all') {
            e.currentTarget.style.background = 'var(--surface-variant)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        >
          Tất cả
        </span>
        {quickFilters.map((filter) => (
          <span
            key={filter}
            style={{
              background: categoryFilter === filter ? 'var(--accent)' : 'var(--surface-variant)',
              color: categoryFilter === filter ? 'white' : 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleQuickFilter(filter)}
            onMouseEnter={(e) => {
              if (categoryFilter !== filter) {
                e.currentTarget.style.background = 'var(--accent-secondary)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (categoryFilter !== filter) {
                e.currentTarget.style.background = 'var(--surface-variant)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
          >
            {filter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EnhancedSearchBar;
