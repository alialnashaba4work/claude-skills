/* جرار — البيانات، اللغة، العملة والسلة. مشتركة بين كل الصفحات.
   كل نص فيه نسختين {ar, en}. كل الأرقام بالإنجليزي.
   مصدر المعلومات: ملصقات جرار (فبراير ويونيو 2026) وموقع jerarbh.com */

/* ===== الدول والعملات =====
   الأسعار الأساسية بالدينار البحريني، وتتحول بسعر الصرف وتتقرّب لأعلى.
   الريال السعودي والدرهم والريال القطري والريال العماني مربوطة بالدولار (أسعار ثابتة).
   الدينار الكويتي غير مربوط: السعر هنا تقريبي، حدّثه إذا تغيّر كثير. */
const COUNTRIES={
  BH:{code:'BHD',ar:'البحرين',en:'Bahrain',sym:{ar:'د.ب',en:'BHD'},rate:1,step:0.001,dec:3,tz:'Asia/Bahrain',ship:{std:0.8,exp:1.5}},
  SA:{code:'SAR',ar:'السعودية',en:'Saudi Arabia',sym:{ar:'ر.س',en:'SAR'},rate:9.9734,step:1,dec:0,tz:'Asia/Riyadh'},
  AE:{code:'AED',ar:'الإمارات',en:'UAE',sym:{ar:'د.إ',en:'AED'},rate:9.7672,step:1,dec:0,tz:'Asia/Dubai'},
  KW:{code:'KWD',ar:'الكويت',en:'Kuwait',sym:{ar:'د.ك',en:'KWD'},rate:0.8165,step:0.05,dec:3,tz:'Asia/Kuwait'},
  QA:{code:'QAR',ar:'قطر',en:'Qatar',sym:{ar:'ر.ق',en:'QAR'},rate:9.6809,step:1,dec:0,tz:'Asia/Qatar'},
  OM:{code:'OMR',ar:'عُمان',en:'Oman',sym:{ar:'ر.ع',en:'OMR'},rate:1.0226,step:0.05,dec:3,tz:'Asia/Muscat'}
};

/* ===== المنتجات =====
   col: لون العبوة الفعلي، مقرّب لأقرب لون في دليل الهوية. p: السعر بالدينار البحريني */
/* ===== العرض الحالي =====
   الخصم ما ينطبق إلا إذا العميل كتب الكود في السلة، وفي الفترة من start لين end (بتوقيت البحرين).
   on:false يوقف العرض كله. exclude: المنتجات اللي ما يشملها الخصم.
   للمعاينة قبل موعد العرض: افتح الرابط وفي آخره #offer-preview */
/* byDate:false يخلي العرض شغّال الحين بغض النظر عن التاريخ. byDate:true يشغّله بس من start لين end */
const OFFER={on:true,byDate:false,pct:25,code:'JERAR9',exclude:['oil'],
  start:'2026-11-25T00:00:00+03:00',end:'2026-11-28T00:00:00+03:00',
  title:{ar:'خصم 25% على كل المنتجات ما عدا زيت الزيتون',en:'25% off everything except olive oil'},
  codeTxt:{ar:'استخدم كود JERAR9',en:'Use code JERAR9'},
  sub:{ar:'بمناسبة سنوية جرار',en:'Celebrating Jerar’s anniversary'},
  cta:{ar:'تسوّق الآن',en:'Shop now'},tag:{ar:'عرض',en:'Offer'},
  line:{ar:'خصم كود {c}',en:'Code {c} discount'}};
let PREVIEW=false;try{PREVIEW=location.hash==='#offer-preview'||sessionStorage.getItem('jerar-offer-preview')==='1';if(PREVIEW)sessionStorage.setItem('jerar-offer-preview','1')}catch(e){}
function offerLive(){if(!OFFER.on)return false;if(PREVIEW||!OFFER.byDate)return true;const n=Date.now();return n>=Date.parse(OFFER.start)&&n<Date.parse(OFFER.end)}
function offerState(){if(!OFFER.on)return'off';if(PREVIEW||!OFFER.byDate)return'live';const n=Date.now();return n<Date.parse(OFFER.start)?'soon':n>=Date.parse(OFFER.end)?'over':'live'}
let PROMO='';try{PROMO=localStorage.getItem('jerar-promo')||''}catch(e){}
function setPromo(c){PROMO=c;try{c?localStorage.setItem('jerar-promo',c):localStorage.removeItem('jerar-promo')}catch(e){}}
/* مبلغ الخصم على السلة (بعملة البلد المختار): بس على المنتجات المشمولة، وبس إذا الكود صح والعرض شغّال */
function promoDisc(keys,cc){
  if(!PROMO||PROMO!==OFFER.code||!offerLive())return 0;
  return keys.reduce((s,k)=>{const L=lineOf(k);return OFFER.exclude.includes(L.p.id)?s:s+convert(L.price,cc)*cart[k]},0)*OFFER.pct/100;
}

const P=[
 {id:'oil',best:true,p:2.9,img:'oliveoil.jpg',c:'liquids',col:'#8F993E',
  name:{ar:'زيت زيتون بكر ممتاز',en:'Extra Virgin Olive Oil'},
  about:{ar:'زيت زيتون من مزارع أردنية، أشجارها تنسقى من مياه الأمطار بس. ينعصر أول عصرة على البارد، وحموضته 0.24%. صبّه على الحمص والسلطة، أو غمّس فيه الخبز مع الزعتر.',
         en:'Olive oil from Jordanian farms whose trees are watered by rain alone. It is first cold pressed, with 0.24% acidity. Pour it over hummus and salad, or dip bread in it with zaatar.'},
  lines:{ar:['عصرة أولى على البارد','حموضة منخفضة 0.24%','مسقي على مياه الأمطار'],en:['First cold press','Low acidity, 0.24%','Rain-fed trees']},
  ing:{ar:'زيت زيتون نقي، عصرة أولى على البارد',en:'Pure olive oil, first cold pressed'},
  origin:{ar:'الأردن',en:'Jordan'},store:{ar:'في مكان بارد وجاف، بعيد عن الشمس',en:'Cool, dry place away from sunlight'},
  sizes:[{k:'250ml',l:{ar:'250 مل',en:'250 ml'},p:2.9,in:true},{k:'500ml',l:{ar:'500 مل',en:'500 ml'},p:4.9,in:true},
         {k:'1L',l:{ar:'1 لتر',en:'1 L'},p:8.9,in:true},{k:'4L',l:{ar:'4 لتر',en:'4 L'},p:34,in:true}]},

 {id:'malaki',best:true,p:3.3,img:'malaki.jpg',c:'powders',col:'#65BAAF',
  name:{ar:'زعتر ملكي',en:'Zaatar Malaki'},size:{ar:'250 غرام',en:'250 g'},
  about:{ar:'زعتر مفروك بزيت الزيتون ومخلوط مع السماق والسمسم، وما فيه قمح. للمناقيش، أو مع صحن زيت وخبز على الفطور.',
         en:'Zaatar rubbed with olive oil and mixed with sumac and sesame, with no wheat. Use it on manakish, or with olive oil and bread at breakfast.'},
  lines:{ar:['مفروك بزيت الزيتون','مع السماق والسمسم','خالي من القمح'],en:['Rubbed with olive oil','With sumac and sesame','Wheat-free']},
  ing:{ar:'زعتر، سمسم، زيت الزيتون، سماق، ملح',en:'Zaatar, sesame, olive oil, sumac, salt'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},allergy:{ar:'يحتوي على السمسم',en:'Contains sesame'}},

 {id:'walnut',p:3.7,img:'walnut.jpg',c:'powders',col:'#DB6015',
  name:{ar:'زعتر بالجوز',en:'Walnut Zaatar'},size:{ar:'250 غرام',en:'250 g'},
  about:{ar:'زعتر مخلوط مع الجوز والسمسم والسماق. الجوز يعطيه قرمشة وطعم أغنى، ويحلى على المناقيش والجبنة البيضا.',
         en:'Zaatar mixed with walnuts, sesame and sumac. The walnuts add crunch and a richer taste, and it is lovely on manakish and white cheese.'},
  lines:{ar:['مع الجوز','مع السمسم والسماق'],en:['With walnuts','With sesame and sumac']},
  ing:{ar:'زعتر، جوز، سمسم، زيت الزيتون، سماق، ملح',en:'Zaatar, walnut, sesame, olive oil, sumac, salt'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},allergy:{ar:'يحتوي على السمسم والجوز',en:'Contains sesame and walnut'}},

 {id:'pist',p:4.2,img:'pistachio.jpg',c:'powders',col:'#8F993E',
  name:{ar:'زعتر بالفستق',en:'Pistachio Zaatar'},size:{ar:'250 غرام',en:'250 g'},
  about:{ar:'زعتر بلدي مع الفستق الحلبي والسماق والسمسم، وخالي من القمح. خلطة للي يحب الزعتر بطعم مختلف.',
         en:'Baladi zaatar with pistachio, sumac and sesame, and no wheat. A different take for people who love zaatar.'},
  lines:{ar:['مع الفستق الحلبي','مع السماق والسمسم','خالي من القمح'],en:['With pistachio','With sumac and sesame','Wheat-free']},
  ing:{ar:'زعتر، فستق، سمسم، زيت الزيتون، سماق، ملح',en:'Zaatar, pistachio, sesame, olive oil, sumac, salt'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},allergy:{ar:'يحتوي على الفستق والسمسم',en:'Contains pistachio and sesame'}},

 {id:'sumac',best:true,p:3.8,img:'sumac.jpg',c:'powders',col:'#AC3C72',
  name:{ar:'سماق بلدي',en:'Sumac Baladi'},size:{ar:'250 غرام',en:'250 g'},
  about:{ar:'سماق بلدي أردني بدون أصباغ ولا مواد حافظة، يعني لونه الأحمر من الحبة نفسها. رشّه على الفتوش والمسخّن والمشاوي.',
         en:'Jordanian baladi sumac with no dyes or preservatives, so its red comes from the berry itself. Sprinkle it on fattoush, musakhan and grilled meat.'},
  lines:{ar:['سماق بلدي أردني','بدون أصباغ','بدون مواد حافظة'],en:['Jordanian baladi sumac','No dyes','No preservatives']},
  ing:{ar:'سماق بلدي',en:'Baladi sumac'},origin:{ar:'الأردن',en:'Jordan'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'}},

 {id:'leaves',p:2.2,img:'leaves.jpg',c:'powders',col:'#2A7050',
  name:{ar:'أوراق الزعتر الخام',en:'Pure Zaatar Leaves'},size:{ar:'100 غرام',en:'100 g'},
  about:{ar:'ورق زعتر خام بدون أي إضافة وبدون ملح. تقدر تخلط منه زعترك على ذوقك، أو تسوي منه شاي زعتر.',
         en:'Raw zaatar leaves with nothing added and no salt. Mix your own zaatar blend, or brew the leaves as tea.'},
  lines:{ar:['ورق زعتر خام','بدون إضافات','بدون ملح'],en:['Raw zaatar leaves','Nothing added','No salt']},
  ing:{ar:'ورق زعتر',en:'Zaatar leaves'}},

 {id:'mol',best:true,p:3.8,img:'molasses.jpg',c:'liquids',col:'#AC3C72',
  name:{ar:'دبس الرمان الطبيعي',en:'Pomegranate Molasses'},size:{ar:'340 غرام',en:'340 g'},
  about:{ar:'دبس رمان طبيعي مركّز، بدون أي سكر مضاف. طعمه حامض وحلو، ويضبط مع الفتوش والمحمّرة وتتبيلة الدجاج والمشاوي.',
         en:'Natural, concentrated pomegranate molasses with no added sugar. It is sweet and sour, and suits fattoush, muhammara, chicken marinades and grills.'},
  lines:{ar:['مركّز بشكل طبيعي','بدون سكر مضاف'],en:['Naturally concentrated','No added sugar']},
  ing:{ar:'خلاصة دبس رمان طبيعي',en:'Natural pomegranate molasses extract'},
  origin:{ar:'الأردن',en:'Jordan'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'}},

 {id:'tahini',p:2.2,img:'tahini.jpg',c:'liquids',col:'#D29E0E',
  name:{ar:'طحينية فاخرة',en:'Premium Tahini'},size:{ar:'320 غرام',en:'320 g'},
  about:{ar:'طحينة من سمسم طبيعي وبس، إنتاج الأردن. للحمص والمتبّل، ولصوص الطحينة مع الشاورما والسمك.',
         en:'Tahini made from natural sesame and nothing else, produced in Jordan. Use it for hummus and moutabal, or as tahini sauce with shawarma and fish.'},
  lines:{ar:['مكوّن واحد: سمسم طبيعي','إنتاج الأردن'],en:['One ingredient: natural sesame','Made in Jordan']},
  ing:{ar:'سمسم طبيعي',en:'Natural sesame'},origin:{ar:'الأردن',en:'Jordan'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'}},

 {id:'vin',p:2.5,img:'vinegar.jpg',c:'liquids',col:'#238DC1',
  name:{ar:'خل التفاح الخالص',en:'Pure Apple Vinegar'},size:{ar:'250 مل',en:'250 ml'},
  about:{ar:'خل تفاح خالص من عصارة التفاح الكامل، طبيعي 100%. للسلطات والتخليل والتتبيل.',
         en:'Pure apple vinegar made from whole apples, 100% natural. Use it in salads, pickling and marinades.'},
  lines:{ar:['من التفاح الكامل','طبيعي 100%'],en:['Made from whole apples','100% natural']},
  ing:{ar:'خل تفاح خالص',en:'Pure apple vinegar'},origin:{ar:'الأردن',en:'Jordan'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'}},

 {id:'ital',p:3.3,img:'italian.png',c:'powders',col:'#BC2F2C',
  name:{ar:'التبهيرة الإيطالية',en:'Italian Seasoning'},size:{ar:'150 غرام',en:'150 g'},
  about:{ar:'طماطم مجففة مع ثوم وريحان وزعتر بري وبقدونس، على طريقة المطبخ الإيطالي. اخلطها مع شوية زيت زيتون قبل ما تحطها على البيض أو سندويش اللبنة أو الباستا.',
         en:'Dried tomatoes with garlic, basil, oregano and parsley, in the Italian style. Mix it with a little olive oil, then add it to eggs, labneh sandwiches or pasta.'},
  lines:{ar:['طماطم مجففة وأعشاب','إنتاج بحريني'],en:['Dried tomato and herbs','Made in Bahrain']},
  ing:{ar:'طماطم مجففة، ثوم، ريحان، زعتر بري، بقدونس، ملح بحري، فلفل أسود',en:'Dried tomatoes, garlic, basil, oregano, parsley, sea salt, black pepper'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},
  use:{ar:'اخلطها مع قليل من زيت الزيتون، وحطها على البيض أو سندويش اللبنة أو الباستا',en:'Mix with a little olive oil, then add to eggs, labneh sandwiches or pasta'}},

 {id:'mex',p:3.3,img:'mexican.png',c:'powders',col:'#2A7050',
  name:{ar:'التبهيرة المكسيكية',en:'Mexican Seasoning'},size:{ar:'150 غرام',en:'150 g'},
  about:{ar:'هالبينو مجفف مع زعتر وريحان وثوم وبصل وكمون وكزبرة، على طريقة المطبخ المكسيكي. للي يحب الحرارة في البيض وسندويش اللبنة والباستا.',
         en:'Dried jalapeño with thyme, basil, garlic, onion, cumin and coriander, in the Mexican style. For anyone who likes some heat in eggs, labneh sandwiches and pasta.'},
  lines:{ar:['هالبينو مجفف وأعشاب','إنتاج بحريني'],en:['Dried jalapeño and herbs','Made in Bahrain']},
  ing:{ar:'هالبينو مجفف، زعتر، ريحان، ثوم، بصل، ملح بحري، كمون، كزبرة',en:'Dried jalapeño, thyme, basil, garlic, onion, sea salt, cumin, coriander'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},
  use:{ar:'اخلطها مع قليل من زيت الزيتون، وحطها على البيض أو سندويش اللبنة أو الباستا',en:'Mix with a little olive oil, then add to eggs, labneh sandwiches or pasta'}},

 {id:'span',p:3.3,img:'spanish.png',c:'powders',col:'#D29E0E',
  name:{ar:'التبهيرة الإسبانية',en:'Spanish Seasoning'},size:{ar:'150 غرام',en:'150 g'},
  about:{ar:'زيتون مجفف مع ريحان وزعتر بري وإكليل الجبل وثوم وبصل، على طريقة المطبخ الإسباني. اخلطها مع شوية زيت زيتون وحطها على البيض أو سندويش اللبنة أو الباستا.',
         en:'Dried olives with basil, wild thyme, rosemary, garlic and onion, in the Spanish style. Mix it with a little olive oil and add it to eggs, labneh sandwiches or pasta.'},
  lines:{ar:['زيتون مجفف وأعشاب','إنتاج بحريني'],en:['Dried olive and herbs','Made in Bahrain']},
  ing:{ar:'زيتون مجفف، ريحان، زعتر بري، إكليل الجبل، ثوم، بصل، ملح بحري',en:'Dried olives, basil, wild thyme, rosemary, garlic, onion, sea salt'},
  origin:{ar:'البحرين',en:'Bahrain'},store:{ar:'في مكان جاف وبارد',en:'Cool, dry place'},
  use:{ar:'اخلطها مع قليل من زيت الزيتون، وحطها على البيض أو سندويش اللبنة أو الباستا',en:'Mix with a little olive oil, then add to eggs, labneh sandwiches or pasta'}},

 {id:'pers',p:2.8,img:'persian.jpg',c:'dressings',col:'#9E3159',
  name:{ar:'تتبيلة السلطة الفارسية',en:'Persian Salad Dressing'},size:{ar:'6 أظرف صغيرة',en:'6 small sachets'},
  about:{ar:'تتبيلة سائلة جاهزة بالنكهة الفارسية، في البوكس 6 أظرف صغيرة. افتح الظرف وصبّه على السلطة مباشرة.',
         en:'A ready-to-use liquid dressing with a Persian flavor, with 6 small sachets in each box. Open a sachet and pour it straight over your salad.'},
  lines:{ar:['جاهزة للاستخدام','6 أظرف في البوكس'],en:['Ready to use','6 sachets per box']},
  use:{ar:'افتح الظرف وصبّه على السلطة',en:'Open a sachet and pour it over the salad'}},

 {id:'orig',p:2.8,img:'original.jpg',c:'dressings',col:'#8F993E',
  name:{ar:'تتبيلة السلطة الأصلية',en:'Original Salad Dressing'},size:{ar:'6 أظرف × 40 غ (240 غ)',en:'6 × 40 g (240 g)'},
  about:{ar:'تتبيلة سائلة جاهزة بالنكهة الأصلية، في البوكس 6 أظرف صغيرة. افتح الظرف وصبّه على السلطة، وما تحتاج تخلط شي.',
         en:'A ready-to-use liquid dressing with the original flavor, with 6 small sachets in each box. Open a sachet and pour it over your salad. There is nothing to mix.'},
  lines:{ar:['جاهزة للاستخدام','6 أظرف في البوكس'],en:['Ready to use','6 sachets per box']},
  use:{ar:'افتح الظرف وصبّه على السلطة',en:'Open a sachet and pour it over the salad'}},

 {id:'zdr',p:2.8,img:'zaatar-dressing.jpg',c:'dressings',col:'#238DC1',
  name:{ar:'تتبيلة السلطة بالزعتر',en:'Zaatar Salad Dressing'},size:{ar:'6 أظرف × 45 غ (270 غ)',en:'6 × 45 g (270 g)'},
  about:{ar:'تتبيلة سائلة جاهزة بنكهة الزعتر، في البوكس 6 أظرف صغيرة. تضبط مع الفتوش والسلطات الخضرا.',
         en:'A ready-to-use liquid dressing with a zaatar flavor, with 6 small sachets in each box. It goes well with fattoush and green salads.'},
  lines:{ar:['بنكهة الزعتر','6 أظرف في البوكس'],en:['Zaatar flavor','6 sachets per box']},
  use:{ar:'افتح الظرف وصبّه على السلطة',en:'Open a sachet and pour it over the salad'}},

 {id:'neqsa',p:12,img:'neqsa.jpg',c:'gifts',col:'#ACA300',big:true,
  name:{ar:'نقصة الخير',en:'Neqsa al Khair'},
  desc:{ar:'سلة كبيرة للعزايم والمناسبات',en:'A large gift bag for gatherings and occasions'},
  about:{ar:'كيس قماش مطرّز برسمة غصن الزيتون، فيه ثلاث منتجات من جرار. تناسب العزايم وزيارات الأهل، والكيس يتم مع اللي تهديه يستخدمه بعدين.',
         en:'A cloth bag embroidered with an olive branch, holding three Jerar products. It suits gatherings and family visits, and the bag stays with whoever receives it.'},
  lines:{ar:['كيس قماش مطرّز','تقدر تستخدم الكيس مرة ثانية'],en:['Embroidered cloth bag','The bag is reusable']},
  inside:{ar:['زيت زيتون','دبس الرمان','تتبيلة السلطة'],en:['Olive oil','Pomegranate molasses','Salad dressing']}},

 {id:'gift',p:6.6,img:'giftbox.jpg',c:'gifts',col:'#8F993E',
  name:{ar:'بوكس الهدايا',en:'Gift Box'},
  desc:{ar:'زيت زيتون بكر وسماق بلدي',en:'Extra virgin olive oil and baladi sumac'},
  about:{ar:'بوكس كرتون برسمة فنان بحريني وعليه رمز نبتة الزعتر. فيه زيت زيتون بكر ممتاز وسماق بلدي، وجاهز تهديه على طول.',
         en:'A cardboard box illustrated by a Bahraini artist and marked with the zaatar plant. It holds extra virgin olive oil and baladi sumac, ready to give.'},
  lines:{ar:['رسمة فنان بحريني','جاهز للإهداء'],en:['Illustrated by a Bahraini artist','Ready to give']},
  inside:{ar:['زيت زيتون بكر ممتاز','سماق بلدي'],en:['Extra virgin olive oil','Baladi sumac']}},

 {id:'mini',p:3.6,img:'minibox.jpg',c:'gifts',shop:true,col:'#65BAAF',
  name:{ar:'ميني بوكس',en:'Mini Collection Box'},
  desc:{ar:'تشكيلة صغيرة للتجربة أو الإهداء',en:'A small set to try or to give'},
  about:{ar:'أربع عبوات صغيرة في بوكس واحد. تجرّب فيها منتجات جرار قبل ما تاخذ الحجم الكامل، أو تهديها كتوزيعات.',
         en:'Four small packs in one box. Try Jerar products before buying full sizes, or hand them out as favors.'},
  lines:{ar:['4 عبوات صغيرة','مناسب للتجربة والتوزيعات'],en:['4 small packs','Good for tasting and favors']},
  inside:{ar:['زعتر ملكي 25 غ','سماق بلدي 30 غ','زيت زيتون 50 مل','دبس رمان 70 غ'],en:['Zaatar Malaki 25 g','Baladi sumac 30 g','Olive oil 50 ml','Pomegranate molasses 70 g']}}
];

const CATS=[['all',{ar:'الكل',en:'All'}],['liquids',{ar:'زيوت وسوائل',en:'Oils & liquids'}],['powders',{ar:'زعتر وبهارات',en:'Zaatar & spices'}],
            ['dressings',{ar:'تتبيلات سلطة',en:'Salad dressings'}],['gifts',{ar:'هدايا',en:'Gifts'}]];

/* ===== نصوص الواجهة ===== */
const T={
  best_h:{ar:'الأكثر مبيعاً',en:'Best sellers'},best_sub:{ar:'المنتجات اللي يرجع لها عملاء جرار كل مرة.',en:'The products Jerar customers come back for.'},
  best_all:{ar:'مشاهدة جميع المنتجات',en:'View all products'},best_tag:{ar:'الأكثر مبيعاً',en:'Best seller'},
  plp_title:{ar:'جميع المنتجات | جرار',en:'All products | Jerar'},
  pc_h:{ar:'عندك كود خصم؟',en:'Have a discount code?'},pc_ph:{ar:'اكتب الكود',en:'Enter code'},pc_apply:{ar:'استخدم',en:'Use'},pc_remove:{ar:'إزالة',en:'Remove'},
  pc_ok:{ar:'تم تطبيق كود {c}: خصم {p}%',en:'Code {c} applied: {p}% off'},
  pc_bad:{ar:'هذا الكود غير صحيح',en:'This code is not valid'},
  pc_soon:{ar:'الكود يشتغل من 25 لين 27 نوفمبر',en:'This code works from 25 to 27 November'},
  pc_over:{ar:'انتهى هذا العرض',en:'This offer has ended'},
  pc_excl:{ar:'الخصم ما يشمل زيت الزيتون',en:'The discount does not include olive oil'},
  f_sort:{ar:'ترتيب',en:'Sort'},f_def:{ar:'المقترح',en:'Featured'},f_lo:{ar:'السعر: من الأقل',en:'Price: low to high'},f_hi:{ar:'السعر: من الأعلى',en:'Price: high to low'},f_az:{ar:'الاسم',en:'Name'},
  f_stock:{ar:'المتوفر بس',en:'In stock only'},f_count:{ar:'{n} منتج',en:'{n} products'},f_none:{ar:'ما فيه منتجات متوفرة في هالقسم الحين.',en:'No products available in this section right now.'},
  g_full:{ar:'ملء الشاشة',en:'Full screen'},g_pics:{ar:'صور المنتج',en:'Product photos'},g_pic:{ar:'الصورة {n}',en:'Photo {n}'},
  nav_shop:{ar:'المنتجات',en:'Products'},nav_gifts:{ar:'الهدايا',en:'Gifts'},nav_story:{ar:'قصة جرار',en:'Our story'},
  nav_ws:{ar:'طلبات الجملة',en:'Wholesale'},nav_contact:{ar:'تواصل معنا',en:'Contact'},
  home_aria:{ar:'جرار، الصفحة الرئيسية',en:'Jerar home'},main_nav:{ar:'القائمة الرئيسية',en:'Main menu'},menu:{ar:'القائمة',en:'Menu'},
  wa_aria:{ar:'راسلنا على واتساب',en:'Message us on WhatsApp'},
  lang_btn:{ar:'English',en:'العربية'},lang_aria:{ar:'Switch to English',en:'التحويل للعربية'},
  country_label:{ar:'اختر بلدك',en:'Choose your country'},country_hint:{ar:'الأسعار تطلع بعملة بلدك.',en:'Prices are shown in your local currency.'},
  hero_h1:{ar:'<span class="h-brand">جرار</span>من المزارع الطبيعية إلى بيتك',en:'<span class="h-brand">Jerar</span>From natural farms to your home'},
  hero_p:{ar:'زيت زيتون بكر ممتاز، زعتر ملكي وبالجوز وبالفستق، سماق بلدي، دبس رمان وتتبيلات سلطة.',
          en:'Extra virgin olive oil, Malaki, walnut and pistachio zaatar, baladi sumac, pomegranate molasses and salad dressings.'},
  hero_cta:{ar:'تسوّق المنتجات',en:'Shop products'},hero_cta3:{ar:'قصتنا',en:'Our story'},hero_cta4:{ar:'شهاداتنا',en:'Certificates'},hv_watch:{ar:'شاهد الفيديو على يوتيوب',en:'Watch the video on YouTube'},hero_cta2:{ar:'بوكسات الهدايا',en:'Gift boxes'},
  note_express:{ar:'توصيل مستعجل خلال 4 ساعات في البحرين',en:'4-hour express delivery in Bahrain'},
  note_vat:{ar:'الأسعار شاملة الضريبة',en:'Prices include VAT'},
  note_conv:{ar:'الأسعار محوّلة من الدينار البحريني',en:'Prices converted from Bahraini dinar'},
  hero_alt:{ar:'بوكس هدايا جرار فيه زيت زيتون بكر وسماق بلدي',en:'Jerar gift box with extra virgin olive oil and baladi sumac'},
  stamp:{ar:'بوكس الهدايا',en:'Gift Box'},
  shop_h:{ar:'المنتجات',en:'Products'},shop_sub:{ar:'كل منتج بلون عبوته، عشان تعرفه أول ما يوصلك.',en:'Each product carries the color of its pack, so you know it when it arrives.'},
  tabs_aria:{ar:'تصفية حسب النوع',en:'Filter by type'},
  story_alt:{ar:'زيت زيتون بكر ممتاز من جرار',en:'Jerar extra virgin olive oil'},
  story_kick:{ar:'قصتنا',en:'Our story'},
  story_ring:{ar:'طازج • صحي • طبيعي • من مزارع الأردن • ',en:'FRESH • HEALTHY • NATURAL • FROM JORDAN • '},
  jr_h:{ar:'رحلة الزيتون',en:"The olive's journey"},
  jr_sub:{ar:'من الشجرة لين سفرتك، بأربع خطوات.',en:'From the tree to your table, in four steps.'},
  jr1_t:{ar:'المزرعة',en:'The farm'},jr1_d:{ar:'أشجار زيتون في مزارع طبيعية.',en:'Olive trees on natural farms.'},
  jr2_t:{ar:'القطف',en:'The harvest'},jr2_d:{ar:'ينقطف الزيتون باليد في موسمه.',en:'Olives are picked by hand, in season.'},
  jr3_t:{ar:'العصر والفحص',en:'Pressing and testing'},jr3_d:{ar:'عصر الزيت وفحصه مختبريًا.',en:'The oil is pressed and lab-tested.'},
  jr3_l:{ar:'شوف الشهادات',en:'See the certificates'},
  jr4_t:{ar:'بيتك',en:'Your home'},jr4_d:{ar:'نعبّيه ونوصله لك من البحرين.',en:'We pack it and deliver it to you from Bahrain.'},
  story_h:{ar:'ليش سمّيناها جرار؟',en:'Why the name Jerar?'},
  story_p1:{ar:'الجرّة وعاء قديم من الفخّار، كانت البيوت تحفظ فيه الزيت والزعتر والسماق ومونة السنة كلها. يحمي الأكل من الشمس والحرارة، ويخليه على طعمه شهور.',
         en:'A jarra is an old clay vessel. Homes kept their olive oil, zaatar, sumac and the whole year’s pantry in it. It shields food from sun and heat and keeps its taste for months.'},
  story_p2:{ar:'أخذنا الاسم منها لأننا نبي نفس الشي: منتجات طبيعية، محفوظة صح، توصل بيتك بطعمها الأصلي.',en:'We took our name from it because we want the same thing: natural products, stored right, reaching your home with their original taste.'},
  story_q:{ar:'طازج، صحي، وطبيعي. هذا اللي نبيه في كل جرّة.',en:'Fresh, healthy and natural. That is what we want in every jar.'},
  gifts_h:{ar:'هدايا جاهزة',en:'Ready-made gifts'},gifts_sub:{ar:'للعزايم والزيارات والمناسبات. تختار البوكس، وإحنا نغلّفه ونوصله.',en:'For gatherings, visits and occasions. Pick a box and we wrap and deliver it.'},
  del_std:{ar:'توصيل عادي',en:'Standard delivery'},del_std_s:{ar:'خلال يومي عمل، من السبت إلى الخميس',en:'Within 2 working days, Saturday to Thursday'},
  del_exp:{ar:'توصيل مستعجل',en:'Express delivery'},del_exp_s:{ar:'خلال 4 ساعات من الطلب',en:'Within 4 hours of ordering'},
  del_q:{ar:'عندك سؤال عن طلبك؟',en:'A question about your order?'},del_q_s:{ar:'راسلنا على واتساب',en:'Message us on WhatsApp'},
  del_out:{ar:'التوصيل إلى {c}',en:'Delivery to {c}'},
  del_out_s:{ar:'نتفق معك على الشحن وتكلفته على واتساب قبل ما نرسل الطلب.',en:'We agree shipping and its cost with you on WhatsApp before we send your order.'},
  del_rate:{ar:'عن الأسعار',en:'About prices'},
  del_rate_s:{ar:'محوّلة من الدينار البحريني بسعر الصرف، ومقرّبة.',en:'Converted from Bahraini dinar at the exchange rate, then rounded.'},
  ws_h:{ar:'عندك مطعم أو فندق؟',en:'Run a restaurant or hotel?'},
  ws_sub:{ar:'نوفر منتجات جرار بالجملة بأسعار تنافسية، والتوصيل مجاني. اكتب لنا اللي تحتاجه ونرجع لك بعرض سعر.',
          en:'We supply Jerar products wholesale at competitive prices, with free delivery. Tell us what you need and we will send you a quote.'},
  ws_l1:{ar:'زيت زيتون بعبوات كبيرة',en:'Olive oil in large packs'},ws_l2:{ar:'زعتر وسماق ومطحنات للمطابخ',en:'Zaatar, sumac and spices for kitchens'},
  ws_l3:{ar:'توصيل مجاني لطلبات الجملة',en:'Free delivery on wholesale orders'},
  ws_name:{ar:'اسمك',en:'Your name'},ws_co:{ar:'اسم المطعم أو الفندق',en:'Restaurant or hotel name'},
  ws_via:{ar:'كيف نتواصل معك؟',en:'How should we reach you?'},
  via_call:{ar:'اتصال',en:'Call'},via_wa:{ar:'واتساب',en:'WhatsApp'},via_mail:{ar:'إيميل',en:'Email'},
  ws_msg:{ar:'وش تحتاج؟',en:'What do you need?'},ws_ph:{ar:'مثال: 20 لتر زيت زيتون، 5 كيلو زعتر ملكي شهرياً',en:'e.g. 20 L olive oil and 5 kg Zaatar Malaki a month'},
  ws_send:{ar:'أرسل الطلب على واتساب',en:'Send request on WhatsApp'},
  f_tag:{ar:'منتجات طبيعية من مزارع الأردن، نوصلها لكم من البحرين.',en:'Natural products from Jordanian farms, delivered from Bahrain.'},
  f_cat_liquids:{ar:'زيوت وسوائل',en:'Oils & liquids'},f_cat_powders:{ar:'زعتر وبهارات',en:'Zaatar & spices'},f_cat_dressings:{ar:'تتبيلات سلطة',en:'Salad dressings'},
  f_shop:{ar:'تسوّق',en:'Shop'},f_about:{ar:'عن جرار',en:'About Jerar'},f_contact:{ar:'تواصل معنا',en:'Contact'},
  f_cert:{ar:'الشهادات',en:'Certificates'},
  cert_h:{ar:'شهادات الجودة',en:'Quality certificates'},
  cert_sub:{ar:'زيت الزيتون عندنا ينفحص في مختبرات معتمدة، وهذي الشهادات الأصلية. اضغط على أي شهادة عشان تشوفها كاملة مع أهم النتائج.',en:'Our olive oil is tested by accredited labs. These are the original certificates. Tap any one to see it in full with the key results.'},
  cert_t:{ar:'شهادة فحص زيت الزيتون',en:'Olive oil test certificate'},
  cert_d:{ar:'فحص مخبري لجودة زيت الزيتون البكر الممتاز',en:'Lab quality test for extra virgin olive oil'},
  cert_view:{ar:'عرض الشهادة',en:'View certificate'},
  cert_close:{ar:'إغلاق',en:'Close'},cert_prev:{ar:'الشهادة السابقة',en:'Previous certificate'},cert_next:{ar:'الشهادة التالية',en:'Next certificate'},
  cert_lab:{ar:'جهة الفحص',en:'Tested by'},cert_date:{ar:'تاريخ التقرير',en:'Report date'},cert_res:{ar:'أهم النتائج',en:'Key results'},cert_lim:{ar:'الحد',en:'Limit'},
  cert_zoom:{ar:'اضغط على الشهادة عشان تكبّرها',en:'Tap the certificate to zoom'},
  cert_kick:{ar:'شهادة فحص مخبري',en:'Lab test certificate'},
  cert_t2:{ar:'زيت الزيتون البكر الممتاز',en:'Extra virgin olive oil'},
  cert_s1:{ar:'شهادات فحص',en:'Test certificates'},
  cert_s2:{ar:'مواسم مفحوصة',en:'Seasons tested'},
  cert_all:{ar:'تصفّح الشهادات',en:'Browse certificates'},f_delivery:{ar:'سياسة التوصيل',en:'Delivery policy'},f_return:{ar:'سياسة الإرجاع',en:'Return policy'},
  f_wa:{ar:'واتساب',en:'WhatsApp'},f_ig:{ar:'انستغرام',en:'Instagram'},
  f_rights:{ar:'جميع الحقوق محفوظة لجرار',en:'All rights reserved, Jerar'},f_terms:{ar:'الشروط والأحكام',en:'Terms & conditions'},
  cart_h:{ar:'سلتك',en:'Your cart'},cart_aria:{ar:'السلة',en:'Cart'},cart_close:{ar:'سكّر السلة',en:'Close cart'},
  cart_open:{ar:'افتح السلة',en:'Open cart'},cart_open_n:{ar:'افتح السلة، فيها {n} منتج',en:'Open cart, {n} items'},
  cart_empty:{ar:'سلتك فاضية.',en:'Your cart is empty.'},cart_browse:{ar:'تصفّح المنتجات',en:'Browse products'},
  ship_aria:{ar:'نوع التوصيل',en:'Delivery type'},ship_std:{ar:'عادي، خلال يومين',en:'Standard, 2 days'},ship_exp:{ar:'مستعجل، خلال 4 ساعات',en:'Express, 4 hours'},
  c_sub:{ar:'المنتجات',en:'Products'},c_ship:{ar:'التوصيل',en:'Delivery'},c_tot:{ar:'الإجمالي',en:'Total'},
  c_ship_wa:{ar:'نتفق عليه على واتساب',en:'Agreed on WhatsApp'},
  checkout:{ar:'أكمل الطلب',en:'Complete order'},
  cart_note:{ar:'نرسل طلبك لواتساب جرار، ونأكد معك العنوان وطريقة الدفع.',en:'Your order goes to Jerar on WhatsApp, and we confirm the address and payment with you.'},
  cart_note_out:{ar:'نرسل طلبك لواتساب جرار، ونأكد معك الشحن وتكلفته والدفع.',en:'Your order goes to Jerar on WhatsApp, and we confirm shipping, its cost and payment with you.'},
  add:{ar:'أضف',en:'Add'},added:{ar:'تمت',en:'Added'},details:{ar:'التفاصيل',en:'Details'},sold_out:{ar:'نفد حالياً',en:'Sold out'},from:{ar:'من',en:'from'},
  add_aria:{ar:'أضف {p} للسلة',en:'Add {p} to cart'},toast_add:{ar:'أضفنا {p} للسلة',en:'Added {p} to your cart'},
  plus:{ar:'زيد واحد',en:'Add one'},minus:{ar:'نقّص واحد',en:'Remove one'},smallest:{ar:'أصغر حجم',en:'smallest size'},
  home:{ar:'الرئيسية',en:'Home'},crumbs:{ar:'مسار الصفحة',en:'Breadcrumb'},
  vat:{ar:'السعر شامل الضريبة',en:'Price includes VAT'},conv:{ar:'سعر تقريبي محوّل من {p}',en:'Approximate price, converted from {p}'},
  choose_size:{ar:'اختر الحجم',en:'Choose a size'},
  add_to_cart:{ar:'أضف للسلة، {p}',en:'Add to cart, {p}'},order_wa:{ar:'اطلب على واتساب',en:'Order on WhatsApp'},
  oos_size:{ar:'هذا الحجم نفد حالياً. راسلنا ونبلغك أول ما يتوفر.',en:'This size is sold out. Message us and we will tell you when it is back.'},
  oos_prod:{ar:'هذا المنتج نفد حالياً. راسلنا ونبلغك أول ما يتوفر.',en:'This product is sold out. Message us and we will tell you when it is back.'},
  notify:{ar:'بلّغني لما يتوفر',en:'Tell me when it is back'},
  inside_box:{ar:'وش داخل البوكس؟',en:'What is in the box?'},
  qty_plus:{ar:'زيد الكمية',en:'Increase quantity'},qty_minus:{ar:'نقّص الكمية',en:'Decrease quantity'},
  fact_size:{ar:'الحجم',en:'Size'},fact_pack:{ar:'العبوة',en:'Pack'},fact_ing:{ar:'المكونات',en:'Ingredients'},fact_allergy:{ar:'تنبيه للحساسية',en:'Allergy notice'},
  fact_origin:{ar:'بلد المنشأ',en:'Origin'},fact_store:{ar:'طريقة الحفظ',en:'Storage'},fact_use:{ar:'الاستخدام',en:'How to use'},fact_del:{ar:'التوصيل',en:'Delivery'},
  fact_del_bh:{ar:'عادي خلال يومين بـ {a}، أو مستعجل خلال 4 ساعات بـ {b}',en:'Standard within 2 days for {a}, or express within 4 hours for {b}'},
  fact_del_out:{ar:'نتفق معك على الشحن إلى {c} على واتساب',en:'Shipping to {c} is agreed with you on WhatsApp'},
  related:{ar:'ممكن يعجبك بعد',en:'You might also like'},
  nf_h:{ar:'ما لقينا هذا المنتج',en:'We could not find this product'},nf_p:{ar:'يمكن الرابط قديم أو المنتج انشال من المتجر.',en:'The link may be old, or the product is no longer in the shop.'},
  nf_btn:{ar:'شوف كل المنتجات',en:'See all products'},
  doc_title:{ar:'جرار | زيت زيتون وزعتر وسماق من مزارع الأردن',en:'Jerar | Olive oil, zaatar and sumac from Jordanian farms'},
  /* رسائل واتساب */
  m_order:{ar:'هلا جرار، حاب أطلب:',en:'Hello Jerar, I would like to order:'},m_ship:{ar:'التوصيل',en:'Delivery'},m_total:{ar:'الإجمالي',en:'Total'},
  m_country:{ar:'البلد',en:'Country'},m_std:{ar:'عادي',en:'Standard'},m_exp:{ar:'مستعجل',en:'Express'},m_agree:{ar:'نتفق على الشحن',en:'Shipping to be agreed'},
  m_one:{ar:'هلا جرار، حاب أطلب {p} × {q}',en:'Hello Jerar, I would like to order {p} × {q}'},
  m_notify:{ar:'هلا جرار، بلّغوني لما يتوفر {p}',en:'Hello Jerar, please tell me when {p} is back in stock'},
  m_ws:{ar:'طلب جملة',en:'Wholesale request'},m_name:{ar:'الاسم',en:'Name'},m_co:{ar:'المنشأة',en:'Business'},m_via:{ar:'أفضّل التواصل',en:'Preferred contact'}
};

/* ===== اللغة والبلد ===== */
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function guessCountry(){
  try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;const hit=Object.entries(COUNTRIES).find(([,c])=>c.tz===tz);if(hit)return hit[0]}catch(e){}
  return 'BH';
}
/* العربي هو الافتراضي، والزائر يقدر يحوّل للإنجليزي ويتحفظ اختياره */
let LANG=store.get('jerar-lang')==='en'?'en':'ar';
let COUNTRY=store.get('jerar-country');if(!COUNTRIES[COUNTRY])COUNTRY=guessCountry();
const CC=()=>COUNTRIES[COUNTRY];
const isBH=()=>COUNTRY==='BH';

/* tx: يرجّع النص باللغة الحالية. t: نص واجهة مع تعويض {x} */
const tx=v=>v&&typeof v==='object'&&!Array.isArray(v)&&('ar' in v)?v[LANG]:v;
const t=(k,vars)=>{let s=tx(T[k])||k;if(vars)for(const [a,b] of Object.entries(vars))s=s.split('{'+a+'}').join(b);return s};
const nm=p=>p.name[LANG];
const otherName=p=>p.name[LANG==='ar'?'en':'ar'];
const catName=k=>tx((CATS.find(c=>c[0]===k)||[,''])[1]);

/* ===== الأسعار ===== */
const ni=n=>new Intl.NumberFormat('en-US').format(n);
function convert(bhd,cc=CC()){
  if(cc.rate===1)return bhd;
  const v=bhd*cc.rate;return Math.ceil(v/cc.step-1e-9)*cc.step;
}
function fmt(v,cc=CC()){return new Intl.NumberFormat('en-US',{minimumFractionDigits:cc.dec,maximumFractionDigits:cc.dec}).format(v)}
/* money: سعر بالدينار البحريني يطلع بعملة البلد المختار */
/* showAmt: مبلغ محوّل جاهز (بعملة البلد) مع رمز العملة */
function showAmt(v,cc=CC()){const n=fmt(v,cc);return LANG==='ar'?`${n} ${cc.sym.ar}`:`${cc.sym.en} ${n}`}
function money(bhd,cc=CC()){return showAmt(convert(bhd,cc),cc)}
function moneyParts(bhd){const cc=CC();return{n:fmt(convert(bhd,cc),cc),s:cc.sym[LANG]}}
const bhdText=bhd=>money(bhd,COUNTRIES.BH);

const $=s=>document.querySelector(s);
const ICON_ADD='<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
const ICON_OK='<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>';
const byId=id=>P.find(p=>p.id===id);
const link=p=>`#p-${p.id}`;
const isOut=p=>p.out||(p.sizes&&!p.sizes.some(s=>s.in));
const priceHTML=(bhd,from)=>{const m=moneyParts(bhd);return `${from?`<small>${t('from')} </small>`:''}${LANG==='ar'?`${m.n} <small>${m.s}</small>`:`<small>${m.s}</small> ${m.n}`}`};

function cardHTML(p){
  const out=isOut(p);
  return `<article class="card" style="--c:${p.col}">
     <a href="${link(p)}" class="ph">${out?`<span class="flag">${t('sold_out')}</span>`:''}<img loading="lazy" src="img/${p.img}" alt="${nm(p)}"></a>
     <span class="band" aria-hidden="true"></span>
     <h3><a href="${link(p)}">${nm(p)}</a></h3><span class="en">${otherName(p)}</span>
     <div class="row">
       <span class="price">${priceHTML(p.p,!!p.sizes)}</span>
       ${out?`<a class="add" href="${link(p)}">${t('details')}</a>`:`<button class="add" data-add="${defaultKey(p)}" aria-label="${t('add_aria',{p:nm(p)})}">${ICON_ADD}${t('add')}</button>`}
     </div>
   </article>`;
}

/* ===== السلة: المفتاح "id" أو "id:size" ===== */
let cart={};
try{cart=JSON.parse(store.get('jerar-cart')||'{}')||{}}catch(e){cart={}}
const save=()=>store.set('jerar-cart',JSON.stringify(cart));
function lineOf(key){
  const [id,sk]=key.split(':');const p=byId(id);if(!p)return null;
  if(p.sizes){const s=p.sizes.find(x=>x.k===(sk||p.sizes[0].k));if(!s)return null;return{p,price:s.p,label:tx(s.l)}}
  return{p,price:p.p,label:tx(p.size)||''};
}
function defaultKey(p){if(!p.sizes)return p.id;const s=p.sizes.find(x=>x.in)||p.sizes[0];return p.id+':'+s.k}
function add(key,qty=1,btn){
  const L=lineOf(key);if(!L)return;
  cart[key]=(cart[key]||0)+qty;save();renderCart();
  toast(t('toast_add',{p:nm(L.p)+(L.p.sizes?' '+L.label:'')}));
  if(btn){const old=btn.innerHTML;btn.classList.add('done');btn.innerHTML=ICON_OK+t('added');setTimeout(()=>{btn.classList.remove('done');btn.innerHTML=old},1300)}
}
const waUrl=msg=>'https://wa.me/97332159000?text='+encodeURIComponent(msg);
function renderCart(){
  const keys=Object.keys(cart).filter(k=>cart[k]>0&&lineOf(k));
  const n=keys.reduce((s,k)=>s+cart[k],0);
  const c=$('#count');c.textContent=ni(n);c.classList.toggle('on',n>0);
  $('#cartBtn').setAttribute('aria-label',n?t('cart_open_n',{n}):t('cart_open'));
  $('#shipSeg').hidden=!isBH();
  if(!keys.length){$('#dList').innerHTML=`<div class="empty">${t('cart_empty')}<br><a href="#products" data-close>${t('cart_browse')}</a></div>`;$('#dFoot').hidden=true;return}
  $('#dFoot').hidden=false;
  $('#dList').innerHTML=keys.map(k=>{const L=lineOf(k);return`
   <div class="item"><a href="${link(L.p)}"><img src="img/${L.p.img}" alt=""></a>
     <div class="t"><a href="${link(L.p)}"><b>${nm(L.p)}</b></a><span>${money(L.price)}${L.label?(LANG==='ar'?'، ':', ')+L.label:''}</span></div>
     <div class="qty"><button data-q="${k}" data-d="1" aria-label="${t('plus')}">+</button><span>${ni(cart[k])}</span><button data-q="${k}" data-d="-1" aria-label="${t('minus')}">−</button></div>
   </div>`}).join('');
  /* نجمع الأسعار بعد التحويل عشان الإجمالي يطابق اللي يشوفه المستخدم */
  const cc=CC();
  const sub=keys.reduce((s,k)=>s+convert(lineOf(k).price,cc)*cart[k],0);
  const shipBhd=isBH()?+document.querySelector('input[name=ship]:checked').value:0;
  const disc=promoDisc(keys,cc);
  const tot=sub-disc+shipBhd;
  const show=v=>showAmt(v,cc);
  $('#sub').textContent=show(sub);
  $('#discLine').hidden=!disc;
  if(disc){$('#discLbl').textContent=`${tx(OFFER.line).replace('{c}',OFFER.code)} (${OFFER.pct}%)`;$('#discV').textContent='− '+show(disc)}
  $('#shipV').textContent=isBH()?show(shipBhd):t('c_ship_wa');
  $('#tot').textContent=show(tot);
  $('#cartNote').textContent=isBH()?t('cart_note'):t('cart_note_out');
  const shipName=isBH()?(document.querySelector('input[name=ship]:checked').id==='s1'?t('m_std'):t('m_exp')):t('m_agree');
  const lines=keys.map(k=>{const L=lineOf(k);return`- ${nm(L.p)}${L.p.sizes?' ('+L.label+')':''} × ${cart[k]}`}).join('\n');
  $('#checkout').href=waUrl(`${t('m_order')}\n${lines}\n\n${t('m_country')}: ${cc[LANG]}\n${t('m_ship')}: ${shipName}${disc?`\n${tx(OFFER.line).replace('{c}',OFFER.code)} ${OFFER.pct}%: − ${show(disc)}`:''}\n${t('m_total')}: ${show(tot)}`);
}
function openCart(){$('#drawer').classList.add('on');$('#drawer').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');setTimeout(()=>$('#closeCart').focus(),50)}
function closeCart(){$('#drawer').classList.remove('on');$('#drawer').setAttribute('aria-hidden','true');$('#scrim').classList.remove('on')}
let tt;function toast(m){const el=$('#toast');el.textContent=m;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),1800)}
function toggleMenu(open){$('#mnav').classList.toggle('on',open);$('#menuBtn').setAttribute('aria-expanded',open);setHeader()}

/* ===== تطبيق اللغة على النصوص الثابتة =====
   data-t: النص، data-t-html: نص فيه وسوم، data-t-aria / data-t-ph / data-t-alt: خصائص */
function applyStatic(){
  const h=document.documentElement;h.lang=LANG;h.dir=LANG==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
  document.querySelectorAll('[data-t-html]').forEach(el=>el.innerHTML=t(el.dataset.tHtml));
  document.querySelectorAll('[data-t-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.tAria)));
  document.querySelectorAll('[data-t-ph]').forEach(el=>el.setAttribute('placeholder',t(el.dataset.tPh)));
  document.querySelectorAll('[data-t-alt]').forEach(el=>el.setAttribute('alt',t(el.dataset.tAlt)));
  document.querySelectorAll('[data-price]').forEach(el=>el.textContent=money(+el.dataset.price));
  $('#langBtn').innerHTML=`<span class="full">${t('lang_btn')}</span><span class="short">${LANG==='ar'?'EN':'ع'}</span>`;
  $('#langBtn').setAttribute('lang',LANG==='ar'?'en':'ar');
  $('#curBtn').querySelector('b').textContent=CC().code;
  renderCountryList();
}
function renderCountryList(){
  $('#countryList').innerHTML=Object.entries(COUNTRIES).map(([k,c])=>
    `<li><button role="menuitemradio" aria-checked="${k===COUNTRY}" data-country="${k}"><span>${c[LANG]}</span><b>${c.code}</b></button></li>`).join('');
}
function setLocale(lang,country){
  if(lang)LANG=lang;if(country)COUNTRY=country;
  store.set('jerar-lang',LANG);store.set('jerar-country',COUNTRY);
  applyStatic();renderCart();
  document.dispatchEvent(new Event('localechange'));
}
function toggleCountry(open){
  const pop=$('#countryPop');pop.hidden=!open;$('#curBtn').setAttribute('aria-expanded',open);
  if(open)setTimeout(()=>{const b=pop.querySelector('[aria-checked=true]');b&&b.focus()},30);
}

/* ===== الهيدر: شفاف فوق الهيرو الأخضر، ثابت في صفحة المنتج ===== */
const hdr=$('#hdr');
function setHeader(){
  if(document.body.classList.contains('view-product')||document.body.classList.contains('view-plp')||document.body.classList.contains('view-info'))return hdr.classList.add('solid');
  hdr.classList.toggle('solid',scrollY>window.innerHeight*0.55||$('#mnav').classList.contains('on'));
}
addEventListener('scroll',setHeader,{passive:true});

document.addEventListener('click',e=>{
  const a=e.target.closest('[data-add]');if(a){e.preventDefault();add(a.dataset.add,1,a);return}
  const q=e.target.closest('[data-q]');if(q){const k=q.dataset.q;cart[k]=Math.max(0,(cart[k]||0)+ +q.dataset.d);if(!cart[k])delete cart[k];save();renderCart();return}
  const cn=e.target.closest('[data-country]');if(cn){toggleCountry(false);setLocale(null,cn.dataset.country);$('#curBtn').focus();return}
  if(!e.target.closest('#countryPop')&&!e.target.closest('#curBtn'))toggleCountry(false);
  if(e.target.closest('[data-close]'))closeCart();
  if(e.target.closest('.mnav a'))toggleMenu(false);
});
$('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;$('#scrim').onclick=closeCart;
$('#langBtn').onclick=()=>setLocale(LANG==='ar'?'en':'ar');
$('#curBtn').onclick=()=>toggleCountry($('#countryPop').hidden);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();toggleMenu(false);if(!$('#countryPop').hidden){toggleCountry(false);$('#curBtn').focus()}}});
$('#shipSeg').onchange=renderCart;
$('#menuBtn').onclick=()=>toggleMenu(!$('#mnav').classList.contains('on'));
/* تحديث السلة لو تغيّرت من تبويب ثاني */
addEventListener('storage',e=>{if(e.key==='jerar-cart'){try{cart=JSON.parse(e.newValue||'{}')||{}}catch(_){cart={}}renderCart()}});
applyStatic();renderCart();setHeader();
