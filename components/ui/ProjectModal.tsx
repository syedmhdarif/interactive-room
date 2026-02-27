'use client';

import { useEffect } from 'react';
import { useScene } from '@/components/providers/SceneProvider';
import { PROJECTS } from '@/lib/projects';

export function ProjectModal() {
  const { showProjectList, setShowProjectList } = useScene();

  const handleClose = () => {
    setShowProjectList(false);
    document.querySelector('canvas')?.requestPointerLock();
  };

  useEffect(() => {
    if (!showProjectList) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProjectList]);

  if (!showProjectList) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 8, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(30, 12, 4, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 180, 80, 0.2)',
          borderRadius: '20px',
          padding: '2rem 2.2rem',
          maxWidth: '640px',
          width: '92%',
          boxShadow: '0 0 80px rgba(255,120,40,0.15), 0 8px 40px rgba(0,0,0,0.6)',
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '1rem',
            lineHeight: 1.5,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <p style={{
          color: 'rgba(255,180,80,0.7)',
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          marginBottom: '0.4rem',
          marginTop: 0,
        }}>
          Projects & Links
        </p>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          marginTop: 0,
          color: '#fff',
        }}>
          What I&apos;ve Built
        </h2>

        {/* Project cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {PROJECTS.map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,180,80,0.15)',
                borderRadius: '12px',
                padding: '1.1rem 1.2rem',
                textDecoration: 'none',
                color: '#fff',
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,180,80,0.4)';
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,180,80,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,180,80,0.15)';
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                }}>
                  {project.title}
                </span>
                <span style={{
                  marginLeft: '6px',
                  color: 'rgba(255,180,80,0.7)',
                  fontSize: '0.8rem',
                }}>
                  ↗
                </span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                margin: '0 0 0.75rem',
              }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{
                    background: 'rgba(255,140,40,0.15)',
                    border: '1px solid rgba(255,140,40,0.2)',
                    borderRadius: '999px',
                    padding: '1px 10px',
                    fontSize: '0.68rem',
                    color: 'rgba(255,200,120,0.8)',
                    fontFamily: 'monospace',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.75rem',
          marginTop: '1.2rem',
          marginBottom: 0,
          fontFamily: 'monospace',
        }}>
          ESC to close
        </p>
      </div>
    </div>
  );
}
