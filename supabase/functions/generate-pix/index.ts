import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIX_KEY = '48996029392';
const PIX_NAME = 'Marcondes Jorge Machado';
const PIX_AMOUNT = 19.90;

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

function generatePixBRCode(): string {
  const gui = tlv('00', 'br.gov.bcb.pix');
  const key = tlv('01', PIX_KEY);
  const mai = tlv('26', gui + key);
  const mcc = tlv('52', '0000');
  const currency = tlv('53', '986');
  const amount = tlv('54', PIX_AMOUNT.toFixed(2));
  const country = tlv('58', 'BR');
  const name = tlv('59', PIX_NAME.substring(0, 25));
  const city = tlv('60', 'BRASILIA');
  const addData = tlv('62', tlv('05', '***'));
  const payload = tlv('00', '01') + mai + mcc + currency + amount + country + name + city + addData;
  const crc = crc16ccitt(payload + '6304');
  return payload + '6304' + crc;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brCode = generatePixBRCode();
    // Mask PIX key for display: show only last 4 digits
    const maskedKey = '•••••••' + PIX_KEY.slice(-4);
    
    return new Response(
      JSON.stringify({
        brCode,
        maskedKey,
        pixKey: PIX_KEY,
        name: PIX_NAME,
        amount: PIX_AMOUNT,
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
