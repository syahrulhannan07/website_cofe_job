<h2 class="text-3xl font-bold text-cafe-dark">Buat Akun untuk Careermu!</h2>
<p class="text-gray-600 mb-10">Gabung di cofe job</p>

<form action="{{ route('register') }}" method="POST" class="space-y-6">
    @csrf
    <input type="hidden" name="user_type" value="pelamar">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 md:col-span-2">
            <label for="username" class="font-semibold text-cafe-dark">Username</label>
            <input type="text" id="username" name="username" value="{{ old('username') }}" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>

        <div class="space-y-2 md:col-span-2">
            <label for="email" class="font-semibold text-cafe-dark">Email</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>

        <div class="space-y-2">
            <label for="password" class="font-semibold text-cafe-dark">Password</label>
            <input type="password" id="password" name="password" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>

        <div class="space-y-2">
            <label for="password_confirmation" class="font-semibold text-cafe-dark">Konfirmasi Password</label>
            <input type="password" id="password_confirmation" name="password_confirmation" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>
    </div>

    <p class="text-sm text-center text-gray-600 mt-8">
        Sudah punya akun? 
        <a href="{{ route('login') }}" class="text-cafe-accent font-semibold hover:underline">Login disini</a>
    </p>

    <button type="submit" class="w-full bg-cafe-accent text-cafe-dark font-bold py-3 rounded-full shadow hover:bg-opacity-90 transition-all text-lg mt-4">
        Daftar
    </button>
</form>