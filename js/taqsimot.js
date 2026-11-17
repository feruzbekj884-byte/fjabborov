/* Dars soatlarini ustuvorlik tartibida taqsimlash (3271-nizom).
   Sof mantiq: DOM'ga bog'liq emas, Node'da ham sinab ko'rish mumkin. */
(function (root) {
  'use strict';

  /* Daraja: nomi, asosiy ustuvorlik guruhi, qat'iy chegara (null = umumiy chegara) */
  var DEGREES = [
    { name: 'Oliy malaka toifali',                         tier: 1,  cap: null },
    { name: 'Birinchi malaka toifali',                     tier: 3,  cap: null },
    { name: 'Ikkinchi malaka toifali',                     tier: 4,  cap: null },
    { name: 'Oliy maʼlumotli, toifasiz',              tier: 5,  cap: null },
    { name: 'Qayta tayyorlash diplomi bor',                tier: 6,  cap: null },
    { name: 'Oʻrindoshlik (oliy maʼlumotli)',    tier: 7,  cap: 10 },
    { name: 'Pedagogika yoʻnalishi 3+ kurs talabasi', tier: 8,  cap: null },
    { name: 'Oʻrta maxsus / prof. (boshlangʻich sinf)', tier: 9, cap: null },
    { name: 'Rahbar xodim (tegishli mutaxassislik)',       tier: 10, cap: 10 }
  ];
  var CERTS = ['Sertifikati yoʻq', 'Milliy sertifikat', 'Xalqaro sertifikat'];
  var TIER_NAMES = ['', 'Oliy malaka toifasi', 'Sertifikat', 'Birinchi toifa', 'Ikkinchi toifa',
    'Oliy maʼlumotli (toifasiz)', 'Qayta tayyorlash', 'Oʻrindoshlik', 'Talaba (3+ kurs)',
    'Oʻrta maxsus', 'Rahbar xodim'];

  function tierOf(degreeIdx, certIdx) {
    var base = DEGREES[degreeIdx].tier;
    if (base === 1) return 1;       /* oliy toifa — eng yuqori */
    if (certIdx > 0) return 2;      /* milliy/xalqaro sertifikat */
    return base;
  }

  /* teachers: [{name, degree, cert, score}], total: jami soat, maxHours: umumiy chegara */
  function distribute(total, teachers, maxHours) {
    var items = teachers.map(function (t, i) {
      var d = DEGREES[t.degree];
      return {
        idx: i, name: t.name, degree: t.degree, cert: t.cert || 0, score: t.score || 5,
        tier: tierOf(t.degree, t.cert || 0),
        cap: d.cap === null ? maxHours : Math.min(maxHours, d.cap),
        hours: 0
      };
    });

    /* tartib: guruh -> sertifikat darajasi -> kengash bahosi -> kiritilgan tartib */
    var order = items.slice().sort(function (a, b) {
      return a.tier - b.tier || b.cert - a.cert || b.score - a.score || a.idx - b.idx;
    });

    var groups = {};
    order.forEach(function (it) { (groups[it.tier] = groups[it.tier] || []).push(it); });

    var left = total;
    Object.keys(groups).map(Number).sort(function (a, b) { return a - b; }).forEach(function (k) {
      var g = groups[k];
      while (left > 0) {
        var open = g.filter(function (it) { return it.hours < it.cap; });
        if (!open.length) break;
        var share = Math.floor(left / open.length);
        if (share === 0) {            /* qoldiq: tartib bo'yicha 1 soatdan */
          for (var x = 0; x < open.length && left > 0; x++) { open[x].hours++; left--; }
          break;
        }
        open.forEach(function (it) {
          var give = Math.min(share, it.cap - it.hours);
          it.hours += give; left -= give;
        });
      }
    });

    return { rows: order, given: total - left, excess: left };
  }

  var api = { DEGREES: DEGREES, CERTS: CERTS, TIER_NAMES: TIER_NAMES, tierOf: tierOf, distribute: distribute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Taqsimot = api;
})(typeof window !== 'undefined' ? window : this);
