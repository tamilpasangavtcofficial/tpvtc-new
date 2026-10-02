import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import './AlbumView.css';

const AlbumView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`/api/images/albums/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAlbum(data);
        } else {
          navigate('/albums');
        }
      } catch (err) {
        console.error('Failed to load album:', err);
        navigate('/albums');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id, navigate]);

  // Handle escape key for fullscreen image
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <div className="album-view-page loading">Loading Album...</div>;
  }

  if (!album) return null;

  return (
    <div className="album-view-page">
      <div className="album-view-header">
        <button className="btn-back" onClick={() => navigate('/albums')}>
          <ArrowLeft size={20} /> Back to Albums
        </button>
        <div className="header-content">
          <h4 className="overline">Event Gallery</h4>
          <h1 className="display-title">{album.title}</h1>
        </div>
      </div>

      <div className="bento-container">
        {album.images && album.images.length > 0 ? (
          <div className="bento-grid">
            {album.images.map((img, index) => {
              // Create dynamic sizes based on index to form a nice bento box layout
              let sizeClass = 'bento-item-regular';
              if (index % 5 === 0) sizeClass = 'bento-item-large'; // large square
              else if (index % 7 === 0) sizeClass = 'bento-item-tall'; // tall rectangle
              else if (index % 4 === 0) sizeClass = 'bento-item-wide'; // wide rectangle

              return (
                <div 
                  key={img.id} 
                  className={`bento-item ${sizeClass}`}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <div className="bento-image-wrapper">
                    <img src={img.image_url} alt={`Gallery Image ${index + 1}`} loading="lazy" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-images-state glass-panel">No images have been uploaded to this album yet.</div>
        )}
      </div>

      {/* Fullscreen Image Viewer Modal */}
      {selectedImage && (
        <div className="fullscreen-viewer" onClick={() => setSelectedImage(null)}>
          <button className="btn-close fullscreen-close" onClick={() => setSelectedImage(null)}>
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Fullscreen view" className="fullscreen-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default AlbumView;
