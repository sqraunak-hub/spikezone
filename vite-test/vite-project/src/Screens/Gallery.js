import React, { useState, useEffect } from "react";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "../Assets/CSS/gallery.css";
import PageTitle from "../Components/PageTitle";
import SEOHelmet from "../Components/SEOHelmet";
import { API_BASE_URL } from "../Utils/appConstant";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}gallery/`)
      .then((response) => {
        const galleryData = response.data.map((item) => ({
          src: item.image,
          title: item.image_title,
          description: item.image_description,
        }));
        setPhotos(galleryData);
      })
      .catch((error) => {
        console.error("Error fetching gallery data:", error);
      });
  }, []);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      <SEOHelmet />
      <PageTitle title="Gallery" />
      <div className="modern-gallery-container">
        <div className="modern-gallery-grid">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="modern-gallery-item"
              onClick={() => openLightbox(index)}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="modern-gallery-img"
              />
              <div className="modern-gallery-caption">
                <h5>{photo.title}</h5>
              </div>
            </div>
          ))}
        </div>

        {isOpen && (
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            index={currentIndex}
            slides={photos}
            render={{
              slide: ({ slide }) => (
                <div className="custom-slide">
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="custom-slide-img"
                  />
                  <div className="custom-slide-caption">
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </div>
                </div>
              ),
            }}
          />
        )}
      </div>
    </>
  );
}
