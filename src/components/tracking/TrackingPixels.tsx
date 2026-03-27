import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface TrackingConfig {
  meta_pixel_id?: string;
  ga_measurement_id?: string;
}

/**
 * Injects Meta Pixel and Google Analytics scripts into public pages.
 * Pass the user_id of the page owner to load their tracking config.
 */
export function TrackingPixels({ userId }: { userId: string }) {
  const [config, setConfig] = useState<TrackingConfig | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_integrations')
      .select('integration_name, config, is_connected')
      .eq('user_id', userId)
      .in('integration_name', ['meta_pixel', 'google_analytics'])
      .then(({ data }) => {
        if (!data) return;
        const cfg: TrackingConfig = {};
        for (const row of data) {
          if (!row.is_connected) continue;
          const c = row.config as Record<string, unknown>;
          if (row.integration_name === 'meta_pixel' && c?.pixel_id) {
            cfg.meta_pixel_id = c.pixel_id as string;
          }
          if (row.integration_name === 'google_analytics' && c?.measurement_id) {
            cfg.ga_measurement_id = c.measurement_id as string;
          }
        }
        setConfig(cfg);
      });
  }, [userId]);

  useEffect(() => {
    if (!config) return;

    // Meta Pixel
    if (config.meta_pixel_id) {
      const pixelId = config.meta_pixel_id;
      if (!document.getElementById('meta-pixel-script')) {
        const script = document.createElement('script');
        script.id = 'meta-pixel-script';
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.id = 'meta-pixel-noscript';
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
        document.head.appendChild(noscript);
      }
    }

    // Google Analytics
    if (config.ga_measurement_id) {
      const gaId = config.ga_measurement_id;
      if (!document.getElementById('ga-script')) {
        const script1 = document.createElement('script');
        script1.id = 'ga-script';
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'ga-config-script';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(script2);
      }
    }

    return () => {
      ['meta-pixel-script', 'meta-pixel-noscript', 'ga-script', 'ga-config-script'].forEach(id => {
        document.getElementById(id)?.remove();
      });
    };
  }, [config]);

  return null;
}
