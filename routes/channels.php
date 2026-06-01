<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:api']]);

Broadcast::channel('App.Models.Pengguna.{id}', function ($user, $id) {
    return (int) $user->id_pengguna === (int) $id;
});
