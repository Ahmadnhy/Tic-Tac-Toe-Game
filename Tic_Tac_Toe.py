import tkinter as tk
from tkinter import messagebox

# Warna tema
BG_COLOR = "#F0F0F0"
BTN_COLOR = "#FFFFFF"
HOVER_COLOR = "#D0E8FF"
WIN_COLOR = "#A8E6CF"
TEXT_COLOR = "#333333"

# Inisialisasi jendela utama
root = tk.Tk()
root.title("Tic Tac Toe - Modern Edition")
root.geometry("360x450")
root.config(bg=BG_COLOR)
root.resizable(False, False)

player = "X"
board = [" " for _ in range(9)]

# Fungsi cek pemenang
def check_winner():
    win_patterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ]
    for pattern in win_patterns:
        if board[pattern[0]] == board[pattern[1]] == board[pattern[2]] != " ":
            for i in pattern:
                buttons[i].config(bg=WIN_COLOR)
            return True
    return False

def is_full():
    return all(cell != " " for cell in board)

# Fungsi klik
def on_click(index):
    global player
    if board[index] == " ":
        board[index] = player
        buttons[index].config(text=player, state="disabled", disabledforeground=TEXT_COLOR)
        if check_winner():
            label_status.config(text=f"🎉 Pemain {player} menang!", fg="#007B5E")
            messagebox.showinfo("Hasil", f"Pemain {player} menang!")
            reset_board()
        elif is_full():
            label_status.config(text="🤝 Seri!", fg="#FF6B6B")
            messagebox.showinfo("Hasil", "Seri!")
            reset_board()
        else:
            player = "O" if player == "X" else "X"
            label_status.config(text=f"Giliran pemain: {player}", fg=TEXT_COLOR)

# Fungsi hover efek
def on_enter(e):
    if e.widget["state"] == "normal":
        e.widget["bg"] = HOVER_COLOR

def on_leave(e):
    if e.widget["state"] == "normal":
        e.widget["bg"] = BTN_COLOR

# Fungsi reset
def reset_board():
    global board, player
    board = [" " for _ in range(9)]
    player = "X"
    for btn in buttons:
        btn.config(text=" ", state="normal", bg=BTN_COLOR)
    label_status.config(text=f"Giliran pemain: {player}", fg=TEXT_COLOR)

# Label judul
label_title = tk.Label(root, text="Tic Tac Toe", font=("Poppins", 22, "bold"), bg=BG_COLOR, fg="#222")
label_title.pack(pady=10)

# Frame papan
frame_board = tk.Frame(root, bg=BG_COLOR)
frame_board.pack()

buttons = []
for i in range(9):
    btn = tk.Button(frame_board, text=" ", font=("Poppins", 24, "bold"), width=4, height=2,
                    bg=BTN_COLOR, relief="ridge", borderwidth=3,
                    command=lambda i=i: on_click(i))
    btn.grid(row=i//3, column=i%3, padx=5, pady=5)
    btn.bind("<Enter>", on_enter)
    btn.bind("<Leave>", on_leave)
    buttons.append(btn)

# Label status
label_status = tk.Label(root, text=f"Giliran pemain: {player}", font=("Poppins", 14), bg=BG_COLOR, fg=TEXT_COLOR)
label_status.pack(pady=10)

# Tombol reset
btn_reset = tk.Button(root, text="Reset", font=("Poppins", 12, "bold"), bg="#4DA8DA", fg="white",
                      relief="flat", width=10, command=reset_board)
btn_reset.pack(pady=10)

root.mainloop()