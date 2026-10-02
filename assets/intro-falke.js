/* FlowState Logo-Intro: der Falke baut sich auf.
   Drei Varianten zur Auswahl (?v=a|b|c), Abschluss bei allen gleich:
   Kreis-Oeffnung in Weiss vom Falkenauge aus, Farbwechsel auf Tinte,
   Landung in der Navigation. Pfade aus dem Brand-Kit vektorisiert
   (flowstate-system/brand, potrace). Nur transform/opacity/clip-path/filter. */
(function(){
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var erzwingen = /intro/.test(location.hash + location.search);
  if(reduced && !erzwingen) return;

  var V = ((new URLSearchParams(location.search)).get('v') || 'b').toLowerCase();
  if('abc'.indexOf(V) < 0) V = 'b';

  var FALKE = "M 879.9 1.4 C 879.5 1.8,834.9 2.3,596.5 5 C 549.2 5.5,470 6.4,420.5 7 C 371 7.6,289.8 8.5,240 9 C 97.8 10.6,7.8 11.9,7.2 12.5 C 5.6 14.1,6.3 14.2,37 16.9 C 50 18.1,75.4 20.4,91 22 C 115.7 24.4,155 27.9,186.5 30.5 C 207.8 32.3,259 36.9,308.5 41.5 C 329.4 43.4,352.4 45.5,359.5 46 C 371.7 47,391.1 48.7,416.5 51 C 422.6 51.6,440.3 53.1,456 54.5 C 471.7 55.9,495.3 57.9,508.5 59.1 C 521.7 60.2,536.8 61.5,542 62 C 554.8 63.2,571.2 64.7,597.5 67 C 609.6 68.1,624.2 69.4,630 70 C 635.8 70.5,648.4 71.7,658 72.5 C 667.6 73.4,685 74.9,696.5 76 C 708.1 77.1,732.8 79.3,751.5 81 C 807.6 85.9,816.9 87.1,831.5 91.7 C 845.3 96.1,864.4 106.5,879.5 118 C 892.6 127.9,1005.3 241.1,1003.7 242.6 C 1003.4 242.9,996.6 238.5,988.6 232.8 C 980.6 227.2,963.9 215.5,951.5 207 C 939.1 198.5,922.4 186.8,914.3 181.1 C 860 143,855.2 140.6,826.7 137.5 C 819.4 136.7,809.7 135.6,805 135 C 793.7 133.6,787.9 132.9,744.5 128.1 C 705 123.7,694.6 122.6,655.5 118 C 613.9 113.1,588.1 110.2,576.5 109 C 547 106,524.9 103.5,511.5 101.5 C 508.7 101,487.2 98.6,474.8 97.3 C 467 96.5,467.5 98.1,475.8 100.4 C 479.5 101.5,488.6 104.3,496 106.7 C 503.4 109.1,514.2 112.4,520 114.1 C 525.8 115.8,533.9 118.3,538 119.7 C 542.1 121.1,558.3 126.2,574 131 C 589.7 135.9,607 141.3,612.5 143 C 618 144.8,628.1 147.9,635 150 C 641.9 152.1,652.5 155.4,658.5 157.3 C 664.6 159.2,680.1 164,693 168 C 705.9 171.9,717.6 175.5,719 176 C 720.4 176.5,726 178.2,731.5 179.8 C 759.5 188.2,867.9 221.5,895 230 C 903.5 232.7,918.2 237.2,927.5 240 C 936.9 242.8,945.6 245.5,947 246 C 948.4 246.5,952.9 247.8,957 249 C 961.1 250.2,968.6 252.4,973.5 253.9 C 978.5 255.5,985.9 257.7,990 258.9 C 1000 261.9,1006.3 264.1,1007.4 265.2 C 1008 265.7,1007.5 267.7,1006 270.2 C 1004.2 273.6,983.9 303.8,973.9 318.2 C 971.5 321.6,973.1 322.7,976.7 320.1 C 978.3 319.1,989 312.4,1000.5 305.4 C 1012.1 298.4,1023.8 291.2,1026.5 289.5 C 1047.1 276.3,1107.7 241.7,1128.8 231.1 C 1151.9 219.5,1184.3 208.8,1209.1 204.6 C 1250.2 197.5,1282.6 206.9,1289.2 227.7 C 1290.1 230.3,1291.1 232.5,1291.6 232.5 C 1293.3 232.5,1296.8 221.2,1297.9 212.4 C 1300.5 191.3,1291.7 173.3,1276.5 168.3 C 1273.8 167.4,1273.4 166.8,1272.8 161.7 C 1271.4 150.7,1263.3 139.4,1252 132.7 C 1238.1 124.6,1216.3 119.6,1144 108.1 C 1132.7 106.3,1093.8 101.8,1065.5 99 C 1044.1 96.8,1037 94.8,1023.8 87 C 1017.2 83,1001.8 66.9,973.1 34 C 950.8 8.4,950.7 8.3,937.4 3.5 C 930.7 1.1,929.7 1,905.4 1 C 891.6 1,880.1 1.2,879.9 1.4 M 1213.6 150.9 C 1213 151.8,1217.1 155,1218.8 155 C 1220.4 155,1225.9 161.6,1227.9 166 C 1230.2 171,1230.6 177.6,1228.8 181.5 C 1227.1 185.2,1228.1 185.4,1234.1 182.3 C 1241.6 178.4,1254.3 172.7,1261.7 169.9 C 1268 167.5,1269.5 165.7,1266.3 164.7 C 1265.3 164.4,1261.8 163,1258.4 161.6 C 1252.7 159.2,1225.9 151.9,1217.8 150.6 C 1215.8 150.2,1213.9 150.4,1213.6 150.9";               /* viewBox 0 0 1300 324, Umriss + Auge (evenodd) */
  var BUCHSTABEN = [{"d":"M 2.1 58.3 C 0.6 60.2,0.7 133.7,2.3 134.7 C 2.8 135,8.6 129.9,15.1 123.4 L 26.8 111.5 26.3 96.8 C 25.9 85.7,26.1 81.6,27 80.5 C 28.1 79.2,33.1 79,62.1 79 L 95.9 79 105.2 69.4 C 110.3 64.1,114.5 59.3,114.5 58.7 C 114.5 56.8,3.7 56.5,2.1 58.3 M 10.5 14 C 5.8 19.5,2.2 24.5,2.5 25 C 2.9 25.7,30.1 26,80.3 26 L 157.5 26 166 16.4 C 170.7 11.2,174.5 6.3,174.5 5.7 C 174.5 4.8,155.8 4.4,96.8 4.2 L 19.1 4 10.5 14","b":[0.6,4,174.5,135]},{"d":"M 273.5 5.3 C 273.2 5.9,273.1 35.3,273.2 70.5 L 273.5 134.5 332.9 134.8 C 366.8 134.9,392.8 134.6,393.3 134.1 C 393.8 133.6,391.4 129.1,387.5 123.2 L 380.8 113.1 339.8 113 C 317.2 113,298.4 112.7,298 112.5 C 297.5 112.2,297.4 88.4,297.8 59.5 C 298.2 17.8,298 6.8,297 5.5 C 295.4 3.5,274.2 3.3,273.5 5.3","b":[273.1,3.3,393.8,134.9]},{"d":"M 559.6 2.1 C 548.7 3.6,541.2 5.8,531.2 10.5 C 519.1 16.2,504.2 30.5,499.2 41.1 C 488.9 62.8,490.6 88.4,503.3 105.5 C 519.5 127.1,542.4 138,571.5 138 C 600.4 137.9,619.6 130,637.8 110.5 C 654.2 93,658.6 69.5,649.8 47 C 644.1 32.6,630.7 18.9,613.5 10.2 C 600.4 3.6,575.7 -0.2,559.6 2.1 M 560 24.1 C 533.1 29.3,513.6 54,518 77 C 522.3 99.8,545.4 116,573.4 116 C 578.5 116,584 115.6,585.6 115.1 C 587.2 114.6,590.5 113.6,593 112.9 C 622 104.4,636.1 77.5,624.7 52.7 C 614.9 31.5,586.5 18.9,560 24.1","b":[488.9,-0.2,658.6,138]},{"d":"M 750.7 4.6 C 750.3 5,750.9 6.5,751.9 7.9 C 753.6 10.3,759.1 20.1,768.5 37.5 C 770.6 41.4,772.6 45,773 45.5 C 773.5 46.1,774.9 48.5,776.3 51 C 777.6 53.5,784.3 65.4,791 77.5 C 797.8 89.6,807.3 106.7,812.2 115.5 C 817.1 124.3,821.7 132.1,822.4 132.8 C 824 134.5,823.4 135.4,841 107 C 873.6 54.4,871.6 57.3,873.2 60.1 C 875.5 63.8,902.7 107.5,914.8 127.1 C 917.2 130.9,919.6 134,920 134 C 920.5 134,924.8 127.1,929.6 118.8 C 950.2 82.9,972.5 44.1,975.3 39 C 977 36,981.9 27.5,986.2 20.2 C 990.5 12.9,994 6.3,994 5.5 C 994 4.3,991.7 4,980.6 4 L 967.3 4 956.3 22.8 C 950.2 33.1,943 45.3,940.4 50 C 932.1 64.6,919.9 84.5,919.1 84.8 C 918.1 85.1,904.1 62.8,879.4 21.8 C 876.2 16.4,873 12,872.4 12 C 871.2 12,864.8 21.5,848.8 47.5 C 832.8 73.3,827 82.4,825.5 83.9 C 824 85.4,821.2 81.6,814 68.5 C 812.2 65.2,805.4 53.3,799 42 C 792.6 30.7,785.2 17.6,782.6 12.8 L 777.8 4 764.6 4 C 757.3 4,751 4.3,750.7 4.6","b":[750.3,4,994,135.4]},{"d":"M 1129.4 6 C 1118.8 9.7,1110.8 16.9,1106.1 26.9 C 1103.8 31.8,1103.5 33.7,1103.6 42.7 C 1103.6 48.3,1104.1 53.4,1104.7 54.2 C 1105.3 54.9,1106 56.7,1106.4 58.3 C 1107.5 63,1118.6 73.3,1125.5 75.9 C 1131.2 78.2,1132.9 78.3,1161.8 78.6 C 1194.4 78.9,1194.9 79,1199.7 82.6 C 1209.3 89.8,1207.6 105.6,1196.7 110.9 C 1192.5 112.9,1190.9 113,1154.3 113 L 1116.2 113 1106.6 123.2 C 1101.1 128.9,1097.3 133.7,1097.8 134.2 C 1098.3 134.7,1121.8 135,1150.1 134.8 C 1201.1 134.5,1201.5 134.4,1205.7 132.2 C 1208 131,1210.3 130,1210.9 130 C 1211.4 130,1214.3 127.7,1217.4 124.9 C 1240.1 104.2,1231.6 66.1,1202.5 58.4 C 1198.9 57.4,1189.6 57,1169.5 57 C 1137.8 56.9,1134.5 56.3,1130.3 50.1 C 1127.7 46.2,1127.2 38.5,1129.3 34.7 C 1134.1 26,1134.3 26,1175.5 26 L 1210.8 26 1219.4 16 C 1224.2 10.5,1227.8 5.5,1227.5 5 C 1227.1 4.4,1209.5 4,1180.7 4.1 C 1138.8 4.1,1134 4.3,1129.4 6","b":[1097.3,4,1240.1,135]},{"d":"M 1323.6 4.8 C 1323.3 5.3,1326.1 10.2,1329.8 15.6 L 1336.5 25.5 1358 25.8 C 1371 25.9,1379.8 26.4,1380.5 27.1 C 1381.2 27.8,1381.5 46.2,1381.5 81.3 L 1381.5 134.5 1392.4 134.8 C 1399.3 135,1403.7 134.7,1404.4 134 C 1405.2 133.2,1405.7 116,1406 79.7 L 1406.5 26.5 1428.4 26.2 C 1447.3 26,1450.6 25.7,1452.2 24.3 C 1455.5 21.3,1466.1 5.9,1465.5 4.9 C 1464.7 3.8,1324.3 3.7,1323.6 4.8","b":[1323.3,3.7,1466.1,135]},{"d":"M 1605.8 27.8 C 1599.4 37,1587.3 54.2,1579 66 C 1570.7 77.8,1561.7 90.8,1558.9 94.9 C 1553.9 102.3,1546.1 113.4,1536.7 126.2 C 1534 129.9,1532.1 133.4,1532.5 134 C 1532.9 134.6,1538.2 135,1545.9 135 C 1557.8 135,1558.8 134.9,1560.7 132.8 C 1561.9 131.5,1572.6 116.6,1584.5 99.5 C 1615.6 55.1,1617.2 53,1618.5 53 C 1619.6 53,1633.6 72.4,1652.1 99.4 C 1656.3 105.5,1663.5 115.9,1668.2 122.5 L 1676.6 134.5 1689.8 134.8 C 1700.8 135,1703 134.8,1703 133.6 C 1703 132.4,1688.4 110.6,1664.8 76.5 C 1650.9 56.5,1635.6 34.2,1627.8 22.8 C 1623.4 16.3,1619.2 11,1618.6 11 C 1618 11,1612.2 18.5,1605.8 27.8","b":[1532.1,11,1703,135]},{"d":"M 1783.6 4.9 C 1783.3 5.3,1785.9 10.2,1789.3 15.6 L 1795.6 25.5 1817.7 25.7 C 1829.9 25.8,1840.3 26.1,1840.8 26.4 C 1841.4 26.7,1841.7 48.7,1841.5 79.7 C 1841.4 111.9,1841.7 133,1842.3 133.8 C 1843.6 135.5,1863.4 135.5,1864.7 133.8 C 1865.3 133,1865.8 111.6,1865.9 80 C 1866.1 51.1,1866.4 27.2,1866.7 26.8 C 1866.9 26.3,1877.2 26,1889.5 26 L 1911.8 26 1919.5 16 C 1923.7 10.5,1926.8 5.5,1926.5 5 C 1925.7 3.7,1784.4 3.6,1783.6 4.9","b":[1783.3,3.6,1926.8,135.5]},{"d":"M 2024.5 58.3 C 2024.2 58.9,2024.1 76.4,2024.2 97 L 2024.5 134.5 2088.2 134.8 L 2151.9 135 2154.1 131.8 C 2155.4 130,2158.8 125.5,2161.7 121.9 C 2164.6 118.3,2167 114.8,2167 114.1 C 2167 113.3,2151 112.9,2107.8 112.8 L 2048.5 112.5 2048.2 96.2 C 2048 83.7,2048.2 79.9,2049.2 79.5 C 2049.9 79.3,2065.1 78.9,2083 78.7 L 2115.5 78.3 2123.2 68.9 C 2127.5 63.7,2131 58.9,2131 58.3 C 2131 56.4,2025.2 56.4,2024.5 58.3 M 2037.4 7.8 C 2035.8 9.8,2032.1 14.3,2029.2 17.8 C 2026.3 21.2,2024.2 24.5,2024.5 25 C 2024.9 25.6,2048 26,2087.5 26 L 2149.8 26 2157.9 16.6 C 2162.4 11.4,2166 6.5,2166 5.6 C 2166 4.2,2160.1 4,2103.1 4 L 2040.2 4 2037.4 7.8","b":[2024.1,4,2167,135]}];       /* viewBox 0 0 2169 140, je {d, b:[x0,y0,x1,y1]} */
  var MW = 1300, MH = 324, WW = 2169, WH = 140;
  var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  var INK = '#1B2733';
  var AUGE = [1252, 168];                /* Mittelpunkt der Augen-Aussparung */

  var root = document.documentElement;
  root.classList.add('fi-lock');

  function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html) e.innerHTML = html; return e; }
  function svgFalke(extra){ return '<svg viewBox="0 0 ' + MW + ' ' + MH + '" preserveAspectRatio="none" aria-hidden="true"><path fill-rule="evenodd" d="' + FALKE + '"/>' + (extra || '') + '</svg>'; }
  function pct(v, of){ return (v / of * 100).toFixed(3) + '%'; }
  function anim(e, kf, o){ if(!e || !e.animate) return null; o.fill = o.fill || 'both'; return e.animate(kf, o); }

  /* ---------- Buehne ---------- */
  var ov = el('div', 'fi fi--' + V); ov.id = 'fsintro'; ov.setAttribute('aria-hidden', 'true');
  var flash = el('div', 'fi-flash');
  var lines = el('div', 'fi-lines');
  var stage = el('div', 'fi-stage');
  var mark = el('div', 'fi-mark');
  var word = el('div', 'fi-word');
  ov.appendChild(flash); ov.appendChild(lines); stage.appendChild(mark); stage.appendChild(word); ov.appendChild(stage);

  var full = el('div', 'fi-full', svgFalke());
  mark.appendChild(full);

  /* Buchstaben als eigene Ebenen (zusammengesetzt und GPU-guenstig) */
  var letters = BUCHSTABEN.map(function(L){
    var b = L.b, pad = 2, x = b[0] - pad, y = b[1] - pad, w = b[2] - b[0] + pad * 2, h = b[3] - b[1] + pad * 2;
    var d = el('div', 'fi-l', '<svg viewBox="' + x + ' ' + y + ' ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path fill-rule="evenodd" d="' + L.d + '"/></svg>');
    d.style.left = pct(x, WW); d.style.top = pct(y, WH); d.style.width = pct(w, WW); d.style.height = pct(h, WH);
    word.appendChild(d);
    return d;
  });

  document.body.insertBefore(ov, document.body.firstChild);

  var fertig = false, timers = [];
  function spaeter(fn, ms){ timers.push(setTimeout(fn, ms)); }

  /* ---------- Abschluss (alle Varianten): Oeffnung, Tinte, Landung ---------- */
  function oeffnen(t){
    spaeter(function(){
      var r = mark.getBoundingClientRect();
      var fx = r.left + r.width * AUGE[0] / MW, fy = r.top + r.height * AUGE[1] / MH;
      /* Tinten-Kopie des fertigen Logos in die Kreis-Oeffnung legen: wo der weisse
         Kreis ankommt, ist das Logo sofort dunkel (kein grauer Zwischenton) */
      var klon = stage.cloneNode(true);
      klon.classList.add('fi-klon');
      flash.appendChild(klon);
      var R = Math.hypot(Math.max(fx, innerWidth - fx), Math.max(fy, innerHeight - fy)) + 4;
      var a = anim(flash, [{ clipPath:'circle(0px at ' + fx + 'px ' + fy + 'px)' },
                           { clipPath:'circle(' + R.toFixed(0) + 'px at ' + fx + 'px ' + fy + 'px)' }],
                   { duration:460, easing:EASE });
      spaeter(function(){
        ov.classList.add('fi-sofort'); ov.classList.add('fi-ink');
        ov.style.background = '#fff';
        if(klon.parentNode) klon.parentNode.removeChild(klon);
        flash.style.display = 'none';
        void ov.offsetWidth; ov.classList.remove('fi-sofort');
      }, 470);
    }, t);
  }
  function landen(t){
    spaeter(function los(){
      if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', los, { once:true }); return; }
      var tm = document.querySelector('.nav .logomark'), tw = document.querySelector('.nav .logotype');
      var d = 640;
      [[mark, tm], [word, tw]].forEach(function(p){
        var a = p[0], z = p[1];
        var from = a.getBoundingClientRect(), to = z ? z.getBoundingClientRect() : { width:0 };
        if(!to.width){ anim(a, [{ opacity:1, transform:'scale(1)' }, { opacity:0, transform:'scale(.92)' }], { duration:d * .55, easing:EASE }); return; }
        var s = to.width / from.width;
        var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
        anim(a, [{ transform:'translate(0,0) scale(1)' }, { transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }], { duration:d, easing:EASE });
      });
      /* Seite blendet schon waehrend des Landeanflugs auf (kein leeres Weiss danach) */
      spaeter(ende, d - 360);
    }, t);
  }
  function ende(){
    if(fertig) return; fertig = true;
    timers.forEach(clearTimeout);
    ov.classList.add('fi-out');
    root.classList.remove('fi-lock');
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); document.dispatchEvent(new Event('fsintro:ende')); }, 360);
  }
  ov.addEventListener('click', ende);
  document.addEventListener('keydown', ende, { once:true });

  /* ---------- A · Konstruktion ---------- */
  function varianteA(){
    /* Hilfslinien entlang der echten Kanten, weit ueber den Falken hinaus verlaengert */
    var K = [[5,10,930,0],[5,12,800,85],[470,97,1000,262],[930,0,1010,90],[880,118,1000,240]];
    var g = '';
    K.forEach(function(k){
      var m = (k[3] - k[1]) / (k[2] - k[0]), x0 = -2600, x1 = 3900;
      if(Math.abs(m) > 0.6){ var y0 = -1600, y1 = 1900; x0 = k[0] + (y0 - k[1]) / m; x1 = k[0] + (y1 - k[1]) / m;
        g += '<line class="fi-g" pathLength="1" x1="' + x0.toFixed(1) + '" y1="' + y0 + '" x2="' + x1.toFixed(1) + '" y2="' + y1 + '"/>'; }
      else g += '<line class="fi-g" pathLength="1" x1="' + x0 + '" y1="' + (k[1] + m * (x0 - k[0])).toFixed(1) + '" x2="' + x1 + '" y2="' + (k[1] + m * (x1 - k[0])).toFixed(1) + '"/>';
    });
    var hilfe = el('div', 'fi-hilfe', '<svg viewBox="0 0 ' + MW + ' ' + MH + '" preserveAspectRatio="none" aria-hidden="true">' + g +
      '<path class="fi-outline" pathLength="1" fill-rule="evenodd" d="' + FALKE + '"/></svg>');
    mark.insertBefore(hilfe, full);
    var wg = el('div', 'fi-hilfe', '<svg viewBox="0 0 ' + WW + ' ' + WH + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<line class="fi-g" pathLength="1" x1="-5200" y1="3" x2="7400" y2="3"/><line class="fi-g" pathLength="1" x1="7400" y1="136" x2="-5200" y2="136"/></svg>');
    word.insertBefore(wg, word.firstChild);

    var ecken = [[5,11],[930,1],[1012,92],[1290,232],[470,97],[1000,242],[970,321],[1220,150]];
    var punkte = ecken.map(function(p){ var d = el('i', 'fi-pt'); d.style.left = pct(p[0], MW); d.style.top = pct(p[1], MH); mark.appendChild(d); return d; });
    var rahmen = letters.map(function(l){ var r = el('i', 'fi-rahmen'); r.style.cssText = l.style.cssText; word.appendChild(r); return r; });

    var gl = [].slice.call(ov.querySelectorAll('.fi-g'));
    gl.forEach(function(l, i){
      anim(l, [{ strokeDashoffset:1, opacity:0 }, { opacity:.34, offset:.25 }, { strokeDashoffset:0, opacity:.34 }], { duration:420, delay:i * 45, easing:EASE });
      anim(l, [{ opacity:.34 }, { opacity:0 }], { duration:300, delay:1040 + i * 20, easing:EASE, fill:'forwards' });
    });
    punkte.forEach(function(p, i){
      anim(p, [{ transform:'translate(-50%,-50%) scale(.4)', opacity:0 }, { transform:'translate(-50%,-50%) scale(1.3)', opacity:1, offset:.55 }, { transform:'translate(-50%,-50%) scale(1)', opacity:1 }], { duration:300, delay:170 + i * 30, easing:EASE });
      anim(p, [{ opacity:1, transform:'translate(-50%,-50%) scale(1)' }, { opacity:0, transform:'translate(-50%,-50%) scale(.5)' }], { duration:220, delay:1000 + i * 18, easing:EASE, fill:'forwards' });
    });
    var ol = ov.querySelector('.fi-outline');
    anim(ol, [{ strokeDashoffset:1 }, { strokeDashoffset:0 }], { duration:600, delay:300, easing:EASE });
    anim(ol, [{ opacity:1 }, { opacity:0 }], { duration:240, delay:1000, easing:EASE, fill:'forwards' });
    anim(full, [{ clipPath:'inset(0 100% 0 0)' }, { clipPath:'inset(0 0% 0 0)' }], { duration:340, delay:760, easing:EASE });

    letters.forEach(function(l, i){
      var t = 900 + i * 38;
      anim(rahmen[i], [{ opacity:0, transform:'scale(.86)' }, { opacity:.8, transform:'scale(1)', offset:.4 }, { opacity:0, transform:'scale(1)' }], { duration:330, delay:t, easing:EASE });
      anim(l, [{ opacity:0, transform:'translate(' + ((i - 4) * 9) + 'px, 45%)' }, { opacity:1, transform:'translate(0,0)' }], { duration:420, delay:t + 90, easing:EASE });
    });
    oeffnen(1500); landen(1990);
  }

  /* ---------- B · Montage ---------- */
  function varianteB(){
    /* Schnittkanten entlang der natuerlichen Falkenlinien (Spalt zwischen den Fluegeln, Nacken) */
    var P = [
      [[-5,-5],[1003,-5],[1003,244],[995,243],[880,135],[800,109],[470,74],[-5,30]],
      [[-5,30],[470,74],[800,109],[880,135],[995,243],[1003,244],[1003,250],[955,330],[-5,330]],
      [[1003,-5],[1310,-5],[1310,330],[955,330],[1003,250],[1003,244]]
    ];
    var teile = P.map(function(poly){
      var d = el('div', 'fi-piece', svgFalke());
      d.style.clipPath = 'polygon(' + poly.map(function(p){ return pct(p[0], MW) + ' ' + pct(p[1], MH); }).join(',') + ')';
      mark.appendChild(d); return d;
    });
    full.style.opacity = '0';
    var start = [
      { transform:'translate(-135%, -38%) skewX(-16deg) scaleX(1.4)', filter:'blur(5px)', opacity:0 },
      { transform:'translate(-95%, 85%) rotate(9deg) skewX(-12deg) scaleX(1.3)', filter:'blur(5px)', opacity:0 },
      { transform:'translate(60%, -120%) rotate(-16deg) scale(1.18)', filter:'blur(5px)', opacity:0 }
    ];
    var ueber = [
      'translate(1.6%, .4%) skewX(2deg) scaleX(.985)',
      'translate(1.2%, -1.2%) rotate(-1deg) scaleX(.99)',
      'translate(-1.4%, 1.6%) rotate(1.8deg) scale(.99)'
    ];
    var zeit = [60, 160, 270];
    teile.forEach(function(t, i){
      anim(t, [start[i],
               { opacity:1, offset:.14 },
               { transform:ueber[i], filter:'blur(0px)', opacity:1, offset:.74 },
               { transform:'none', filter:'blur(0px)', opacity:1 }],
           { duration:520, delay:zeit[i], easing:EASE });
    });
    /* Einrasten: nahtloser Tausch auf den ganzen Falken, Kamera-Stoss, Glow, Funke am Auge */
    spaeter(function(){ full.style.opacity = '1'; teile.forEach(function(t){ t.style.visibility = 'hidden'; }); }, 790);
    anim(stage, [{ transform:'scale(1)' }, { transform:'scale(1.045)', offset:.18 }, { transform:'scale(1)' }], { duration:520, delay:690, easing:EASE });
    anim(full, [{ filter:'drop-shadow(0 0 0 rgba(255,255,255,0))' }, { filter:'drop-shadow(0 0 20px rgba(255,255,255,.6))', offset:.25 }, { filter:'drop-shadow(0 0 0 rgba(255,255,255,0))' }], { duration:560, delay:720, easing:EASE, fill:'none' });
    var funke = el('i', 'fi-funke'); funke.style.left = pct(AUGE[0], MW); funke.style.top = pct(AUGE[1], MH); mark.appendChild(funke);
    anim(funke, [{ opacity:0, transform:'translate(-50%,-50%) scale(.3)' }, { opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.2 }, { opacity:0, transform:'translate(-50%,-50%) scale(2.6)' }], { duration:520, delay:740, easing:EASE });

    /* Buchstaben platzen aus der Mitte heraus, von innen nach aussen */
    var wr = word.getBoundingClientRect(), mitte = wr.left + wr.width / 2;
    letters.forEach(function(l, i){
      var r = l.getBoundingClientRect(), dx = mitte - (r.left + r.width / 2);
      var rang = Math.abs(i - 4);
      anim(l, [{ opacity:0, transform:'translate(' + dx.toFixed(1) + 'px, -170%) scale(.55)', filter:'blur(4px)' },
               { opacity:1, offset:.3 },
               { transform:'translate(0, 12%) scale(1.04)', filter:'blur(0px)', opacity:1, offset:.72 },
               { opacity:1, transform:'none', filter:'blur(0px)' }],
           { duration:480, delay:860 + rang * 40, easing:EASE });
    });
    oeffnen(1400); landen(1890);
  }

  /* ---------- C · Sturzflug ---------- */
  function varianteC(){
    /* Speed-Linien in Flugrichtung (von oben links zur Mitte) */
    var winkel = Math.atan2(innerHeight * .55, innerWidth * .7) * 180 / Math.PI;
    lines.style.transform = 'rotate(' + winkel.toFixed(1) + 'deg)';
    for(var i = 0; i < 12; i++){
      var s = el('i', 'fi-speed' + (i === 5 ? ' fi-speed--akzent' : ''));
      s.style.top = (38 + (i * 37 % 24)) + '%';
      s.style.width = (16 + (i * 53 % 26)) + 'vmax';
      lines.appendChild(s);
      anim(s, [{ transform:'translateX(-70vmax)', opacity:0 }, { opacity:.75, offset:.25 }, { transform:'translateX(95vmax)', opacity:0 }],
           { duration:440 + (i % 4) * 40, delay:(i * 29) % 260, easing:'cubic-bezier(0.4, 0, 0.2, 1)' });
    }
    var w0 = winkel.toFixed(1);
    anim(full, [
      { transform:'translate(-72vw, -58vh) scale(.2) rotate(' + w0 + 'deg)', opacity:0, filter:'blur(6px)', easing:'cubic-bezier(.5,0,.25,1)' },
      { opacity:1, offset:.1, easing:'cubic-bezier(.5,0,.25,1)' },
      { transform:'translate(2.6vw, 2vh) scale(1.12) rotate(-5deg)', filter:'blur(0px)', opacity:1, offset:.62, easing:EASE },
      { transform:'translate(-.5vw, -.3vh) scale(.985) rotate(.8deg)', opacity:1, offset:.84, easing:EASE },
      { transform:'none', opacity:1, filter:'blur(0px)' }
    ], { duration:820, delay:150, easing:'linear' });
    /* Druckwelle vom Kopf beim Abbremsen */
    var ring = el('i', 'fi-ring'); ring.style.left = pct(1150, MW); ring.style.top = pct(160, MH); mark.appendChild(ring);
    anim(ring, [{ opacity:0, transform:'translate(-50%,-50%) scale(.25)' }, { opacity:.85, offset:.12 }, { opacity:0, transform:'translate(-50%,-50%) scale(3.4)' }], { duration:620, delay:640, easing:EASE });
    /* Buchstaben im Windschatten */
    letters.forEach(function(l, i){
      anim(l, [{ opacity:0, transform:'translateX(-70%) skewX(-28deg)', filter:'blur(4px)' },
               { opacity:1, offset:.3 },
               { transform:'translateX(6%) skewX(6deg)', filter:'blur(0px)', opacity:1, offset:.7 },
               { transform:'none', opacity:1, filter:'blur(0px)' }],
           { duration:440, delay:720 + i * 28, easing:EASE });
    });
    oeffnen(1350); landen(1840);
  }

  /* Sofort starten: der Aufbau braucht nur die eigene Buehne. Nur die Landung
     braucht die Navigation; ist die bei sehr langsamem Netz noch nicht geparst,
     wartet landen() darauf (siehe unten), statt dass vorher nur Schwarz steht. */
  function los(){ if(V === 'a') varianteA(); else if(V === 'c') varianteC(); else varianteB(); }
  requestAnimationFrame(los);
})();
