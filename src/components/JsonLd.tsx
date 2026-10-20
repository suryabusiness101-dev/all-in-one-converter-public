import { useEffect } from 'react';

interface JsonLdProps {
  id: string;
  data: Record<string, unknown>;
}

const JsonLd = ({ id, data }: JsonLdProps) => {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [id, data]);

  return null;
};

export default JsonLd;
