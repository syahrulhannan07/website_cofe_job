<?php

namespace App\Broadcasting;

use App\Models\Pengguna;

class NotifikasiChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(Pengguna $user): array|bool
    {
        //
    }
}
