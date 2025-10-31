import tkinter as tk
# Pastikan file home.py dan play_game.py ada di folder yang sama
from home import HomePage
from play_game import GamePage

class TicTacToeApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Tic Tac Toe - 404")
        self.geometry("400x500")
        self.config(bg="#F0F0F0")
        self.resizable(False, False)

        # Menyimpan nama pemain
        self.player1_name = ""
        self.player2_name = ""

        # Frame kontainer
        self.container = tk.Frame(self, bg="#F0F0F0")
        self.container.pack(fill="both", expand=True)

        # --- PERBAIKAN ---
        # Konfigurasi grid di dalam container agar sel (0,0) mengembang
        # Ini penting agar frame yang ditampilkan bisa mengisi seluruh container
        self.container.grid_rowconfigure(0, weight=1)
        # Ini adalah baris yang diperbaiki (tanpa underscore '_')
        self.container.grid_columnconfigure(0, weight=1)
        # -------------------

        self.frames = {}
        for F in (HomePage, GamePage):
            page_name = F.__name__
            frame = F(parent=self.container, controller=self)
            self.frames[page_name] = frame
            # sticky="nsew" membuat frame mengisi seluruh sel grid
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame("HomePage")

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        # Jika halaman adalah GamePage, panggil update_turn_label saat menampilkannya
        if page_name == "GamePage":
            # Panggil reset_board *sebelum* update_turn_label saat beralih ke GamePage
            # Ini memastikan label giliran sudah benar saat permainan dimulai
            if frame.player != "X" or frame.is_full() or frame.check_winner(silent=True):
                 frame.reset_board()
            else:
                 frame.update_turn_label()
        frame.tkraise()

if __name__ == "__main__":
    app = TicTacToeApp()
    app.mainloop()