import type { HelpCategoryMeta, HelpFaqItem } from '../types/help';

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  { id: 'all', translationKey: 'helpCenter.categoryAll', defaultLabel: 'All Topics' },
  { id: 'getting_started', translationKey: 'helpCenter.categoryGettingStarted', defaultLabel: 'Getting Started' },
  { id: 'wardrobe', translationKey: 'helpCenter.categoryWardrobe', defaultLabel: 'Wardrobe' },
  { id: 'builder', translationKey: 'helpCenter.categoryBuilder', defaultLabel: 'Outfit Builder' },
  { id: 'outfits', translationKey: 'helpCenter.categoryOutfits', defaultLabel: 'Saved Outfits' },
  { id: 'calendar', translationKey: 'helpCenter.categoryCalendar', defaultLabel: 'Calendar' },
  { id: 'history', translationKey: 'helpCenter.categoryHistory', defaultLabel: 'Wear History' },
  { id: 'suggestions_stats', translationKey: 'helpCenter.categorySuggestionsStats', defaultLabel: 'Suggestions & Stats' },
  { id: 'settings', translationKey: 'helpCenter.categorySettings', defaultLabel: 'Account & Settings' },
];

export const HELP_FAQS: HelpFaqItem[] = [
  {
    id: 'what_is_outdrobe',
    category: 'getting_started',
    question: {
      en: 'What is OutDrobe?',
      bn: 'আউটড্রোব কী এবং এর মূল উদ্দেশ্য কী?',
      hi: 'आउटड्रोब क्या है और इसका मुख्य उद्देश्य क्या है?',
    },
    answer: {
      en: 'OutDrobe — The Pocket Wardrobe is a personal digital closet and lookbook application. It allows you to catalog the garments you already own, compose balanced multi-layer outfits, plan your week on a calm visual calendar, and understand your real cost-per-wear without feeling overwhelmed.',
      bn: 'আউটড্রোব — দ্য পকেট ওয়ারড্রোব হলো একটি ব্যক্তিগত ডিজিটাল ক্লোজেট ও লুকবুক অ্যাপ্লিকেশন। এটি আপনার বর্তমান পোশাকগুলো সুন্দরভাবে তালিকাভুক্ত করতে, বহুমাত্রিক স্টাইলিশ আউটফিট তৈরি করতে, ক্যালেন্ডারে সাপ্তাহিক পোশাকের পরিকল্পনা করতে এবং প্রতিটি পোশাকের আসল খরচ বিশ্লেষণ করতে সাহায্য করে।',
      hi: 'आउटड्रोब — द पॉकेट वॉर्डरोब एक व्यक्तिगत डिजिटल अलमारी और लुकबुक एप्लिकेशन है। यह आपके मौजूदा कपड़ों को व्यवस्थित रूप से सूचीबद्ध करने, संतुलित बहु-स्तरीय पहनावा तैयार करने, कैलेंडर पर योजना बनाने और वास्तविक प्रति-पहनावा लागत समझने में मदद करता है।',
    },
    keywords: {
      en: ['what is outdrobe', 'about', 'overview', 'pocket wardrobe', 'purpose', 'features', 'intro'],
      bn: ['আউটড্রোব কী', 'পরিচিতি', 'উদ্দেশ্য', 'কীভাবে কাজ করে', 'ফিচার', 'বিবরণ'],
      hi: ['आउटड्रोब क्या है', 'परिचय', 'उद्देश्य', 'सुविधाएं', 'विवरण'],
    },
  },
  {
    id: 'how_to_use_demo_mode',
    category: 'getting_started',
    question: {
      en: 'How does Demo Mode work?',
      bn: 'ডেমো মোড কীভাবে কাজ করে?',
      hi: 'डेमो मोड कैसे काम करता है?',
    },
    answer: {
      en: 'Demo Mode provides an interactive, pre-populated 9-piece capsule closet curated for Claire Vance. You can explore the full Guided Product Tour, inspect individual garments, build outfits in the visual studio, and view calendar plans in a safe, read-only preview without needing to create an account.',
      bn: 'ডেমো মোডে কোনো অ্যাকাউন্ট তৈরি না করেই ক্লেয়ার ভ্যান্সের জন্য সাজানো ৯টি পোশাকের নমুনা ক্যাপসুল ওয়ারড্রোব দেখা যায়। আপনি গাইডেড প্রোডাক্ট ট্যুর দেখতে পারেন, প্রতিটি পোশাকের বিস্তারিত পরিদর্শন করতে পারেন, এবং বিল্ডার ও ক্যালেন্ডার নিরাপদে ব্যবহার করে দেখতে পারেন।',
      hi: 'डेमो मोड आपको बिना खाता बनाए क्लेयर वेंस की 9-टुकड़ों की पूर्व-निर्मित अलमारी का अनुभव करने की अनुमति देता है। आप निर्देशित उत्पाद टूर ले सकते हैं, कपड़े देख सकते हैं, और सुरक्षित पूर्वावलोकन में कैलेंडर योजनाओं की समीक्षा कर सकते हैं।',
    },
    keywords: {
      en: ['demo mode', 'sample wardrobe', 'claire vance', 'guided tour', 'read only', 'explore'],
      bn: ['ডেমো মোড', 'নমুনা পোশাক', 'ক্যাপসুল', 'গাইডেড ট্যুর', 'টেস্ট মোড'],
      hi: ['डेमो मोड', 'नमूना अलमारी', 'निर्देशित टूर', 'परीक्षण मोड'],
    },
  },
  {
    id: 'how_to_add_clothing',
    category: 'wardrobe',
    question: {
      en: 'How do I add clothing to my wardrobe?',
      bn: 'পোশাক কীভাবে ওয়ার্ডরোবে যোগ করবেন?',
      hi: 'अलमारी में कपड़े कैसे जोड़ें?',
    },
    answer: {
      en: 'Navigate to "Digital Wardrobe" from the sidebar and click the "Add Garment" button. You can upload a photo from your device or select from our curated studio silhouettes. Specify the garment name, category (Outerwear, Tops, Bottoms, Footwear, Accessories), season, brand, purchase price, fabric care notes, and optional styling advice, then save.',
      bn: "সাইডবার থেকে 'ডিজিটাল ওয়ারড্রোব'-এ যান এবং 'পোশাক যোগ করুন' বাটনে ক্লিক করুন। আপনি নিজের ডিভাইস থেকে ছবি আপলোড করতে পারেন অথবা স্টুডিও সিলুয়েট থেকে বেছে নিতে পারেন। পোশাকের নাম, ক্যাটাগরি, ঋতু, ব্র্যান্ড, ক্রয়মূল্য ও কাপড়ের যত্নের তথ্য লিখে সংরক্ষণ করুন।",
      hi: "साइडबार से 'डिजिटल वॉर्डरोब' पर जाएं और 'कपड़ा जोड़ें' बटन पर क्लिक करें। आप अपने डिवाइस से फ़ोटो अपलोड कर सकते हैं या स्टूडियो सिल्हूट चुन सकते हैं। कपड़े का नाम, श्रेणी, मौसम, ब्रांड, खरीद मूल्य और कपड़े की देखभाल संबंधी विवरण भरकर सहेजें।",
    },
    keywords: {
      en: ['add clothing', 'add garment', 'upload photo', 'new piece', 'catalog item', 'create garment'],
      bn: ['পোশাক যোগ', 'নতুন পোশাক', 'ছবি আপলোড', 'পোশাক আপলোড', 'পোশাক তৈরি'],
      hi: ['कपड़े जोड़ें', 'नया कपड़ा', 'फ़ोटो अपलोड', 'कपड़ा बनाना', 'अलमारी में जोड़ें'],
    },
  },
  {
    id: 'how_to_edit_delete_clothing',
    category: 'wardrobe',
    question: {
      en: 'How do I edit or delete clothing items?',
      bn: 'পোশাক কীভাবে সম্পাদনা বা ডিলিট করবেন?',
      hi: 'कपड़ों को कैसे संपादित या हटाएं?',
    },
    answer: {
      en: 'In the "Digital Wardrobe" grid, hover over any garment card to reveal the edit (pencil) and delete (trash) icons. You can also click directly on any card to open the Garment Inspector modal and update attributes. (Note: in read-only Demo Mode, modifications are simulated and protected).',
      bn: "'ডিজিটাল ওয়ারড্রোব'-এ যেকোনো পোশাক কার্ডের ওপর মাউস রাখলে সম্পাদনা (পেন্সিল) এবং মুছে ফেলার (ট্র্যাশ) আইকন দেখা যাবে। কার্ডে ক্লিক করে বিস্তারিত দেখার ফর্মও খুলতে পারেন এবং তথ্য আপডেট করতে পারেন। (ডেমো মোডে ডেটা মুছে ফেলা বা পরিবর্তন করা সুরক্ষিত থাকে)।",
      hi: "'डिजिटल वॉर्डरोब' में, संपादन (पेंसिल) और हटाने (कचरा) आइकन देखने के लिए किसी भी कपड़े के कार्ड पर होवर करें। आप विवरण देखने और अपडेट फ़ॉर्म खोलने के लिए कार्ड पर सीधे क्लिक भी कर सकते हैं। (डेमो मोड में यह सुरक्षित और केवल पढ़ने के लिए है)।",
    },
    keywords: {
      en: ['edit clothing', 'delete clothing', 'remove garment', 'update garment', 'modify piece'],
      bn: ['পোশাক সম্পাদনা', 'পোশাক ডিলিট', 'পোশাক পরিবর্তন', 'পোশাক মোছা', 'আপডেট'],
      hi: ['कपड़े संपादित करें', 'कपड़े हटाएं', 'संशोधित करें', 'अपडेट करें'],
    },
  },
  {
    id: 'how_to_create_outfit',
    category: 'builder',
    question: {
      en: 'How do I create an outfit in the Outfit Builder?',
      bn: 'আউটফিট বিল্ডারে নতুন পোশাকের কম্বিনেশন কীভাবে তৈরি করবেন?',
      hi: 'आउटफ़िट बिल्डर में नया लुक कैसे तैयार करें?',
    },
    answer: {
      en: 'Open the "Outfit Builder" from the sidebar or header. Use the Layer Rack tabs (Outerwear, Tops, Bottoms, Footwear, Accessories) to select one piece per layer. The Lookbook Canvas immediately previews the combination, calculates color harmony, and computes total ensemble value.',
      bn: "সাইডবার বা হেডার থেকে 'আউটফিট বিল্ডার' খুলুন। লেয়ার সিলেকশন র্যাকের ট্যাবগুলোতে (আউটারওয়্যার, টপস, বটমস, জুতো, অ্যাক্সেসরিজ) প্রতি লেয়ারে একটি করে পোশাক পছন্দ করুন। লাইভ লুকবুক ক্যানভাস সাথে সাথে পুরো আউটফিটের প্রিভিউ, রঙের সামঞ্জস্য ও মোট মূল্য প্রদর্শন করবে।",
      hi: "साइडबार या शीर्ष लेख से 'आउटफ़िट बिल्डर' खोलें। प्रत्येक परत (आउटरवियर, टॉप्स, बॉटम्स, जूते, एक्सेसरीज़) के लिए एक कपड़ा चुनें। लाइव लुकबुक कैनवास तुरंत आपका पहनावा दिखाता है, रंग सामंजस्य का मूल्यांकन करता है और कुल मूल्य की गणना करता है।",
    },
    keywords: {
      en: ['create outfit', 'outfit builder', 'compose look', 'layers', 'color harmony', 'canvas'],
      bn: ['আউটফিট তৈরি', 'আউটফিট বিল্ডার', 'লেয়ার', 'রং সামঞ্জস্য', 'নতুন লুক'],
      hi: ['पहनावा तैयार करें', 'आउटफ़िट बिल्डर', 'परतें', 'रंग सामंजस्य', 'नया लुक'],
    },
  },
  {
    id: 'how_to_save_outfit',
    category: 'outfits',
    question: {
      en: 'How do I save an outfit to my Lookbook?',
      bn: 'লুকবুকে আউটফিট কীভাবে সংরক্ষণ করবেন?',
      hi: 'लुकबुक में पहनावा कैसे सहेजें?',
    },
    answer: {
      en: 'Once you select your pieces on the Outfit Builder canvas, fill out the right-hand formulation panel. Enter a title for the outfit (e.g., "Autumn Architecture Critique"), select the Occasion and Season, optionally check "Add immediately to Favorite Outfits", and click "Save Outfit to Lookbook". It will immediately appear under "Saved Outfits".',
      bn: "আউটফিট বিল্ডারে পোশাক পছন্দের পর ডানপাশের প্যানেলে যান। আউটফিটের একটি শিরোনাম দিন, উপলক্ষ ও ঋতু নির্ধারণ করুন, চাইলে 'পছন্দের আউটফিটে যোগ করুন' বক্সে টিক দিন এবং 'লুকবুকে আউটফিট সংরক্ষণ' বাটনে ক্লিক করুন।",
      hi: "आउटफ़िट बिल्डर कैनवास पर कपड़े चुनने के बाद, दाईं ओर के पैनल को भरें। पहनावे का एक शीर्षक दर्ज करें, अवसर और मौसम चुनें, चाहें तो 'पसंदीदा' चिह्नित करें और 'लुकबुक में पहनावा सहेजें' पर क्लिक करें।",
    },
    keywords: {
      en: ['save outfit', 'store outfit', 'save lookbook', 'favorite outfit', 'outfit title'],
      bn: ['আউটফিট সংরক্ষণ', 'আউটফিট সেভ', 'লুকবুক সংরক্ষণ', 'পছন্দের আউটফিট'],
      hi: ['पहनावा सहेजें', 'लुकबुक में जोड़ें', 'पसंदीदा पहनावा', 'शीर्षक'],
    },
  },
  {
    id: 'how_to_schedule_outfit',
    category: 'calendar',
    question: {
      en: 'How do I schedule an outfit on the calendar?',
      bn: 'ক্যালেন্ডারে নির্দিষ্ট দিনের জন্য আউটফিট কীভাবে শিডিউল করবেন?',
      hi: 'कैलेंडर में किसी निश्चित दिन के लिए पहनावा कैसे शेड्यूल करें?',
    },
    answer: {
      en: 'You can schedule an outfit in two ways: 1) Go to "Saved Outfits" and click "Schedule" on any outfit card to pick a date. 2) Open the "Outfit Calendar", click directly on any date on the calendar, and assign an outfit in the Day Inspector panel.',
      bn: "আপনি দুটি উপায়ে আউটফিট শিডিউল করতে পারেন: ১) 'সংরক্ষিত আউটফিট' ট্যাবে গিয়ে যেকোনো পোশাকের কার্ডে থাকা 'শিডিউল' বাটনে ক্লিক করে তারিখ বেছে নিন। ২) 'পোশাক ক্যালেন্ডার'-এ গিয়ে সরাসরি কাঙ্ক্ষিত তারিখে ক্লিক করে ডে ইন্সপেক্টর থেকে পছন্দের আউটফিট নির্ধারণ করুন।",
      hi: "आप दो तरीकों से पहनावा शेड्यूल कर सकते हैं: 1) 'सहेजे गए पहनावे' में जाएं और किसी भी कार्ड पर 'शेड्यूल' पर क्लिक करके तारीख चुनें। 2) 'आउटफ़िट कैलेंडर' में सीधे किसी भी तारीख पर क्लिक करें और दिन के विवरण पैनल में पहनावा असाइन करें।",
    },
    keywords: {
      en: ['schedule outfit', 'plan outfit', 'calendar schedule', 'assign date', 'day inspector'],
      bn: ['আউটফিট শিডিউল', 'পোশাক পরিকল্পনা', 'তারিখ নির্বাচন', 'ক্যালেন্ডার শিডিউল'],
      hi: ['पहनावा शेड्यूल करें', 'तारीख तय करें', 'कैलेंडर निर्धारण', 'दिन का विवरण'],
    },
  },
  {
    id: 'how_to_use_calendar',
    category: 'calendar',
    question: {
      en: 'How do I use the Outfit Calendar?',
      bn: 'পোশাক ক্যালেন্ডার কীভাবে ব্যবহার করবেন?',
      hi: 'आउटफ़िट कैलेंडर का उपयोग कैसे करें?',
    },
    answer: {
      en: 'The "Outfit Calendar" gives you a calm monthly view of all your planned dressing dates. Use the month navigation arrows to plan ahead, click any date to review scheduled pieces and weather notes, and click "Log Today" directly from the Day Inspector once you have worn that look.',
      bn: "'পোশাক ক্যালেন্ডার' পুরো মাসের পোশাকের পরিকল্পনার একটি পরিচ্ছন্ন রূপরেখা প্রদান করে। তীরচিহ্ন দিয়ে মাস পরিবর্তন করুন, কোনো তারিখে ক্লিক করে নির্ধারিত পোশাকের তালিকা ও স্টাইলিং নোট দেখুন, এবং পরিধানের পর সরাসরি ডে ইন্সপেক্টর থেকে 'আজ পরিধান করেছি' ক্লিক করুন।",
      hi: "'आउटफ़िट कैलेंडर' पूरे महीने में आपके पहनावे की योजना का शांत दृश्य प्रस्तुत करता है। महीनों के बीच नेविगेट करें, नियोजित कपड़े देखने के लिए किसी भी तारीख पर क्लिक करें, और पहनने के बाद दिन के विवरण से सीधे 'आज पहना' दर्ज करें।",
    },
    keywords: {
      en: ['use calendar', 'month view', 'plan week', 'morning routine', 'day details'],
      bn: ['ক্যালেন্ডার ব্যবহার', 'মাসিক ভিউ', 'সাপ্তাহিক পরিকল্পনা', 'দিনের বিবরণ'],
      hi: ['कैलेंडर का उपयोग', 'मासिक दृश्य', 'साप्ताहिक योजना', 'दिन के विवरण'],
    },
  },
  {
    id: 'how_to_track_wear_history',
    category: 'history',
    question: {
      en: 'How do I track Wear History and log daily outfits?',
      bn: 'পরিধানের ইতিহাস কীভাবে ট্র্যাক করবেন এবং দৈনিক পোশাক লগ করবেন?',
      hi: 'पहनावे का इतिहास कैसे ट्रैक करें और दैनिक उपयोग कैसे दर्ज करें?',
    },
    answer: {
      en: 'Open "Wear History" to inspect your complete wear diary. You can log an outfit wear in three places: by clicking "Log Outfit Wear" in the Wear History view, from today\'s look in the Calendar, or from "Saved Outfits". Each log automatically updates the wear counter and recalculates cost-per-wear.',
      bn: "'পরিধানের ইতিহাস' ট্যাবে গিয়ে আপনার পোশাক ব্যবহারের সার্বিক ডায়েরি দেখতে পারেন। আপনি তিনটি জায়গা থেকে পরিধান লগ করতে পারেন: পরিধানের ইতিহাস পৃষ্ঠার 'পরিধান লগ করুন' বাটনে ক্লিক করে, ক্যালেন্ডারের আজকের আউটফিট থেকে, অথবা সংরক্ষিত আউটফিট থেকে। প্রতিটি লগ পোশাকের ব্যবহারের হিসাব আপডেট করে।",
      hi: "'पहनावे का इतिहास' खोलकर अपनी पूरी उपयोग डायरी देखें। आप तीन स्थानों से उपयोग दर्ज कर सकते हैं: पहनावे के इतिहास पृष्ठ पर 'पहनावा दर्ज करें' बटन से, कैलेंडर से आज के लुक से, या 'सहेजे गए पहनावे' से।",
    },
    keywords: {
      en: ['wear history', 'log wear', 'wear diary', 'cost per wear', 'track rotation'],
      bn: ['পরিধানের ইতিহাস', 'পোশাক লগ', 'ব্যবহারের ডায়েরি', 'খরচ বিশ্লেষণ', 'রোটেশন'],
      hi: ['पहनावे का इतिहास', 'उपयोग दर्ज करें', 'उपयोग डायरी', 'लागत विश्लेषण'],
    },
  },
  {
    id: 'how_do_suggestions_work',
    category: 'suggestions_stats',
    question: {
      en: 'How do intelligent Outfit Suggestions work?',
      bn: 'পোশাকের বুদ্ধিমান পরামর্শ (স্মার্ট সাজেশন) কীভাবে কাজ করে?',
      hi: 'बुद्धिमान पहनावा सुझाव कैसे काम करते हैं?',
    },
    answer: {
      en: 'The "Suggestions" engine analyzes your wardrobe to find "sleeper" pieces—garments with 0 wears or long periods without rotation. It automatically pairs these underutilized pieces with your favorite everyday staples, filtering by climate (Cool, Mild, Warm) and occasion so nothing in your closet sits unworn.',
      bn: "'পরামর্শ' ইঞ্জিন আপনার আলমারির সব পোশাক বিশ্লেষণ করে অব্যবহৃত বা কম পরা পোশাকগুলো খুঁজে বের করে। এটি আবহাওয়া (শীতল, নাতিশীতোষ্ণ, উষ্ণ) এবং উপলক্ষ অনুযায়ী অব্যবহৃত পোশাকের সাথে নিয়মিত ব্যবহৃত পোশাক মিলিয়ে সুন্দর কম্বিনেশন তৈরি করে, যাতে কোনো পোশাকই অব্যবহৃত না থাকে।",
      hi: "'सुझाव' इंजन आपकी अलमारी का विश्लेषण करके कम पहने गए या बिना पहने कपड़ों की पहचान करता है। यह मौसम (ठंडा, हल्का, गर्म) और अवसर के अनुसार उपयुक्त संयोजन सुझाता है ताकि अलमारी के सभी कपड़ों का प्रभावी उपयोग हो सके।",
    },
    keywords: {
      en: ['suggestions', 'smart recommendation', 'sleeper pieces', 'climate filter', 'occasion filter'],
      bn: ['পরামর্শ', 'স্মার্ট সাজেশন', 'অব্যবহৃত পোশাক', 'আবহাওয়া ফিল্টার', 'উপলক্ষ'],
      hi: ['सुझाव', 'स्मार्ट सिफारिश', 'अलमारी सुझाव', 'मौसम फ़िल्टर', 'अवसर'],
    },
  },
  {
    id: 'how_to_understand_stats',
    category: 'suggestions_stats',
    question: {
      en: 'How do I understand wardrobe statistics and cost-per-wear?',
      bn: 'ওয়ার্ডরোব পরিসংখ্যান ও প্রতি-পরিধান খরচ কীভাবে বুঝবেন?',
      hi: 'वॉर्डरोब सांख्यिकी और प्रति-पहनावा लागत को कैसे समझें?',
    },
    answer: {
      en: 'The "Statistics" view provides quantitative clarity on your closet: 1) Total Closet Investment is the sum of purchase prices. 2) Closet Utilization shows the percentage of garments worn at least once. 3) Portfolio Cost-Per-Wear divides total investment by cumulative wears. 4) Lowest CPW Staples highlights your highest-value wardrobe essentials.',
      bn: "'পরিসংখ্যান' পৃষ্ঠায় পোশাকের পরিমাপযোগ্য উপাত্ত দেওয়া থাকে: ১) মোট বিনিয়োগ: পোশাকের ক্রয়মূল্যের সমষ্টি। ২) ওয়ারড্রোব ব্যবহার হার: অন্তত একবার পরা পোশাকের শতকরা হার। ৩) পোর্টফোলিও প্রতি-পরিধান খরচ: মোট বিনিয়োগকে মোট পরিধানের সংখ্যা দিয়ে ভাগ করে বের করা হয়। ৪) সেরা মূল্যের পোশাক: যে পোশাকগুলো সবচেয়ে বেশি পরা হয়েছে।",
      hi: "'सांख्यिकी' दृश्य आपकी अलमारी का सटीक गणितीय विवरण प्रस्तुत करता है: 1) कुल निवेश: सभी कपड़ों की खरीद कीमतों का योग। 2) उपयोग दर: कम से कम एक बार पहने गए कपड़ों का प्रतिशत। 3) प्रति-पहनावा लागत: कुल निवेश को कुल उपयोगों से विभाजित करके गणना की जाती है। 4) मुख्य कपड़े: सबसे अधिक पहने गए कपड़े।",
    },
    keywords: {
      en: ['statistics', 'stats', 'cost per wear', 'closet utilization', 'investment', 'lowest cpw'],
      bn: ['পরিসংখ্যান', 'হিসাব', 'প্রতি পরিধানের খরচ', 'বিনিয়োগ', 'ব্যবহারের হার', 'সেরা পোশাক'],
      hi: ['सांख्यिकी', 'आंकड़े', 'प्रति पहनावा लागत', 'उपयोग दर', 'निवेश', 'मुख्य कपड़े'],
    },
  },
  {
    id: 'how_to_change_language',
    category: 'settings',
    question: {
      en: 'How do I change the application language?',
      bn: 'অ্যাপ্লিকেশনের ভাষা কীভাবে পরিবর্তন করবেন?',
      hi: 'एप्लिकेशन की भाषा कैसे बदलें?',
    },
    answer: {
      en: 'Click the Globe icon in the top header (or inside the mobile drawer navigation). OutDrobe provides comprehensive, immediate localization for English, Bengali (বাংলা), and Hindi (हिन्दी) across all views, forms, calendars, and this Help Center without requiring a page reload.',
      bn: "টপ হেডার বা মোবাইল মেনুতে থাকা গ্লোব (বিশ্ব) আইকনে ক্লিক করুন। আউটড্রোবে তাৎক্ষণিকভাবে ইংরেজি, বাংলা (বাংলা) এবং হিন্দি (हिन्दी) ভাষার মধ্যে পরিবর্তন করা যায়। এতে সব দৃশ্য, ফর্ম, ক্যালেন্ডার ও এই সাহায্য কেন্দ্রের ভাষা সাথে সাথে পরিবর্তিত হয়।",
      hi: "शीर्ष लेख या मोबाइल मेनू में ग्लोब आइकन पर क्लिक करें। आउटड्रोब अंग्रेजी, बंगाली (বাংলা) और हिंदी (हिन्दी) तीनों भाषाओं में तुरंत अनुवाद प्रदान करता है, बिना पेज को रीलोड किए।",
    },
    keywords: {
      en: ['change language', 'switch language', 'bengali', 'hindi', 'english', 'locale'],
      bn: ['ভাষা পরিবর্তন', 'ভাষা বদলান', 'বাংলা ভাষা', 'ইংরেজি', 'হিন্দি', 'ভাষা'],
      hi: ['भाषा बदलें', 'भाषा परिवर्तन', 'हिंदी', 'अंग्रेजी', 'बंगाली'],
    },
  },
  {
    id: 'how_to_switch_themes',
    category: 'settings',
    question: {
      en: 'How do I switch between Light, Dark, and System themes?',
      bn: 'লাইট, ডার্ক ও সিস্টেম থিম কীভাবে পরিবর্তন করবেন?',
      hi: 'लाइट, डार्क और सिस्टम थीम के बीच कैसे स्विच करें?',
    },
    answer: {
      en: 'Click the Sun / Moon / Monitor icon in the top header. You can select Light mode (warm parchment & ecru surfaces), Dark mode (deep charcoal & soft slate cards), or System mode (automatically syncs with your device\'s operating system preference).',
      bn: "টপ হেডারে থাকা সূর্য / চাঁদ / মনিটর আইকনে ক্লিক করুন। আপনি লাইট মোড (উষ্ণ পার্চমেন্ট ও এক্রু রং), ডার্ক মোড (শান্ত কাঠকয়লা চারকোল ও স্লেট রং) অথবা সিস্টেম মোড (আপনার ডিভাইসের সেটিংসের সাথে স্বয়ংক্রিয়ভাবে মিলে যায়) বেছে নিতে পারেন।",
      hi: "शीर्ष लेख में सूर्य / चंद्रमा / मॉनिटर आइकन पर क्लिक करें। आप लाइट मोड (गर्म पार्चमेंट सतहें), डार्क मोड (गहरा चारकोल), या सिस्टम मोड (जो आपके डिवाइस की प्राथमिकता से स्वतः मेल खाता है) चुन सकते हैं।",
    },
    keywords: {
      en: ['switch theme', 'dark mode', 'light mode', 'theme selector', 'system theme'],
      bn: ['থিম পরিবর্তন', 'ডার্ক মোড', 'লাইট মোড', 'থিম', 'রং পরিবর্তন', 'সিস্টেম থিম'],
      hi: ['थीम बदलें', 'डार्क मोड', 'लाइट मोड', 'थीम चयनकर्ता', 'सिस्टम थीम'],
    },
  },
];
