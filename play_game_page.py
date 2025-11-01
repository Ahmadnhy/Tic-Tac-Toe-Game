import tkinter as tk
# from tkinter import messagebox 
import pygame # Impor pygame untuk suara

class GamePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#F0F0F0")
        self.controller = controller
        self.player = "X"
        self.board = [" " for _ in range(9)]
        self.game_in_progress = True # Status untuk mengabaikan klik setelah game selesai
        self.cell_size = 100 # Ukuran setiap kotak
        self.line_width = 2  # Lebar garis grid (DIKURANGI DARI 3)

        # --- Inisialisasi dan Muat Suara ---
        pygame.mixer.init()
        try:
            self.sound_click = pygame.mixer.Sound("sounds/click.mp3")
            self.sound_win = pygame.mixer.Sound("sounds/win.mp3")
            self.sound_draw = pygame.mixer.Sound("sounds/draw.mp3")
        except pygame.error as e:
            print(f"Error memuat file suara: {e}")

        # --- Frame Konten Utama untuk memusatkan ---
        content_frame = tk.Frame(self, bg="#F0F0F0")
        content_frame.pack(expand=True)
        # ------------------------------------------

        self.label_status = tk.Label(content_frame, text="", font=("Poppins", 14, "bold"), bg="#F0F0F0", fg="#333")
        self.label_status.pack(pady=10)

        # --- Papan Tombol diganti dengan Canvas ---
        # Ukuran total = 3 * cell_size + 2 * line_width
        board_size = self.cell_size * 3 + self.line_width * 2
        
        self.canvas_board = tk.Canvas(content_frame, width=board_size, height=board_size, bg="#FFFFFF", 
                                      highlightthickness=2, highlightbackground="#AAAAAA")
        self.canvas_board.pack(pady=10)
        
        # Mengikat event klik ke canvas
        self.canvas_board.bind("<Button-1>", self.on_canvas_click)
        
        # Menggambar grid awal
        self.draw_grid()
        # ------------------------------------------

        # Tombol kontrol (tidak berubah)
        tk.Button(content_frame, text="Reset", font=("Poppins", 12, "bold"), bg="#4DA8DA", fg="white", relief="flat", width=10, command=self.reset_board).pack(pady=15)
        tk.Button(content_frame, text="Kembali ke Home 🏠", font=("Poppins", 10), bg="#CCCCCC", relief="flat", command=lambda: controller.show_frame("HomePage")).pack()

    # ==============================
    # ⚙️ Fungsi Logika Game
    # ==============================
    
    def on_canvas_click(self, event):
        """Menangani klik pada canvas."""
        if not self.game_in_progress:
            return 

        # Tentukan sel mana yang diklik
        col = event.x // (self.cell_size + self.line_width)
        row = event.y // (self.cell_size + self.line_width)
        index = row * 3 + col

        # Pastikan klik berada di dalam batas (menghindari klik pada garis grid)
        if 0 <= col < 3 and 0 <= row < 3:
             # Cek apakah sel valid di dalam area kotak
            x_in_cell = event.x % (self.cell_size + self.line_width)
            y_in_cell = event.y % (self.cell_size + self.line_width)
            
            if x_in_cell < self.cell_size and y_in_cell < self.cell_size:
                self.on_click(index)

    def on_click(self, index):
        """Logika yang terjadi saat sel yang valid diklik."""
        if self.board[index] == " ":
            self.board[index] = self.player
            self.sound_click.play() # Mainkan suara klik
            self.draw_move(index, self.player) # Gambar X atau O di canvas

            # Cek pemenang
            if self.check_winner():
                self.game_in_progress = False # Hentikan permainan
                # Logika pindah halaman akan ditangani *setelah* animasi selesai
                # Suara kemenangan akan diputar sebelum pindah halaman di go_to_end_page
                # Lihat di dalam fungsi animate_line

            elif self.is_full():
                self.game_in_progress = False
                end_frame = self.controller.frames["EndGamePage"]
                end_frame.set_result(result_type="SERI")
                self.controller.show_frame("EndGamePage")
                self.sound_draw.play() # Mainkan suara seri
            
            else:
                self.player = "O" if self.player == "X" else "X"
                self.update_turn_label()

    def check_winner(self, silent=False):
        """
        Memeriksa pemenang.
        Jika tidak silent, akan memanggil draw_winner_line (animasi).
        """
        win_patterns = [
            [0,1,2], [3,4,5], [6,7,8], # Baris
            [0,3,6], [1,4,7], [2,5,8], # Kolom
            [0,4,8], [2,4,6]          # Diagonal
        ]
        for pattern in win_patterns:
            if self.board[pattern[0]] == self.board[pattern[1]] == self.board[pattern[2]] != " ":
                if not silent:
                    # Panggil fungsi untuk menggambar garis
                    self.draw_winner_line(pattern)
                return True
        return False

    def is_full(self):
        return all(cell != " " for cell in self.board)

    def disable_board(self):
        """
        Sekarang hanya perlu mengubah status untuk mengabaikan klik.
        """
        self.game_in_progress = False

    def reset_board(self):
        """Mereset papan untuk permainan baru."""
        self.board = [" " for _ in range(9)]
        self.player = "X"
        self.game_in_progress = True
        
        # Hapus semua gambar dari canvas dan gambar ulang grid
        self.canvas_board.delete("all")
        self.draw_grid()
        
        self.update_turn_label()

    def update_turn_label(self):
        """Memperbarui label giliran (tidak berubah)."""
        if hasattr(self.controller, 'player1_name') and self.controller.player1_name:
            if self.player == "X":
                self.label_status.config(text=f"Giliran: {self.controller.player1_name} (X)")
            else:
                self.label_status.config(text=f"Giliran: {self.controller.player2_name} (O)")
        else:
            self.label_status.config(text="Giliran: Player (X)")

    # ==============================
    # 🎨 Fungsi Menggambar di Canvas
    # ==============================

    def draw_grid(self):
        """Menggambar garis grid 3x3 di canvas."""
        # Garis Vertikal
        for i in range(1, 3):
            x = i * self.cell_size + (i-1) * self.line_width
            self.canvas_board.create_line(x, 0, x, self.canvas_board.winfo_height(), fill="#333", width=self.line_width)
            x_end = x + self.line_width
            self.canvas_board.create_line(x_end, 0, x_end, self.canvas_board.winfo_height(), fill="#333", width=self.line_width)

        # Garis Horizontal
        for i in range(1, 3):
            y = i * self.cell_size + (i-1) * self.line_width
            self.canvas_board.create_line(0, y, self.canvas_board.winfo_width(), y, fill="#333", width=self.line_width)
            y_end = y + self.line_width
            self.canvas_board.create_line(0, y_end, self.canvas_board.winfo_width(), y_end, fill="#333", width=self.line_width)

    def get_cell_center(self, index):
        """Mendapatkan koordinat (x, y) tengah dari sebuah sel."""
        row = index // 3
        col = index % 3
        
        # (cell_size + line_width) adalah jarak antar sel
        x = col * (self.cell_size + self.line_width) + self.cell_size / 2
        y = row * (self.cell_size + self.line_width) + self.cell_size / 2
        return x, y

    def draw_move(self, index, player):
        """Menggambar X atau O di sel yang ditentukan."""
        x, y = self.get_cell_center(index)
        margin = self.cell_size * 0.2 # Margin 20%
        
        if player == "X":
            # Gambar 2 garis untuk X
            self.canvas_board.create_line(x - margin, y - margin, x + margin, y + margin, fill="#E63946", width=5, capstyle=tk.ROUND)
            self.canvas_board.create_line(x + margin, y - margin, x - margin, y + margin, fill="#E63946", width=5, capstyle=tk.ROUND)
        
        elif player == "O":
            # Gambar oval untuk O
            self.canvas_board.create_oval(x - margin, y - margin, x + margin, y + margin, outline="#457B9D", width=5)

    def draw_winner_line(self, pattern):
        """Mendapatkan koordinat garis pemenang dan memulai animasi."""
        start_cell = pattern[0]
        end_cell = pattern[2]

        x0, y0 = self.get_cell_center(start_cell)
        x1, y1 = self.get_cell_center(end_cell)

        # Sesuaikan koordinat agar garis lebih panjang (dari tepi ke tepi)
        padding = self.cell_size * 0.2 # Padding 20%
        
        if y0 == y1: # Garis Horizontal
            x0, x1 = padding, self.canvas_board.winfo_width() - padding
        elif x0 == x1: # Garis Vertikal
            y0, y1 = padding, self.canvas_board.winfo_height() - padding
        elif x0 < x1: # Garis Diagonal (kiri-atas ke kanan-bawah)
            x0, y0 = padding, padding
            x1, y1 = self.canvas_board.winfo_width() - padding, self.canvas_board.winfo_height() - padding
        else: # Garis Diagonal (kanan-atas ke kiri-bawah)
            x0, y0 = self.canvas_board.winfo_width() - padding, padding
            x1, y1 = padding, self.canvas_board.winfo_height() - padding

        # Memulai animasi
        self.animate_line([x0, y0, x1, y1])

    def animate_line(self, coords, steps=20):
        """Menggambar garis secara bertahap untuk animasi."""
        x0, y0, x1, y1 = coords
        dx = (x1 - x0) / steps
        dy = (y1 - y0) / steps
        
        current_x, current_y = x0, y0

        # Simpan ID item yang digambar untuk dihapus jika perlu (meski di sini tidak)
        line_segments = []

        def draw_segment(step):
            nonlocal current_x, current_y
            if step > 0:
                next_x = x0 + dx * (steps - step + 1)
                next_y = y0 + dy * (steps - step + 1)
                
                segment = self.canvas_board.create_line(current_x, current_y, next_x, next_y, 
                                                        fill="#2A9D8F", width=7, capstyle=tk.ROUND)
                line_segments.append(segment)
                
                current_x, current_y = next_x, next_y
                
                # Panggil fungsi ini lagi setelah 20ms
                self.after(20, draw_segment, step - 1)
            else:
                # Animasi selesai, tunggu sebentar lalu pindah halaman
                self.after(500, self.go_to_end_page)

        # Mulai rekursi animasi
        draw_segment(steps)
    
    def go_to_end_page(self):
        """Fungsi helper untuk pindah ke halaman akhir setelah animasi."""
        self.sound_win.play()
        end_frame = self.controller.frames["EndGamePage"]
        end_frame.set_result(result_type="WIN", player_symbol=self.player)
        self.controller.show_frame("EndGamePage")