// fallback untuk development di browser: kirim event 'pywebviewready' jika tidak ada pywebview
if (!window.pywebview) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      window.dispatchEvent(new Event("pywebviewready"));
    }, 0);
  });
}

// Menunggu pywebview siap sebelum menambahkan listener
window.addEventListener("pywebviewready", () => {
  // ==================================================================
  // Variabel Global dan Konfigurasi Canvas
  // ==================================================================
  const canvas = document.getElementById("tic-tac-toe-board");
  if (!canvas) {
    console.error("Elemen canvas 'tic-tac-toe-board' tidak ditemukan!");
    return;
  }
  const ctx = canvas.getContext("2d");

  const CELL_SIZE = 125;
  const LINE_WIDTH = 6; // Lebar garis 4px
  const BOARD_SIZE = CELL_SIZE * 3 + LINE_WIDTH * 2; // 308

  canvas.width = BOARD_SIZE;
  canvas.height = BOARD_SIZE;

  // WARNA: gunakan let supaya bisa diubah runtime
  let COLOR_X = "#E63946"; // default X
  let COLOR_O = "#007BFF"; // default O
  let COLOR_WIN_LINE = "rgba(0, 0, 0, 0.4)"; // garis pemenang
  let COLOR_GRID = "rgba(255,255,255,0.06)"; // warna kotak putih tipis

  // default player names (akan di-overwrite dari Python)
  let playerNames = { X: "Player 1", O: "Player 2" };

  // skor JS (dipakai di UI)
  let player1Score = 0;
  let player2Score = 0;

  // ==================================================================
  // Referensi Elemen DOM
  // ==================================================================
  const pages = {
    mainMenu: document.getElementById("main-menu-page"),
    home: document.getElementById("home-page"),
    game: document.getElementById("game-page"),
    end: document.getElementById("end-page"),
  };

  // Main menu buttons
  const btnMainMenuStart = document.getElementById("main-menu-start-btn");
  const btnMainMenuSettings = document.getElementById("main-menu-settings-btn");
  const btnMainMenuCredits = document.getElementById("main-menu-credits-btn");
  const btnMainMenuExit = document.getElementById("main-menu-exit-btn");

  // Home (player name)
  const btnStartGame = document.getElementById("start-game-btn");
  const inputPlayer1 = document.getElementById("player1");
  const inputPlayer2 = document.getElementById("player2");
  const homeError = document.getElementById("home-error");
  const btnBackToMainMenu = document.getElementById("back-to-main-menu-btn");

  // Game page elements
  const player1ScoreEl = document.getElementById("player1-score");
  const player2ScoreEl = document.getElementById("player2-score");
  const labelStatus = document.getElementById("label-status");
  const btnResetGame = document.getElementById("reset-game-btn");
  const btnBackToHome = document.getElementById("back-to-home-btn");
  const btnGameSettings = document.getElementById("game-settings-btn");
  const btnFinishGame = document.getElementById("finish-game-btn");
  const btnNewGame = document.getElementById("new-game-btn"); // optional

  // End page
  const labelTitle = document.getElementById("label-title");
  const labelSubtitle = document.getElementById("label-subtitle");
  const btnPlayAgain = document.getElementById("play-again-btn");
  const btnBackToHome2 = document.getElementById("back-to-home-btn-2");

  // Modals
  const creditsModal = document.getElementById("credits-modal");
  const modalCloseBtn = document.getElementById("modal-close");
  const settingsModal = document.getElementById("settings-modal");
  const settingsModalClose = document.getElementById("settings-modal-close");

  // Audio controls
  const soundToggle = document.getElementById("sound-toggle");
  const volumeSlider = document.getElementById("volume-slider");

  // PERBAIKAN: Memuat suara klik di JavaScript
  const soundClick = new Audio("assets/sounds/click.wav");

  // Color pickers (X/O) and background controls (may be null if HTML belum punya)
  const xColorPicker = document.getElementById("x-color-picker");
  const oColorPicker = document.getElementById("o-color-picker");
  const bgColorPicker = document.getElementById("bg-color-picker");
  const bgApplyBtn = document.getElementById("bg-apply-btn");

  // ==================================================================
  // Helper untuk memutar suara dari Python (win, draw, score)
  // ==================================================================
  function playPySound(soundName) {
    if (
      window.pywebview &&
      window.pywebview.api &&
      typeof window.pywebview.api.play_sound === "function"
    ) {
      try {
        window.pywebview.api.play_sound(soundName);
      } catch (e) {
        console.error(`Gagal memutar suara: ${soundName}`, e);
      }
    } else {
      console.log(`Fallback: Memainkan suara ${soundName}`);
    }
  }

  // ==================================================================
  // Helper: baca CSS vars bila kamu pakai :root vars
  // ==================================================================
  function readCssVar(name) {
    try {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    } catch (e) {
      return "";
    }
  }

  function updateColorsFromCss() {
    const x = readCssVar("--x-color") || COLOR_X;
    const o = readCssVar("--o-color") || COLOR_O;
    const grid = readCssVar("--grid-color") || COLOR_GRID;
    if (x) COLOR_X = x;
    if (o) COLOR_O = o;
    if (grid) COLOR_GRID = grid;
    try {
      drawGrid();
    } catch (e) {
      /* ignore */
    }
  }

  // attach quick theme circles (jika ada .color-circle di DOM)
  (function attachColorCircles() {
    const circles = document.querySelectorAll(".color-circle");
    if (!circles || circles.length === 0) return;
    circles.forEach((c) => {
      c.addEventListener("click", () => {
        const theme = c.dataset.theme || null;
        if (!theme) {
          const bg = c.style.backgroundColor;
          if (bg) {
            document.documentElement.style.setProperty("--accent-color", bg);
            document.documentElement.style.setProperty("--x-color", bg);
          }
        } else {
          const map = {
            default: {
              "--x-color": "#ff715b",
              "--o-color": "#7bd389",
              "--grid-color": "rgba(255,255,255,0.06)",
            },
            dark: {
              "--x-color": "#ff6b6b",
              "--o-color": "#9ad29a",
              "--grid-color": "rgba(255,255,255,0.04)",
            },
            pink: {
              "--x-color": "#ff3b79",
              "--o-color": "#800040",
              "--grid-color": "rgba(255,255,255,0.03)",
            },
            blue: {
              "--x-color": "#005f99",
              "--o-color": "#007BFF",
              "--grid-color": "rgba(255,255,255,0.05)",
            },
            green: {
              "--x-color": "#2e8b57",
              "--o-color": "#33cc66",
              "--grid-color": "rgba(255,255,255,0.05)",
            },
          };
          const vars = map[theme] || map.default;
          Object.keys(vars).forEach((k) =>
            document.documentElement.style.setProperty(k, vars[k])
          );
          try {
            localStorage.setItem("tic_theme", theme);
          } catch (e) {}
        }
        circles.forEach((x) => x.classList.remove("active"));
        c.classList.add("active");
        updateColorsFromCss();
      });
    });
    // apply saved theme if exists
    try {
      const saved = localStorage.getItem("tic_theme");
      if (saved) {
        const el = Array.from(circles).find((x) => x.dataset.theme === saved);
        if (el) el.classList.add("active");
      }
    } catch (e) {}
  })();

  // Apply initial colors from CSS var if present
  updateColorsFromCss();

  // ==================================================================
  // Fungsi Helper (dipanggil dari Python / UI)
  // ==================================================================
  window.showPage = (pageId) => {
    for (const id in pages) {
      if (pages.hasOwnProperty(id) && pages[id]) {
        pages[id].classList.remove("active");
      }
    }
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
      pageToShow.classList.add("active");
    } else {
      console.error("Halaman tidak ditemukan:", pageId);
    }
    if (pageId === "home-page") {
      if (inputPlayer1) inputPlayer1.value = "";
      if (inputPlayer2) inputPlayer2.value = "";
      if (homeError) homeError.textContent = "";
    }
  };

  window.showError = (message) => {
    if (homeError) homeError.textContent = message;
  };

  window.updateTurnLabel = async (player) => {
    try {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.get_player_names === "function"
      ) {
        playerNames = await window.pywebview.api.get_player_names();
      }
      if (labelStatus)
        labelStatus.textContent = `Giliran: ${playerNames[player]} (${player})`;
    } catch (e) {
      console.error("Gagal mendapatkan nama pemain:", e);
      const name = player === "X" ? "Player 1" : "Player 2";
      if (labelStatus) labelStatus.textContent = `Giliran: ${name} (${player})`;
    }
  };

  // ==================================================================
  // Gambar pada Canvas
  // ==================================================================
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
      x0 = padding;
      x1 = canvas.width - padding;
    } else if (x0 === x1) {
      y0 = padding;
      y1 = canvas.height - padding;
    } else if (x0 < x1) {
      x0 = padding;
      y0 = padding;
      x1 = canvas.width - padding;
      y1 = canvas.height - padding;
    } else {
      x0 = canvas.width - padding;
      y0 = padding;
      x1 = padding;
      y1 = canvas.height - padding;
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
  };

  // ==================================================================
  // Game outcome handlers
  // ==================================================================
  window.handleWin = (pattern, player) => {
    drawWinnerLine(pattern);

    if (player === "X") {
      playPySound("score"); // Panggil suara untuk P1
      player1Score++;
      if (player1ScoreEl) player1ScoreEl.textContent = player1Score;
    } else {
      playPySound("score"); // Panggil suara untuk P2
      player2Score++;
      if (player2ScoreEl) player2ScoreEl.textContent = player2Score;
    }

    setTimeout(() => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.reset_board_from_js === "function"
      ) {
        try {
          window.pywebview.api.reset_board_from_js();
        } catch (e) {
          console.error(e);
          window.resetBoardUI();
        }
      } else {
        window.resetBoardUI();
      }
    }, 1500);
  };

  window.handleDraw = () => {
    playPySound("draw");
    setTimeout(() => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.reset_board_from_js === "function"
      ) {
        try {
          window.pywebview.api.reset_board_from_js();
        } catch (e) {
          console.error(e);
          window.resetBoardUI();
        }
      } else {
        window.resetBoardUI();
      }
    }, 1000);
  };

  // ==================================================================
  // Event listeners (Main menu, Home, Game, Modals)
  // ==================================================================
  if (btnMainMenuStart) {
    btnMainMenuStart.addEventListener("click", () => {
      if (typeof window.showPage === "function") window.showPage("home-page");
    });
  }

  if (btnMainMenuExit) {
    btnMainMenuExit.addEventListener("click", () => {
      try {
        if (
          window.pywebview &&
          window.pywebview.api &&
          typeof window.pywebview.api.exit_game === "function"
        ) {
          window.pywebview.api.exit_game();
        } else {
          window.close();
        }
      } catch (e) {
        console.error("Gagal memanggil exit_game():", e);
        try {
          window.close();
        } catch (err) {}
      }
    });
  }

  if (btnStartGame) {
    btnStartGame.addEventListener("click", () => {
      const name1 = (inputPlayer1 && inputPlayer1.value.trim()) || "";
      const name2 = (inputPlayer2 && inputPlayer2.value.trim()) || "";
      if (homeError) homeError.textContent = "";
      if (!name1 || !name2) {
        if (homeError) homeError.textContent = "Masukkan nama kedua pemain!";
        return;
      } else {
        player1Score = 0;
        player2Score = 0;
        if (player1ScoreEl) player1ScoreEl.textContent = "0";
        if (player2ScoreEl) player2ScoreEl.textContent = "0";

        if (
          window.pywebview &&
          window.pywebview.api &&
          typeof window.pywebview.api.start_game === "function"
        ) {
          window.pywebview.api.start_game(name1, name2);
        } else {
          // fallback untuk testing di browser
          playerNames.X = name1;
          playerNames.O = name2;
          if (typeof window.showPage === "function")
            window.showPage("game-page");
          if (typeof window.resetBoardUI === "function") window.resetBoardUI();
        }
      }
    });
  }

  if (btnBackToMainMenu) {
    btnBackToMainMenu.addEventListener("click", () => {
      if (typeof window.showPage === "function")
        window.showPage("main-menu-page");
    });
  }

  // canvas click -> kirim cell index ke Python
  if (canvas) {
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
        // PERBAIKAN: Mainkan suara klik instan di JS
        if (soundClick) {
          // Terapkan volume dari slider
          const sliderVolume =
            (volumeSlider.value / 100) * (soundToggle.checked ? 1 : 0);
          soundClick.volume = sliderVolume;
          soundClick.currentTime = 0; // Rewind
          soundClick.play();
        }

        const index = row * 3 + col;
        if (
          window.pywebview &&
          window.pywebview.api &&
          typeof window.pywebview.api.cell_clicked === "function"
        ) {
          // Kirim perintah ke Python (tanpa menunggu suara)
          window.pywebview.api.cell_clicked(index);
        } else {
          console.log("cell clicked (fallback):", index);
        }
      }
    });
  }

  if (btnResetGame) {
    btnResetGame.addEventListener("click", () => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.reset_board_from_js === "function"
      ) {
        window.pywebview.api.reset_board_from_js();
      } else {
        window.resetBoardUI();
      }
    });
  }

  if (btnBackToHome) {
    btnBackToHome.addEventListener("click", () => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.go_to_home === "function"
      ) {
        window.pywebview.api.go_to_home();
      } else if (typeof window.showPage === "function") {
        window.showPage("home-page");
      }
    });
  }

  if (btnGameSettings) {
    btnGameSettings.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "flex";
    });
  }

  if (btnFinishGame) {
    btnFinishGame.addEventListener("click", () => {
      const p1Name = playerNames.X || "Player 1";
      const p2Name = playerNames.O || "Player 2";

      if (player1Score > player2Score) {
        playPySound("win");
        if (labelTitle) labelTitle.textContent = "PEMENANG AKHIR";
        if (labelSubtitle)
          labelSubtitle.textContent = `${p1Name} (X) - Skor: ${player1Score}`;
      } else if (player2Score > player1Score) {
        playPySound("win");
        if (labelTitle) labelTitle.textContent = "PEMENANG AKHIR";
        if (labelSubtitle)
          labelSubtitle.textContent = `${p2Name} (O) - Skor: ${player2Score}`;
      } else {
        playPySound("draw");
        if (labelTitle) labelTitle.textContent = "PERMAINAN SERI";
        if (labelSubtitle)
          labelSubtitle.textContent = `Skor Akhir: ${p1Name} (${player1Score}) - ${p2Name} (${player2Score})`;
      }
      if (typeof window.showPage === "function") window.showPage("end-page");
    });
  }

  if (btnNewGame) {
    btnNewGame.addEventListener("click", () => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.reset_board_from_js === "function"
      ) {
        window.pywebview.api.reset_board_from_js();
      } else {
        window.resetBoardUI();
      }
    });
  }

  if (btnPlayAgain) {
    btnPlayAgain.addEventListener("click", () => {
      player1Score = 0;
      player2Score = 0;
      if (player1ScoreEl) player1ScoreEl.textContent = "0";
      if (player2ScoreEl) player2ScoreEl.textContent = "0";

      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.reset_board_from_js === "function"
      ) {
        window.pywebview.api.reset_board_from_js();
      }

      // PERBAIKAN: Pindahkan showPage ke sini.
      if (typeof window.showPage === "function") {
        window.showPage("game-page");
      }
    });
  }

  if (btnBackToHome2) {
    btnBackToHome2.addEventListener("click", () => {
      if (
        window.pywebview &&
        window.pywebview.api &&
        typeof window.pywebview.api.go_to_home === "function"
      ) {
        window.pywebview.api.go_to_home();
      } else if (typeof window.showPage === "function") {
        window.showPage("home-page");
      }
    });
  }

  // ==================================================================
  // Modal (Credits & Settings) listeners
  // ==================================================================
  if (btnMainMenuCredits) {
    btnMainMenuCredits.addEventListener("click", (e) => {
      e.preventDefault();
      if (creditsModal) creditsModal.style.display = "flex";
    });
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      if (creditsModal) creditsModal.style.display = "none";
    });
  }
  if (creditsModal) {
    creditsModal.addEventListener("click", (e) => {
      if (e.target === creditsModal) creditsModal.style.display = "none";
    });
  }
  if (btnMainMenuSettings) {
    btnMainMenuSettings.addEventListener("click", (e) => {
      e.preventDefault();
      if (settingsModal) settingsModal.style.display = "flex";
    });
  }
  if (settingsModalClose) {
    settingsModalClose.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) settingsModal.style.display = "none";
    });
  }

  // ==================================================================
  // Audio controls (volume + mute toggle)
  // ==================================================================
  let isProgrammaticallyChanging = false;

  // PERBAIKAN: Fungsi baru untuk mengatur SEMUA suara
  function setAllVolumes(normalizedVolume) {
    // 1. Kirim ke Python (untuk win, draw, score)
    if (
      window.pywebview &&
      window.pywebview.api &&
      typeof window.pywebview.api.set_volume === "function"
    ) {
      try {
        window.pywebview.api.set_volume(normalizedVolume);
      } catch (e) {
        console.error("Gagal mengatur volume Python:", e);
      }
    }

    // 2. Terapkan ke JS (untuk click)
    if (soundClick) {
      soundClick.volume = normalizedVolume;
    }
  }

  function loadAudioSettings() {
    let savedVolume = localStorage.getItem("ticTacToeVolume") || 0.5;
    const isMuted = false;
    if (soundToggle) soundToggle.checked = true;
    if (volumeSlider) volumeSlider.disabled = false;
    if (parseFloat(savedVolume) === 0) savedVolume = 0.5;
    if (volumeSlider) volumeSlider.value = parseFloat(savedVolume) * 100;

    // Gunakan fungsi baru
    setAllVolumes(savedVolume);

    try {
      localStorage.setItem("ticTacToeMuted", isMuted);
      localStorage.setItem("ticTacToeVolume", savedVolume);
    } catch (e) {}
  }

  function handleSliderInput(event) {
    if (isProgrammaticallyChanging) return;
    const intendedVolume = event.target.value;
    const normalizedVolume = parseFloat(intendedVolume) / 100;

    try {
      localStorage.setItem("ticTacToeVolume", normalizedVolume);
    } catch (e) {}

    // Gunakan fungsi baru
    setAllVolumes(normalizedVolume);

    if (normalizedVolume === 0 && soundToggle && soundToggle.checked) {
      isProgrammaticallyChanging = true;
      soundToggle.checked = false;
      isProgrammaticallyChanging = false;
    } else if (normalizedVolume > 0 && soundToggle && !soundToggle.checked) {
      isProgrammaticallyChanging = true;
      soundToggle.checked = true;
      isProgrammaticallyChanging = false;
    }
  }

  function handleToggleChange(event) {
    if (isProgrammaticallyChanging) return;
    const isMuted = !(soundToggle && soundToggle.checked);
    try {
      localStorage.setItem("ticTacToeMuted", isMuted);
    } catch (e) {}

    if (isMuted) {
      if (volumeSlider) volumeSlider.disabled = true;
      setAllVolumes(0); // Set semua suara ke 0
    } else {
      if (volumeSlider) volumeSlider.disabled = false;
      let savedVolume = localStorage.getItem("ticTacToeVolume") || 0.5;
      if (parseFloat(savedVolume) === 0) {
        savedVolume = 0.5;
        try {
          localStorage.setItem("ticTacToeVolume", savedVolume);
        } catch (e) {}
      }
      isProgrammaticallyChanging = true;
      if (volumeSlider) volumeSlider.value = parseFloat(savedVolume) * 100;
      isProgrammaticallyChanging = false;

      // Gunakan fungsi baru
      setAllVolumes(savedVolume);
    }
  }

  if (volumeSlider) volumeSlider.addEventListener("input", handleSliderInput);
  if (soundToggle) soundToggle.addEventListener("change", handleToggleChange);

  // ==================================================================
  // Custom color pickers for X and O
  // ==================================================================
  if (xColorPicker) {
    xColorPicker.addEventListener("input", () => {
      COLOR_X = xColorPicker.value;
      try {
        document.documentElement.style.setProperty("--x-color", COLOR_X);
      } catch (e) {}
      drawGrid();
    });
  }
  if (oColorPicker) {
    oColorPicker.addEventListener("input", () => {
      COLOR_O = oColorPicker.value;
      try {
        document.documentElement.style.setProperty("--o-color", COLOR_O);
      } catch (e) {}
      drawGrid();
    });
  }

  // ==================================================================
  // Background color/image picker
  // ==================================================================
  const BG_IMAGE_URL = "assets/images/bg1.jpg"; // Default path

  function applyBackgroundType(typeOrColor) {
    const bgEl = document.querySelector(".background");
    const overlay = document.querySelector(".background-overlay");
    if (!bgEl) return;
    if (!typeOrColor || typeOrColor === "image") {
      bgEl.style.backgroundImage = `url('${BG_IMAGE_URL}')`; // Tetapkan ke BG1
      bgEl.style.backgroundColor = "";
      bgEl.style.backgroundSize = "auto";
      if (overlay) overlay.style.display = "";
      try {
        localStorage.setItem("ticTacToeBg", "image");
        localStorage.setItem("ticTacToeBgPath", BG_IMAGE_URL); // Simpan BG1
      } catch (e) {}
    } else {
      // Ini untuk menerapkan warna custom
      bgEl.style.backgroundImage = "none";
      bgEl.style.backgroundColor = typeOrColor;
      bgEl.style.backgroundSize = "cover";
      if (overlay) overlay.style.display = "none";
      try {
        localStorage.setItem("ticTacToeBg", typeOrColor);
        localStorage.removeItem("ticTacToeBgPath"); // Hapus path gambar
      } catch (e) {}
    }
  }

  // ==================================================================
  // Dukungan background bergambar (BG1, BG2, BG3, dst.)
  // ==================================================================
  const bgButtons = document.querySelectorAll(".bg-img-btn");
  bgButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bgEl = document.querySelector(".background");
      const overlay = document.querySelector(".background-overlay");
      const bgPath = btn.dataset.bg; // Ambil path dari tombol (mis: "assets/images/bg1.jpg")
      if (bgEl && bgPath) {
        bgEl.style.backgroundImage = `url('${bgPath}')`;
        bgEl.style.backgroundColor = "";
        bgEl.style.backgroundSize = "cover"; // Set ke cover agar pas
        if (overlay) overlay.style.display = ""; // Tampilkan overlay
        try {
          // Simpan path gambar yg dipilih
          localStorage.setItem("ticTacToeBg", "image");
          localStorage.setItem("ticTacToeBgPath", bgPath);
        } catch (e) {}
      }
    });
  });

  // Saat startup, cek apakah user sebelumnya pakai gambar custom
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const savedType = localStorage.getItem("ticTacToeBg");
      const savedPath = localStorage.getItem("ticTacToeBgPath");
      const bgEl = document.querySelector(".background");
      const overlay = document.querySelector(".background-overlay");
      if (!bgEl) return;

      // 1. Jika ada path gambar yg tersimpan, gunakan itu.
      if (savedType === "image" && savedPath) {
        bgEl.style.backgroundImage = `url('${savedPath}')`;
        bgEl.style.backgroundColor = "";
        bgEl.style.backgroundSize = "cover";
        if (overlay) overlay.style.display = "";
      }
      // 2. Jika tidak ada path, tapi tipenya adalah warna, gunakan warna itu.
      else if (savedType && savedType.startsWith("#")) {
        bgEl.style.backgroundImage = "none";
        bgEl.style.backgroundColor = savedType;
        bgEl.style.backgroundSize = "cover";
        if (overlay) overlay.style.display = "none";
      }
      // 3. Jika tidak ada yg tersimpan (pertama kali main), CSS default (bg1.jpg)
      //    akan otomatis diterapkan.
    } catch (e) {}
  });

  // Listener untuk tombol "Terapkan" warna custom
  if (bgApplyBtn && bgColorPicker) {
    bgApplyBtn.addEventListener("click", () => {
      applyBackgroundType(bgColorPicker.value);
    });
  }

  // Muat pengaturan audio, gambar grid, dan tampilkan halaman utama
  loadAudioSettings();
  drawGrid();
  if (typeof window.showPage === "function") window.showPage("main-menu-page");
});
