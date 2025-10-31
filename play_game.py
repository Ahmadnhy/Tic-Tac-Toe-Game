import tkinter as tk
from tkinter import messagebox

class GamePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#F0F0F0")
        self.controller = controller
        self.player = "X"
        self.board = [" " for _ in range(9)]

        self.label_status = tk.Label(self, text="", font=("Poppins", 14, "bold"),
                                     bg="#F0F0F0", fg="#333")
        self.label_status.pack(pady=10)

        # Papan tombol
        self.frame_board = tk.Frame(self, bg="#F0F0F0")
        self.frame_board.pack()

        self.buttons = []
        for i in range(9):
            btn = tk.Button(self.frame_board, text=" ", font=("Poppins", 24, "bold"),
                            width=4, height=2, bg="#FFFFFF", relief="ridge", borderwidth=3,
                            command=lambda i=i: self.on_click(i))
            btn.grid(row=i//3, column=i%3, padx=5, pady=5)
            btn.bind("<Enter>", self.on_enter)
            btn.bind("<Leave>", self.on_leave)
            self.buttons.append(btn)

        # Tombol kontrol
        tk.Button(self, text="Reset", font=("Poppins", 12, "bold"), bg="#4DA8DA",
                  fg="white", relief="flat", width=10,
                  command=self.reset_board).pack(pady=15)

        tk.Button(self, text="Kembali ke Home 🏠", font=("Poppins", 10),
                  bg="#CCCCCC", relief="flat",
                  command=lambda: controller.show_frame("HomePage")).pack()

    # ==============================
    # ⚙️ Fungsi Logika Game
    # ==============================
    def on_click(self, index):
        if self.board[index] == " ":
            self.board[index] = self.player
            self.buttons[index].config(text=self.player, state="disabled",
                                       disabledforeground="#333")

            if self.check_winner():
                winner = self.controller.player1_name if self.player == "X" else self.controller.player2_name
                messagebox.showinfo("Hasil", f"🎉 {winner} menang!")
                self.reset_board()
            elif self.is_full():
                messagebox.showinfo("Hasil", "🤝 Seri!")
                self.reset_board()
            else:
                self.player = "O" if self.player == "X" else "X"
                self.update_turn_label()

    def check_winner(self):
        win_patterns = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ]
        for pattern in win_patterns:
            if self.board[pattern[0]] == self.board[pattern[1]] == self.board[pattern[2]] != " ":
                for i in pattern:
                    self.buttons[i].config(bg="#A8E6CF")
                return True
        return False

    def is_full(self):
        return all(cell != " " for cell in self.board)

    def reset_board(self):
        self.board = [" " for _ in range(9)]
        self.player = "X"
        for btn in self.buttons:
            btn.config(text=" ", state="normal", bg="#FFFFFF")
        self.update_turn_label()

    def update_turn_label(self):
        if self.player == "X":
            self.label_status.config(text=f"Giliran: {self.controller.player1_name} (X)")
        else:
            self.label_status.config(text=f"Giliran: {self.controller.player2_name} (O)")

    # ==============================
    # 🖱️ Efek Hover
    # ==============================
    def on_enter(self, e):
        if e.widget["state"] == "normal":
            e.widget["bg"] = "#D0E8FF"

    def on_leave(self, e):
        if e.widget["state"] == "normal":
            e.widget["bg"] = "#FFFFFF"