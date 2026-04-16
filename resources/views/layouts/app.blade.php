<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cofe Job - @yield('title')</title>
    @vite('resources/css/app.css')
</head>
<body class="bg-cafe-bg font-sans antialiased text-cafe-dark">

    <header class="py-6 px-4 sm:px-10">
        <nav class="bg-cafe-dark rounded-full py-3 px-6 flex items-center justify-between shadow-lg max-w-7xl mx-auto">
            <div class="flex items-center gap-2">
                <img src="/path/to/your/logo.png" alt="Cofe Job Logo" class="h-10 w-10">
                {{-- Atau gunakan teks jika logo belum ada --}}
                {{-- <span class="text-cafe-text-gold font-bold text-xl">COFE JOB</span> --}}
            </div>

            <div class="hidden md:flex items-center gap-8 text-white font-medium">
                <a href="#" class="hover:text-cafe-accent">Beranda</a>
                <a href="#" class="hover:text-cafe-accent">Lowoongan</a>
                <a href="#" class="hover:text-cafe-accent">Perusahaan</a>
            </div>

            <div class="flex items-center gap-4">
                <a href="{{ route('login') }}" class="text-white font-medium hover:text-cafe-accent">Masuk</a>
                <a href="{{ route('register') }}" class="bg-cafe-accent text-cafe-dark font-semibold px-6 py-2 rounded-full hover:bg-opacity-90 transition-all">
                    Daftar
                </a>
            </div>
        </nav>
    </header>

    <main class="py-10">
        @yield('content')
    </main>

</body>
</html>