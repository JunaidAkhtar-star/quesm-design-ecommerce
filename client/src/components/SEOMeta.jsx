import React, { useEffect } from 'react';

const SEOMeta = ({ title, description, image, canonical, jsonLd }) => {
  useEffect(() => {
    // Update Title
    if (title) {
      document.title = `${title} | QueS.M design`;
    }

    // Helper to update or create meta tag
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    if (description) {
      updateMeta('description', description);
      updateMeta('og:description', description, true);
      updateMeta('twitter:description', description);
    }

    if (title) {
      updateMeta('og:title', `${title} | QueS.M design`, true);
      updateMeta('twitter:title', `${title} | QueS.M design`);
    }

    if (image) {
      updateMeta('og:image', image, true);
      updateMeta('twitter:image', image);
    }

    // JSON-LD Structured Data
    let scriptElement = document.getElementById('seo-jsonld-script');
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-jsonld-script';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, image, canonical, jsonLd]);

  return null;
};

export default SEOMeta;
