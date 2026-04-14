<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Cofe Job</title>
    @vite('resources/css/app.css')
</head>
<body class="bg-[#F1E9E0] flex items-center justify-center min-h-screen">
    <div class="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold text-[#4D362F] mb-6">Masuk ke Cofe Job</h2>
        <form>
            <div class="mb-4">
                <label class="block mb-2 font-semibold">Email</label>
                <input type="email" class="w-full border rounded-full px-4 py-2 outline-none focus:border-[#C59E72]">
            </div>
            <div class="mb-6">
                <label class="block mb-2 font-semibold">Password</label>
                <input type="password" class="w-full border rounded-full px-4 py-2 outline-none focus:border-[#C59E72]">
            </div>
            <button type="button" class="w-full bg-[#C59E72] text-white font-bold py-3 rounded-full">
                Masuk
            </button>
        </form>
    </div>
</body>
</html>