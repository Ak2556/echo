// Product data for Echo Shop - Clothes, Tech, and Lifestyle categories (No Food)

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  namePa: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  trending?: boolean;
  description: string;
  descriptionHi: string;
  descriptionPa: string;
  specifications: { key: string; value: string }[];
  brand?: string;
  colors?: string[];
  sizes?: string[];
}

export const PRODUCTS: Product[] = [
  // FASHION & CLOTHING
  {
    id: 'cl-001',
    name: 'Premium Cotton T-Shirt',
    nameHi: 'प्रीमियम कॉटन टी-शर्ट',
    namePa: 'ਪ੍ਰੀਮੀਅਮ ਕਪਾਹ ਟੀ-ਸ਼ਰਟ',
    price: 499,
    originalPrice: 999,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=800&fit=crop',
    ],
    category: 'fashion',
    rating: 4.7,
    reviews: 342,
    stock: 150,
    trending: true,
    brand: 'EchoWear',
    colors: ['Black', 'White', 'Navy', 'Grey'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      '100% premium cotton t-shirt with modern fit. Breathable, comfortable, and perfect for everyday wear. Pre-shrunk fabric ensures lasting fit.',
    descriptionHi:
      '100% प्रीमियम कपास टी-शर्ट आधुनिक फिट के साथ। सांस लेने योग्य, आरामदायक और रोज़मर्रा के पहनने के लिए एकदम सही।',
    descriptionPa:
      '100% ਪ੍ਰੀਮੀਅਮ ਕਪਾਹ ਟੀ-ਸ਼ਰਟ ਆਧੁਨਿਕ ਫਿੱਟ ਨਾਲ। ਸਾਹ ਲੈਣ ਯੋਗ, ਆਰਾਮਦਾਇਕ ਅਤੇ ਰੋਜ਼ਾਨਾ ਪਹਿਨਣ ਲਈ ਸੰਪੂਰਨ।',
    specifications: [
      { key: 'Material', value: '100% Cotton' },
      { key: 'Fit', value: 'Regular' },
      { key: 'Neck', value: 'Round' },
      { key: 'Sleeve', value: 'Short' },
      { key: 'Care', value: 'Machine Wash' },
    ],
  },
  {
    id: 'cl-002',
    name: 'Slim Fit Denim Jeans',
    nameHi: 'स्लिम फिट डेनिम जींस',
    namePa: 'ਸਲਿਮ ਫਿੱਟ ਡੈਨਿਮ ਜੀਨਸ',
    price: 1299,
    originalPrice: 2499,
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=1200&h=800&fit=crop',
    ],
    category: 'fashion',
    rating: 4.8,
    reviews: 567,
    stock: 120,
    trending: true,
    brand: 'DenimCraft',
    colors: ['Blue', 'Black', 'Grey'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    description:
      'Premium stretch denim jeans with slim fit. Comfortable 5-pocket design with stylish fading. Perfect for casual and semi-formal occasions.',
    descriptionHi:
      'स्लिम फिट के साथ प्रीमियम स्ट्रेच डेनिम जींस। स्टाइलिश फीकेपन के साथ आरामदायक 5-पॉकेट डिज़ाइन। आकस्मिक और अर्ध-औपचारिक अवसरों के लिए सही।',
    descriptionPa:
      'ਸਲਿਮ ਫਿੱਟ ਨਾਲ ਪ੍ਰੀਮੀਅਮ ਸਟਰੈਚ ਡੈਨਿਮ ਜੀਨਸ। ਸਟਾਈਲਿਸ਼ ਫੇਡਿੰਗ ਨਾਲ ਆਰਾਮਦਾਇਕ 5-ਜੇਬ ਡਿਜ਼ਾਈਨ।',
    specifications: [
      { key: 'Material', value: '98% Cotton, 2% Elastane' },
      { key: 'Fit', value: 'Slim' },
      { key: 'Rise', value: 'Mid Rise' },
      { key: 'Pockets', value: '5' },
      { key: 'Care', value: 'Machine Wash Cold' },
    ],
  },
  {
    id: 'cl-003',
    name: 'Designer Kurta Set',
    nameHi: 'डिज़ाइनर कुर्ता सेट',
    namePa: 'ਡਿਜ਼ਾਈਨਰ ਕੁੜਤਾ ਸੈੱਟ',
    price: 1899,
    originalPrice: 3499,
    image:
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1610652763531-37657c384e59?w=1200&h=800&fit=crop',
    ],
    category: 'fashion',
    rating: 4.9,
    reviews: 234,
    stock: 85,
    brand: 'EthnicElegance',
    colors: ['Ivory', 'Navy', 'Maroon', 'Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Traditional designer kurta with matching pants. Perfect for festivals, weddings, and special occasions. Premium fabric with intricate embroidery.',
    descriptionHi:
      'मैचिंग पैंट के साथ पारंपरिक डिज़ाइनर कुर्ता। त्योहारों, शादियों और विशेष अवसरों के लिए एकदम सही। जटिल कढ़ाई के साथ प्रीमियम कपड़ा।',
    descriptionPa:
      'ਮੈਚਿੰਗ ਪੈਂਟ ਨਾਲ ਰਵਾਇਤੀ ਡਿਜ਼ਾਈਨਰ ਕੁੜਤਾ। ਤਿਉਹਾਰਾਂ, ਵਿਆਹਾਂ ਅਤੇ ਵਿਸ਼ੇਸ਼ ਮੌਕਿਆਂ ਲਈ ਸੰਪੂਰਨ।',
    specifications: [
      { key: 'Material', value: 'Cotton Blend' },
      { key: 'Set Includes', value: 'Kurta + Pants' },
      { key: 'Pattern', value: 'Embroidered' },
      { key: 'Occasion', value: 'Festive' },
      { key: 'Care', value: 'Dry Clean Recommended' },
    ],
  },

  // ELECTRONICS & TECH
  {
    id: 'te-001',
    name: 'Wireless Bluetooth Earbuds',
    nameHi: 'वायरलेस ब्लूटूथ ईयरबड्स',
    namePa: 'ਵਾਇਰਲੈੱਸ ਬਲੂਟੁੱਥ ਈਅਰਬੱਡਜ਼',
    price: 1999,
    originalPrice: 4999,
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598620617137-5c7e47c9ef3d?w=1200&h=800&fit=crop',
    ],
    category: 'electronics',
    rating: 4.6,
    reviews: 892,
    stock: 200,
    trending: true,
    brand: 'SoundPro',
    colors: ['Black', 'White', 'Blue'],
    description:
      'Premium wireless earbuds with active noise cancellation. 30-hour battery life with charging case. IPX7 water resistant. Crystal clear sound quality.',
    descriptionHi:
      'एक्टिव नॉइज़ कैंसिलेशन के साथ प्रीमियम वायरलेस ईयरबड्स। चार्जिंग केस के साथ 30 घंटे की बैटरी लाइफ। IPX7 वाटर रेसिस्टेंट।',
    descriptionPa:
      'ਐਕਟਿਵ ਸ਼ੋਰ ਰੱਦੀਕਰਨ ਨਾਲ ਪ੍ਰੀਮੀਅਮ ਵਾਇਰਲੈੱਸ ਈਅਰਬੱਡਜ਼। ਚਾਰਜਿੰਗ ਕੇਸ ਨਾਲ 30-ਘੰਟੇ ਦੀ ਬੈਟਰੀ ਲਾਈਫ।',
    specifications: [
      { key: 'Type', value: 'True Wireless' },
      { key: 'Battery', value: '30 hours with case' },
      { key: 'Water Resistance', value: 'IPX7' },
      { key: 'Connectivity', value: 'Bluetooth 5.3' },
      { key: 'Features', value: 'ANC, Touch Controls' },
    ],
  },
  {
    id: 'te-002',
    name: 'Smart Watch Pro',
    nameHi: 'स्मार्ट वॉच प्रो',
    namePa: 'ਸਮਾਰਟ ਵਾਚ ਪ੍ਰੋ',
    price: 3999,
    originalPrice: 7999,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1617625802912-cde586faf331?w=1200&h=800&fit=crop',
    ],
    category: 'electronics',
    rating: 4.8,
    reviews: 1234,
    stock: 150,
    trending: true,
    brand: 'TechLife',
    colors: ['Black', 'Silver', 'Gold'],
    description:
      'Advanced fitness tracker with heart rate monitor, sleep tracking, and 100+ sport modes. AMOLED display, 7-day battery life, water resistant.',
    descriptionHi:
      'हार्ट रेट मॉनिटर, स्लीप ट्रैकिंग और 100+ स्पोर्ट मोड के साथ एडवांस्ड फिटनेस ट्रैकर। AMOLED डिस्प्ले, 7-दिन की बैटरी लाइफ।',
    descriptionPa:
      'ਦਿਲ ਦੀ ਧੜਕਣ ਮਾਨੀਟਰ, ਨੀਂਦ ਟਰੈਕਿੰਗ ਅਤੇ 100+ ਖੇਡ ਮੋਡਾਂ ਨਾਲ ਉੱਨਤ ਫਿਟਨੈਸ ਟਰੈਕਰ।',
    specifications: [
      { key: 'Display', value: '1.4" AMOLED' },
      { key: 'Battery', value: '7 days' },
      { key: 'Water Resistance', value: '5ATM' },
      { key: 'Sports Modes', value: '100+' },
      { key: 'Features', value: 'HR, SpO2, Sleep, GPS' },
    ],
  },
  {
    id: 'te-003',
    name: 'Wireless Gaming Mouse',
    nameHi: 'वायरलेस गेमिंग माउस',
    namePa: 'ਵਾਇਰਲੈੱਸ ਗੇਮਿੰਗ ਮਾਊਸ',
    price: 2499,
    originalPrice: 4999,
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=1200&h=800&fit=crop',
    ],
    category: 'electronics',
    rating: 4.7,
    reviews: 456,
    stock: 180,
    brand: 'GameMaster',
    colors: ['Black', 'White'],
    description:
      'High-precision wireless gaming mouse with 16,000 DPI sensor. RGB lighting, programmable buttons, ultra-fast response time. Perfect for competitive gaming.',
    descriptionHi:
      '16,000 DPI सेंसर के साथ हाई-प्रिसिजन वायरलेस गेमिंग माउस। RGB लाइटिंग, प्रोग्रामेबल बटन। प्रतिस्पर्धी गेमिंग के लिए सही।',
    descriptionPa:
      '16,000 DPI ਸੈਂਸਰ ਨਾਲ ਉੱਚ-ਸਟੀਕਤਾ ਵਾਇਰਲੈੱਸ ਗੇਮਿੰਗ ਮਾਊਸ। RGB ਰੋਸ਼ਨੀ, ਪ੍ਰੋਗਰਾਮੇਬਲ ਬਟਨ।',
    specifications: [
      { key: 'DPI', value: 'Up to 16,000' },
      { key: 'Buttons', value: '8 Programmable' },
      { key: 'Battery', value: '70 hours' },
      { key: 'Connectivity', value: 'Wireless 2.4GHz' },
      { key: 'RGB', value: 'Customizable' },
    ],
  },
  {
    id: 'te-004',
    name: 'Mechanical Gaming Keyboard',
    nameHi: 'मैकेनिकल गेमिंग कीबोर्ड',
    namePa: 'ਮਕੈਨੀਕਲ ਗੇਮਿੰਗ ਕੀਬੋਰਡ',
    price: 3499,
    originalPrice: 6999,
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&h=800&fit=crop',
    ],
    category: 'electronics',
    rating: 4.9,
    reviews: 678,
    stock: 120,
    trending: true,
    brand: 'KeyMaster',
    description:
      'RGB mechanical gaming keyboard with tactile switches. Full N-key rollover, customizable macros, aircraft-grade aluminum frame. Professional gaming experience.',
    descriptionHi:
      'टैक्टाइल स्विच के साथ RGB मैकेनिकल गेमिंग कीबोर्ड। फुल N-key रोलओवर, कस्टमाइज़ेबल मैक्रोज़। प्रोफेशनल गेमिंग अनुभव।',
    descriptionPa:
      'ਟੈਕਟਾਈਲ ਸਵਿੱਚਾਂ ਨਾਲ RGB ਮਕੈਨੀਕਲ ਗੇਮਿੰਗ ਕੀਬੋਰਡ। ਪੂਰਾ N-key ਰੋਲਓਵਰ, ਕਸਟਮਾਈਜ਼ੇਬਲ ਮੈਕਰੋ।',
    specifications: [
      { key: 'Type', value: 'Mechanical' },
      { key: 'Switches', value: 'Tactile' },
      { key: 'Backlighting', value: 'RGB Per-key' },
      { key: 'Build', value: 'Aluminum Frame' },
      { key: 'Features', value: 'Macro Support, N-Key Rollover' },
    ],
  },

  // HOME & LIFESTYLE
  {
    id: 'ho-001',
    name: 'Smart LED Desk Lamp',
    nameHi: 'स्मार्ट LED डेस्क लैम्प',
    namePa: 'ਸਮਾਰਟ LED ਡੈਸਕ ਲੈਂਪ',
    price: 1299,
    originalPrice: 2499,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1554995347-3c3e6e6e5b77?w=1200&h=800&fit=crop',
    ],
    category: 'home',
    rating: 4.6,
    reviews: 234,
    stock: 150,
    brand: 'LightPro',
    description:
      'Adjustable LED desk lamp with touch controls. Multiple brightness levels, eye-care technology, USB charging port. Perfect for studying and working.',
    descriptionHi:
      'टच कंट्रोल के साथ एडजस्टेबल LED डेस्क लैम्प। कई ब्राइटनेस लेवल, आई-केयर टेक्नोलॉजी, USB चार्जिंग पोर्ट। पढ़ाई और काम के लिए सही।',
    descriptionPa:
      'ਟੱਚ ਕੰਟਰੋਲ ਨਾਲ ਐਡਜਸਟੇਬਲ LED ਡੈਸਕ ਲੈਂਪ। ਕਈ ਚਮਕ ਦੇ ਪੱਧਰ, ਅੱਖਾਂ ਦੀ ਦੇਖਭਾਲ ਤਕਨੀਕ।',
    specifications: [
      { key: 'Type', value: 'LED' },
      { key: 'Brightness Levels', value: '5' },
      { key: 'USB Port', value: 'Yes' },
      { key: 'Adjustable', value: 'Yes' },
      { key: 'Eye Care', value: 'Flicker-free' },
    ],
  },
  {
    id: 'ho-002',
    name: 'Yoga Mat with Strap',
    nameHi: 'स्ट्रैप के साथ योग मैट',
    namePa: 'ਸਟ੍ਰੈਪ ਨਾਲ ਯੋਗਾ ਮੈਟ',
    price: 799,
    originalPrice: 1499,
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=1200&h=800&fit=crop',
    ],
    category: 'fitness',
    rating: 4.7,
    reviews: 345,
    stock: 200,
    brand: 'FitLife',
    colors: ['Purple', 'Blue', 'Green', 'Pink'],
    description:
      'Premium TPE yoga mat with excellent grip and cushioning. Non-slip surface, eco-friendly material, includes carrying strap. Perfect for yoga, pilates, and fitness.',
    descriptionHi:
      'उत्कृष्ट पकड़ और कुशनिंग के साथ प्रीमियम TPE योग मैट। नॉन-स्लिप सतह, इको-फ्रेंडली सामग्री। योग, पिलेट्स और फिटनेस के लिए सही।',
    descriptionPa:
      'ਸ਼ਾਨਦਾਰ ਪਕੜ ਅਤੇ ਗੱਦੀ ਨਾਲ ਪ੍ਰੀਮੀਅਮ TPE ਯੋਗਾ ਮੈਟ। ਨਾਨ-ਸਲਿਪ ਸਤਹ, ਇਕੋ-ਦੋਸਤਾਨਾ ਸਮੱਗਰੀ।',
    specifications: [
      { key: 'Material', value: 'TPE (Eco-friendly)' },
      { key: 'Thickness', value: '6mm' },
      { key: 'Size', value: '183cm x 61cm' },
      { key: 'Surface', value: 'Non-slip' },
      { key: 'Includes', value: 'Carrying Strap' },
    ],
  },

  // ACCESSORIES
  {
    id: 'ac-001',
    name: 'Leather Wallet',
    nameHi: 'लेदर वॉलेट',
    namePa: 'ਲੈਦਰ ਵਾਲੇਟ',
    price: 899,
    originalPrice: 1999,
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1605801272974-e21a0d3bf767?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1554566397-d030106a4c87?w=1200&h=800&fit=crop',
    ],
    category: 'accessories',
    rating: 4.8,
    reviews: 567,
    stock: 180,
    brand: 'LeatherCraft',
    colors: ['Black', 'Brown', 'Tan'],
    description:
      'Genuine leather wallet with RFID protection. Multiple card slots, coin pocket, and cash compartment. Slim design fits easily in pocket.',
    descriptionHi:
      'RFID प्रोटेक्शन के साथ असली लेदर वॉलेट। कई कार्ड स्लॉट, कॉइन पॉकेट और कैश कम्पार्टमेंट। स्लिम डिज़ाइन जेब में आसानी से फिट।',
    descriptionPa:
      'RFID ਸੁਰੱਖਿਆ ਨਾਲ ਅਸਲੀ ਚਮੜੇ ਦਾ ਵਾਲੇਟ। ਕਈ ਕਾਰਡ ਸਲਾਟ, ਸਿੱਕੇ ਦੀ ਜੇਬ ਅਤੇ ਨਕਦ ਡੱਬਾ।',
    specifications: [
      { key: 'Material', value: 'Genuine Leather' },
      { key: 'Card Slots', value: '8' },
      { key: 'RFID Protection', value: 'Yes' },
      { key: 'Coin Pocket', value: 'Yes' },
      { key: 'Style', value: 'Bifold' },
    ],
  },
  {
    id: 'ac-002',
    name: 'Premium Backpack',
    nameHi: 'प्रीमियम बैकपैक',
    namePa: 'ਪ੍ਰੀਮੀਅਮ ਬੈਕਪੈਕ',
    price: 1599,
    originalPrice: 2999,
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81163e88?w=1200&h=800&fit=crop',
    ],
    category: 'accessories',
    rating: 4.7,
    reviews: 456,
    stock: 140,
    trending: true,
    brand: 'TravelPro',
    colors: ['Black', 'Grey', 'Navy'],
    description:
      'Water-resistant laptop backpack with multiple compartments. Padded laptop sleeve (up to 15.6"), USB charging port, ergonomic design. Perfect for work and travel.',
    descriptionHi:
      'कई कम्पार्टमेंट के साथ वाटर-रेसिस्टेंट लैपटॉप बैकपैक। पैडेड लैपटॉप स्लीव (15.6" तक), USB चार्जिंग पोर्ट। काम और यात्रा के लिए सही।',
    descriptionPa:
      'ਕਈ ਕੰਪਾਰਟਮੈਂਟਾਂ ਨਾਲ ਪਾਣੀ-ਰੋਧਕ ਲੈਪਟਾਪ ਬੈਕਪੈਕ। ਪੈਡਡ ਲੈਪਟਾਪ ਸਲੀਵ (15.6" ਤੱਕ), USB ਚਾਰਜਿੰਗ ਪੋਰਟ।',
    specifications: [
      { key: 'Capacity', value: '30L' },
      { key: 'Laptop', value: 'Up to 15.6"' },
      { key: 'Material', value: 'Water-resistant Polyester' },
      { key: 'USB Port', value: 'Yes' },
      { key: 'Pockets', value: 'Multiple' },
    ],
  },
  {
    id: 'ac-003',
    name: 'Polarized Sunglasses',
    nameHi: 'पोलराइज्ड सनग्लासेस',
    namePa: 'ਪੋਲਰਾਈਜ਼ਡ ਸਨਗਲਾਸ',
    price: 1299,
    originalPrice: 2499,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1574351241102-caa8674d806c?w=1200&h=800&fit=crop',
    ],
    category: 'accessories',
    rating: 4.6,
    reviews: 289,
    stock: 160,
    brand: 'VisionPro',
    description:
      'UV400 polarized sunglasses with scratch-resistant lenses. Stylish aviator design, lightweight frame, includes protective case. Perfect for driving and outdoor activities.',
    descriptionHi:
      'स्क्रैच-रेसिस्टेंट लेंस के साथ UV400 पोलराइज्ड सनग्लासेस। स्टाइलिश एविएटर डिज़ाइन, हल्का फ्रेम। ड्राइविंग और आउटडोर गतिविधियों के लिए सही।',
    descriptionPa:
      'ਖੁਰਚ-ਰੋਧਕ ਲੈਂਸਾਂ ਨਾਲ UV400 ਪੋਲਰਾਈਜ਼ਡ ਸਨਗਲਾਸ। ਸਟਾਈਲਿਸ਼ ਏਵੀਏਟਰ ਡਿਜ਼ਾਈਨ, ਹਲਕਾ ਫਰੇਮ।',
    specifications: [
      { key: 'UV Protection', value: 'UV400' },
      { key: 'Lens', value: 'Polarized' },
      { key: 'Frame', value: 'Metal' },
      { key: 'Style', value: 'Aviator' },
      { key: 'Includes', value: 'Protective Case' },
    ],
  },

  // BEAUTY & GROOMING
  {
    id: 'be-001',
    name: 'Electric Trimmer Set',
    nameHi: 'इलेक्ट्रिक ट्रिमर सेट',
    namePa: 'ਇਲੈਕਟ੍ਰਿਕ ਟ੍ਰਿਮਰ ਸੈੱਟ',
    price: 1499,
    originalPrice: 2999,
    image:
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=1200&h=800&fit=crop',
    ],
    category: 'grooming',
    rating: 4.7,
    reviews: 678,
    stock: 140,
    brand: 'GroomKing',
    description:
      'Professional cordless trimmer with 10 attachments. Waterproof design, 90-minute runtime, precision cutting. Perfect for beard, hair, and body grooming.',
    descriptionHi:
      '10 अटैचमेंट के साथ प्रोफेशनल कॉर्डलेस ट्रिमर। वाटरप्रूफ डिज़ाइन, 90-मिनट रनटाइम। दाढ़ी, बाल और बॉडी ग्रूमिंग के लिए सही।',
    descriptionPa:
      '10 ਅਟੈਚਮੈਂਟਾਂ ਨਾਲ ਪੇਸ਼ੇਵਰ ਕੋਰਡਲੈਸ ਟ੍ਰਿਮਰ। ਵਾਟਰਪ੍ਰੂਫ ਡਿਜ਼ਾਈਨ, 90-ਮਿੰਟ ਰਨਟਾਈਮ।',
    specifications: [
      { key: 'Type', value: 'Cordless' },
      { key: 'Attachments', value: '10' },
      { key: 'Runtime', value: '90 minutes' },
      { key: 'Waterproof', value: 'Yes' },
      { key: 'Blade', value: 'Stainless Steel' },
    ],
  },

  // MOBILE ACCESSORIES
  {
    id: 'mo-001',
    name: '20000mAh Power Bank',
    nameHi: '20000mAh पावर बैंक',
    namePa: '20000mAh ਪਾਵਰ ਬੈਂਕ',
    price: 1299,
    originalPrice: 2499,
    image:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1619971787062-2a8cdeeab911?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1602739642072-8e7c2c6b0e55?w=1200&h=800&fit=crop',
    ],
    category: 'mobile',
    rating: 4.8,
    reviews: 1234,
    stock: 250,
    trending: true,
    brand: 'ChargePro',
    description:
      'High-capacity 20000mAh power bank with fast charging. Dual USB ports, LED display, lightweight design. Can charge smartphone 4-5 times.',
    descriptionHi:
      'फास्ट चार्जिंग के साथ हाई-कैपेसिटी 20000mAh पावर बैंक। ड्यूल USB पोर्ट, LED डिस्प्ले। स्मार्टफोन को 4-5 बार चार्ज कर सकता है।',
    descriptionPa:
      'ਤੇਜ਼ ਚਾਰਜਿੰਗ ਨਾਲ ਉੱਚ-ਸਮਰੱਥਾ 20000mAh ਪਾਵਰ ਬੈਂਕ। ਦੋਹਰੇ USB ਪੋਰਟ, LED ਡਿਸਪਲੇਅ।',
    specifications: [
      { key: 'Capacity', value: '20000mAh' },
      { key: 'Output Ports', value: '2 USB' },
      { key: 'Fast Charging', value: 'Yes' },
      { key: 'Display', value: 'LED' },
      { key: 'Weight', value: '350g' },
    ],
  },
  {
    id: 'mo-002',
    name: 'Phone Camera Lens Kit',
    nameHi: 'फोन कैमरा लेंस किट',
    namePa: 'ਫੋਨ ਕੈਮਰਾ ਲੈਂਸ ਕਿੱਟ',
    price: 999,
    originalPrice: 1999,
    image:
      'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=1200&h=800&fit=crop',
    ],
    category: 'mobile',
    rating: 4.5,
    reviews: 345,
    stock: 180,
    brand: 'LensPro',
    description:
      '3-in-1 smartphone lens kit with wide-angle, macro, and fisheye lenses. Universal clip design fits most phones. Professional-quality mobile photography.',
    descriptionHi:
      'वाइड-एंगल, मैक्रो और फिशआई लेंस के साथ 3-in-1 स्मार्टफोन लेंस किट। यूनिवर्सल क्लिप डिज़ाइन। प्रोफेशनल-क्वालिटी मोबाइल फोटोग्राफी।',
    descriptionPa:
      'ਵਾਈਡ-ਐਂਗਲ, ਮੈਕਰੋ ਅਤੇ ਫਿਸ਼ਆਈ ਲੈਂਸਾਂ ਨਾਲ 3-ਇਨ-1 ਸਮਾਰਟਫੋਨ ਲੈਂਸ ਕਿੱਟ।',
    specifications: [
      { key: 'Lenses', value: '3 (Wide, Macro, Fisheye)' },
      { key: 'Compatibility', value: 'Universal' },
      { key: 'Material', value: 'Optical Glass' },
      { key: 'Attachment', value: 'Clip-on' },
      { key: 'Case', value: 'Protective Case Included' },
    ],
  },
];

export const CATEGORIES = [
  {
    id: 'all',
    name: 'All Products',
    nameHi: 'सभी उत्पाद',
    namePa: 'ਸਾਰੇ ਉਤਪਾਦ',
    icon: 'ShoppingBag',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    nameHi: 'फ़ैशन',
    namePa: 'ਫੈਸ਼ਨ',
    icon: 'Shirt',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    nameHi: 'इलेक्ट्रॉनिक्स',
    namePa: 'ਇਲੈਕਟ੍ਰਾਨਿਕਸ',
    icon: 'Smartphone',
  },
  {
    id: 'home',
    name: 'Home & Living',
    nameHi: 'घर और जीवन',
    namePa: 'ਘਰ ਅਤੇ ਰਹਿਣ',
    icon: 'Home',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    nameHi: 'फिटनेस',
    namePa: 'ਫਿੱਟਨੈਸ',
    icon: 'Dumbbell',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameHi: 'एक्सेसरीज़',
    namePa: 'ਐਕਸੈਸਰੀਜ਼',
    icon: 'Backpack',
  },
  {
    id: 'grooming',
    name: 'Grooming',
    nameHi: 'ग्रूमिंग',
    namePa: 'ਗਰੂਮਿੰਗ',
    icon: 'Scissors',
  },
  {
    id: 'mobile',
    name: 'Mobile Accessories',
    nameHi: 'मोबाइल एक्सेसरीज़',
    namePa: 'ਮੋਬਾਈਲ ਐਕਸੈਸਰੀਜ਼',
    icon: 'Smartphone',
  },
  {
    id: 'trending',
    name: 'Trending',
    nameHi: 'ट्रेंडिंग',
    namePa: 'ਟ੍ਰੈਂਡਿੰਗ',
    icon: '🔥',
  },
];
