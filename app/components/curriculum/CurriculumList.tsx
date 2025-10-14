"use client";

import { useState, useEffect } from 'react';

interface Lesson {
  title: string;
  duration: string;
  type: 'youtube' | 'online-meeting';
  url: string;
}

interface CurriculumListProps {
  courseId: string;
  curriculum: Lesson[];
  userId?: string;
  email?: string;
  onLessonSelect?: (lesson: Lesson, index: number) => void;
  className?: string;
}

export default function CurriculumList({
  courseId,
  curriculum,
  userId,
  email,
  onLessonSelect,
  className = ""
}: CurriculumListProps) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const handleLessonClick = (lesson: Lesson, index: number) => {
    setSelectedLesson(index);
    onLessonSelect?.(lesson, index);
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url: string): string => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'fab fa-youtube';
      case 'online-meeting':
        return 'fas fa-video';
      default:
        return 'fas fa-play-circle';
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'YouTube Video';
      case 'online-meeting':
        return 'Online Meeting';
      default:
        return 'Bài học';
    }
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div className={`curriculum-list ${className}`}>
        <div className="empty-curriculum">
          <i className="fas fa-graduation-cap"></i>
          <p>Chưa có chương trình học nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`curriculum-list ${className}`}>
      <div className="curriculum-header">
        <h3>Chương trình học</h3>
        <span className="lesson-count">{curriculum.length} bài học</span>
      </div>
      
      <div className="lessons-container">
        {curriculum.map((lesson, index) => (
          <div
            key={index}
            className={`lesson-card ${selectedLesson === index ? 'selected' : ''}`}
            onClick={() => handleLessonClick(lesson, index)}
          >
            <div className="lesson-number">
              {index + 1}
            </div>
            
            <div className="lesson-content">
              <div className="lesson-header">
                <h4 className="lesson-title">{lesson.title}</h4>
              </div>
              
              <div className="lesson-meta">
                <span className="lesson-duration">
                  <i className="fas fa-clock"></i>
                  {lesson.duration}
                </span>
                {lesson.type === 'youtube' && (
                  <span className="lesson-thumbnail">
                    <img 
                      src={getThumbnailUrl(lesson.url)} 
                      alt={lesson.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </span>
                )}
              </div>
              
              {lesson.type === 'online-meeting' && (
                <div className="meeting-info">
                  <i className="fas fa-link"></i>
                  <span>Link tham gia sẵn sàng</span>
                </div>
              )}
            </div>
            
            <div className="lesson-action">
              <i className="fas fa-play-circle"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
