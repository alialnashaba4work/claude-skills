/*
  محتوى الموقع كله هنا.
  - كل قسم فيه "groups" (أقسام فرعية مثل المواسم حسب السنة)، ويمكن أن تحتوي الأقسام الفرعية على أقسام فرعية أخرى.
  - آخر مستوى فيه "items" وهي المقاطع/القصائد.
  - كل مقطع: id (بالإنجليزي بدون مسافات)، title، audio (مسار ملف الصوت)، text (النص).
  - color: لون وسط الأسطوانة. يوضع على القسم، ويمكن وضعه على قسم فرعي أو مقطع ليغطي لون القسم.
  - في النص: كل سطر بيت، والسطر الفارغ يفصل بين المقاطع، وعلامة | تفصل صدر البيت عن عجزه.
*/
window.SITE = {
  name: "السيد أحمد الموسوي",
  tagline: "",
  cover: "img/cover-512.jpg",
  sections: [
    {
      id: "quran", color: "#d4b25a", title: "القرآن الكريم", note: "تلاوات",
      groups: [
        { id: "tilawat", title: "تلاوات مختارة", items: [
          { id: "q1", title: "تلاوة نموذجية", audio: "audio/sample.mp3", text: "يوضع هنا نص الآيات المتلوة." }
        ]}
      ]
    },
    {
      id: "duaa", color: "#8fb3e0", title: "أدعية ومناجاة", note: "أدعية الأيام والليالي",
      groups: [
        { id: "adiya", title: "أدعية", items: [
          { id: "d1", title: "دعاء نموذجي", audio: "audio/sample.mp3", text: "يوضع هنا نص الدعاء." }
        ]},
        { id: "munajat", title: "مناجاة", items: [] }
      ]
    },
    {
      id: "seerah", color: "#b58a5c", title: "دروس سيرة", note: "سيرة النبي وأهل بيته",
      groups: [ { id: "general", title: "دروس عامة", items: [] } ]
    },
    {
      id: "latmiyat", color: "#a3232b", title: "لطميات", note: "حسب الموسم",
      groups: [
        { id: "1447", title: "موسم ١٤٤٧هـ", items: [
          { id: "l1", title: "يا حسين", audio: "audio/sample.mp3",
            text: "يا حسينُ وفي اسمِكَ الدمعُ يجري | وعلى ذكرِكَ القلوبُ تذوبُ\nكلُّ عامٍ نعودُ نحملُ جرحاً | ما لهُ غيرُ كربلاءَ طبيبُ\n\n(نص نموذجي — يُستبدل بالنص الأصلي)" },
          { id: "l2", title: "لطمية نموذجية ثانية", audio: "audio/sample.mp3", text: "يوضع هنا نص اللطمية." }
        ]},
        { id: "1446", title: "موسم ١٤٤٦هـ", items: [
          { id: "l3", title: "لطمية من موسم ١٤٤٦", audio: "audio/sample.mp3", text: "يوضع هنا نص اللطمية." }
        ]}
      ]
    },
    {
      id: "rithaa", color: "#a3232b", title: "رثاء ومجالس حسينية", note: "المواسم حسب السنة",
      groups: [
        { id: "1447", title: "موسم ١٤٤٧هـ", groups: [
          { id: "muharram", title: "محرم", items: [
            { id: "r1", title: "مجلس الليلة الأولى", audio: "audio/sample.mp3",
              text: "يا كربلاءُ وفيكِ الحزنُ ما بَرِحا | والدمعُ من مُقلتي في ذكرِهم سَفَحا\nنأتي إليكِ وفي الأرواحِ موعدُنا | عهدٌ مع السبطِ لا يُنسى وإن نَزَحا\n\n(نص نموذجي — يُستبدل بالنص الأصلي)" },
            { id: "r2", title: "مجلس الليلة الثانية", audio: "audio/sample.mp3", text: "يوضع هنا نص المجلس." }
          ]},
          { id: "safar", title: "صفر", items: [] }
        ]},
        { id: "1446", title: "موسم ١٤٤٦هـ", items: [
          { id: "r3", title: "مجلس نموذجي", audio: "audio/sample.mp3", text: "يوضع هنا نص المجلس." }
        ]}
      ]
    },
    {
      id: "madaeh", color: "#3a9a4f", title: "مدائح", note: "مواليد وأفراح أهل البيت",
      groups: [ { id: "mawalid", title: "مواليد", items: [
        { id: "m1", title: "مدحة نموذجية", audio: "audio/sample.mp3", text: "يوضع هنا نص المدحة." }
      ]}]
    },
    {
      id: "recorded", color: "#c6d65b", title: "إنتاجات مسجلة", note: "إصدارات الاستوديو",
      groups: [ { id: "albums", title: "الإصدارات", items: [] } ]
    },
    {
      id: "other", color: "#b9bcc6", title: "أخرى", note: "",
      groups: [ { id: "misc", title: "متفرقات", items: [] } ]
    }
  ]
};
