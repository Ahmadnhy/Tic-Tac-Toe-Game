// Menunggu pywebview siap sebelum menambahkan listener
window.addEventListener("pywebviewready", () => {
  // ==================================================================
  // Variabel Global dan Konfigurasi Canvas
  // ==================================================================
  const canvas = document.getElementById("tic-tac-toe-board");
  // Pastikan canvas ada sebelum melanjutkan
  if (!canvas) {
    console.error("Elemen canvas 'tic-tac-toe-board' tidak ditemukan!");
    return;
  }
  const ctx = canvas.getContext("2d");

  // Konstanta Papan
  const CELL_SIZE = 100;
  const LINE_WIDTH = 4; // Lebar garis 4px
  const BOARD_SIZE = CELL_SIZE * 3 + LINE_WIDTH * 2;

  // Sesuaikan ukuran canvas jika berbeda (meski sudah diatur di HTML)
  canvas.width = BOARD_SIZE;
  canvas.height = BOARD_SIZE;

  // Warna
  const COLOR_GRID = "#333";
  const COLOR_X = "#E63946"; // Merah
  const COLOR_O = "#457B9D"; // Biru
  const COLOR_WIN_LINE = "#2A9D8F"; // Hijau Tosca

  // Variabel state JS
  let playerNames = { X: "Player 1", O: "Player 2" }; // Default

  // ==================================================================
  // Referensi Elemen DOM
  // ==================================================================

  // Halaman
  const pages = {
    home: document.getElementById("home-page"),
    game: document.getElementById("game-page"),
    end: document.getElementById("end-page"),
  };

  // Halaman Home
  const btnStartGame = document.getElementById("start-game-btn");
  const inputPlayer1 = document.getElementById("player1");
  const inputPlayer2 = document.getElementById("player2");
  const homeError = document.getElementById("home-error");

  // Halaman Game
  const labelStatus = document.getElementById("label-status");
  const btnResetGame = document.getElementById("reset-game-btn");
  const btnBackToHome = document.getElementById("back-to-home-btn");

  // Halaman Selesai
  const labelTitle = document.getElementById("label-title");
  const labelSubtitle = document.getElementById("label-subtitle");
  const btnPlayAgain = document.getElementById("play-again-btn");
  const btnBackToHome2 = document.getElementById("back-to-home-btn-2");

  // ===== Referensi Modal Credits =====
  const creditsLink = document.getElementById("credits-link");
  const creditsModal = document.getElementById("credits-modal");
  const modalCloseBtn = document.getElementById("modal-close");
  // ====================================

  // ===== Referensi Modal Settings =====
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const settingsModalClose = document.getElementById("settings-modal-close");
  const soundToggle = document.getElementById("sound-toggle");
  const volumeSlider = document.getElementById("volume-slider");
  // ====================================

  // ==================================================================
  // Fungsi Helper (Dipanggil oleh Python atau Event Listener)
  // ==================================================================

  /**
   * Menampilkan halaman yang ditentukan dan menyembunyikan yang lain.
   * @param {string} pageId ('home-page', 'game-page', 'end-page')
   */
  window.showPage = (pageId) => {
    for (const id in pages) {
      if (pages.hasOwnProperty(id)) {
        pages[id].classList.remove("active");
      }
    }
    document.getElementById(pageId).classList.add("active");

    // Jika pindah ke home, bersihkan input
    if (pageId === "home-page") {
      inputPlayer1.value = "";
      inputPlayer2.value = "";
      homeError.textContent = "";
    }
  };

  /**
   * Menampilkan pesan error di halaman home.
   * @param {string} message
   */
  window.showError = (message) => {
    homeError.textContent = message;
  };

  /**
   * Memperbarui label giliran di halaman game.
   * @param {string} player ('X' atau 'O')
   */
  window.updateTurnLabel = async (player) => {
    try {
      // Panggil Python untuk mendapatkan nama terbaru
      playerNames = await window.pywebview.api.get_player_names();
      labelStatus.textContent = `Giliran: ${playerNames[player]} (${player})`;
    } catch (e) {
      console.error("Gagal mendapatkan nama pemain:", e);
      // Fallback jika gagal
      const name = player === "X" ? "Player 1" : "Player 2";
      labelStatus.textContent = `Giliran: ${name} (${player})`;
    }
  };

  /**
   * Menggambar X atau O di canvas.
   * @param {number} index (0-8)
   * @param {string} player ('X' atau 'O')
   */
  window.drawMove = (index, player) => {
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Hitung koordinat tengah sel
    const x = col * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;
    const y = row * (CELL_SIZE + LINE_WIDTH) + CELL_SIZE / 2;

    const margin = CELL_SIZE * 0.2; // 20% margin
    ctx.lineWidth = 5;
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

  /**
   * Menggambar garis grid awal.
   */
  const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineCap = "butt"; // Garis kotak

    // Garis Vertikal
    for (let i = 1; i < 3; i++) {
      const x = i * CELL_SIZE + (i - 1) * LINE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      // Garis kedua untuk ketebalan
      ctx.beginPath();
      ctx.moveTo(x + LINE_WIDTH, 0);
      ctx.lineTo(x + LINE_WIDTH, canvas.height);
      ctx.stroke();
    }

    // Garis Horizontal
    for (let i = 1; i < 3; i++) {
      const y = i * CELL_SIZE + (i - 1) * LINE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      // Garis kedua untuk ketebalan
      ctx.beginPath();
      ctx.moveTo(0, y + LINE_WIDTH);
      ctx.lineTo(canvas.width, y + LINE_WIDTH);
      ctx.stroke();
    }
  };

  /**
   * Membersihkan canvas dan menggambar ulang grid.
   */
  window.resetBoardUI = () => {
    drawGrid();
  };

  /**
   * Menggambar garis kemenangan dengan animasi.
   * @param {Array<number>} pattern [start, mid, end]
   */
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

    // Padding agar garis lebih panjang
    const padding = CELL_SIZE * 0.3;

    let x0 = start.x,
      y0 = start.y,
      x1 = end.x,
      y1 = end.y;

    if (y0 === y1) {
      // Horizontal
      x0 = padding;
      x1 = canvas.width - padding;
    } else if (x0 === x1) {
      // Vertikal
      y0 = padding;
      y1 = canvas.height - padding;
    } else if (x0 < x1) {
      // Diagonal \
      x0 = padding;
      y0 = padding;
      x1 = canvas.width - padding;
      y1 = canvas.height - padding;
    } else {
      // Diagonal /
      x0 = canvas.width - padding;
      y0 = padding;
      x1 = padding;
      y1 = canvas.height - padding;
    }

    // Animasi
    ctx.strokeStyle = COLOR_WIN_LINE;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";

    let progress = 0;
    const totalSteps = 20; // Jumlah langkah animasi

    function animate() {
      if (progress > totalSteps) return;

      // Hitung posisi saat ini
      const currentX = x0 + (x1 - x0) * (progress / totalSteps);
      const currentY = y0 + (y1 - y0) * (progress / totalSteps);

      // Hitung posisi sebelumnya
      const prevX = x0 + (x1 - x0) * ((progress - 1) / totalSteps);
      const prevY = y0 + (y1 - y0) * ((progress - 1) / totalSteps);

      ctx.beginPath();
      // Hanya gambar segmen baru
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      progress++;
      // requestAnimationFrame lebih mulus daripada setTimeout
      requestAnimationFrame(animate);
    }

    // Inisialisasi posisi awal untuk langkah pertama
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0);
    ctx.stroke();

    animate(); // Mulai animasi
  };

  /**
   * Menangani logika UI saat menang.
   * @param {Array<number>} pattern [start, mid, end]
   * @param {string} player ('X' atau 'O')
   */
  window.handleWin = (pattern, player) => {
    drawWinnerLine(pattern);

    // Tampilkan halaman akhir setelah animasi
    setTimeout(() => {
      labelTitle.textContent = "WINNER";
      labelSubtitle.textContent = `${playerNames[player]} sebagai ${player}`;
      window.showPage("end-page");
    }, 800); // Tunggu 0.8 detik agar animasi selesai
  };

  /**
   * Menangani logika UI saat seri.
   */
  window.handleDraw = () => {
    setTimeout(() => {
      labelTitle.textContent = "SERI";
      labelSubtitle.textContent = "Kalian semua hebat";
      window.showPage("end-page");
    }, 500); // Tunggu 0.5 detik
  };

  // ==================================================================
  // Event Listeners (JS ke Python)
  // ==================================================================

  // Halaman Home
  btnStartGame.addEventListener("click", () => {
    // --- PERBAIKAN DIMULAI DI SINI ---

    // 1. Ambil nilai dan hapus spasi di awal/akhir
    const name1 = inputPlayer1.value.trim();
    const name2 = inputPlayer2.value.trim();

    homeError.textContent = ""; // Bersihkan error

    // 2. Lakukan validasi di JavaScript
    if (!name1 || !name2) {
      // Tampilkan error langsung di JS, JANGAN panggil Python
      homeError.textContent = "Masukkan nama kedua pemain!";
    } else {
      // 3. Baru panggil API Python jika nama sudah valid
      window.pywebview.api.start_game(name1, name2);
    }
    // --- PERBAIKAN SELESAI ---
  });

  // Halaman Game
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    // Skalakan klik jika ukuran canvas berbeda dari ukuran display
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Tentukan sel mana yang diklik
    const col = Math.floor(x / (CELL_SIZE + LINE_WIDTH));
    const row = Math.floor(y / (CELL_SIZE + LINE_WIDTH));

    // Pastikan klik berada di dalam batas (menghindari klik pada garis grid)
    if (col < 0 || col > 2 || row < 0 || row > 2) return;

    const xInCell = x % (CELL_SIZE + LINE_WIDTH);
    const yInCell = y % (CELL_SIZE + LINE_WIDTH);

    // Hanya proses jika klik *di dalam* sel, bukan di garis
    if (xInCell < CELL_SIZE && yInCell < CELL_SIZE) {
      const index = row * 3 + col;
      // Panggil API Python
      window.pywebview.api.cell_clicked(index);
    }
  });

  btnResetGame.addEventListener("click", () => {
    // Panggil API Python untuk mereset (hanya reset papan, bukan nama)
    window.pywebview.api.reset_board_from_js();
  });

  btnBackToHome.addEventListener("click", () => {
    // Panggil API Python
    window.pywebview.api.go_to_home();
  });

  // Halaman Selesai
  btnPlayAgain.addEventListener("click", () => {
    // Panggil API Python untuk mereset
    window.pywebview.api.reset_board_from_js();
  });

  btnBackToHome2.addEventListener("click", () => {
    // Panggil API Python
    window.pywebview.api.go_to_home();
  });

  // ===== Event Listener Modal Credits =====
  if (creditsLink) {
    creditsLink.addEventListener("click", (e) => {
      e.preventDefault(); // Mencegah link pindah halaman
      if (creditsModal) {
        creditsModal.style.display = "flex"; // Tampilkan modal
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      // PERBAIKAN: () => {
      if (creditsModal) {
        creditsModal.style.display = "none"; // Sembunyikan modal
      }
    });
  }

  if (creditsModal) {
    // Klik di luar konten modal (di overlay) akan menutupnya
    creditsModal.addEventListener("click", (e) => {
      if (e.target === creditsModal) {
        creditsModal.style.display = "none";
      }
    });
  }

  // ===== Event Listener Modal Settings =====
  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Mencegah link pindah halaman
      if (settingsModal) {
        settingsModal.style.display = "flex"; // Tampilkan modal
      }
    });
  }

  if (settingsModalClose) {
    settingsModalClose.addEventListener("click", () => {
      if (settingsModal) {
        settingsModal.style.display = "none"; // Sembunyikan modal
      }
    });
  }

  if (settingsModal) {
    // Klik di luar konten modal (di overlay) akan menutupnya
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = "none";
      }
    });
  }
  // ========================================

  // ==================================================================
  // Logika Volume dan Suara (REVISI TOTAL)
  // ==================================================================

  /**
   * Mengirim nilai volume HANYA ke backend Python.
   * Tidak menyimpan state di localStorage di sini.
   * @param {number|string} volume Nilai dari 0.0 hingga 1.0
   */
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

  /**
   * Fungsi utama untuk memperbarui status audio.
   * Membaca state dari toggle dan slider,
   * lalu memanggil setPythonVolume dan menyimpan ke localStorage.
   */
  function updateAudioSettings() {
    // 1. Baca state dari elemen HTML
    const isMuted = !soundToggle.checked;
    const intendedVolume = volumeSlider.value;

    // 2. Simpan preferensi ke localStorage
    localStorage.setItem("ticTacToeMuted", isMuted);
    localStorage.setItem("ticTacToeVolume", intendedVolume);

    // 3. Terapkan state
    if (isMuted) {
      volumeSlider.disabled = true;
      setPythonVolume(0); // Mute Python
    } else {
      volumeSlider.disabled = false;
      setPythonVolume(intendedVolume); // Atur volume Python
    }
  }

  /**
   * Memuat pengaturan audio dari localStorage saat aplikasi dimulai.
   */
  function loadAudioSettings() {
    const savedVolume = localStorage.getItem("ticTacToeVolume") || 1.0;
    const savedMuted = localStorage.getItem("ticTacToeMuted") === "true";

    // Atur elemen HTML sesuai state yang disimpan
    volumeSlider.value = savedVolume;
    soundToggle.checked = !savedMuted;

    // Terapkan state yang dimuat (mengatur volume di Python dan disable slider jika perlu)
    updateAudioSettings();
  }

  // Tambahkan listener untuk setiap kali slider atau toggle diubah
  volumeSlider.addEventListener("input", updateAudioSettings);
  soundToggle.addEventListener("change", updateAudioSettings);
  // ========================================

  // ==================================================================
  // Inisialisasi Awal
  // ==================================================================

  loadAudioSettings(); // Panggil fungsi untuk memuat setelan audio

  drawGrid(); // Gambar grid saat script dimuat
  window.showPage("home-page"); // Tampilkan halaman home
});
