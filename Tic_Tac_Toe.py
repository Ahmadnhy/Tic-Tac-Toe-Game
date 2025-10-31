import tkinter as tk
from tkinter import messagebox

# ===============================
# 🎨 Tema Warna
# ===============================
BG_COLOR = "#F0F0F0"
BTN_COLOR = "#FFFFFF"
HOVER_COLOR = "#D0E8FF"
WIN_COLOR = "#A8E6CF"
TEXT_COLOR = "#333333"

# ===============================
# 🪟 Jendela Utama
# ===============================
root = tk.Tk()
root.title("Tic Tac Toe - Versi dengan Home")
root.geometry("400x500")
root.config(bg=BG_COLOR)
root.resizable(False, False)

# Variabel global
player = "X"
board = [" " for _ in range(9)]
player1_name = ""
player2_name = ""

# ===============================
# ⚙️ Fungsi Game
# ===============================
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

def on_click(index):
    global player
    if board[index] == " ":
        board[index] = player
        buttons[index].config(text=player, state="disabled", disabledforeground=TEXT_COLOR)
        if check_winner():
            winner = player1_name if player == "X" else player2_name
            messagebox.showinfo("Hasil", f"🎉 {winner} menang!")
            reset_board()
        elif is_full():
            messagebox.showinfo("Hasil", "🤝 Seri!")
            reset_board()
        else:
            player = "O" if player == "X" else "X"
            update_turn_label()

def on_enter(e):
    if e.widget["state"] == "normal":
        e.widget["bg"] = HOVER_COLOR

def on_leave(e):
    if e.widget["state"] == "normal":
        e.widget["bg"] = BTN_COLOR

def reset_board():
    global board, player
    board = [" " for _ in range(9)]
    player = "X"
    for btn in buttons:
        btn.config(text=" ", state="normal", bg=BTN_COLOR)
    update_turn_label()

def update_turn_label():
    if player == "X":
        label_status.config(text=f"Giliran: {player1_name} (X)", fg=TEXT_COLOR)
    else:
        label_status.config(text=f"Giliran: {player2_name} (O)", fg=TEXT_COLOR)

# ===============================
# 🏠 Halaman Home
# ===============================
def show_home():
    frame_game.pack_forget()
    frame_home.pack(pady=80)

def start_game():
    global player1_name, player2_name
    name1 = entry_player1.get().strip()
    name2 = entry_player2.get().strip()
    if not name1 or not name2:
        messagebox.showwarning("Peringatan", "Masukkan nama kedua pemain!")
        return
    player1_name = name1
    player2_name = name2
    frame_home.pack_forget()
    show_game()

# ===============================
# 🎮 Halaman Game
# ===============================
def show_game():
    frame_game.pack(pady=10)
    reset_board()

# Frame Home
frame_home = tk.Frame(root, bg=BG_COLOR)

label_title = tk.Label(frame_home, text="Tic Tac Toe", font=("Poppins", 28, "bold"), bg=BG_COLOR, fg="#222")
label_title.pack(pady=20)

label_sub = tk.Label(frame_home, text="Masukkan nama pemain", font=("Poppins", 12), bg=BG_COLOR, fg=TEXT_COLOR)
label_sub.pack(pady=10)

frame_inputs = tk.Frame(frame_home, bg=BG_COLOR)
frame_inputs.pack()

tk.Label(frame_inputs, text="Player 1 (X):", font=("Poppins", 11), bg=BG_COLOR, fg=TEXT_COLOR).grid(row=0, column=0, pady=5, sticky="e")
entry_player1 = tk.Entry(frame_inputs, font=("Poppins", 11), width=18)
entry_player1.grid(row=0, column=1, pady=5, padx=5)

tk.Label(frame_inputs, text="Player 2 (O):", font=("Poppins", 11), bg=BG_COLOR, fg=TEXT_COLOR).grid(row=1, column=0, pady=5, sticky="e")
entry_player2 = tk.Entry(frame_inputs, font=("Poppins", 11), width=18)
entry_player2.grid(row=1, column=1, pady=5, padx=5)

btn_start = tk.Button(frame_home, text="Mulai Permainan 🎮", font=("Poppins", 12, "bold"),
                      bg="#4DA8DA", fg="white", width=20, relief="flat", command=start_game)
btn_start.pack(pady=30)

# Frame Game
frame_game = tk.Frame(root, bg=BG_COLOR)

label_status = tk.Label(frame_game, text="", font=("Poppins", 14, "bold"), bg=BG_COLOR, fg=TEXT_COLOR)
label_status.pack(pady=10)

frame_board = tk.Frame(frame_game, bg=BG_COLOR)
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

btn_reset = tk.Button(frame_game, text="Reset", font=("Poppins", 12, "bold"),
                      bg="#4DA8DA", fg="white", relief="flat", width=10, command=reset_board)
btn_reset.pack(pady=15)

btn_home = tk.Button(frame_game, text="Kembali ke Home 🏠", font=("Poppins", 10),
                     bg="#CCCCCC", relief="flat", command=show_home)
btn_home.pack()

# Tampilkan halaman home pertama kali
show_home()
root.mainloop()