<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model Skill
class SkillFactory extends Factory
{
    protected $model = Skill::class;

    public function definition(): array
    {
        return [
            'id_profil' => ProfilPelamarFactory::new(),
            'nama_skill' => $this->faker->word(),
            'deskripsi' => $this->faker->sentence(),
        ];
    }
}
