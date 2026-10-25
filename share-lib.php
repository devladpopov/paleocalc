<?php
// Общая часть для персональных ссылок (share.php) и картинок превью (og.php).
// Логика повторяет index.html: код ссылки, times(), подбор скелета, типичный объём мозга таксона.
// Код ссылки: <рост>-<вес>-<m|f|x>[-e<объём мозга>]-<lucy|turkana|ferrassie|hobbit|n<номер в will2017.json>>

const BASE = 'https://vladislavpopov.ru/paleocalc/';
const OGV = 6; // версия рисунка превью: при изменении og.php увеличить, старый кэш перестанет использоваться

const FAMOUS = [
  'lucy' => ['spec' => 'AL 288-1', 'name' => 'Люси', 'gen' => 'Люси', 'ins' => 'Люси', 'sub' => 'Au. afarensis, Эфиопия', 'ecv' => 450],
  'turkana' => ['spec' => 'KNM-WT 15000 (adult)', 'name' => 'Мальчик из Турканы', 'gen' => 'Мальчика из Турканы', 'ins' => 'Мальчиком из Турканы', 'sub' => 'Homo erectus, Кения', 'ecv' => 880],
  'ferrassie' => ['spec' => 'La Ferrassie 1', 'name' => 'Неандерталец из Ла Ферраси', 'gen' => 'неандертальца из Ла Ферраси', 'ins' => 'неандертальцем из Ла Ферраси', 'sub' => 'H. neanderthalensis, Франция', 'ecv' => 1640],
  'hobbit' => ['spec' => 'LB1', 'name' => 'Хоббит с острова Флорес', 'gen' => 'хоббита с Флореса', 'ins' => 'хоббитом с Флореса', 'sub' => 'Homo floresiensis, Индонезия', 'ecv' => 426],
];
// Ширина/высота рисунков img/*.webp, как SKIMG в index.html
const SKIMG = ['lucy' => 270 / 900, 'turkana' => 331 / 900, 'ferrassie' => 340 / 900, 'hobbit' => 362 / 900, 'modern-short' => 284 / 900, 'modern-mid' => 285 / 900, 'modern-tall' => 281 / 900];
// Таксоны базы: русское название, типичный объём мозга (ориентир, ждёт сверки), рисунок-заменитель. Как TAXA в index.html.
const TAXA = [
  ['/afarensis/i', 'австралопитек афарский', 450, 'lucy'], ['/africanus/i', 'австралопитек африканский', 460, 'lucy'], ['/sediba/i', 'австралопитек седиба', 420, 'lucy'],
  ['/garhi|anamensis/i', 'австралопитек', 450, 'lucy'], ['/robustus/i', 'парантроп массивный', 530, 'lucy'], ['/boisei|aethiopicus/i', 'парантроп Бойса', 500, 'lucy'],
  ['/ramidus/i', 'ардипитек', 300, 'lucy'], ['/habilis/i', 'человек умелый', 610, 'turkana'], ['/^Early Homo/i', 'ранний Homo', 650, 'turkana'],
  ['/erectus/i', 'человек прямоходящий', 900, 'turkana'], ['/antecessor/i', 'человек-предшественник', 1000, 'turkana'], ['/naledi/i', 'Homo naledi', 510, 'turkana'],
  ['/Mid-Pleistocene/i', 'Homo среднего плейстоцена', 1200, 'turkana'], ['/neanderthalensis/i', 'неандерталец', 1450, 'ferrassie'],
  ['/floresiensis/i', 'человек флоресский', 426, 'hobbit'], ['/MP Homo sapiens/i', 'ранний Homo sapiens', 1450, null], ['/UP modern/i', 'Homo sapiens верхнего палеолита', 1500, null],
];

function fmt($x, $d = 0) { return str_replace('.', ',', number_format($x, $d, '.', '')); }
function times($a, $b, $more, $less, $unit, $d = 0) {
  $r = $a / $b;
  if (abs($r - 1) < .15) { $x = $a - $b; return abs($x) < ($d ? .05 : .5) ? 'почти одинаково' : 'на ' . fmt(abs($x), $d) . ($unit ? " $unit" : '') . ' ' . ($x > 0 ? $more : $less); }
  return $r > 1 ? 'в ' . fmt($r, 1) . ' раза ' . $more : 'в ' . fmt(1 / $r, 1) . ' раза ' . $less;
}
function ageOf($mya) { return $mya < 1 ? fmt($mya * 1000) . ' тыс. лет назад' : fmt($mya, 1) . ' млн лет назад'; }
function bmi($st, $bm) { return $bm / pow($st / 100, 2); }
function modernImg($st, $sex) {
  if ($sex === 'F') return $st > 178 ? 'modern-mid' : 'modern-short';
  if ($sex === 'M') return $st < 165 ? 'modern-short' : ($st > 182 ? 'modern-tall' : 'modern-mid');
  return $st < 163 ? 'modern-short' : ($st > 182 ? 'modern-tall' : 'modern-mid');
}
function modernWf($st, $bm) { return min(1.15, max(.9, sqrt(bmi($st, $bm) / 22))); }
function grp($t) { return !$t || $t === '?' ? 0 : (preg_match('/^(Au\.|P\.|Ar\.)/i', $t) ? 1 : (preg_match('/sapiens|UP modern/i', $t) ? 3 : 2)); }

function db() { static $d = null; return $d ?? ($d = json_decode(file_get_contents(__DIR__ . '/data/will2017.json'), true)); }

// разбор кода ссылки; null, если код неверный
function parseCode($code) {
  if (!preg_match('/^(\d{2,3}(?:\.\d)?)-(\d{2,3}(?:\.\d)?)-([mfx])(?:-e(\d{3,4}))?-(lucy|turkana|ferrassie|hobbit|n\d{1,3})$/', $code, $m)) return null;
  $st = (float)$m[1]; $bm = (float)$m[2]; $ecvOwn = $m[4] !== '' ? (float)$m[4] : null;
  if ($st < 50 || $st > 250 || $bm < 15 || $bm > 300 || ($ecvOwn && ($ecvOwn < 500 || $ecvOwn > 2200))) return null;
  $sex = ['m' => 'M', 'f' => 'F', 'x' => ''][$m[3]];
  $u = ['st' => $st, 'bm' => $bm, 'sex' => $sex, 'ecv' => $ecvOwn ?: ($sex === 'M' ? 1420 : ($sex === 'F' ? 1260 : 1350)), 'ecvOwn' => (bool)$ecvOwn];
  $c = target($m[5]); if (!$c) return null;
  return ['u' => $u, 'c' => $c, 'code' => $code];
}
function target($id) {
  $db = db();
  if (isset(FAMOUS[$id])) { $f = FAMOUS[$id]; foreach ($db as $i => $r) if ($r['specimen'] === $f['spec']) return $f + ['id' => $id, 'r' => $r, 'img' => $id, 'proxy' => false]; return null; }
  $i = (int)substr($id, 1); $r = $db[$i] ?? null; if (!$r || !$r['st'] || !$r['bm']) return null;
  foreach (FAMOUS as $k => $f) if ($f['spec'] === $r['specimen']) return target($k);
  $tx = null; foreach (TAXA as $t) if (preg_match($t[0], $r['taxon'] ?? '')) { $tx = $t; break; }
  $name = $r['specimen'];
  return ['id' => $id, 'r' => $r, 'name' => $name, 'gen' => $name, 'ins' => $name, 'sub' => ($tx ? $tx[1] : 'таксон не указан'),
    'ecv' => $tx ? $tx[2] : null, 'img' => $tx && $tx[3] ? $tx[3] : modernImg($r['st'], $r['sex'] ?? ''), 'proxy' => true];
}

function headline($u, $c) {
  $d = round($u['st'] - $c['r']['st']);
  return abs($d) < 1 ? "Я одного роста с {$c['ins']}" : 'Я на ' . abs($d) . ' см ' . ($d > 0 ? 'выше' : 'ниже') . ' ' . $c['gen'];
}
function bigRows($u, $c) {
  $r = $c['r'];
  $cmp = fn($v, $what, $who) => [$v, "$what, " . ($v === 'почти одинаково' ? 'как' : 'чем') . " у $who"];
  $rows = [$cmp(times($u['bm'], $r['bm'], 'тяжелее', 'легче', 'кг'), 'масса тела', $c['gen'])];
  if ($c['ecv']) $rows[] = $cmp(times($u['ecv'], $c['ecv'], 'больше', 'меньше', 'см³'), 'объём мозга', $c['proxy'] ? 'таксона в среднем' : $c['gen']);
  return $rows;
}
function description($u, $c) {
  $r = $c['r'];
  $s = 'Мои ' . fmt($u['st']) . ' см и ' . fmt($u['bm']) . ' кг против ' . fmt($r['st']) . ' см и ' . fmt($r['bm']) . ' кг у ' . $c['gen'] . ' (' . $c['sub'] . ', ' . ageOf($r['mya']) . '). ';
  $s .= 'Масса: ' . times($u['bm'], $r['bm'], 'тяжелее', 'легче', 'кг');
  if ($c['ecv']) $s .= ', мозг' . ($c['proxy'] ? ' (против среднего для таксона)' : '') . ': ' . times($u['ecv'], $c['ecv'], 'больше', 'меньше', 'см³');
  return $s . '. Кто из 311 ископаемых людей ваш двойник? Проверьте на Палеокалькуляторе.';
}
function targetUrl($p) {
  $u = $p['u'];
  $q = ['h' => rtrim(rtrim(number_format($u['st'], 1, '.', ''), '0'), '.'), 'w' => rtrim(rtrim(number_format($u['bm'], 1, '.', ''), '0'), '.')];
  if ($u['sex']) $q['s'] = $u['sex']; if ($u['ecvOwn']) $q['e'] = (int)$u['ecv'];
  $q['c'] = $p['c']['id'];
  return BASE . '?' . http_build_query($q) . '#you';
}
