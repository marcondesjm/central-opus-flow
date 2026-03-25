const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default fallback values (used for subscription payments)
const DEFAULT_PIX_KEY = '+5548996029392';
const DEFAULT_PIX_NAME = 'Marcondes Jorge Machado';
const DEFAULT_PIX_AMOUNT = 7.90;

/**
 * CRC16-CCITT (0xFFFF) — required by PIX EMV BR Code spec
 * Polynomial: 0x1021, Init: 0xFFFF
 */
function crc16ccitt(payload: string): string {
  // Convert string to byte array (ASCII only for PIX payloads)
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    bytes.push(payload.charCodeAt(i) & 0xFF);
  }
  
  let crc = 0xFFFF;
  for (const byte of bytes) {
    crc ^= (byte << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Build a TLV (Tag-Length-Value) field
 * Length is based on the string's byte length (ASCII chars only in PIX)
 */
function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Remove accents and special chars for PIX compatibility
 * PIX BR Code only supports ASCII
 */
function sanitize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove accents
    .replace(/[^a-zA-Z0-9 ]/g, '')    // keep only alphanumeric + space
    .trim();
}

/**
 * Generate a valid PIX BR Code (EMV QR Code Merchant Presented Mode)
 * Following BACEN specification: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/AnexoI-PadsoesBRCodePIX.pdf
 */
function generatePixBRCode(
  pixKey: string,
  pixName: string,
  amount: number,
  city: string = 'BRASILIA',
  txid: string = '***'
): string {
  // Sanitize name and city (max lengths per spec)
  const cleanName = sanitize(pixName).substring(0, 25);
  const cleanCity = sanitize(city).substring(0, 15);
  
  // ID 00 - Payload Format Indicator (fixed "01")
  const id00 = tlv('00', '01');
  
  // ID 26 - Merchant Account Information (PIX)
  //   ID 00 - GUI (fixed "br.gov.bcb.pix")
  //   ID 01 - Chave PIX
  const mai26Content = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey);
  const id26 = tlv('26', mai26Content);
  
  // ID 52 - Merchant Category Code (0000 = not informed)
  const id52 = tlv('52', '0000');
  
  // ID 53 - Transaction Currency (986 = BRL)
  const id53 = tlv('53', '986');
  
  // ID 54 - Transaction Amount (optional, only if > 0)
  let id54 = '';
  if (amount > 0) {
    id54 = tlv('54', amount.toFixed(2));
  }
  
  // ID 58 - Country Code (BR)
  const id58 = tlv('58', 'BR');
  
  // ID 59 - Merchant Name
  const id59 = tlv('59', cleanName);
  
  // ID 60 - Merchant City
  const id60 = tlv('60', cleanCity);
  
  // ID 62 - Additional Data Field Template
  //   ID 05 - Reference Label (txid)
  const addDataContent = tlv('05', txid);
  const id62 = tlv('62', addDataContent);
  
  // Assemble payload WITHOUT CRC
  const payloadWithoutCRC = id00 + id26 + id52 + id53 + id54 + id58 + id59 + id60 + id62;
  
  // ID 63 - CRC16 (must be last, calculated over entire payload including "6304")
  const crcInput = payloadWithoutCRC + '6304';
  const crc = crc16ccitt(crcInput);
  
  return payloadWithoutCRC + '6304' + crc;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let pixKey = DEFAULT_PIX_KEY;
    let pixName = DEFAULT_PIX_NAME;
    let amount = DEFAULT_PIX_AMOUNT;
    let city = 'BRASILIA';
    let txid = '***';

    // Accept custom values from request body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.pixKey) pixKey = body.pixKey;
        if (body.pixName) pixName = body.pixName;
        if (typeof body.amount === 'number') amount = body.amount;
        if (body.city) city = body.city;
        if (body.txid) txid = body.txid;
      } catch {
        // If body parsing fails, use defaults
      }
    }

    const brCode = generatePixBRCode(pixKey, pixName, amount, city, txid);
    
    // Mask the PIX key for display
    const maskedKey = pixKey.length > 6
      ? pixKey.substring(0, 3) + '•'.repeat(pixKey.length - 6) + pixKey.substring(pixKey.length - 3)
      : '•••••••••••';

    return new Response(
      JSON.stringify({
        brCode,
        pixKey,
        maskedKey,
        name: pixName,
        amount,
        city,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate PIX data", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
