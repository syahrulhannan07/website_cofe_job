<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar - Cofe Job</title>
    @vite('resources/css/app.css')
</head>
<body class="bg-[#F1E9E0] flex items-center justify-center min-h-screen py-10">
    
    <div class="w-full max-w-4xl flex flex-col md:flex-row gap-10 lg:gap-16 items-start px-4">
        
        <div class="w-full md:w-2/5 bg-[#4D362F] rounded-tr-[40px] rounded-br-[40px] p-10 lg:p-12 text-white min-h-[400px]">
            <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight">
                Gabung bersama <br>
                <span class="text-[#F3C997]">di cofe job.</span>
            </h1>
        </div>

        <div class="w-full md:w-3/5 flex flex-col items-center">
            
            <div class="w-full max-w-lg mb-8 flex bg-[#C59E72] rounded-full shadow-inner overflow-hidden p-1">
                <a href="{{ route('register', ['type' => 'pelamar']) }}" 
                   class="flex-1 text-center py-3 font-bold text-lg rounded-full transition-all duration-300
                   {{ $type == 'pelamar' ? 'bg-white text-[#4D362F] shadow' : 'text-white hover:text-[#4D362F]' }}">
                    Pelamar
                </a>
                <a href="{{ route('register', ['type' => 'perusahaan']) }}" 
                   class="flex-1 text-center py-3 font-bold text-lg rounded-full transition-all duration-300
                   {{ $type == 'perusahaan' ? 'bg-white text-[#4D362F] shadow' : 'text-white hover:text-[#4D362F]' }}">
                    Perusahaan
                </a>
            </div>

            <div class="w-full max-w-2xl bg-white p-10 lg:p-12 rounded-[40px] shadow-xl">
                
                {{-- Include file partials berdasarkan type --}}
                @if($type == 'pelamar')
                    @include('auth.partials.register-pelamar')
                @else
                    @include('auth.partials.register-perusahaan')
                @endif

            </div>
        </div>
    </div>

</body>
</html>