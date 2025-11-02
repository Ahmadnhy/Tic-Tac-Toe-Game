class GameController:
    """
    Ini adalah file 'play_game_logic.py'.
    Menangani semua logika inti permainan Tic Tac Toe
    (papan, giliran, cek pemenang, dll).
    """
    def __init__(self, api):
        self.api = api # Menyimpan referensi ke Api utama
        self.reset_board_internal() # Atur state awal

    def reset_board_internal(self):
        """Helper untuk mereset state Python."""
        self.board = [" " for _ in range(9)]
        self.player = "X"
        self.game_in_progress = True

    def cell_clicked(self, index):
        """Logika utama saat sel diklik."""
        if not self.game_in_progress or self.board[index] != " ":
            return # Abaikan klik jika game selesai atau sel sudah terisi

        # 1. Update state di Python
        self.board[index] = self.player
        self.api.sound_click.play()

        # 2. Kirim perintah gambar ke JS
        # Tambahkan pemeriksaan 'if self.api.window'
        if self.api.window:
            self.api.window.evaluate_js(f'window.drawMove({index}, "{self.player}")')

        # 3. Cek pemenang atau seri
        win_pattern = self.check_winner()
        is_full = self.is_full()

        if win_pattern:
            self.game_in_progress = False
            self.api.sound_win.play()
            # Tambahkan pemeriksaan 'if self.api.window'
            if self.api.window:
                # Kirim pattern sebagai array JS
                self.api.window.evaluate_js(f'window.handleWin({win_pattern}, "{self.player}")')
        
        elif is_full:
            self.game_in_progress = False
            self.api.sound_draw.play()
            # Tambahkan pemeriksaan 'if self.api.window'
            if self.api.window:
                self.api.window.evaluate_js('window.handleDraw()')
        
        else:
            # Ganti pemain
            self.player = "O" if self.player == "X" else "X"
            # Tambahkan pemeriksaan 'if self.api.window'
            if self.api.window:
                self.api.window.evaluate_js(f'window.updateTurnLabel("{self.player}")')

    def check_winner(self):
        """Mengecek apakah ada pemenang."""
        win_patterns = [
            [0,1,2], [3,4,5], [6,7,8], # Baris
            [0,3,6], [1,4,7], [2,5,8], # Kolom
            [0,4,8], [2,4,6]           # Diagonal
        ]
        for pattern in win_patterns:
            if self.board[pattern[0]] == self.board[pattern[1]] == self.board[pattern[2]] != " ":
                return pattern # Kembalikan pola kemenangan
        return None

    def is_full(self):
        """Mengecek apakah papan penuh."""
        return all(cell != " " for cell in self.board)

    def reset_board_from_js(self):
        """Dipanggil oleh JS (tombol 'Main Lagi' atau 'Reset')."""
        self.reset_board_internal()
        # Tambahkan pemeriksaan 'if self.api.window'
        if self.api.window:
            self.api.window.evaluate_js('window.resetBoardUI()')
            self.api.window.evaluate_js('window.showPage("game-page")')
            self.api.window.evaluate_js(f'window.updateTurnLabel("X")')