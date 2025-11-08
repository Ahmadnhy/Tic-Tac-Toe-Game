import pygame
import os
from home_logic import HomeController
from play_game_logic import GameController 

# Inisialisasi mixer di sini, di luar kelas.
try:
    pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=4096)
except pygame.error as e:
    print(f"Peringatan: Gagal menginisialisasi pygame.mixer: {e}. Suara tidak akan berfungsi.")

class Api:
    """
    Kelas ini diekspos ke JavaScript dan bertindak sebagai jembatan
    ke controller yang tepat (Home atau Game).
    """
    def __init__(self, sound_dir):
        self.player1_name = ""
        self.player2_name = ""
        self.window = None
        
        # --- PERBAIKAN: Menggunakan Dictionary dan file .wav ---
        self.sounds = {}
        self.volume = 0.5  # Volume default (0.0 hingga 1.0)

        # Daftar semua file suara yang ingin dimuat
        sound_files = {
            'click': 'click.wav',  # PASTIKAN Anda punya file click.wav
            'win': 'win.wav',
            'draw': 'draw.wav',
            'score': 'score.wav'
        }

        try:
            for name, file in sound_files.items():
                path = os.path.join(sound_dir, file)
                if os.path.exists(path):
                    self.sounds[name] = pygame.mixer.Sound(path)
                else:
                    # Pesan ini penting untuk debugging jika ada file yang hilang
                    print(f"Peringatan PENTING: File suara tidak ditemukan: {path}")
        
        except pygame.error as e:
            print(f"Error memuat file suara: {e}. Pastikan folder 'assets/sounds' ada.")

        # Terapkan volume default ke semua suara yang berhasil dimuat
        self.set_volume(self.volume)
        # --------------------------------------------------

        # --- Inisialisasi Controllers ---
        self.home_controller = HomeController(self)
        self.game_controller = GameController(self)

    def set_window(self, window):
        """Menyimpan instance window untuk eksekusi JS nanti."""
        self.window = window

    # --- Fungsi yang Dipanggil dari JavaScript ---
    
    def start_game(self, name1, name2):
        """Dipanggil oleh JS (tombol 'Mulai Permainan')."""
        self.home_controller.start_game(name1, name2)

    def cell_clicked(self, index):
        """Dipanggil oleh JS saat sel di papan diklik."""
        self.play_sound('click') # Mainkan suara klik di sini
        self.game_controller.cell_clicked(index) # Teruskan ke logika game

    def reset_board_from_js(self):
        """Dipanggil oleh JS (tombol 'Main Lagi' atau 'Reset')."""
        self.game_controller.reset_board_from_js()

    def go_to_home(self):
        """Dipanggil oleh JS (tombol 'Kembali ke Home')."""
        self.home_controller.go_to_home()
        
    def get_player_names(self):
        """Dipanggil oleh JS untuk mendapatkan nama pemain."""
        name1 = self.player1_name if self.player1_name else "Player 1"
        name2 = self.player2_name if self.player2_name else "Player 2"
        return {"X": name1, "O": name2}

    def set_volume(self, volume):
        """Dipanggil oleh JS untuk mengatur volume semua suara."""
        try:
            vol = float(volume)
            if vol < 0.0: vol = 0.0
            if vol > 1.0: vol = 1.0
            
            self.volume = vol  # Simpan nilai volume
            
            for sound in self.sounds.values():
                sound.set_volume(self.volume)
                
        except (ValueError, TypeError) as e:
            print(f"Error nilai volume tidak valid: {volume}, Error: {e}")
            pass

    # --- FUNGSI BARU YANG DIPANGGIL OLEH SCRIPT.JS ---
    def play_sound(self, sound_name):
        """Memutar suara dari dictionary berdasarkan nama."""
        if sound_name in self.sounds:
            try:
                self.sounds[sound_name].set_volume(self.volume)
                self.sounds[sound_name].play()
            except Exception as e:
                print(f"Error memutar suara {sound_name}: {e}")
        else:
            print(f"Peringatan: Suara tidak ditemukan: {sound_name}")
    # ----------------------------------------------

    def exit_game(self):
        """Dipanggil dari JavaScript (tombol 'Exit') untuk menutup aplikasi."""
        if self.window:
            self.window.destroy()

    def shutdown(self):
        """Dipanggil dari main.py saat window ditutup."""
        print("Menjalankan shutdown pygame...")
        pygame.mixer.quit()
        pygame.quit()
        self.window = None