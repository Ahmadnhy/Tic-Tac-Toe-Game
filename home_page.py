import tkinter as tk
from tkinter import messagebox

class HomePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#F0F0F0")
        self.controller = controller

        # Frame Konten Utama untuk memusatkan semua widget
        content_frame = tk.Frame(self, bg="#F0F0F0")
        # .pack(expand=True) akan memusatkan frame ini di tengah (vertikal & horizontal)
        content_frame.pack(expand=True)


        # Semua widget sekarang di-pack ke dalam content_frame
        tk.Label(content_frame, text="Tic Tac Toe", font=("Poppins", 28, "bold"), bg="#F0F0F0", fg="#222").pack(pady=20)

        tk.Label(content_frame, text="Masukkan nama pemain", font=("Poppins", 12), bg="#F0F0F0", fg="#333").pack(pady=10)

        frame_inputs = tk.Frame(content_frame, bg="#F0F0F0")
        frame_inputs.pack()

        tk.Label(frame_inputs, text="Player 1 (X):", font=("Poppins", 11), bg="#F0F0F0", fg="#333").grid(row=0, column=0, pady=5, sticky="e")
        self.entry_player1 = tk.Entry(frame_inputs, font=("Poppins", 11), width=18)
        self.entry_player1.grid(row=0, column=1, pady=5, padx=5)

        tk.Label(frame_inputs, text="Player 2 (O):", font=("Poppins", 11), bg="#F0F0F0", fg="#333").grid(row=1, column=0, pady=5, sticky="e")
        self.entry_player2 = tk.Entry(frame_inputs, font=("Poppins", 11), width=18)
        self.entry_player2.grid(row=1, column=1, pady=5, padx=5)

        tk.Button(content_frame, text="Mulai Permainan 🎮", font=("Poppins", 12, "bold"), bg="#4DA8DA", fg="white", width=20, relief="flat", command=self.start_game).pack(pady=30)

    def start_game(self):
        name1 = self.entry_player1.get().strip()
        name2 = self.entry_player2.get().strip()

        if not name1 or not name2:
            messagebox.showwarning("Peringatan", "Masukkan nama kedua pemain!")
            return

        self.controller.player1_name = name1
        self.controller.player2_name = name2

        # Panggil reset_board sebelum beralih frame
        self.controller.frames["GamePage"].reset_board()
        self.controller.show_frame("GamePage")