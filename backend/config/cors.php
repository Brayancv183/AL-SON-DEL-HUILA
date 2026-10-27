<?php

$origins = array_filter(array_map('trim', explode(',', env('CORS_ORIGINS', 'http://localhost:5173'))));

return [
    'paths'                    => ['api/*'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => $origins,
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 3600,
    'supports_credentials'     => true,
];
