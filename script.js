class VirtualMonkey {
  assetPaths = {
    monkey: {
      idle: "/assets/idle.gif",
      eating: "/assets/makan.gif",
      sleeping: "/assets/tidur.gif",
      bathing: "/assets/mandi.gif",
      hungry: "/assets/makan.gif",
      dead: "/assets/idle.gif",
    },
    background: {
      idle: "/assets/bg_siang.gif",
      sleeping: "/assets/bg_malam.jpg",
      playing: "/assets/Mario Kart Arcade GIF by Smolverse.gif",
    },
  };

  constructor() {
    this.context = {
      life: 100,
      mood: 70,
      energy: 100,
      hunger: 0,
      cleanliness: 100,
      points: 0,
    };

    this.currentState = "idle";
    this.actionTimeout = null;
    this.degradationInterval = null;
    this.messageTimeout = null;

    this.initializeElements();
    this.setupEventListeners();
    this.updateDisplay();
    this.startDegradation();
    this.updateMonkeyAppearance(); // Memastikan gambar awal dimuat dengan benar
  }

  initializeElements() {
    this.monkey = document.getElementById("monkey");
    this.monkeyImage = document.getElementById("monkeyImage");
    this.monkeyArea = document.getElementById("monkeyArea");
    this.statusText = document.getElementById("statusText");
    this.message = document.getElementById("message");
    this.gameOver = document.getElementById("gameOver");

    this.elements = {
      life: {
        value: document.getElementById("lifeValue"),
        fill: document.getElementById("lifeFill"),
      },
      mood: {
        value: document.getElementById("moodValue"),
        fill: document.getElementById("moodFill"),
      },
      energy: {
        value: document.getElementById("energyValue"),
        fill: document.getElementById("energyFill"),
      },
      hunger: {
        value: document.getElementById("hungerValue"),
        fill: document.getElementById("hungerFill"),
      },
      cleanliness: {
        value: document.getElementById("cleanlinessValue"),
        fill: document.getElementById("cleanlinessFill"),
      },
    };

    this.buttons = {
      feed: document.getElementById("feedBtn"),
      sleep: document.getElementById("sleepBtn"),
      play: document.getElementById("playBtn"),
      bathe: document.getElementById("batheBtn"),
      restart: document.getElementById("restartBtn"),
    };
  }

  setupEventListeners() {
    this.buttons.feed.addEventListener("click", () => this.sendEvent("FEED"));
    this.buttons.sleep.addEventListener("click", () => this.sendEvent("SLEEP"));
    this.buttons.play.addEventListener("click", () => this.sendEvent("PLAY"));
    this.buttons.bathe.addEventListener("click", () => this.sendEvent("BATHE"));
    this.buttons.restart.addEventListener("click", () => this.restart());

    this.monkey.addEventListener("click", () => {
      if (this.currentState === "sleeping") {
        this.sendEvent("WAKE_UP");
      }
    });
  }

  sendEvent(event) {
    if (this.currentState === "dead") return;

    switch (this.currentState) {
      case "idle":
        this.handleIdleEvents(event);
        break;
      case "hungry":
        this.handleHungryEvents(event);
        break;
      case "sleeping":
        this.handleSleepingEvents(event);
        break;
    }
  }

  handleIdleEvents(event) {
    switch (event) {
      case "FEED":
        if (this.context.hunger > 0) {
          this.transitionTo("eating");
        } else {
          this.showMessage("Monyet tidak lapar saat ini.", "info");
        }
        break;
      case "SLEEP":
        if (this.context.energy < 100) {
          this.transitionTo("sleeping");
        } else {
          this.showMessage("Monyet tidak mengantuk.", "info");
        }
        break;
      case "PLAY":
        if (this.context.energy > 20) {
          this.transitionTo("playing");
        } else {
          this.showMessage("Monyet terlalu lelah untuk bermain.", "warning");
        }
        break;
      case "BATHE":
        if (this.context.cleanliness < 100) {
          this.transitionTo("bathing");
        } else {
          this.showMessage("Monyet sudah bersih!", "info");
        }
        break;
    }
  }

  handleHungryEvents(event) {
    if (event === "FEED") {
      this.transitionTo("eating");
    }
  }

  handleSleepingEvents(event) {
    if (event === "WAKE_UP") {
      const sleepDuration = (Date.now() - this.sleepStartTime) / 1000;
      const energyGained = Math.min(40, Math.floor(sleepDuration * 2));

      this.increaseEnergyPartial(energyGained);
      this.transitionTo("idle");
      if (energyGained < 10) {
        this.showMessage(
          "Monyet terbangun terlalu cepat dan masih lelah!",
          "warning"
        );
      } else {
        this.showMessage("Monyet terbangun!", "info");
      }
    }
  }

  transitionTo(state) {
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout);
      this.actionTimeout = null;
    }

    this.currentState = state;
    this.updateMonkeyAppearance();
    this.updateStatusText();
    this.updateButtonStates();

    switch (state) {
      case "eating":
        this.actionTimeout = setTimeout(() => {
          this.decreaseHunger(
            Math.min(this.context.hunger, 40 + Math.floor(Math.random() * 11))
          );
          this.increaseLife(5);
          this.increaseMood(10);
          this.decreaseCleanliness(5);
          this.transitionTo("idle");
          this.showMessage("Monyet selesai makan. Nyam!", "info");
        }, 2000 + Math.floor(Math.random() * 1000));
        break;

      case "sleeping":
        this.sleepStartTime = Date.now();
        this.actionTimeout = setTimeout(() => {
          this.increaseEnergy(50);
          this.increaseLife(10);
          this.transitionTo("idle");
          this.showMessage("Monyet segar setelah tidur nyenyak!", "info");
        }, 7000 + Math.floor(Math.random() * 3000));
        break;

      case "playing":
        this.actionTimeout = setTimeout(() => {
          this.increaseMood(
            Math.min(
              100 - this.context.mood,
              20 + Math.floor(Math.random() * 11)
            )
          );
          this.decreaseEnergy(25 + Math.floor(Math.random() * 6));
          this.increaseHunger(15 + Math.floor(Math.random() * 6));
          this.decreaseCleanliness(10 + Math.floor(Math.random() * 6));
          this.transitionTo("idle");
          this.showMessage("Monyet senang setelah bermain!", "info");
        }, 3000 + Math.floor(Math.random() * 2000));
        break;

      case "bathing":
        this.actionTimeout = setTimeout(() => {
          this.increaseCleanliness(
            Math.min(
              100 - this.context.cleanliness,
              50 + Math.floor(Math.random() * 21)
            )
          );
          this.increaseMood(10);
          this.decreaseEnergy(5);
          this.transitionTo("idle");
          this.showMessage("Monyet sekarang bersih dan segar!", "info");
        }, 2500 + Math.floor(Math.random() * 1500));
        break;

      case "hungry":
        this.showMessage("Monyet lapar! Beri dia makan.", "warning");
        break;

      case "dead":
        this.showGameOver();
        break;

      case "idle":
        if (this.context.life <= 0 && this.currentState !== "dead") {
          this.transitionTo("dead");
          return;
        }
        if (this.isHungerHigh()) {
          this.showMessage("Monyet masih terlihat lapar...", "warning");
        } else if (this.isEnergyLow()) {
          this.showMessage("Monyet terlihat lelah.", "info");
        } else if (this.isCleanlinessLowWarning()) {
          this.showMessage("Monyet sepertinya perlu mandi.", "info");
        }
        break;
    }
  }

  updateMonkeyAppearance() {
    const state = this.currentState;

    // Atur sumber gambar monyet, gunakan 'idle' jika state tidak ditemukan
    const monkeySrc =
      this.assetPaths.monkey[state] || this.assetPaths.monkey.idle;
    this.monkeyImage.src = monkeySrc;

    // Atur gambar latar belakang, gunakan 'idle' jika state tidak ditemukan
    const backgroundUrl =
      this.assetPaths.background[state] || this.assetPaths.background.idle;
    this.monkeyArea.style.backgroundImage = `url('${backgroundUrl}')`;

    // Hapus kelas-kelas spesifik status sebelumnya untuk reset
    this.monkey.classList.remove("dead", "sedang-bermain");

    // Terapkan kelas yang sesuai untuk status saat ini
    if (state === "dead") {
      this.monkey.classList.add("dead");
    } else if (state === "playing") {
      this.monkey.classList.add("sedang-bermain");
    }
  }

  updateStatusText() {
    const statusTexts = {
      idle: "Idle - Monyet sedang santai",
      eating: "Makan - Monyet sedang lahap makan",
      sleeping: "Tidur - Zzz... (klik monyet untuk membangunkan)",
      playing: "Main - Monyet sedang asyik bermain!",
      bathing: "Mandi - Monyet sedang membersihkan diri",
      hungry: "Lapar - Perut monyet keroncongan!",
      dead: "Mati - Monyet kesayanganmu telah tiada...",
    };
    this.statusText.textContent =
      statusTexts[this.currentState] || "Kondisi tidak diketahui";
  }

  updateDisplay() {
    Object.keys(this.context).forEach((stat) => {
      if (this.elements[stat]) {
        const value = Math.max(0, Math.min(100, this.context[stat]));
        this.elements[stat].value.textContent = Math.round(value);
        this.elements[stat].fill.style.width = value + "%";
      }
    });
    this.updateButtonStates();
  }

  updateButtonStates() {
    const isActionState = ["eating", "sleeping", "playing", "bathing"].includes(
      this.currentState
    );
    const isDead = this.currentState === "dead";

    this.buttons.feed.disabled =
      isActionState || isDead || this.context.hunger === 0;
    this.buttons.sleep.disabled =
      isActionState || isDead || this.context.energy === 100;
    this.buttons.play.disabled =
      isActionState || isDead || this.context.energy < 25;
    this.buttons.bathe.disabled =
      isActionState || isDead || this.context.cleanliness === 100;
    this.buttons.restart.disabled = !isDead;
  }

  increaseLife(amount = 5) {
    this.context.life = Math.min(100, this.context.life + amount);
    this.updateDisplay();
  }

  decreaseLife(amount = 2) {
    if (this.currentState === "dead") return;
    this.context.life = Math.max(0, this.context.life - amount);
    this.updateDisplay();
    if (this.context.life <= 0) {
      this.transitionTo("dead");
    }
  }

  increaseMood(amount = 10) {
    this.context.mood = Math.min(100, this.context.mood + amount);
    this.updateDisplay();
  }

  decreaseMood(amount = 2) {
    this.context.mood = Math.max(0, this.context.mood - amount);
    this.updateDisplay();
  }

  increaseEnergy(amount = 20) {
    this.context.energy = Math.min(100, this.context.energy + amount);
    this.updateDisplay();
  }

  increaseEnergyPartial(amount = 15) {
    this.context.energy = Math.min(100, this.context.energy + amount);
    this.updateDisplay();
  }

  decreaseEnergy(amount = 2) {
    this.context.energy = Math.max(0, this.context.energy - amount);
    this.updateDisplay();
  }

  increaseHunger(amount = 2) {
    this.context.hunger = Math.min(100, this.context.hunger + amount);
    this.updateDisplay();
  }

  decreaseHunger(amount = 20) {
    this.context.hunger = Math.max(0, this.context.hunger - amount);
    this.updateDisplay();
  }

  increaseCleanliness(amount = 20) {
    this.context.cleanliness = Math.min(100, this.context.cleanliness + amount);
    this.updateDisplay();
  }

  decreaseCleanliness(amount = 2) {
    this.context.cleanliness = Math.max(0, this.context.cleanliness - amount);
    this.updateDisplay();
  }

  isHungerCritical() {
    return this.context.hunger >= 90;
  }

  isHungerHigh() {
    return this.context.hunger > 65;
  }

  isEnergyCriticallyLow() {
    return this.context.energy < 10;
  }

  isEnergyLow() {
    return this.context.energy < 25;
  }

  isCleanlinessCriticallyLow() {
    return this.context.cleanliness < 15;
  }

  isCleanlinessLowWarning() {
    return this.context.cleanliness < 35;
  }

  startDegradation() {
    if (this.degradationInterval) {
      clearInterval(this.degradationInterval);
    }
    this.degradationInterval = setInterval(() => {
      if (
        this.currentState === "dead" ||
        ["eating", "sleeping", "playing", "bathing"].includes(this.currentState)
      ) {
        return;
      }

      this.increaseHunger(1 + Math.floor(Math.random() * 2));
      this.decreaseEnergy(1 + Math.floor(Math.random() * 2));
      this.decreaseCleanliness(1);

      if (
        this.context.hunger > 60 ||
        this.context.energy < 40 ||
        this.context.cleanliness < 40
      ) {
        this.decreaseMood(2 + Math.floor(Math.random() * 2));
      }

      if (this.isHungerCritical()) {
        this.decreaseLife(8 + Math.floor(Math.random() * 5));
        this.showMessage(
          "Monyet sangat kelaparan dan tubuhnya melemah!",
          "error"
        );
      }
      if (this.isCleanlinessCriticallyLow()) {
        this.decreaseLife(5 + Math.floor(Math.random() * 4));
        this.decreaseMood(10);
        this.showMessage("Monyet sangat kotor dan terlihat lesu!", "error");
      }
      if (this.isEnergyCriticallyLow() && this.context.life > 0) {
        this.decreaseLife(3 + Math.floor(Math.random() * 3));
        this.showMessage("Monyet hampir pingsan karena kelelahan!", "warning");
        if (this.currentState === "idle") this.transitionTo("sleeping");
      }

      if (this.currentState === "idle") {
        if (this.isHungerHigh() && !this.isHungerCritical()) {
          this.transitionTo("hungry");
        } else if (
          this.isEnergyLow() &&
          !this.isEnergyCriticallyLow() &&
          this.context.life > 0
        ) {
          this.decreaseMood(5);
          this.transitionTo("sleeping");
          this.showMessage("Monyet kelelahan dan akhirnya tertidur.", "info");
        }
      } else if (this.currentState === "hungry") {
        if (this.context.hunger < 30) {
          this.transitionTo("idle");
        }
      }

      if (this.context.life <= 0 && this.currentState !== "dead") {
        this.transitionTo("dead");
      }
      this.updateDisplay();
    }, 3000);
  }

  showMessage(text, type = "info") {
    this.message.textContent = text;
    this.message.className = `message show ${type}`;

    if (this.messageTimeout) clearTimeout(this.messageTimeout);

    this.messageTimeout = setTimeout(() => {
      if (this.message) {
        this.message.classList.remove("show");
      }
    }, 3500);
  }

  showGameOver() {
    this.gameOver.classList.add("show");
    this.updateButtonStates();
    if (this.degradationInterval) {
      clearInterval(this.degradationInterval);
      this.degradationInterval = null;
    }
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout);
      this.actionTimeout = null;
    }
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.updateMonkeyAppearance(); // Perbarui ke gambar 'dead'
    this.statusText.textContent = "Mati - Monyet kesayanganmu telah tiada...";
  }

  restart() {
    this.context = {
      life: 100,
      mood: 70,
      energy: 100,
      hunger: 0,
      cleanliness: 100,
      points: 0,
    };

    this.currentState = "idle";
    if (this.gameOver) this.gameOver.classList.remove("show");

    if (this.actionTimeout) clearTimeout(this.actionTimeout);
    this.actionTimeout = null;
    if (this.degradationInterval) clearInterval(this.degradationInterval);
    this.degradationInterval = null;
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = null;

    this.updateDisplay();
    this.updateMonkeyAppearance();
    this.updateStatusText();
    this.startDegradation();

    this.showMessage("Game dimulai ulang! Semoga kali ini lebih baik.", "info");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.virtualMonkey = new VirtualMonkey();
});
