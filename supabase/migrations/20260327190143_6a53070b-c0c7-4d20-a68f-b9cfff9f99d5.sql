
UPDATE portfolio_sections 
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            content::jsonb,
            '{items,0,image_url}', '"https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=450&fit=crop"'
          ),
          '{items,1,image_url}', '"https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=450&fit=crop"'
        ),
        '{items,2,image_url}', '"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=450&fit=crop"'
      ),
      '{items,3,image_url}', '"https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=450&fit=crop"'
    ),
    '{items,4,image_url}', '"https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=450&fit=crop"'
  ),
  '{items,5,image_url}', '"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop"'
)
WHERE id = '2548076e-cf90-4e64-befb-e8ec2a17ee53';

UPDATE portfolio_sections 
SET content = jsonb_set(
  content::jsonb,
  '{image_url}', '"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"'
)
WHERE id = 'a820049e-b58e-4490-977d-137de2bd1a1a';

UPDATE portfolio_sections 
SET content = jsonb_set(
  jsonb_set(
    content::jsonb,
    '{items,0,image_url}', '"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"'
  ),
  '{items,1,image_url}', '"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"'
)
WHERE id = 'ca913d51-41d2-49d3-9b14-186e68d98455';
