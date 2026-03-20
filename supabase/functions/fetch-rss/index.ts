import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

function extractText(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function parseRss(xml: string, sourceName: string): RssItem[] {
  const items: RssItem[] = [];
  
  // Split by <item> or <entry> (Atom)
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
  
  let match;
  const regex = xml.includes('<entry') ? entryRegex : itemRegex;
  
  while ((match = regex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractText(content, 'title');
    
    // Get link - handle both RSS and Atom formats
    let link = extractText(content, 'link');
    if (!link) {
      const linkHref = content.match(/<link[^>]+href="([^"]+)"/i);
      if (linkHref) link = linkHref[1];
    }
    
    const description = extractText(content, 'description') || extractText(content, 'summary') || extractText(content, 'content');
    const pubDate = extractText(content, 'pubDate') || extractText(content, 'published') || extractText(content, 'updated');
    
    if (title) {
      // Strip HTML tags from description
      const cleanDesc = description.replace(/<[^>]+>/g, '').substring(0, 200);
      
      items.push({
        title,
        link,
        description: cleanDesc,
        pubDate,
        source: sourceName,
      });
    }
  }
  
  return items;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active feeds
    const { data: feeds, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    if (!feeds || feeds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, items: [], message: 'No feeds configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allItems: RssItem[] = [];

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.feed_url, {
          headers: { 'User-Agent': 'OpusFlow/1.0 RSS Reader' },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const items = parseRss(xml, feed.name);
        allItems.push(...items);
      } catch (e) {
        console.error(`Error fetching feed ${feed.name}:`, e);
      }
    }

    // Sort by date descending
    allItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    // Limit to 30 items
    const limited = allItems.slice(0, 30);

    return new Response(
      JSON.stringify({ success: true, items: limited }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RSS fetch error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
