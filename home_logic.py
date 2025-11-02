class HomeController:
    """
    File ini sebelumnya bernama home_controller.py.
    Menangani semua logika yang terkait dengan
    halaman 'Home' (memulai game, validasi nama).
    """
    def __init__(self, api):
        self.api = api # Menyimpan referensi ke Api utama

    def start_game(self, name1, name2):
        """Validasi nama dan memulai permainan."""
        name1 = name1.strip()
        name2 = name2.strip()

        # Simpan nama di Api utama
        self.api.player1_name = name1
        self.api.player2_name = name2
        
        # Reset papan (internal) di game_controller
        self.api.game_controller.reset_board_internal()
        
        # Tambahkan pemeriksaan 'if self.api.window'
        if self.api.window:
            # Pindah halaman di JS
            self.api.window.evaluate_js('window.showPage("game-page")')
            # Update label giliran di JS
            self.api.window.evaluate_js('window.updateTurnLabel("X")')

    def go_to_home(self):
        """Kembali ke halaman home."""
        # Tambahkan pemeriksaan 'if self.api.window'
        if self.api.window:
            self.api.window.evaluate_js('window.showPage("home-page")')