<?php

/*
 * This file is part of justoverclock/flarum-ext-contactme.
 *
 * Copyright (c) 2021 Marco Colia.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Tudor\ArticleRequest;

use Flarum\Extend;
use Tudor\ArticleRequest\Api\Controller\ContactController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less')
        ->route('/cere-un-articol', 'tudor/article-request'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),
    (new Extend\Routes('forum'))
        ->post('/sendmail', 'tudor.sendmail', ContactController::class),
    new Extend\Locales(__DIR__.'/resources/locale'),

];
