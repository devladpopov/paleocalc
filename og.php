<?php
// Картинка превью 1200x630 под параметры ссылки: вы и находка в одном масштабе, на белом фоне.
// Готовые картинки кэшируются в og/v<версия>-<код>.png.
require __DIR__ . '/share-lib.php';
$p = parseCode($_GET['c'] ?? '');
if (!$p) { header('Location: ' . BASE . 'img/og.png', true, 302); exit; }
$cache = __DIR__ . '/og/v' . OGV . '-' . $p['code'] . '.png';
if (!is_file($cache)) {
  $im = render($p);
  if (!is_dir(dirname($cache))) @mkdir(dirname($cache), 02770);
  imagepng($im, $cache . '.tmp', 6); @rename($cache . '.tmp', $cache);
}
header('Content-Type: image/png');
header('Cache-Control: public, max-age=604800');
readfile($cache);

function render($p) {
  $u = $p['u']; $c = $p['c']; $r = $c['r'];
  $W = 1200; $H = 630; $RG = __DIR__ . '/fonts/Inter-Regular.ttf'; $SB = __DIR__ . '/fonts/Inter-SemiBold.ttf';
  $im = imagecreatetruecolor($W, $H); imagealphablending($im, true); imagesavealpha($im, false);
  $col = fn($hex) => imagecolorallocate($im, hexdec(substr($hex, 1, 2)), hexdec(substr($hex, 3, 2)), hexdec(substr($hex, 5, 2)));
  $white = $col('#ffffff'); $text = $col('#0a0a0e'); $t2 = $col('#3a3a4a'); $t3 = $col('#7a7a8a'); $acc = $col('#4f3cc9'); $grid = $col('#ebebee');
  $gcol = $col(['#a3a3ad', '#2a78d6', '#eb6834', '#1baf7a'][grp($r['taxon'] ?? '')]);
  imagefilledrectangle($im, 0, 0, $W, $H, $white);
  // полоса фирменного градиента сверху
  $stops = [[79, 60, 201], [139, 63, 160], [214, 51, 132]];
  for ($x = 0; $x < $W; $x++) { $t = $x / ($W - 1) * 2; $i = min(1, (int)$t); $f = $t - $i; $a = $stops[$i]; $b = $stops[$i + 1];
    imageline($im, $x, 0, $x, 9, imagecolorallocate($im, (int)($a[0] + ($b[0] - $a[0]) * $f), (int)($a[1] + ($b[1] - $a[1]) * $f), (int)($a[2] + ($b[2] - $a[2]) * $f))); }
  $tw = fn($s, $size, $font) => (function ($b) { return $b[2] - $b[0]; })(imagettfbbox($size, 0, $font, $s));
  $txt = function ($s, $x, $y, $size, $font, $color, $align = 'l') use ($im, $tw) {
    if ($align !== 'l') $x -= $align === 'c' ? $tw($s, $size, $font) / 2 : $tw($s, $size, $font);
    imagettftext($im, $size, 0, (int)$x, (int)$y, $color, $font, $s);
  };
  $wrap = function ($s, $max, $size, $font) use ($tw) { $lines = []; $line = '';
    foreach (explode(' ', $s) as $w) { $t = $line === '' ? $w : "$line $w"; if ($tw($t, $size, $font) > $max && $line !== '') { $lines[] = $line; $line = $w; } else $line = $t; }
    if ($line !== '') $lines[] = $line; return $lines; };

  // левая часть: два скелета в одном масштабе
  $ground = 548; $maxH = max($u['st'], $r['st'], 180); $ppc = 430 / $maxH;
  for ($t = 50; $t <= $maxH; $t += 50) { $y = (int)($ground - $t * $ppc); imageline($im, 78, $y, 560, $y, $grid); $txt((string)$t, 68, $y + 5, 11, $RG, $t3, 'r'); }
  imageline($im, 78, $ground, 560, $ground, $t3); $txt('0 см', 68, $ground + 5, 11, $RG, $t3, 'r');
  $pic = function ($id, $cx, $st, $wf, $gray) use ($im, $ground, $ppc) {
    $src = @imagecreatefromwebp(__DIR__ . "/img/$id.webp"); if (!$src) return;
    if ($gray) { imagefilter($src, IMG_FILTER_GRAYSCALE); imagefilter($src, IMG_FILTER_BRIGHTNESS, 150); imagefilter($src, IMG_FILTER_CONTRAST, 50); }
    $h = $st * $ppc; $w = $h * SKIMG[$id] * $wf;
    imagecopyresampled($im, $src, (int)($cx - $w / 2), (int)($ground - $h), 0, 0, (int)$w, (int)$h, imagesx($src), imagesy($src));
  };
  $me = modernImg($u['st'], $u['sex']);
  $pic($me, 215, $u['st'], modernWf($u['st'], $u['bm']), false);
  $pic($c['img'], 430, $r['st'], str_starts_with($c['img'], 'modern') ? modernWf($r['st'], $r['bm']) : 1, $c['proxy']);
  $short = $c['proxy'] ? $c['name'] : explode(' ', $c['name'])[0];
  $txt('Я', 215, $ground - $u['st'] * $ppc - 14, 17, $SB, $acc, 'c');
  $txt($short, 430, $ground - $r['st'] * $ppc - 14, 15, $SB, $gcol, 'c');
  $txt(fmt($u['st']) . ' см · ' . fmt($u['bm']) . ' кг', 215, $ground + 30, 14, $RG, $t2, 'c');
  $txt(fmt($r['st']) . ' см · ' . fmt($r['bm']) . ' кг', 430, $ground + 30, 14, $RG, $t2, 'c');

  // правая часть: заголовок и цифры
  $x0 = 628; $mw = 530;
  $txt('ПАЛЕОКАЛЬКУЛЯТОР', $x0, 76, 14, $SB, $acc);
  $size = 40; do { $lines = $wrap(preg_replace('/ (\S{1,3})$/u', "\u{00A0}$1", headline($u, $c)), $mw, $size, $SB); } while ((count($lines) > 3 || max(array_map(fn($l) => $tw($l, $size, $SB), $lines)) > $mw) && --$size > 24);
  $y = 136; foreach ($lines as $l) { $txt($l, $x0, $y, $size, $SB, $text); $y += (int)($size * 1.25); }
  $sub = $c['sub'] . ' · ' . ageOf($r['mya']);
  foreach ($wrap($sub, $mw, 15, $RG) as $l) { $txt($l, $x0, $y + 2, 15, $RG, $t2); $y += 24; }
  $y += 34;
  foreach (bigRows($u, $c) as [$a, $b]) {
    if ($y > 470) break;
    imagefilledrectangle($im, $x0, $y - 30, $x0 + 3, $y + 22, $acc);
    $txt(mb_strtoupper(mb_substr($a, 0, 1)) . mb_substr($a, 1), $x0 + 18, $y, 25, $SB, $text);
    $txt($b, $x0 + 18, $y + 23, 13, $RG, $t2);
    $y += 74;
  }
  imageline($im, $x0, 528, $W - 42, 528, $grid);
  $txt('Кто из предков ваш двойник?', $x0, 563, 19, $SB, $text);
  $txt('vladislavpopov.ru/paleocalc', $x0, 595, 17, $RG, $acc);
  $txt($c['proxy'] ? 'Скелет условный: рисунок по типу группы' : 'Коричневые кости найдены, белые восстановлены', 78, 614, 11, $RG, $t3);
  return $im;
}
