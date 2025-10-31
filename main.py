import tkinter as tk
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

        self.frames = {}
        for F in (HomePage, GamePage):
            page_name = F.__name__
            frame = F(parent=self.container, controller=self)
            self.frames[page_name] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame("HomePage")

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        frame.tkraise()

if __name__ == "__main__":
    app = TicTacToeApp()
    app.mainloop()