<?php
// Персональная ссылка /paleocalc/s/<код>: соцсети читают из неё заголовок, описание и картинку
// под параметры пользователя, человек сразу попадает на своё сравнение.
require __DIR__ . '/share-lib.php';
$p = parseCode($_GET['c'] ?? '');
if (!$p) { header('Location: ' . BASE, true, 302); exit; }
$u = $p['u']; $c = $p['c'];
$h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$title = headline($u, $c);
$desc = description($u, $c);
$img = BASE . 'og/' . $p['code'] . '.png';
$self = BASE . 's/' . $p['code'];
$to = targetUrl($p);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=86400');
?><!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $h($title) ?> | Палеокалькулятор</title>
<meta name="description" content="<?= $h($desc) ?>">
<meta name="robots" content="noindex">
<link rel="canonical" href="<?= BASE ?>">
<meta property="og:site_name" content="Палеокалькулятор">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:url" content="<?= $h($self) ?>">
<meta property="og:title" content="<?= $h($title) ?>">
<meta property="og:description" content="<?= $h($desc) ?>">
<meta property="og:image" content="<?= $h($img) ?>">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="<?= $h($title . ': скелеты в одном масштабе') ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= $h($title) ?>">
<meta name="twitter:description" content="<?= $h($desc) ?>">
<meta name="twitter:image" content="<?= $h($img) ?>">
<script>location.replace(<?= json_encode($to) ?>);</script>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:640px;margin:60px auto;padding:0 20px;color:#0a0a0e}a{color:#4f3cc9}img{max-width:100%;border:1px solid #ddd;border-radius:8px}</style>
</head>
<body>
<h1><?= $h($title) ?></h1>
<p><?= $h($desc) ?></p>
<p><img src="<?= $h($img) ?>" alt=""></p>
<p><a href="<?= $h($to) ?>">Открыть сравнение на Палеокалькуляторе</a></p>
</body>
</html>
