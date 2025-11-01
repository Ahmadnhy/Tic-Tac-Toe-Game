import tkinter as tk

class EndGamePage(tk.Frame):
    def __init__(self, parent, controller):
        """
        Inisialisasi frame untuk halaman akhir permainan (Menang/Seri).
        """
        super().__init__(parent, bg="#F0F0F0")
        self.controller = controller

        # Frame Konten Utama untuk memusatkan semua widget
        content_frame = tk.Frame(self, bg="#F0F0F0")
        content_frame.pack(expand=True)

        # Label untuk Judul (WINNER/SERI)
        self.label_title = tk.Label(content_frame, text="", font=("Poppins", 28, "bold"), bg="#F0F0F0", fg="#222")
        self.label_title.pack(pady=20)

        # Label untuk Sub-judul (Nama pemenang / "Kalian semua hebat")
        self.label_subtitle = tk.Label(content_frame, text="", font=("Poppins", 14), bg="#F0F0F0", fg="#333")
        self.label_subtitle.pack(pady=10)

        # Tombol Main Lagi
        self.btn_play_again = tk.Button(content_frame, text="Main Lagi 🔄", 
                                        font=("Poppins", 12, "bold"), 
                                        bg="#4DA8DA", fg="white", 
                                        width=20, relief="flat", 
                                        command=self.go_to_game)
        self.btn_play_again.pack(pady=(30, 10))

        # Tombol Kembali ke Home
        self.btn_home = tk.Button(content_frame, text="Kembali ke Home 🏠", 
                                  font=("Poppins", 10), 
                                  bg="#CCCCCC", relief="flat", 
                                  command=lambda: self.controller.show_frame("HomePage"))
        self.btn_home.pack(pady=10)

    def set_result(self, result_type, player_symbol=None):
        """
        Mengatur teks pada label berdasarkan hasil permainan.
        result_type: "WIN" atau "SERI"
        player_symbol: "X" atau "O" (jika result_type == "WIN")
        """
        if result_type == "SERI":
            self.label_title.config(text="SERI")
            self.label_subtitle.config(text="Kalian semua hebat")
        
        elif result_type == "WIN" and player_symbol:
            # Ambil nama pemain dari controller
            if player_symbol == "X":
                name = self.controller.player1_name
            else:
                name = self.controller.player2_name
            
            self.label_title.config(text="WINNER")
            self.label_subtitle.config(text=f"{name} sebagai {player_symbol}")

    def go_to_game(self):
        """
        Mereset papan permainan di GamePage lalu beralih ke GamePage.
        """
        # Reset papan *sebelum* menampilkannya
        self.controller.frames["GamePage"].reset_board()
        self.controller.show_frame("GamePage")