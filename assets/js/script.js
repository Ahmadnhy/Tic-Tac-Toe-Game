// Menunggu pywebview siap sebelum menambahkan listener
window.addEventListener("pywebviewready", () => {
  // ==================================================================
  // Variabel Global dan Konfigurasi Canvas
  // ==================================================================
  const canvas = document.getElementById("tic-tac-toe-board"); // Pastikan canvas ada sebelum melanjutkan
  if (!canvas) {
    console.error("Elemen canvas 'tic-tac-toe-board' tidak ditemukan!");
    return;
  }
  const ctx = canvas.getContext("2d"); // Konstanta Papan

  const CELL_SIZE = 100;
  const LINE_WIDTH = 4; // Lebar garis 4px
  const BOARD_SIZE = CELL_SIZE * 3 + LINE_WIDTH * 2; // 308 // Sesuaikan ukuran canvas jika berbeda (meski sudah diatur di HTML)

  canvas.width = BOARD_SIZE;
  canvas.height = BOARD_SIZE; // Warna (DIUBAH AGAR SESUAI GAMBAR)

  const COLOR_GRID = "#4A4A4A"; // Kotak abu-abu gelap
  const COLOR_X = "#FFFFFF"; // X Putih
  const COLOR_O = "#FFFFFF"; // O Putih
  const COLOR_WIN_LINE = "rgba(255, 255, 255, 0.5)"; // Garis putih transparan // Variabel state JS

  let playerNames = { X: "Player 1", O: "Player 2" }; // Default // BARU: Variabel untuk melacak skor di sisi JavaScript

  let player1Score = 0;
  let player2Score = 0; // ================================================================== // Referensi Elemen DOM // ================================================================== // Halaman

  const pages = {
    mainMenu: document.getElementById("main-menu-page"),
    home: document.getElementById("home-page"),
    game: document.getElementById("game-page"),
    end: document.getElementById("end-page"),
  }; // Halaman Main Menu

  const btnMainMenuStart = document.getElementById("main-menu-start-btn");
  const btnMainMenuSettings = document.getElementById("main-menu-settings-btn");
  const btnMainMenuCredits = document.getElementById("main-menu-credits-btn");
  const btnMainMenuExit = document.getElementById("main-menu-exit-btn"); // Halaman Home (Player Name)

  const btnStartGame = document.getElementById("start-game-btn");
  const inputPlayer1 = document.getElementById("player1");
  const inputPlayer2 = document.getElementById("player2");
  const homeError = document.getElementById("home-error");
  const btnBackToMainMenu = document.getElementById("back-to-main-menu-btn"); // Halaman Game // BARU: Referensi elemen skor

  const player1ScoreEl = document.getElementById("player1-score");
  const player2ScoreEl = document.getElementById("player2-score");

  const labelStatus = document.getElementById("label-status");
  const btnResetGame = document.getElementById("reset-game-btn");
  const btnBackToHome = document.getElementById("back-to-home-btn");
  const btnGameSettings = document.getElementById("game-settings-btn");
  const btnFinishGame = document.getElementById("finish-game-btn");
  const btnNewGame = document.getElementById("new-game-btn"); // Catatan: btnNewGame tidak ada di HTML Anda, tapi ada di JS. // Halaman Selesai

  const labelTitle = document.getElementById("label-title");
  const labelSubtitle = document.getElementById("label-subtitle");
  const btnPlayAgain = document.getElementById("play-again-btn");
  const btnBackToHome2 = document.getElementById("back-to-home-btn-2"); // Referensi Modal Credits

  const creditsModal = document.getElementById("credits-modal");
  const modalCloseBtn = document.getElementById("modal-close"); // Referensi Modal Settings

  const settingsModal = document.getElementById("settings-modal");
  const settingsModalClose = document.getElementById("settings-modal-close");
  const soundToggle = document.getElementById("sound-toggle");
  const volumeSlider = document.getElementById("volume-slider"); // ================================================================== // Fungsi Helper (Dipanggil oleh Python atau Event Listener) // ==================================================================

  window.showPage = (pageId) => {
    for (const id in pages) {
      if (pages.hasOwnProperty(id)) {
        if (pages[id]) {
          pages[id].classList.remove("active");
        }
      }
    }
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
      pageToShow.classList.add("active");
    } else {
      console.error("Halaman tidak ditemukan:", pageId);
    }
    if (pageId === "home-page") {
      inputPlayer1.value = "";
      inputPlayer2.value = "";
      homeError.textContent = "";
    }
  };

  window.showError = (message) => {
    homeError.textContent = message;
  };

  window.updateTurnLabel = async (player) => {
    try {
      // Pastikan playerNames di-fetch saat giliran di-update
      playerNames = await window.pywebview.api.get_player_names();
      labelStatus.textContent = `Giliran: ${playerNames[player]} (${player})`;
    } catch (e) {
      console.error("Gagal mendapatkan nama pemain:", e);
      const name = player === "X" ? "Player 1" : "Player 2";
      labelStatus.textContent = `Giliran: ${name} (${player})`;
    }
  }; // ========================================================== // FUNGSI MENGGAMBAR KANVAS (Tidak Berubah) // ==========================================================

  window.drawMove = (index, player) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = col * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;
    const y = row * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;
    const margin = CELL_SIZE * 0.25;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    if (player === "X") {
      ctx.strokeStyle = COLOR_X;
      ctx.beginPath();
      ctx.moveTo(x - margin, y - margin);
      ctx.lineTo(x + margin, y + margin);
      ctx.moveTo(x + margin, y - margin);
      ctx.lineTo(x - margin, y + margin);
      ctx.stroke();
    } else if (player === "O") {
      ctx.strokeStyle = COLOR_O;
      ctx.beginPath();
      ctx.arc(x, y, margin, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLOR_GRID;
    const cornerRadius = 15;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * (CELL_SIZE + LINE_WIDTH);
        const y = row * (CELL_SIZE + LINE_WIDTH);
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + CELL_SIZE - cornerRadius, y);
        ctx.quadraticCurveTo(x + CELL_SIZE, y, x + CELL_SIZE, y + cornerRadius);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE - cornerRadius);
        ctx.quadraticCurveTo(
          x + CELL_SIZE,
          y + CELL_SIZE,
          x + CELL_SIZE - cornerRadius,
          y + CELL_SIZE
        );
        ctx.lineTo(x + cornerRadius, y + CELL_SIZE);
        ctx.quadraticCurveTo(x, y + CELL_SIZE, x, y + CELL_SIZE - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  window.resetBoardUI = () => {
    drawGrid();
  };

  const drawWinnerLine = (pattern) => {
    const getCellCenter = (index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = col * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;
      const y = row * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;
      return { x, y };
    };

    const start = getCellCenter(pattern[0]);
    const end = getCellCenter(pattern[2]);
    const padding = CELL_SIZE * 0.3;
    let x0 = start.x,
      y0 = start.y,
      x1 = end.x,
      y1 = end.y;

    if (y0 === y1) {
      (x0 = padding), (x1 = canvas.width - padding);
    } else if (x0 === x1) {
      (y0 = padding), (y1 = canvas.height - padding);
    } else if (x0 < x1) {
      (x0 = padding),
        (y0 = padding),
        (x1 = canvas.width - padding),
        (y1 = canvas.height - padding);
    } else {
      (x0 = canvas.width - padding),
        (y0 = padding),
        (x1 = padding),
        (y1 = canvas.height - padding);
    }

    ctx.strokeStyle = COLOR_WIN_LINE;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    let progress = 0;
    const totalSteps = 20;

    function animate() {
      if (progress > totalSteps) return;
      const currentX = x0 + (x1 - x0) * (progress / totalSteps);
      const currentY = y0 + (y1 - y0) * (progress / totalSteps);
      const prevX = x0 + (x1 - x0) * ((progress - 1) / totalSteps);
      const prevY = y0 + (y1 - y0) * ((progress - 1) / totalSteps);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      progress++;
      requestAnimationFrame(animate);
    }
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0);
    ctx.stroke();
    animate();
  }; // ========================================================== // FUNGSI LOGIKA GAME (INI YANG DIMODIFIKASI) // ==========================================================
  /**
   * MODIFIKASI: Menangani logika UI saat menang ronde.
   * Tidak pindah halaman, tapi tambah skor dan reset papan.
   * @param {Array<number>} pattern [start, mid, end]
   * @param {string} player ('X' atau 'O')
   */

  window.handleWin = (pattern, player) => {
    drawWinnerLine(pattern); // Logika baru: Tambah skor

    if (player === "X") {
      player1Score++;
      if (player1ScoreEl) player1ScoreEl.textContent = player1Score;
    } else {
      // player === "O"
      player2Score++;
      if (player2ScoreEl) player2ScoreEl.textContent = player2Score;
    } // Jangan pindah ke end-page, tapi reset papan setelah 1.5 detik

    setTimeout(() => {
      // Panggil fungsi reset board milik Python
      try {
        window.pywebview.api.reset_board_from_js();
      } catch (e) {
        console.error("Gagal memanggil reset_board_from_js:", e);
        window.resetBoardUI(); // Fallback reset UI
      }
    }, 1500); // Beri waktu 1.5 detik untuk melihat garis kemenangan
  };
  /**
   * MODIFIKASI: Menangani logika UI saat seri.
   * Tidak pindah halaman, hanya reset papan.
   */

  window.handleDraw = () => {
    // Logika baru: Cukup reset papan, jangan ke end-page
    setTimeout(() => {
      try {
        window.pywebview.api.reset_board_from_js();
      } catch (e) {
        console.error("Gagal memanggil reset_board_from_js:", e);
        window.resetBoardUI(); // Fallback reset UI
      }
    }, 1000); // Waktu tunggu sedikit untuk seri
  }; // ================================================================== // Event Listeners (JS ke Python) // ================================================================== // Halaman Main Menu

  if (btnMainMenuStart) {
    btnMainMenuStart.addEventListener("click", () => {
      window.showPage("home-page");
    });
  }

  if (btnMainMenuExit) {
    btnMainMenuExit.addEventListener("click", () => {
      try {
        window.pywebview.api.exit_game();
      } catch (e) {
        console.error("Gagal memanggil exit_game():", e);
        window.close();
      }
    });
  } // Halaman Home (Input Nama)

  btnStartGame.addEventListener("click", () => {
    const name1 = inputPlayer1.value.trim();
    const name2 = inputPlayer2.value.trim();
    homeError.textContent = "";
    if (!name1 || !name2) {
      homeError.textContent = "Masukkan nama kedua pemain!";
    } else {
      // BARU: Reset skor JS dan UI saat game baru dimulai
      player1Score = 0;
      player2Score = 0;
      if (player1ScoreEl) player1ScoreEl.textContent = "0";
      if (player2ScoreEl) player2ScoreEl.textContent = "0";

      window.pywebview.api.start_game(name1, name2);
    }
  });

  if (btnBackToMainMenu) {
    btnBackToMainMenu.addEventListener("click", () => {
      window.showPage("main-menu-page");
    });
  } // Halaman Game

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const col = Math.floor(x / (CELL_SIZE + LINE_WIDTH));
    const row = Math.floor(y / (CELL_SIZE + LINE_WIDTH));
    if (col < 0 || col > 2 || row < 0 || row > 2) return;
    const xInCell = x % (CELL_SIZE + LINE_WIDTH);
    const yInCell = y % (CELL_SIZE + LINE_WIDTH);
    if (xInCell < CELL_SIZE && yInCell < CELL_SIZE) {
      const index = row * 3 + col;
      window.pywebview.api.cell_clicked(index);
    }
  });

  btnResetGame.addEventListener("click", () => {
    // "Reset" mereset papan (skor tetap)
    window.pywebview.api.reset_board_from_js();
  });

  btnBackToHome.addEventListener("click", () => {
    // "Back To Home" kembali ke input nama
    window.pywebview.api.go_to_home();
  });

  if (btnGameSettings) {
    btnGameSettings.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "flex";
    });
  } // MODIFIKASI: Tombol Finish sekarang menghitung pemenang akhir

  if (btnFinishGame) {
    btnFinishGame.addEventListener("click", () => {
      // "Finish" akan MENGHITUNG PEMENANG AKHIR dan pindah ke end-page
      const p1Name = playerNames.X || "Player 1";
      const p2Name = playerNames.O || "Player 2";

      if (player1Score > player2Score) {
        labelTitle.textContent = "PEMENANG AKHIR";
        labelSubtitle.textContent = `${p1Name} (X) - Skor: ${player1Score}`;
      } else if (player2Score > player1Score) {
        labelTitle.textContent = "PEMENANG AKHIR";
        labelSubtitle.textContent = `${p2Name} (O) - Skor: ${player2Score}`;
      } else {
        // Seri
        labelTitle.textContent = "PERMAINAN SERI";
        labelSubtitle.textContent = `Skor Akhir: ${p1Name} (${player1Score}) - ${p2Name} (${player2Score})`;
      }
      window.showPage("end-page");
    });
  }

  if (btnNewGame) {
    // Tombol ini tidak ada di HTML Anda
    btnNewGame.addEventListener("click", () => {
      window.pywebview.api.reset_board_from_js();
    });
  } // Halaman Selesai

  btnPlayAgain.addEventListener("click", () => {
    // BARU: Reset skor JS saat "Main Lagi" dari halaman akhir
    player1Score = 0;
    player2Score = 0;
    if (player1ScoreEl) player1ScoreEl.textContent = "0";
    if (player2ScoreEl) player2ScoreEl.textContent = "0"; // Panggil reset Python (yang akan kembali ke game-page dengan nama yg sama)
    window.pywebview.api.reset_board_from_js();
  });

  btnBackToHome2.addEventListener("click", () => {
    // Kembali ke input nama
    window.pywebview.api.go_to_home();
  }); // ================================================================== // Event Listener Modal (Tidak Berubah) // ================================================================== // ===== Event Listener Modal Credits =====

  if (btnMainMenuCredits) {
    btnMainMenuCredits.addEventListener("click", (e) => {
      e.preventDefault();
      if (creditsModal) {
        creditsModal.style.display = "flex";
      }
    });
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      if (creditsModal) {
        creditsModal.style.display = "none";
      }
    });
  }
  if (creditsModal) {
    creditsModal.addEventListener("click", (e) => {
      if (e.target === creditsModal) {
        creditsModal.style.display = "none";
      }
    });
  } // ===== Event Listener Modal Settings =====

  if (btnMainMenuSettings) {
    btnMainMenuSettings.addEventListener("click", (e) => {
      e.preventDefault();
      if (settingsModal) {
        settingsModal.style.display = "flex";
      }
    });
  }
  if (settingsModalClose) {
    settingsModalClose.addEventListener("click", () => {
      if (settingsModal) {
        settingsModal.style.display = "none";
      }
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = "none";
      }
    });
  } // ================================== // Logika Volume (Tidak Berubah) // ==================================

  let isProgrammaticallyChanging = false;

  function setPythonVolume(volume) {
    const numericVolume = parseFloat(volume);
    if (window.pywebview && window.pywebview.api) {
      try {
        window.pywebview.api.set_volume(numericVolume);
      } catch (e) {
        console.error("Gagal mengatur volume di Python:", e);
      }
    }
  }

  function loadAudioSettings() {
    let savedVolume = localStorage.getItem("ticTacToeVolume") || 1.0;
    const isMuted = false;
    soundToggle.checked = true;
    volumeSlider.disabled = false;
    if (parseFloat(savedVolume) === 0) {
      savedVolume = 1.0;
    }
    volumeSlider.value = savedVolume;
    setPythonVolume(savedVolume);
    localStorage.setItem("ticTacToeMuted", isMuted);
    localStorage.setItem("ticTacToeVolume", savedVolume);
  }

  function handleSliderInput(event) {
    if (isProgrammaticallyChanging) return;
    const intendedVolume = event.target.value;
    localStorage.setItem("ticTacToeVolume", intendedVolume);
    setPythonVolume(intendedVolume);
    if (parseFloat(intendedVolume) === 0 && soundToggle.checked) {
      isProgrammaticallyChanging = true;
      soundToggle.checked = false;
      isProgrammaticallyChanging = false;
    } else if (parseFloat(intendedVolume) > 0 && !soundToggle.checked) {
      isProgrammaticallyChanging = true;
      soundToggle.checked = true;
      isProgrammaticallyChanging = false;
    }
  }

  function handleToggleChange(event) {
    if (isProgrammaticallyChanging) return;
    const isMuted = !soundToggle.checked;
    localStorage.setItem("ticTacToeMuted", isMuted);
    if (isMuted) {
      volumeSlider.disabled = true;
      setPythonVolume(0);
    } else {
      volumeSlider.disabled = false;
      let savedVolume = localStorage.getItem("ticTacToeVolume") || 1.0;
      if (parseFloat(savedVolume) === 0) {
        savedVolume = 1.0;
        localStorage.setItem("ticTacToeVolume", savedVolume);
      }
      isProgrammaticallyChanging = true;
      volumeSlider.value = savedVolume;
      isProgrammaticallyChanging = false;
      setPythonVolume(savedVolume);
    }
  }

  volumeSlider.addEventListener("input", handleSliderInput);
  soundToggle.addEventListener("change", handleToggleChange); // ================================================================== // Inisialisasi Awal // ==================================================================

  loadAudioSettings();
  drawGrid(); // Panggil drawGrid baru
  window.showPage("main-menu-page");
});
