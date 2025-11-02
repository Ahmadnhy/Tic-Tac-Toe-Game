class HomeController:
    """
    File ini sebelumnya bernama home_controller.py.
    Menangani semua logika yang terkait dengan
    halaman 'Home' (memulai game, validasi nama).
    """

    def __init__(self, api):
        # Konstruktor yang benar: __init__ (dua underscore)
        self.api = api  # Menyimpan referensi ke Api utama

    def start_game(self, name1, name2):
        """Validasi nama dan memulai permainan."""
        # Pastikan bukan None
        name1 = (name1 or "").strip()
        name2 = (name2 or "").strip()

        # Jika kosong, beri nama default
        if not name1:
            name1 = "Player 1"
        if not name2:
            name2 = "Player 2"

        # Simpan nama di Api utama
        self.api.player1_name = name1
        self.api.player2_name = name2

        # Reset papan (internal) di game_controller bila ada
        if hasattr(self.api, "game_controller") and self.api.game_controller:
            # Pastikan ada method yang dipanggil
            reset_internal = getattr(self.api.game_controller, "reset_board_internal", None)
            if callable(reset_internal):
                reset_internal()

        # Interaksi dengan UI webview hanya bila window tersedia
        if getattr(self.api, "window", None):
            try:
                # Panggil fungsi JS untuk membersihkan canvas (menghapus X/O lama)
                self.api.window.evaluate_js('window.resetBoardUI()')
                # Pindah halaman di JS
                self.api.window.evaluate_js('window.showPage("game-page")')
                # Update label giliran di JS
                self.api.window.evaluate_js('window.updateTurnLabel("X")')
            except Exception as e:
                # Cetak debug jika ada masalah memanggil JS
                print(f"Warning: gagal memanggil JS saat start_game: {e}")

    def go_to_home(self):
        """Kembali ke halaman home."""
        if getattr(self.api, "window", None):
            try:
                self.api.window.evaluate_js('window.showPage("home-page")')
            except Exception as e:
                print(f"Warning: gagal memanggil JS saat go_to_home: {e}")
