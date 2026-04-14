@extends('layouts.app')

@yield('title', 'Daftar')

@section('content')
<div class="container mx-auto px-4 sm:px-10 flex flex-col md:flex-row gap-10 lg:gap-20 items-start">
    
    <div class="w-full md:w-2/5 lg:w-1/3 bg-cafe-dark rounded-tr-5xl rounded-br-5xl p-10 lg:p-16 text-white min-h-[500px]">
        <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight">
            Gabung bersama <br>
            <span class="text-cafe-text-gold">di cofe job.</span>
        </h1>
    </div>

    <div class="w-full md:w-3/5 lg:w-2/3 flex flex-col items-center">
        
        <div class="w-full max-w-2xl mb-8 flex bg-cafe-accent rounded-full shadow-inner overflow-hidden">
            <a href="{{ route('register', ['type' => 'pelamar']) }}" 
               class="flex-1 text-center py-3 font-bold text-lg rounded-full transition-all duration-300
               {{ request('type', 'pelamar') == 'pelamar' ? 'bg-white text-cafe-dark' : 'text-white hover:text-cafe-dark' }}">
                Pelamar
            </a>
            <a href="{{ route('register', ['type' => 'perusahaan']) }}" 
               class="flex-1 text-center py-3 font-bold text-lg rounded-full transition-all duration-300
               {{ request('type') == 'perusahaan' ? 'bg-white text-cafe-dark' : 'text-white hover:text-cafe-dark' }}">
                Perusahaan
            </a>
        </div>

        <div class="w-full max-w-3xl bg-white p-10 lg:p-12 rounded-5xl shadow-xl">
            @if(request('type', 'pelamar') == 'pelamar')
                @include('auth.partials.register-pelamar')
            @else
                @include('auth.partials.register-perusahaan')
            @endif
        </div>
    </div>
</div>
@endsection