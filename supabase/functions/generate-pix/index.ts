import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default fallback values (used for subscription payments)
const DEFAULT_PIX_KEY = '+5548996029392';
const DEFAULT_PIX_NAME = 'Marcondes Jorge Machado';
const DEFAULT_PIX_AMOUNT = 19.90;

function crc16ccitt(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function generatePixBRCode(pixKey: string, pixName: string, amount: number, city: string = 'BRASILIA'): string {
  const gui = tlv('00', 'br.gov.bcb.pix');
  const key = tlv('01', pixKey);
  const mai = tlv('26', gui + key);
  const mcc = tlv('52', '0000');
  const currency = tlv('53', '986');
  
  let payload = tlv('00', '01') + mai + mcc + currency;
  
  // Only add amount if > 0
  if (amount > 0) {
    payload += tlv('54', amount.toFixed(2));
  }
  
  payload += tlv('58', 'BR');
  payload += tlv('59', pixName.substring(0, 25));
  payload += tlv('60', city.substring(0, 15));
  payload += tlv('62', tlv('05', '***'));
  
  const crc = crc16ccitt(payload + '6304');
  return payload + '6304' + crc;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let pixKey = DEFAULT_PIX_KEY;
    let pixName = DEFAULT_PIX_NAME;
    let amount = DEFAULT_PIX_AMOUNT;
    let city = 'BRASILIA';

    // Accept custom values from request body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.pixKey) pixKey = body.pixKey;
        if (body.pixName) pixName = body.pixName;
        if (typeof body.amount === 'number') amount = body.amount;
        if (body.city) city = body.city;
      } catch {
        // If body parsing fails, use defaults
      }
    }

    const brCode = generatePixBRCode(pixKey, pixName, amount, city);
    const maskedKey = '•••••••' + pixKey.slice(-4);
    
    return new Response(
      JSON.stringify({
        brCode,
        maskedKey,
        pixKey,
        name: pixName,
        amount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate PIX data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
