@extends('layouts.app')

@yield('title', 'Masuk')

@section('content')
<div class="container mx-auto px-4 sm:px-10 flex flex-col md:flex-row gap-10 lg:gap-20 items-start">
    
    <div class="w-full md:w-2/5 lg:w-1/3 bg-cafe-dark rounded-tr-5xl rounded-br-5xl p-10 lg:p-16 text-white min-h-[500px]">
        <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight">
            Gabung bersama <br>
            <span class="text-cafe-text-gold">di cofe job.</span>
        </h1>
    </div>

    <div class="w-full md:w-3/5 lg:w-2/3 flex flex-col items-center">
        <div class="w-full max-w-lg mb-6">
            <div class="bg-cafe-accent text-cafe-dark text-center font-bold py-3 rounded-full shadow-md text-lg">
                Masuk
            </div>
        </div>

        <div class="w-full max-w-lg bg-white p-10 lg:p-12 rounded-5xl shadow-xl">
            <h2 class="text-2xl font-bold mb-8 text-cafe-dark">Masuk dan temukan Careermu!</h2>

            <form action="{{ route('login') }}" method="POST" class="space-y-6">
                @csrf
                
                <div class="space-y-2">
                    <label for="email" class="font-semibold text-cafe-dark">Email</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required
                        class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent focus:border-cafe-accent outline-none transition"
                        placeholder="nama@email.com">
                </div>

                <div class="space-y-2">
                    <label for="password" class="font-semibold text-cafe-dark">Password</label>
                    <input type="password" id="password" name="password" required
                        class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent focus:border-cafe-accent outline-none transition"
                        placeholder="••••••••">
                </div>

                <p class="text-sm text-center text-gray-600 mt-6">
                    Belum punya akun? 
                    <a href="{{ route('register') }}" class="text-cafe-accent font-semibold hover:underline">Daftar disini</a>
                </p>

                <button type="submit" class="w-full bg-cafe-accent text-cafe-dark font-bold py-3 rounded-full shadow hover:bg-opacity-90 transition-all text-lg mt-4">
                    Masuk
                </button>
            </form>
        </div>
    </div>
</div>
@endsection