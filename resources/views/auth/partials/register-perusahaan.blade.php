<h2 class="text-3xl font-bold text-cafe-dark">Buat Akun untuk Bisnismu!</h2>
<p class="text-gray-600 mb-10">Gabung di cofe job</p>

<form action="{{ route('register') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
    @csrf
    <input type="hidden" name="user_type" value="perusahaan">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
            <label for="nama_cafe" class="font-semibold text-cafe-dark">Nama Cafe</label>
            <input type="text" id="nama_cafe" name="nama_cafe" value="{{ old('nama_cafe') }}" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>

        <div class="space-y-2">
            <label for="nama_pengelola" class="font-semibold text-cafe-dark">Nama Pengelola/HRD</label>
            <input type="text" id="nama_pengelola" name="nama_pengelola" value="{{ old('nama_pengelola') }}" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-full focus:ring-2 focus:ring-cafe-accent outline-none">
        </div>

        <div class="space-y-2 md:col-span-2">
            <label for="email" class="font-semibold text-cafe-dark">Email Bisnis</label>
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

        <div class="space-y-2 md:col-span-2">
            <label for="alamat" class="font-semibold text-cafe-dark">Alamat</label>
            <textarea id="alamat" name="alamat" rows="3" required
                class="w-full px-5 py-3 border border-cafe-dark/20 rounded-3xl focus:ring-2 focus:ring-cafe-accent outline-none"></textarea>
        </div>

        <div class="space-y-2 md:col-span-2">
            <label for="nib" class="font-semibold text-cafe-dark">Dokumen Izin Usaha/NIB</label>
            <div class="relative border-2 border-dashed border-cafe-accent/50 bg-cafe-bg rounded-3xl p-8 flex flex-col items-center justify-center text-center group hover:border-cafe-accent transition-all cursor-pointer">
                <svg class="w-12 h-12 text-cafe-accent mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-cafe-dark font-medium">Upload dengan format PDF (max 10mb)</p>
                <input type="file" id="nib" name="nib" accept=".pdf" required
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            </div>
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