/*
  محتوى الموقع كله هنا.
  - كل قسم فيه "groups" (أقسام فرعية مثل المواسم حسب السنة)، ويمكن أن تحتوي الأقسام الفرعية على أقسام فرعية أخرى.
  - آخر مستوى فيه "items" وهي المقاطع/القصائد.
  - كل مقطع: id (بالإنجليزي بدون مسافات)، title، والباقي اختياري:
      audio: مسار ملف الصوت
      text: النص (كل سطر بيت، والسطر الفارغ يفصل المقاطع، وعلامة | تفصل الصدر عن العجز)
      cover: صورة مربعة (img/covers/...)
      youtube: رابط المقطع على يوتيوب
      duration: مدة المقطع
  - color على القسم: لون القسم (ويمكن وضعه على موسم أو مقطع).
  - مواسم مقاطع اليوتيوب محسوبة تقريباً من تاريخ النشر في يوتيوب.
*/
window.SITE = {
  "name": "السيد أحمد الموسوي",
  "heroLines": [
    "السيد أحمد",
    "الموســـــوي"
  ],
  "tagline": "",
  "cover": "img/cover-512.jpg",
  "sections": [
    {
      "id": "quran",
      "color": "#d4b25a",
      "title": "القرآن الكريم",
      "note": "تلاوات",
      "groups": [
        {
          "id": "tilawat",
          "title": "تلاوات مختارة",
          "items": []
        }
      ]
    },
    {
      "id": "duaa",
      "color": "#8fb3e0",
      "title": "أدعية ومناجاة",
      "note": "أدعية وزيارات",
      "groups": [
        {
          "id": "adiya",
          "title": "أدعية",
          "items": [
            {
              "id": "G80TVwsCFIk",
              "title": "دعاء الافتتاح",
              "cover": "img/covers/G80TVwsCFIk.jpg",
              "youtube": "https://www.youtube.com/watch?v=G80TVwsCFIk",
              "duration": "25:58"
            },
            {
              "id": "hmwtA1Kk-1s",
              "title": "يا مَنْ يَمْلِكُ حَوائِجَ السّائِلينَ",
              "cover": "img/covers/hmwtA1Kk-1s.jpg",
              "youtube": "https://www.youtube.com/watch?v=hmwtA1Kk-1s",
              "duration": "1:56"
            },
            {
              "id": "cdS_KXPMtz8",
              "title": "دعاء خاب الوافدون على غيرك",
              "cover": "img/covers/cdS_KXPMtz8.jpg",
              "youtube": "https://www.youtube.com/watch?v=cdS_KXPMtz8",
              "duration": "2:25"
            },
            {
              "id": "gdwT3UjqHtI",
              "title": "دعاء يا من أرجوه لكل خير",
              "cover": "img/covers/gdwT3UjqHtI.jpg",
              "youtube": "https://www.youtube.com/watch?v=gdwT3UjqHtI",
              "duration": "2:26"
            },
            {
              "id": "mAJ9ig9Tldo",
              "title": "وَقَدْ أَتَيْتُكَ يا إِلهِي ( دعاء كميل )",
              "cover": "img/covers/mAJ9ig9Tldo.jpg",
              "youtube": "https://www.youtube.com/watch?v=mAJ9ig9Tldo",
              "duration": "2:37"
            },
            {
              "id": "YJzGpUGsbqU",
              "title": "دعاء أمير المؤمنين في مسجد زيد",
              "cover": "img/covers/YJzGpUGsbqU.jpg",
              "youtube": "https://www.youtube.com/watch?v=YJzGpUGsbqU",
              "duration": "7:51"
            },
            {
              "id": "98PiNcjlmeA",
              "title": "اَللّـهُمَّ رَبَّ شَهْرِ رَمَضانَ",
              "cover": "img/covers/98PiNcjlmeA.jpg",
              "youtube": "https://www.youtube.com/watch?v=98PiNcjlmeA",
              "duration": "2:09"
            },
            {
              "id": "ZGh431kV2ek",
              "title": "تَتَحَبَّبُ إلَينا بِالنِّعَمِ",
              "cover": "img/covers/ZGh431kV2ek.jpg",
              "youtube": "https://www.youtube.com/watch?v=ZGh431kV2ek",
              "duration": "1:01"
            },
            {
              "id": "VGMR0LQgEQE",
              "title": "دعاء النور لشفاء المرضى",
              "cover": "img/covers/VGMR0LQgEQE.jpg",
              "youtube": "https://www.youtube.com/watch?v=VGMR0LQgEQE",
              "duration": "2:11"
            },
            {
              "id": "VztRZ2qGlsg",
              "title": "وَارْحَمْني صَريعاً عَلَى الْفِراشِ",
              "cover": "img/covers/VztRZ2qGlsg.jpg",
              "youtube": "https://www.youtube.com/watch?v=VztRZ2qGlsg",
              "duration": "2:36"
            },
            {
              "id": "ayFYpLF2tz4",
              "title": "مالِي كُلَّما قُلْتُ قَدْ صَلُحَتْ سَرِيرَتِي",
              "cover": "img/covers/ayFYpLF2tz4.jpg",
              "youtube": "https://www.youtube.com/watch?v=ayFYpLF2tz4",
              "duration": "4:52"
            },
            {
              "id": "LC3-M6KhMjw",
              "title": "يا عماد من لا عماد له (دعاء المكروب الحزين)",
              "cover": "img/covers/LC3-M6KhMjw.jpg",
              "youtube": "https://www.youtube.com/watch?v=LC3-M6KhMjw",
              "duration": "3:16"
            },
            {
              "id": "8cYOZToO-v8",
              "title": "تَتَحَبَّبُ إلَينا بِالنِّعَمِ",
              "cover": "img/covers/8cYOZToO-v8.jpg",
              "youtube": "https://www.youtube.com/watch?v=8cYOZToO-v8",
              "duration": "1:16"
            },
            {
              "id": "2-ucAX2hzHQ",
              "title": "مقطع من دعاء عرفة",
              "cover": "img/covers/2-ucAX2hzHQ.jpg",
              "youtube": "https://www.youtube.com/watch?v=2-ucAX2hzHQ",
              "duration": "3:18"
            },
            {
              "id": "wll6sJzG1eE",
              "title": "إلهي أتحرق بالنار وجهي",
              "cover": "img/covers/wll6sJzG1eE.jpg",
              "youtube": "https://www.youtube.com/watch?v=wll6sJzG1eE",
              "duration": "3:31"
            },
            {
              "id": "HBHBXY2KVFw",
              "title": "يا من تحل به عقد المكاره",
              "cover": "img/covers/HBHBXY2KVFw.jpg",
              "youtube": "https://www.youtube.com/watch?v=HBHBXY2KVFw",
              "duration": "5:27"
            },
            {
              "id": "CpA4z8xtH90",
              "title": "مقطع مؤثر من دعاء الندبة",
              "cover": "img/covers/CpA4z8xtH90.jpg",
              "youtube": "https://www.youtube.com/watch?v=CpA4z8xtH90",
              "duration": "10:19"
            }
          ]
        },
        {
          "id": "ziyarat",
          "title": "زيارات",
          "items": [
            {
              "id": "4yMI189xwLc",
              "title": "زيارة أمين الله",
              "cover": "img/covers/4yMI189xwLc.jpg",
              "youtube": "https://www.youtube.com/watch?v=4yMI189xwLc",
              "duration": "7:05"
            },
            {
              "id": "pv5AQv7P58I",
              "title": "و قد أتيتك يا أبا عبد الله",
              "cover": "img/covers/pv5AQv7P58I.jpg",
              "youtube": "https://www.youtube.com/watch?v=pv5AQv7P58I",
              "duration": "5:01"
            }
          ]
        },
        {
          "id": "munajat",
          "title": "مناجاة",
          "items": []
        }
      ]
    },
    {
      "id": "seerah",
      "color": "#b58a5c",
      "title": "دروس سيرة",
      "note": "سيرة النبي وأهل بيته",
      "groups": [
        {
          "id": "general",
          "title": "دروس عامة",
          "items": []
        }
      ]
    },
    {
      "id": "latmiyat",
      "color": "#a3232b",
      "title": "لطميات",
      "note": "حسب الموسم",
      "groups": [
        {
          "id": "1448",
          "title": "موسم ١٤٤٨هـ",
          "items": [
            {
              "id": "7Pkn5GCdizc",
              "title": "اللهم إني أفتتح العزاء بحمدك",
              "cover": "img/covers/7Pkn5GCdizc.jpg",
              "youtube": "https://www.youtube.com/watch?v=7Pkn5GCdizc",
              "duration": "1:44"
            },
            {
              "id": "BOTQvpvNKEo",
              "title": "دنبال تو می‌گردم",
              "cover": "img/covers/BOTQvpvNKEo.jpg",
              "youtube": "https://www.youtube.com/watch?v=BOTQvpvNKEo",
              "duration": "6:29"
            },
            {
              "id": "4Ib3uGs7IPA",
              "title": "شمشیر بردار",
              "cover": "img/covers/4Ib3uGs7IPA.jpg",
              "youtube": "https://www.youtube.com/watch?v=4Ib3uGs7IPA",
              "duration": "6:33"
            },
            {
              "id": "SxOPHeTsoWE",
              "title": "دنبال کبریایی",
              "cover": "img/covers/SxOPHeTsoWE.jpg",
              "youtube": "https://www.youtube.com/watch?v=SxOPHeTsoWE",
              "duration": "7:45"
            },
            {
              "id": "q6lrrcN2_Ho",
              "title": "أبا القِربة",
              "cover": "img/covers/q6lrrcN2_Ho.jpg",
              "youtube": "https://www.youtube.com/watch?v=q6lrrcN2_Ho",
              "duration": "6:18"
            }
          ]
        },
        {
          "id": "1447",
          "title": "موسم ١٤٤٧هـ",
          "items": [
            {
              "id": "qad-allamatni",
              "title": "قد علمتني جدّتي",
              "audio": "audio/qad-allamatni-jaddati.mp3",
              "cover": "img/covers/qad-allamatni.jpg",
              "youtube": "https://www.youtube.com/watch?v=ZpEoEvORd4s",
              "text": "اسمكَ غَوثُ الكُرَبِ | فِداكَ أمّي وأبي\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nلي في نداكَ مُعتقد | \"نادِ عليًا\" في الشدد\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nاسمكَ ذا مُعوّلِي | عندَ البلايـا أملي\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nقد علمتنـي جدّتـي\nأدعوكَ وقتَ شدّتي\nهذا الندا عقيدتـي\nيا عليُ يا علي | يا عليُ يا علي\n\nيا نور عيني .. علي\nانت يَقيني .. علي\nادعوك يا سيـدي\nخذ بيمني علي !",
              "duration": "5:12"
            }
          ]
        },
        {
          "id": "1446",
          "title": "موسم ١٤٤٦هـ",
          "items": [
            {
              "id": "_nTGuQ-aBzA",
              "title": "قسم قسم",
              "cover": "img/covers/_nTGuQ-aBzA.jpg",
              "youtube": "https://www.youtube.com/watch?v=_nTGuQ-aBzA",
              "duration": "4:38"
            },
            {
              "id": "VUhR5R4ss6g",
              "title": "فقط حسين(ديني على دين الحسين)",
              "cover": "img/covers/VUhR5R4ss6g.jpg",
              "youtube": "https://www.youtube.com/watch?v=VUhR5R4ss6g",
              "duration": "4:25"
            },
            {
              "id": "h7I0cQae5IE",
              "title": "قَصَّرنا",
              "cover": "img/covers/h7I0cQae5IE.jpg",
              "youtube": "https://www.youtube.com/watch?v=h7I0cQae5IE",
              "duration": "4:57"
            },
            {
              "id": "_25UF1JjLns",
              "title": "من أنا",
              "cover": "img/covers/_25UF1JjLns.jpg",
              "youtube": "https://www.youtube.com/watch?v=_25UF1JjLns",
              "duration": "5:08"
            },
            {
              "id": "un24HTb4dDA",
              "title": "شهر الحسين",
              "cover": "img/covers/un24HTb4dDA.jpg",
              "youtube": "https://www.youtube.com/watch?v=un24HTb4dDA",
              "duration": "8:18"
            },
            {
              "id": "1flzcegD9OY",
              "title": "حالا اومدم ( ها قد أتيت )",
              "cover": "img/covers/1flzcegD9OY.jpg",
              "youtube": "https://www.youtube.com/watch?v=1flzcegD9OY",
              "duration": "7:40"
            },
            {
              "id": "hPx6nz99vHY",
              "title": "مرحبا زينب",
              "cover": "img/covers/hPx6nz99vHY.jpg",
              "youtube": "https://www.youtube.com/watch?v=hPx6nz99vHY",
              "duration": "8:03"
            }
          ]
        },
        {
          "id": "1445",
          "title": "موسم ١٤٤٥هـ",
          "items": [
            {
              "id": "EV7HbVJ3stE",
              "title": "شور| فقط حسين",
              "cover": "img/covers/EV7HbVJ3stE.jpg",
              "youtube": "https://www.youtube.com/watch?v=EV7HbVJ3stE",
              "duration": "4:35"
            },
            {
              "id": "LUA1rT5O3pg",
              "title": "يا خير الأنصار",
              "cover": "img/covers/LUA1rT5O3pg.jpg",
              "youtube": "https://www.youtube.com/watch?v=LUA1rT5O3pg",
              "duration": "7:41"
            },
            {
              "id": "jz9vdMKBrrY",
              "title": "شيعيان از نو (فارسي - عربي )",
              "cover": "img/covers/jz9vdMKBrrY.jpg",
              "youtube": "https://www.youtube.com/watch?v=jz9vdMKBrrY",
              "duration": "7:13"
            },
            {
              "id": "kvHIYyncWvI",
              "title": "السلام",
              "cover": "img/covers/kvHIYyncWvI.jpg",
              "youtube": "https://www.youtube.com/watch?v=kvHIYyncWvI",
              "duration": "7:21"
            },
            {
              "id": "b360AggyLuY",
              "title": "عَلى عهدي",
              "cover": "img/covers/b360AggyLuY.jpg",
              "youtube": "https://www.youtube.com/watch?v=b360AggyLuY",
              "duration": "4:13"
            },
            {
              "id": "Um-PAB1l_7s",
              "title": "تا حسين داريم",
              "cover": "img/covers/Um-PAB1l_7s.jpg",
              "youtube": "https://www.youtube.com/watch?v=Um-PAB1l_7s",
              "duration": "4:37"
            },
            {
              "id": "syoPXP5ExKM",
              "title": "ما عِندي غيرك",
              "cover": "img/covers/syoPXP5ExKM.jpg",
              "youtube": "https://www.youtube.com/watch?v=syoPXP5ExKM",
              "duration": "5:10"
            },
            {
              "id": "G7idTbjJ-CA",
              "title": "ما ملت شهادتيم (فارسي - عربي)",
              "cover": "img/covers/G7idTbjJ-CA.jpg",
              "youtube": "https://www.youtube.com/watch?v=G7idTbjJ-CA",
              "duration": "5:27"
            }
          ]
        },
        {
          "id": "1444",
          "title": "موسم ١٤٤٤هـ",
          "items": [
            {
              "id": "uV-Y4kesy20",
              "title": "إِنْ تَنْصُرُوا اللَّهَ يَنْصُرْكُمْ",
              "cover": "img/covers/uV-Y4kesy20.jpg",
              "youtube": "https://www.youtube.com/watch?v=uV-Y4kesy20",
              "duration": "3:26"
            },
            {
              "id": "a75h2STbM84",
              "title": "عزيز دلم حسين",
              "cover": "img/covers/a75h2STbM84.jpg",
              "youtube": "https://www.youtube.com/watch?v=a75h2STbM84",
              "duration": "6:19"
            }
          ]
        },
        {
          "id": "1443",
          "title": "موسم ١٤٤٣هـ",
          "items": [
            {
              "id": "PEJriwXkCe8",
              "title": "جان جانانه",
              "cover": "img/covers/PEJriwXkCe8.jpg",
              "youtube": "https://www.youtube.com/watch?v=PEJriwXkCe8",
              "duration": "2:50"
            },
            {
              "id": "B_XAuhGmpqk",
              "title": "الحِقني بالحسين(فارسي-عربي)",
              "cover": "img/covers/B_XAuhGmpqk.jpg",
              "youtube": "https://www.youtube.com/watch?v=B_XAuhGmpqk",
              "duration": "3:24"
            }
          ]
        }
      ]
    },
    {
      "id": "rithaa",
      "color": "#a3232b",
      "title": "رثاء ومجالس حسينية",
      "note": "المواسم حسب السنة",
      "groups": [
        {
          "id": "1447",
          "title": "موسم ١٤٤٧هـ",
          "items": [
            {
              "id": "6cf9qHbREzE",
              "title": "داره شب ميشه (مصاب السيدة رقية)",
              "cover": "img/covers/6cf9qHbREzE.jpg",
              "youtube": "https://www.youtube.com/watch?v=6cf9qHbREzE",
              "duration": "6:00"
            },
            {
              "id": "8YbRyOk8fyk",
              "title": "كُسِر ضلعُها",
              "cover": "img/covers/8YbRyOk8fyk.jpg",
              "youtube": "https://www.youtube.com/watch?v=8YbRyOk8fyk",
              "duration": "3:25"
            }
          ]
        },
        {
          "id": "1445",
          "title": "موسم ١٤٤٥هـ",
          "items": [
            {
              "id": "H7Xv0DhxNZk",
              "title": "دمعاتها بالعيون هزت أركان يزيد( فارسي - عربي )",
              "cover": "img/covers/H7Xv0DhxNZk.jpg",
              "youtube": "https://www.youtube.com/watch?v=H7Xv0DhxNZk",
              "duration": "4:09"
            },
            {
              "id": "rDo7WUHWqD0",
              "title": "أَنا زَينَب أُختُ الحسين",
              "cover": "img/covers/rDo7WUHWqD0.jpg",
              "youtube": "https://www.youtube.com/watch?v=rDo7WUHWqD0",
              "duration": "6:56"
            },
            {
              "id": "2V1ARVU0o3Y",
              "title": "الحَشْرُ فاطِمَة ( فارسي - عربي )",
              "cover": "img/covers/2V1ARVU0o3Y.jpg",
              "youtube": "https://www.youtube.com/watch?v=2V1ARVU0o3Y",
              "duration": "10:22"
            },
            {
              "id": "P86PR7Kd9K0",
              "title": "لُطِمَ خدُّها ( فارسي -عربي )",
              "cover": "img/covers/P86PR7Kd9K0.jpg",
              "youtube": "https://www.youtube.com/watch?v=P86PR7Kd9K0",
              "duration": "6:23"
            }
          ]
        },
        {
          "id": "1444",
          "title": "موسم ١٤٤٤هـ",
          "items": [
            {
              "id": "LecmHxaNlJE",
              "title": "وصية محروم (ياللي رايح الزيارة)",
              "cover": "img/covers/LecmHxaNlJE.jpg",
              "youtube": "https://www.youtube.com/watch?v=LecmHxaNlJE",
              "duration": "2:53"
            },
            {
              "id": "PVYOhqfgDPk",
              "title": "اى رقيه جان",
              "cover": "img/covers/PVYOhqfgDPk.jpg",
              "youtube": "https://www.youtube.com/watch?v=PVYOhqfgDPk",
              "duration": "6:49"
            },
            {
              "id": "6DE71Bpibx8",
              "title": "إن تُنكِرونِي فَأنا القَاسِم",
              "cover": "img/covers/6DE71Bpibx8.jpg",
              "youtube": "https://www.youtube.com/watch?v=6DE71Bpibx8",
              "duration": "5:52"
            },
            {
              "id": "pl5VDSSngkY",
              "title": "پاشو بريم خونه",
              "cover": "img/covers/pl5VDSSngkY.jpg",
              "youtube": "https://www.youtube.com/watch?v=pl5VDSSngkY",
              "duration": "6:37"
            },
            {
              "id": "sbKCEvfnPDE",
              "title": "وما أدراك ما زينب",
              "cover": "img/covers/sbKCEvfnPDE.jpg",
              "youtube": "https://www.youtube.com/watch?v=sbKCEvfnPDE",
              "duration": "11:46"
            }
          ]
        },
        {
          "id": "1443",
          "title": "موسم ١٤٤٣هـ",
          "items": [
            {
              "id": "b2Qq_6Teb7k",
              "title": "راحت روحم",
              "cover": "img/covers/b2Qq_6Teb7k.jpg",
              "youtube": "https://www.youtube.com/watch?v=b2Qq_6Teb7k",
              "duration": "3:30"
            }
          ]
        },
        {
          "id": "1442",
          "title": "موسم ١٤٤٢هـ",
          "items": [
            {
              "id": "TETThoez54M",
              "title": "نافِذُ البَصيْرَة",
              "cover": "img/covers/TETThoez54M.jpg",
              "youtube": "https://www.youtube.com/watch?v=TETThoez54M",
              "duration": "6:29"
            },
            {
              "id": "WzyswiSuRis",
              "title": "أوفيتُ؟",
              "cover": "img/covers/WzyswiSuRis.jpg",
              "youtube": "https://www.youtube.com/watch?v=WzyswiSuRis",
              "duration": "2:55"
            }
          ]
        }
      ]
    },
    {
      "id": "madaeh",
      "color": "#3a9a4f",
      "title": "مدائح",
      "note": "مواليد وأفراح أهل البيت",
      "groups": [
        {
          "id": "madaeh",
          "title": "مدائح",
          "items": [
            {
              "id": "3n60UpFc7TM",
              "title": "يا علي يا علي",
              "cover": "img/covers/3n60UpFc7TM.jpg",
              "youtube": "https://www.youtube.com/watch?v=3n60UpFc7TM",
              "duration": "5:57"
            },
            {
              "id": "xY3CcXKk9Aw",
              "title": "انتظروا الفرج",
              "cover": "img/covers/xY3CcXKk9Aw.jpg",
              "youtube": "https://www.youtube.com/watch?v=xY3CcXKk9Aw",
              "duration": "3:49"
            },
            {
              "id": "gWfslf3NzTA",
              "title": "لو أن عبداً مدح أمير المؤمنين",
              "cover": "img/covers/gWfslf3NzTA.jpg",
              "youtube": "https://www.youtube.com/watch?v=gWfslf3NzTA",
              "duration": "1:58"
            },
            {
              "id": "ltBU7WuWfkw",
              "title": "به مقام قرب سلمان",
              "cover": "img/covers/ltBU7WuWfkw.jpg",
              "youtube": "https://www.youtube.com/watch?v=ltBU7WuWfkw",
              "duration": "3:57"
            },
            {
              "id": "t_1k4gkHgCw",
              "title": "بعلي ( فارسي - عربي )",
              "cover": "img/covers/t_1k4gkHgCw.jpg",
              "youtube": "https://www.youtube.com/watch?v=t_1k4gkHgCw",
              "duration": "4:44"
            },
            {
              "id": "QhmN909vaZg",
              "title": "مرد عليه ( فارسي - عربي )",
              "cover": "img/covers/QhmN909vaZg.jpg",
              "youtube": "https://www.youtube.com/watch?v=QhmN909vaZg",
              "duration": "6:17"
            },
            {
              "id": "AuOTPz5nynI",
              "title": "قسم به حيدر (فارسي - عربي)",
              "cover": "img/covers/AuOTPz5nynI.jpg",
              "youtube": "https://www.youtube.com/watch?v=AuOTPz5nynI",
              "duration": "6:58"
            },
            {
              "id": "hdPio6C4ZI0",
              "title": "نادِ علياً في الشدد",
              "cover": "img/covers/hdPio6C4ZI0.jpg",
              "youtube": "https://www.youtube.com/watch?v=hdPio6C4ZI0",
              "duration": "6:37"
            },
            {
              "id": "wd8MlX7M_uc",
              "title": "يا صاحب الزمان",
              "cover": "img/covers/wd8MlX7M_uc.jpg",
              "youtube": "https://www.youtube.com/watch?v=wd8MlX7M_uc",
              "duration": "8:05"
            },
            {
              "id": "Alq0_PgfrsE",
              "title": "بالمصطفى",
              "cover": "img/covers/Alq0_PgfrsE.jpg",
              "youtube": "https://www.youtube.com/watch?v=Alq0_PgfrsE",
              "duration": "1:45"
            },
            {
              "id": "mMwEpZ_T6fM",
              "title": "قال النور",
              "cover": "img/covers/mMwEpZ_T6fM.jpg",
              "youtube": "https://www.youtube.com/watch?v=mMwEpZ_T6fM",
              "duration": "2:41"
            },
            {
              "id": "i3YqkDiWMAE",
              "title": "إمامي دعواتك",
              "cover": "img/covers/i3YqkDiWMAE.jpg",
              "youtube": "https://www.youtube.com/watch?v=i3YqkDiWMAE",
              "duration": "3:50"
            },
            {
              "id": "Pj-xjT-gZwQ",
              "title": "يا بوصالح كلنا محتاجين",
              "cover": "img/covers/Pj-xjT-gZwQ.jpg",
              "youtube": "https://www.youtube.com/watch?v=Pj-xjT-gZwQ",
              "duration": "3:45"
            }
          ]
        }
      ]
    },
    {
      "id": "recorded",
      "color": "#c6d65b",
      "title": "إنتاجات مسجلة",
      "note": "إصدارات الاستوديو",
      "groups": [
        {
          "id": "albums",
          "title": "الإصدارات",
          "items": [
            {
              "id": "qad-allamatni",
              "title": "قد علمتني جدّتي",
              "audio": "audio/qad-allamatni-jaddati.mp3",
              "cover": "img/covers/qad-allamatni.jpg",
              "youtube": "https://www.youtube.com/watch?v=ZpEoEvORd4s",
              "text": "اسمكَ غَوثُ الكُرَبِ | فِداكَ أمّي وأبي\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nلي في نداكَ مُعتقد | \"نادِ عليًا\" في الشدد\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nاسمكَ ذا مُعوّلِي | عندَ البلايـا أملي\nعلي .. علي .. علي .. علي .. علي .. علي .. علي .. علي\n\nقد علمتنـي جدّتـي\nأدعوكَ وقتَ شدّتي\nهذا الندا عقيدتـي\nيا عليُ يا علي | يا عليُ يا علي\n\nيا نور عيني .. علي\nانت يَقيني .. علي\nادعوك يا سيـدي\nخذ بيمني علي !",
              "duration": "5:12"
            },
            {
              "id": "Cwd3ka8Kcq8",
              "title": "اقبلني مولاي",
              "cover": "img/covers/Cwd3ka8Kcq8.jpg",
              "youtube": "https://www.youtube.com/watch?v=Cwd3ka8Kcq8",
              "duration": "3:49"
            },
            {
              "id": "Hy-HSME8A2A",
              "title": "رحم الله من قرأ الفاتحة",
              "cover": "img/covers/Hy-HSME8A2A.jpg",
              "youtube": "https://www.youtube.com/watch?v=Hy-HSME8A2A",
              "duration": "5:33"
            },
            {
              "id": "4zvdUZz9ME0",
              "title": "لا أفارق الحسين قصة عبد الله بن الحسن",
              "cover": "img/covers/4zvdUZz9ME0.jpg",
              "youtube": "https://www.youtube.com/watch?v=4zvdUZz9ME0",
              "duration": "3:51"
            },
            {
              "id": "ekjAaYABA98",
              "title": "عَلمنِي كَيف (حوار بين الإبن والأب)",
              "cover": "img/covers/ekjAaYABA98.jpg",
              "youtube": "https://www.youtube.com/watch?v=ekjAaYABA98",
              "duration": "5:26"
            },
            {
              "id": "ipKh2D6pYjA",
              "title": "إنّنَي باقِيَة السيدة زينب",
              "cover": "img/covers/ipKh2D6pYjA.jpg",
              "youtube": "https://www.youtube.com/watch?v=ipKh2D6pYjA",
              "duration": "5:27"
            },
            {
              "id": "3uWf41umSOg",
              "title": "قُم مَعيْ (أحبيبي قد غبت في التراب)",
              "cover": "img/covers/3uWf41umSOg.jpg",
              "youtube": "https://www.youtube.com/watch?v=3uWf41umSOg",
              "duration": "6:46"
            }
          ]
        }
      ]
    },
    {
      "id": "other",
      "color": "#b9bcc6",
      "title": "أخرى",
      "note": "",
      "groups": [
        {
          "id": "misc",
          "title": "متفرقات",
          "items": []
        }
      ]
    }
  ]
};
