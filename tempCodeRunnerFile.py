import tkinter as tk
from tkinter import messagebox

# Inisialisasi jendela utama
root = tk.Tk()
root.title("Tic Tac Toe - by ChatGPT")
root.resizable(False, False)

# Variabel global
player = "X"
board = [" " for _ in range(9)]

# Fungsi untuk cek pemenang
def check_winner():
    win_patterns = [
        [0,1,2], [3,4,5], [6,7,8],  # baris
        [0,3,6], [1,4,7], [2,5,8],  # kolom
        [0,4,8], [2,4,6]            # diagonal
    ]
    for pattern in win_patterns:
        if board[pattern[0]] == board[pattern[1]] == board[pattern[2]] != " ":
            for i in pattern:
                buttons[i].config(bg="lightgreen")  # menandai pemenang
            return True
    return False

# Fungsi cek apakah papan penuh (seri)
def is_full():
    return all(cell != " " for cell in board)

# Aksi setiap tombol ditekan
def on_click(index):
    global player
    if board[index] == " ":
        board[index] = player
        buttons[index].config(text=player, state="disabled")
        if check_winner():
            messagebox.showinfo("Hasil", f"Pemain {player} menang!")
            reset_board()
        elif is_full():
            messagebox.showinfo("Hasil", "Seri!")
            reset_board()
        else:
            player = "O" if player == "X" else "X"
            label_status.config(text=f"Giliran pemain: {player}")

# Fungsi reset papan
def reset_board():
    global board, player
    board = [" " for _ in range(9)]
    player = "X"
    for btn in buttons:
        btn.config(text=" ", state="normal", bg="SystemButtonFace")
    label_status.config(text=f"Giliran pemain: {player}")

# Label status pemain
label_status = tk.Label(root, text=f"Giliran pemain: {player}", font=("Arial", 14, "bold"))
label_status.grid(row=0, column=0, columnspan=3, pady=10)

# Buat tombol-tombol kotak papan
buttons = []
for i in range(9):
    btn = tk.Button(root, text=" ", font=("Arial", 20), width=5, height=2,
                    command=lambda i=i: on_click(i))
    btn.grid(row=(i//3)+1, column=i%3)
    buttons.append(btn)

# Tombol reset manual
btn_reset = tk.Button(root, text="Reset", font=("Arial", 12, "bold"), bg="lightblue",
                      command=reset_board)
btn_reset.grid(row=4, column=0, columnspan=3, pady=10)

# Jalankan program
root.mainloop()