import pygame
import os
from home_logic import HomeController
# Mengimpor dari play_game_logic.py sesuai permintaan Anda
from play_game_logic import GameController 

class Api:
    """
    File ini sebelumnya bernama api.py.
    Kelas ini diekspos ke JavaScript.
    Kelas ini bertindak sebagai "facade" atau jembatan,
    meneruskan panggilan ke controller yang tepat.
    """
    def __init__(self, sound_dir):
        self.player1_name = ""
        self.player2_name = ""
        self.window = None

        # --- Inisialisasi Suara ---
        # 'contextlib' dihapus. os.environ di main.py akan menangani ini.
        pygame.mixer.init()

        try:
            # Path suara sudah benar karena dikirim dari main.py
            self.sound_click = pygame.mixer.Sound(os.path.join(sound_dir, "click.mp3"))
            self.sound_win = pygame.mixer.Sound(os.path.join(sound_dir, "win.mp3"))
            self.sound_draw = pygame.mixer.Sound(os.path.join(sound_dir, "draw.mp3"))
        
        except pygame.error as e:
            # Biarkan pesan error ini, penting untuk debugging
            print(f"Error memuat file suara: {e}. Pastikan folder 'assets/sounds' ada.")

        # --- Inisialisasi Controllers ---
        self.home_controller = HomeController(self)
        self.game_controller = GameController(self)

    def set_window(self, window):
        """Menyimpan instance window untuk eksekusi JS nanti."""
        self.window = window

    # --- Fungsi yang Dipanggil dari JavaScript ---
    # Fungsi-fungsi ini adalah API yang diekspos ke 'window.pywebview.api'
    
    def start_game(self, name1, name2):
        """Dipanggil oleh JS (tombol 'Mulai Permainan')."""
        self.home_controller.start_game(name1, name2)

    def cell_clicked(self, index):
        """Dipanggil oleh JS saat sel di papan diklik."""
        self.game_controller.cell_clicked(index)

    def reset_board_from_js(self):
        """Dipanggil oleh JS (tombol 'Main Lagi' atau 'Reset')."""
        self.game_controller.reset_board_from_js()

    def go_to_home(self):
        """Dipanggil oleh JS (tombol 'Kembali ke Home')."""
        self.home_controller.go_to_home()
        
    def get_player_names(self):
        """Dipanggil oleh JS untuk mendapatkan nama pemain."""
        # Memberi nama default jika kosong
        name1 = self.player1_name if self.player1_name else "Player 1"
        name2 = self.player2_name if self.player2_name else "Player 2"
        return {"X": name1, "O": name2}

    def set_volume(self, volume):
        """Dipanggil oleh JS untuk mengatur volume semua suara."""
        try:
            # Pastikan volume adalah float antara 0.0 dan 1.0
            vol = float(volume)
            if 0.0 <= vol <= 1.0:
                # Atur volume untuk setiap suara yang ada
                if hasattr(self, 'sound_click'):
                    self.sound_click.set_volume(vol)
                if hasattr(self, 'sound_win'):
                    self.sound_win.set_volume(vol)
                if hasattr(self, 'sound_draw'):
                    self.sound_draw.set_volume(vol)
        except (ValueError, TypeError):
            # Abaikan jika nilai yang dikirim dari JS tidak valid
            pass

    # Tambahkan fungsi shutdown
    def shutdown(self):
        """Dipanggil dari main.py saat window ditutup."""
        # Hentikan semua modul pygame
        pygame.mixer.quit()
        pygame.quit()
        # Hapus referensi ke window untuk mencegah error 'ObjectDisposed'
        self.window = None