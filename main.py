import webview
import os

# PERBAIKAN: Sembunyikan pesan 'hello' pygame
# Ini HARUS dijalankan SEBELUM 'game_logic' (yang mengimpor pygame) diimpor
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "1"

# Mengimpor dari game_logic.py
from game_logic import Api  

# Tentukan path ke folder 'assets'.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOUND_DIR = os.path.join(BASE_DIR, 'assets', 'sounds')

# Fungsi callback saat window ditutup
def on_window_closed():
    """Fungsi ini dipanggil saat window pywebview ditutup."""
    # print("Window ditutup, mematikan pygame...")
    # Panggil fungsi shutdown di API
    # Pengecekan 'api' in locals() untuk keamanan jika window ditutup cepat
    if 'api' in locals() and api:
        api.shutdown()

if __name__ == "__main__":
    # 1. Buat instance API
    api = Api(sound_dir=SOUND_DIR)

    # 2. Buat window, muat HTML, dan suntikkan API
    window = webview.create_window(
        'Tic Tac Toe - 404',
        'index.html',  # File HTML yang akan dimuat
        js_api=api,      # Objek yang akan diekspos ke JS
        resizable=False,
        width=700,
        height=700       
    )

    # Daftarkan fungsi on_closed
    window.events.closed += on_window_closed

    # 3. Simpan referensi window di API agar bisa panggil JS
    api.set_window(window)

    # 4. Mulai aplikasi
    webview.start()