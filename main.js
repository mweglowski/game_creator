const root = document.querySelector(".root");

// State
let currentScreen = "landing";
let currentPreset = {};
let gamePreset = {};
let selectedControlButton = null;
const mobs = ["lavaman", "electro", "normal"];
const colors = {
  lavaman: "#DF2C2C",
  lava: "orange",
  electro: "#22A7C5",
  normal: "black",
  coin: "#B8900F",
  obstacle: "#939393",
  player: "#8E24AA",
  eraser: "#FF6D6D",
};

const applyBaseStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

    * {
      font-family: 'Inter', sans-serif;
      /* animation: show 400ms ease-out; */
    }
  `;
  document.head.appendChild(style);
}

const createNotificationBar = () => {
  const notificationBarContainer = createElement("div", "w-full flex justify-center fixed top-[-50px]");
  notificationBarContainer.id = "notification-bar-container";
  notificationBarContainer.style.transition = "top 0.3s ease-in-out";
  const notificationBar = createElement("div", "bg-purple-50 text-purple-400 rounded-b py-2 px-4 shadow-md shadow-purple-300");
  notificationBar.id = "notification-bar";
  notificationBarContainer.appendChild(notificationBar);
  document.body.appendChild(notificationBarContainer);
}

const showNotificationBar = (message, type = "info") => {
  const container = document.getElementById("notification-bar-container");
  const bar = document.getElementById("notification-bar");

  if (type === "error") {
    bar.className = "bg-red-100 text-red-500 rounded-b py-2 px-4 shadow-md shadow-red-300";
  } else {
    bar.className = "bg-purple-50 text-purple-400 rounded-b py-2 px-4 shadow-md shadow-purple-300";
  }

  bar.textContent = message;

  container.style.top = "0px";

  setTimeout(() => {
    container.style.top = "-50px";
  }, 3000);
}

const navigateTo = (screen) => {
  currentScreen = screen;
  render();
}

const render = () => {
  root.innerHTML = "";

  if (currentScreen === "landing") {
    renderLandingPage();
  } else if (currentScreen === "menu") {
    renderMenuPage();
  } else if (currentScreen === "presets" || currentScreen === "choose-preset") {
    currentPreset = {};
    renderPresetsPage();
  } else if (currentScreen === "new-game-options") {
    renderNewGameOptionsPage();
  } else if (currentScreen === "create-preset" || currentScreen === "edit-preset") {
    selectedControlButton = null;
    renderPresetPage();
  } else if (currentScreen === "game") {
    renderGamePage();
  } else if (currentScreen === "game-history") {
    renderGameHistoryPage();
  }
}

// 🔵 Landing page
const renderLandingPage = () => {
  const container = createElement(
    "div",
    "h-screen relative flex justify-center overflow-hidden"
  );
  const boxOne = createElement(
    "div",
    "w-[400px] h-[300px] rounded-lg bg-[#A82EEF] absolute top-[30%] left-[15%] rotate-[20deg] z-[-1]"
  );
  const boxTwo = createElement(
    "div",
    "w-[400px] h-[300px] rounded-lg bg-[#BB4BC5] absolute top-[20%] right-[15%] rotate-[-20deg] z-[-1]"
  );

  const mainContent = createElement(
    "div",
    "h-screen bg-white/30 backdrop-blur-[60px] w-full flex flex-col justify-center items-center"
  );

  const textContainer = createElement(
    "div",
    "max-w-[500px] flex flex-col justify-center gap-3 p-8"
  );

  const title = createElement("h1", "text-5xl font-black");
  title.textContent = "Jump into next level of gaming!";
  const p = createElement("p", "text-white font-light");
  p.textContent = "Feel how it is to be a player as well as the creator.";
  textContainer.append(title, p);

  const btn = createButton(
    "Start your journey ->",
    () => navigateTo("menu"),
    "mt-[60px] mx-auto"
  );

  mainContent.append(textContainer, btn);
  container.append(mainContent, boxOne, boxTwo);
  root.appendChild(container);
}

// 🟢 Menu page
const renderMenuPage = () => {
  const container = createElement(
    "div",
    "h-screen flex flex-col items-center justify-center gap-3"
  );

  const newGameBtn = createButton("New Game", () =>
    navigateTo("new-game-options")
  );
  const presetsBtn = createButton("Presets", () => navigateTo("presets"));
  const gameHistoryBtn = createButton("Game History", () =>
    navigateTo("game-history")
  );
  const btnBack = createButton("<- Back to Landing", () =>
    navigateTo("landing")
  );

  container.append(newGameBtn, presetsBtn, gameHistoryBtn, btnBack);
  root.appendChild(container);
}

// ⚪ New game options page
const renderNewGameOptionsPage = () => {
  const container = createElement(
    "div",
    "h-screen flex flex-col items-center justify-center gap-3"
  );

  const choosePresetBtn = createButton("Choose Preset", () =>
    navigateTo("choose-preset")
  );
  const createNewPresetBtn = createButton("Create new Preset", () => {
      navigateTo("create-preset")
      currentPreset = {};
    }
  );
  const startWithRandomPresetBtn = createButton(
    "Start with random Preset",
    async () => {
      try {
        const presets = await fetchPresets();
        
        if (presets.length === 0) {
          showNotificationBar("There are not any presets.");
          return;
        }

        currentPreset = presets[Math.floor(Math.random() * presets.length)];
      } catch (error) {
        showNotificationBar("Failed to fetch presets.", "error");
        console.error("Failed to fetch presets: ", error);
      }

      navigateTo("game");
    }
  );
  const btnBack = createButton("<- Back to Menu", () => navigateTo("menu"));

  container.append(
    choosePresetBtn,
    createNewPresetBtn,
    startWithRandomPresetBtn,
    btnBack
  );
  root.appendChild(container);
}

// 🟣 Presets list or choose preset to edit page
const renderPresetsPage = async () => {
  const container = createElement(
    "div",
    "flex flex-col p-8 max-w-[1000px] mx-auto"
  );

  let presets = [];
  try {
    presets = await fetchPresets();
  } catch (error) {
    showNotificationBar("Failed fetching presets.", "error");
    console.error("Failed fetching presets: ", error);
  }

  const sectionTitle = createElement("h2", "text-3xl font-black border-b pb-1");
  sectionTitle.textContent = currentScreen === "presets" ? "Presets" : "Choose Preset";

  const presetsList = createElement("div", `grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-[40px]`);
  presets.forEach((preset) => {
    const presetCard = createElement("div", "flex flex-col border rounded p-3 text-[13px] hover:ring-2 hover:ring-purple-300 duration-400 transition cursor-pointer hover:scale-[1.01]" + (currentPreset.id === preset.id && " ring-2 ring-purple-500"));

    const title = createElement("p", "font-black mt-2");
    title.textContent = preset.title;

    const size = createElement("p", "font-light text-gray-500");
    size.textContent = "Size: ";
    const sizeValue = createElement("span", "font-bold");
    sizeValue.textContent = `${preset.height}x${preset.width}`
    size.appendChild(sizeValue);

    const coins = createElement("p", "font-light text-gray-500");
    coins.textContent = "Coins: ";
    const coinsValue = createElement("span", "font-bold");
    coinsValue.textContent = countElementsInGrid(preset, "coin");
    coins.appendChild(coinsValue);

    const mobsList = createElement("div", "flex mt-2 gap-2 flex-wrap");
    const lavamanCount = countElementsInGrid(preset, "lavaman");
    const electroCount = countElementsInGrid(preset, "electro");
    const normalCount = countElementsInGrid(preset, "normal");

    let colorsList = [colors.coin, colors.obstacle, colors.player];
    if (lavamanCount > 0) {
      const lavamanItem = createElement("div", `border border-[${colors.lavaman}] text-[${colors.lavaman}] rounded px-2 py-1`);
      lavamanItem.textContent = "Lavaman x" + lavamanCount;
      mobsList.appendChild(lavamanItem);
      colorsList.push(colors.lavaman);
    }
    if (electroCount > 0) {
      const electroItem = createElement("div", `border border-[${colors.electro}] text-[${colors.electro}] rounded px-2 py-1`);
      electroItem.textContent = "Electro x" + electroCount;
      mobsList.appendChild(electroItem);
      colorsList.push(colors.electro);
    }
    if (normalCount > 0) {
      const normalItem = createElement("div", `border border-[${colors.normal}] text-[${colors.normal}] rounded px-2 py-1`);
      normalItem.textContent = "Normal x" + normalCount;
      mobsList.appendChild(normalItem);
      colorsList.push(colors.normal);
    }

    const imageContainer = createElement("div", "border rounded h-[110px] relative overflow-hidden");
    const item = createElement("div", `w-[150px] h-[150px] sm:w-[70px] sm:h-[70px] rotate-[${Math.floor(Math.random() * 45)}deg] absolute top-${Math.floor(Math.random() * 10)} right-${Math.floor(Math.random() * 20)} bg-[${colorsList[Math.floor(Math.random() * colorsList.length)]}] rounded-md`);
    const secondItem = createElement("div", `w-[150px] h-[150px] sm:w-[70px] sm:h-[70px] rotate-[${Math.floor(Math.random() * 45)}deg] absolute top-${Math.floor(Math.random() * 10)} right-${Math.floor(Math.random() * 20)} bg-[${colorsList[Math.floor(Math.random() * colorsList.length)]}] rounded-md`);
    const backdrop = createElement("div", "w-full h-full absolute bg-white/50 rounded backdrop-blur-[10px]");
    imageContainer.append(item, secondItem, backdrop);


    presetCard.append(imageContainer, title, size, coins, mobsList);

    presetCard.addEventListener("click", () => {
      if (currentScreen === "presets") {
        currentPreset = preset;

        navigateTo("edit-preset");
      } else if (currentScreen === "choose-preset") {
        if (currentPreset.id !== preset.id) {
          currentPreset = preset;
          root.innerHTML = "";
          renderPresetsPage();
        }
      }
    })

    presetsList.appendChild(presetCard);
  })


  const btnContainer = createElement(
    "div",
    "flex flex-col gap-3 md:flex-row-reverse mx-auto mt-[50px]"
  );
  const btnBack = createButton("<- Back to Options", () =>
    navigateTo("new-game-options")
  );

  if (currentScreen === "choose-preset" && presets.length > 0) {
    const btnStartGame = createButton("Start game", () => {
      if (!currentPreset.width) {
        showNotificationBar("Select preset to start the game.", "error");
        return;
      }
      navigateTo("game");
    });
    btnContainer.appendChild(btnStartGame);
  }
  btnContainer.appendChild(btnBack);

  if (presets.length === 0) {
    presetsList.className = "";
    const description = createElement("p", "font-light text-gray-400 mx-auto mt-[60px] text-center");
    description.textContent = "Here will be your presets displayed.";
    presetsList.appendChild(description);
  }

  container.append(sectionTitle, presetsList, btnContainer);
  root.append(container);
}

// 🔴 Create new preset or edit preset page
const renderPresetPage = () => {
  const container = createElement(
    "div",
    "flex flex-col p-8 max-w-[1000px] mx-auto"
  );

  const sectionTitleContainer = createElement("div", "border-b pb-1 relative")
  const sectionTitle = createElement("h2", "text-3xl font-black");
  sectionTitleContainer.appendChild(sectionTitle);
  sectionTitle.textContent = currentScreen === "create-preset" ? "Create Preset" : "Edit Preset";

  if (currentScreen === "edit-preset") {
    const deletePresetButton = createElement("button", `font-normal text-[${colors.eraser}] absolute right-0 bottom-2 text-[13px] border rounded duration-400 transition text-[#${colors.eraser}] border-[${colors.eraser}] hover:bg-[${colors.eraser}] hover:text-white hover:shadow-md hover:shadow-[${colors.eraser}] px-5 py-1`);
    deletePresetButton.textContent = "Delete";

    sectionTitleContainer.appendChild(deletePresetButton);

    deletePresetButton.addEventListener("click", async() => {
      try {
        await deletePreset(currentPreset.id);
        
        showNotificationBar("Preset deleted successfully.");
        navigateTo("menu");
      } catch (error) {
        showNotificationBar("Failed to delete preset.", "error");
        console.error("Failed to delete preset: ", error);
      }
    });
  }

  // Size
  const sizeSection = createElement("div", "flex flex-col mb-6 mt-[40px]");
  const sizeSectionHeader = createElement("p", "font-black");
  sizeSectionHeader.textContent = "Size";

  const sizeSectionInputsContainer = createElement("div", "flex items-center");
  const sizeSectionWidthInput = createInput("Width", "w-[100px]");
  sizeSectionWidthInput.type = "number";
  sizeSectionWidthInput.min = 0;
  const sizeSectionX = createElement("p", "mx-2 text-gray-400 font-light");
  sizeSectionX.textContent = "x";
  const sizeSectionHeightInput = createInput("Height", "w-[100px]");
  sizeSectionHeightInput.type = "number";
  sizeSectionHeightInput.min = 0;

  sizeSectionWidthInput.addEventListener("input", (e) => {
    currentPreset.width = +e.target.value;
    regeneratePreviewGrid();
  });

  sizeSectionHeightInput.addEventListener("input", (e) => {
    currentPreset.height = +e.target.value;
    regeneratePreviewGrid();
  });

  sizeSectionInputsContainer.append(
    sizeSectionHeightInput,
    sizeSectionX,
    sizeSectionWidthInput
  );
  sizeSection.append(sizeSectionHeader, sizeSectionInputsContainer);

  // Controls
  const controlsSection = createElement("div", "flex flex-col mb-6");
  const controlsSectionHeader = createElement("p", "font-black mb-2");
  controlsSectionHeader.textContent = "Controls";

  const controlsSectionButtonsContainer = createElement(
    "div",
    "flex flex-wrap gap-[4px]"
  );

  // Mobs buttons
  const controlsSectionMobsButtonsContainer = createElement(
    "div",
    "flex flex-col"
  );
  const controlsSectionMobsButtonsHeader = createElement(
    "p",
    "font-black text-[13px]"
  );
  controlsSectionMobsButtonsHeader.textContent = "Mobs";
  const controlsSectionMobsButtons = createElement("div", "flex space-x-[4px]");
  const lavamanButton = createControlButton(
    "Lavaman",
    colors.lavaman,
    "lavaman"
  );
  const electroButton = createControlButton(
    "Electro",
    colors.electro,
    "electro"
  );
  const normalButton = createControlButton("Normal", colors.normal, "normal");
  controlsSectionMobsButtons.append(lavamanButton, electroButton, normalButton);
  controlsSectionMobsButtonsContainer.append(
    controlsSectionMobsButtonsHeader,
    controlsSectionMobsButtons
  );

  // Objects buttons
  const controlsSectionObjectsButtonsContainer = createElement(
    "div",
    "flex flex-col"
  );
  const controlsSectionObjectsButtonsHeader = createElement(
    "p",
    "font-black text-[13px]"
  );
  controlsSectionObjectsButtonsHeader.textContent = "Objects";
  const controlsSectionObjectsButtons = createElement(
    "div",
    "flex space-x-[4px]"
  );
  const coinButton = createControlButton("Coin", colors.coin, "coin");
  const obstacleButton = createControlButton(
    "Obstacle",
    colors.obstacle,
    "obstacle"
  );
  controlsSectionObjectsButtons.append(coinButton, obstacleButton);
  controlsSectionObjectsButtonsContainer.append(
    controlsSectionObjectsButtonsHeader,
    controlsSectionObjectsButtons
  );

  // Player button
  const controlsSectionPlayerButtonsContainer = createElement("div", "flex flex-col");
  const controlsSectionPlayerButtonsHeader = createElement("p", "font-black text-[13px]");
  controlsSectionPlayerButtonsHeader.textContent = "Player";
  const controlsSectionPlayerButtons = createElement("div", "flex space-x-[4px]");
  const playerButton = createControlButton("Player", colors.player, "player");
  controlsSectionPlayerButtons.append(playerButton);

  controlsSectionPlayerButtonsContainer.append(
    controlsSectionPlayerButtonsHeader,
    controlsSectionPlayerButtons
  );

  controlsSectionButtonsContainer.append(
    controlsSectionMobsButtonsContainer,
    controlsSectionObjectsButtonsContainer,
    controlsSectionPlayerButtonsContainer
  );

  // Mobs parameters
  const controlsSectionMobsParameters = createElement(
    "div",
    "flex flex-col mt-4"
  );
  const controlsSectionMobsParametersHeader = createElement(
    "p",
    "font-black text-[13px]"
  );
  controlsSectionMobsParametersHeader.textContent = "Mobs parameters";
  const controlsSectionMobsParametersCardsList = createElement("div", "flex flex-wrap gap-[3px] text-[13px] text-gray-400 font-light");
  controlsSectionMobsParametersCardsList.id = "mobs-parameters-list";
  controlsSectionMobsParametersCardsList.textContent = "Here parameters of each mob will be displayed."

  controlsSectionMobsParameters.append(controlsSectionMobsParametersHeader, controlsSectionMobsParametersCardsList);

  controlsSection.append(
    controlsSectionHeader,
    controlsSectionButtonsContainer,
    controlsSectionMobsParameters
  );

  // Preview
  const previewSection = createElement("div", "flex flex-col mb-6 relative");
  const previewSectionHeader = createElement("p", "font-black");
  previewSectionHeader.textContent = "Preview";

  const previewSectionGrid = createElement(
    "div",
    "flex flex-col text-gray-400 font-light space-y-[2px]  text-[13px]"
  );
  previewSectionGrid.id = "preview-grid";
  previewSectionGrid.innerHTML = "Here map will be shown.";

  const eraserButton = createControlButton("Eraser", "#FF6D6D", "eraser");
  eraserButton.className =
    eraserButton.className + " absolute right-0 top-[-10px]";

  previewSection.append(previewSectionHeader, previewSectionGrid, eraserButton);

  // Title
  const titleSection = createElement("div", "flex flex-col");
  const titleSectionHeader = createElement("p", "font-black");
  titleSectionHeader.textContent = "Title";
  const titleSectionInput = createInput("Enter preset title");
  titleSectionInput.id = "title-section-input";

  titleSectionInput.addEventListener("input", (e) => {
    currentPreset.title = e.target.value;
  });

  titleSection.append(titleSectionHeader, titleSectionInput);

  const btnContainer = createElement(
    "div",
    "flex flex-col gap-3 md:flex-row-reverse mx-auto mt-[50px]"
  );
  const btnBack = createButton("<- Back to Options", () =>
    navigateTo("new-game-options")
  );
  const btnSubmit = createButton("Submit", async () => {
      // Preset Validation

      // Player
      const playerCount = countElementsInGrid(currentPreset, "player");

      // Coin
      const coinCount = countElementsInGrid(currentPreset, "coin");

      if (!currentPreset.grid) {
        showNotificationBar("Create map.", "error");
        return;
      } else if (playerCount === 0) {
        showNotificationBar("There should be player initial position.", "error");
        return;
      } else if (playerCount > 1) {
        showNotificationBar("There should be only one player initial position.", "error");
        return;
      } else if (coinCount === 0) {
        showNotificationBar("There should be at least one coin placed.", "error");
        return;
      } else if (document.getElementById("title-section-input").value === "") {
        showNotificationBar("Title should not be empty.", "error")
        return;
      }

      // Save to localStorage
      // Create preset
      // Save to localStorage
      if (currentScreen === "create-preset") {
        try {
          currentPreset.id = generateUUID();
          currentPreset.creationDate = formatDate(new Date());
          await savePreset(currentPreset);

          navigateTo("new-game-options");
          showNotificationBar("Preset added successfully.");
          currentPreset = {};
        } catch (error) {
          showNotificationBar("Failed to save preset.", "error");
          console.error("Failed to save preset:", error);
        }

      } else {
        try {
          let storedPresets = await fetchPresets();

          const index = storedPresets.findIndex(p => p.id === currentPreset.id);
          currentPreset.creationDate = formatDate(new Date());

          if (index !== -1) {
            storedPresets[index] = currentPreset;
          } else {
            currentPreset.id = generateUUID();
            storedPresets.push(currentPreset);
          }

          await saveAllPresets(storedPresets);

          navigateTo("new-game-options");
          showNotificationBar("Preset saved successfully.");
          currentPreset = {};
        } catch (error) {
          showNotificationBar("Failed to update preset.", "error");
          console.error("Failed to update preset:", error);
        }
      }
    }
  );

  // const btnStartGame = createButton("Start game", () => navigateTo("game"));
  // btnContainer.append(btnStartGame, btnSubmit, btnBack);
  btnContainer.append(btnSubmit, btnBack);

  container.append(
    sectionTitleContainer,
    sizeSection,
    controlsSection,
    previewSection,
    titleSection,
    btnContainer
  );
  root.appendChild(container);
  
  if (currentScreen === "edit-preset") {
    sizeSectionHeightInput.value = currentPreset.height;
    sizeSectionWidthInput.value = currentPreset.width;
    titleSectionInput.value = currentPreset.title;
    updateMobsParameters();
    regeneratePreviewGrid();
  }
}


// 🟡 Game page
let gameStartTimestamp = null;
let gameEndTimestamp = null;
let coinsCollected = 0;
let gameStatus = null;
let lossCause = "";
let playerMoves = 0;
let slowInterval = null;
let fastInterval = null;
let currentInterval = null;
let keydownHandler = null;
let areControlsShown = false;

const handleKeyDown = (e) => {
  if (gameStatus !== "playing") return;
  switch (e.key) {
    case "ArrowUp": movePlayer(-1, 0); break;
    case "ArrowDown": movePlayer(1, 0); break;
    case "ArrowLeft": movePlayer(0, -1); break;
    case "ArrowRight": movePlayer(0, 1); break;
  }
};
const bfsToNearestObject = (targetName, startY, startX) => {
  const visited = Array.from({ length: gamePreset.height }, () =>
    Array(gamePreset.width).fill(false)
  );

  const queue = [{ y: startY, x: startX, path: [{ y: startY, x: startX }] }];

  while (queue.length > 0) {
    const { y, x, path } = queue.shift();
    if (visited[y][x]) continue;
    visited[y][x] = true;

    if (gamePreset.grid[y][x].value?.name === targetName && !(y === startY && x === startX)) {
      return path;
    }

    for (const { dy, dx } of [
      { dy: -1, dx: 0 }, { dy: 1, dx: 0 },
      { dy: 0, dx: -1 }, { dy: 0, dx: 1 }
    ]) {
      const newY = y + dy;
      const newX = x + dx;

      if (
        newY >= 0 && newY < gamePreset.height &&
        newX >= 0 && newX < gamePreset.width &&
        !visited[newY][newX]
      ) {
        const cellValue = gamePreset.grid[newY][newX].value;
        if (!cellValue || cellValue.name === "coin") {
          queue.push({
            y: newY,
            x: newX,
            path: [...path, { y: newY, x: newX }]
          });
        }
      }
    }
  }

  return null;
};
const getDirectionsBasedOnIntelligence = (intelligence, y, x) => {
  const directions = [
    { dy: -1, dx: 0 },
    { dy: 1, dx: 0 },
    { dy: 0, dx: -1 },
    { dy: 0, dx: 1 }
  ];

  if (intelligence === "low") {
    return directions.sort(() => Math.random() - 0.5);
  }

  if (intelligence === "medium") {
    const player = findPlayerPosition();
    if (!player) return directions;

    return directions
      .map(dir => {
        const newY = y + dir.dy;
        const newX = x + dir.dx;
        const dist = Math.abs(newY - player.y) + Math.abs(newX - player.x);
        return { ...dir, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  if (intelligence === "high") {
    const path = bfsToNearestObject("coin", y, x);

    if (path && path.length >= 2) {
      const nextStep = path[1];

      return directions
        .map(dir => {
          if (y + dir.dy === nextStep.y && x + dir.dx === nextStep.x) {
            return { ...dir, distance: 0 };
          }
          return { ...dir, distance: 999 };
        })
        .sort((a, b) => a.distance - b.distance);
    }
  }

  return directions;
};
const emitCurrentFromElectroMobs = () => {
  const electroPositions = [];

  for (let y = 0; y < gamePreset.height; y++) {
    for (let x = 0; x < gamePreset.width; x++) {
      const cell = gamePreset.grid[y][x];
      if (cell.value?.name === "electro") {
        electroPositions.push({ y, x });
      }
    }
  }

  const affected = [];

  electroPositions.forEach(({ y, x }) => {
    const directions = [
      { dy: -1, dx: 0 },
      { dy: 1, dx: 0 },
      { dy: 0, dx: -1 },
      { dy: 0, dx: 1 },
    ];

    directions.forEach(({ dy, dx }) => {
      let newY = y + dy;
      let newX = x + dx;

      while (
        newY >= 0 && newY < gamePreset.height &&
        newX >= 0 && newX < gamePreset.width
      ) {
        const target = gamePreset.grid[newY][newX].value;

        if (target?.name === "player") {
          gameStatus = "loss";
          lossCause = "Killed by electro's current.";
          showGameEndModal();
          break;
        }

        if (target && target.name !== "coin") {
          break;
        }

        gamePreset.grid[newY][newX].temp = "current";
        affected.push({ y: newY, x: newX });

        newY += dy;
        newX += dx;
      }
    });
  });

  renderGame();

  setTimeout(() => {
    affected.forEach(({ y, x }) => {
      delete gamePreset.grid[y][x].temp;
    });
    renderGame();
  }, 500);
};
const findPlayerPosition = () => {
  for (let row = 0; row < gamePreset.height; row++) {
    for (let col = 0; col < gamePreset.width; col++) {
      const cell = gamePreset.grid[row][col];

      if (cell.value && cell.value.name === "player") {
        return { y: row, x: col };
      }
    }
  }
  return null;
};
const findNearestObject = (name, y, x) => {
  let minDist = Infinity;
  let closest = null;

  for (let i = 0; i < gamePreset.height; i++) {
    for (let j = 0; j < gamePreset.width; j++) {
      if (gamePreset.grid[i][j].value?.name === name) {
        const dist = Math.abs(i - y) + Math.abs(j - x);

        if (dist < minDist) {
          minDist = dist;
          closest = { y: i, x: j };
        }
      }
    }
  }
  return closest;
};
const movePlayer = (dy, dx) => {
  const pos = findPlayerPosition();
  if (!pos) return;

  const newY = pos.y + dy;
  const newX = pos.x + dx;

  if (newY < 0 || newY >= gamePreset.height || newX < 0 || newX >= gamePreset.width) return;

  const destination = gamePreset.grid[newY][newX];
  console.log(destination);

  if (destination.temp && destination.temp === "current") {
    lossCause = "Killed by electro's current.";
    gameStatus = "loss";
    showGameEndModal();
  } else if ((destination.value === null) || destination.value.name === "coin") {
    playerMoves++;
    if (destination.value && destination.value.name === "coin") coinsCollected++;
    if (coinsCollected === countElementsInGrid(currentPreset, "coin")) {
      gameStatus = "win";
      showGameEndModal();
    }

    gamePreset.grid[pos.y][pos.x].value = null;
    gamePreset.grid[newY][newX].value = { name: "player" };
    renderGame();
  } else if (["lavaman", "lava", "electro", "normal"].includes(destination.value.name)) {
    lossCause = "Killed by " + destination.value.name + ".";
    gameStatus = "loss";
    showGameEndModal();
  }
};
const moveMobs = (speed) => {
  const mobs = [];

  for (let y = 0; y < gamePreset.height; y++) {
    for (let x = 0; x < gamePreset.width; x++) {
      const cell = gamePreset.grid[y][x];
      if ((cell.value?.name === "lavaman" || cell.value?.name === "normal" || cell.value?.name === "electro") && cell.value.speed === speed) {
        mobs.push({ y, x, mob: cell.value });
      }
    }
  }

  mobs.forEach(({ y, x, mob }) => {
    const directions = getDirectionsBasedOnIntelligence(mob.intelligence, y, x);

    for (let dir of directions) {
      const newY = y + dir.dy;
      const newX = x + dir.dx;

      if (
        newY >= 0 && newY < gamePreset.height &&
        newX >= 0 && newX < gamePreset.width
      ) {
        const target = gamePreset.grid[newY][newX].value;
        if (!target || target.name === "player" || target.name === "coin" || target.name === "lava") {

          if (["player", "coin"].includes(target?.name)) {
            clearInterval(slowInterval);
            clearInterval(fastInterval);
            
            if (target?.name === "coin") {
              lossCause = "Mob damaged the coin.";
            } else {
              lossCause = "Killed by " + mob.name + ".";
            }

            gameStatus = "loss";
            showGameEndModal();
          }

          gamePreset.grid[newY][newX].value = { ...mob };

          if (mob.name === "lavaman")
            gamePreset.grid[y][x].value = { name: "lava" };
          else
            gamePreset.grid[y][x].value = null;
          break;
        }
      }
    }
  });
};
const renderGamePage = () => {
  if (keydownHandler) {
    document.removeEventListener("keydown", keydownHandler);
  }

  keydownHandler = handleKeyDown;
  document.addEventListener("keydown", keydownHandler);

  if (slowInterval) clearInterval(slowInterval);
  if (fastInterval) clearInterval(fastInterval);
  gameStatus = null;

  root.innerHTML = "";
  const container = createElement("div", "h-screen justify-center items-center flex");
  container.id = "game-container";

  const game = createElement("div", `flex flex-col space-y-[${(window.innerWidth / (currentPreset.width + 2)) / 15}px]`);
  game.id = "game";

  const gameEndModal = createElement("div", "flex justify-center items-center hidden absolute bg-white/30 backdrop-blur-[10px] h-screen w-screen");
  gameEndModal.id = "game-end-modal";

  const gameControls = createElement("div", "absolute bottom-0 hidden flex flex-col items-center gap-2 p-2");
  gameControls.id = "game-controls";

  const upButton = createButton("↑", () => movePlayer(-1, 0), "w-[50px] h-[50px]");
  const downButton = createButton("↓", () => movePlayer(1, 0), "w-[50px] h-[50px]");
  const leftButton = createButton("<-", () => movePlayer(0, -1), "w-[50px] h-[50px]");
  const rightButton = createButton("->", () => movePlayer(0, 1), "w-[50px] h-[50px]");

  const empty = () => createElement("div", "");

  const arrowGrid = createElement("div", "grid grid-cols-3 gap-[3px]");
  arrowGrid.appendChild(empty());
  arrowGrid.appendChild(upButton);
  arrowGrid.appendChild(empty());
  arrowGrid.appendChild(leftButton);
  arrowGrid.appendChild(empty());
  arrowGrid.appendChild(rightButton);
  arrowGrid.appendChild(empty());
  arrowGrid.appendChild(downButton);
  arrowGrid.appendChild(empty());

  gameControls.appendChild(arrowGrid);

  const gameControlsToggleButton = createButton("Controls", () => {
    const controls = document.getElementById("game-controls");

    if (!controls) return;

    if (areControlsShown) controls.classList.add("hidden");
    else controls.classList.remove("hidden");

    areControlsShown = !areControlsShown;
  }, "absolute bottom-1 left-1 w-fit px-4");

  container.append(game, gameEndModal, gameControls, gameControlsToggleButton);
  root.appendChild(container);

  gamePreset = JSON.parse(JSON.stringify(currentPreset));

  startGame();
};
const startGame = () => {
  gameStatus = "playing";
  gameStartTimestamp = new Date();
  renderGame();

  slowInterval = setInterval(() => {
    moveMobs("slow");
    renderGame();
  }, 2000);

  fastInterval = setInterval(() => {
    moveMobs("fast");
    renderGame();
  }, 500);

  currentInterval = setInterval(() => {
    emitCurrentFromElectroMobs();
  }, 5000);
};
const renderGame = () => {
  const game = document.getElementById("game");
  game.innerHTML = "";

  const { height, width } = gamePreset;
  let cellSize = window.innerWidth / (width + 2);
  if (cellSize > 40) cellSize = 40;

  for (let i = 1; i <= height; i++) {
    const currentRow = createElement("div", `flex space-x-[${cellSize / 15}px]`);

    for (let j = 1; j <= width; j++) {

      const cell = createElement(
        "div",
        `cell w-[${cellSize}px] h-[${cellSize}px] rounded border hover:ring-2 hover:ring-gray-200 duration-400 transition cursor-pointer`
      );
      cell.dataset.y = i;
      cell.dataset.x = j;

      const gameCell = gamePreset.grid[i - 1][j - 1];
      let color = "";

      if (gameCell.temp === "current") {
        color = "#00FFFF";
      } else if (gameCell.value) {
        color = colors[gameCell.value.name];
      }

      cell.classList.add(`bg-[${color}]`);

      currentRow.appendChild(cell);
    }
    game.appendChild(currentRow);
  }
}
const showGameEndModal = async () => {
  gameEndTimestamp = new Date();

  const modal = document.getElementById("game-end-modal");
  modal.innerHTML = "";
  const content = createElement("div", "flex flex-col");
  const header = createElement("p", "font-black text-6xl text-center mb-[20px]");
  header.textContent = gameStatus === "loss" ? "You Lost!" : "You won!";
  const description = createElement("p", "font-light mb-[30px] text-center text-gray-600");
  description.textContent = gameStatus === "loss" ? lossCause : "All coins have been collected.";
  modal.classList.remove("hidden");

  // Save game statistics to localStorage
  try {
    const gameStats = {
      status: gameStatus,
      lossCause: lossCause,
      moves: playerMoves,
      coinsCollected: coinsCollected,
      timeAlive: Math.floor((gameEndTimestamp - gameStartTimestamp) / 1000),
      preset: currentPreset,
      date: gameStartTimestamp,
    }

    await saveGameStats(gameStats);
  } catch (error) {
    showNotificationBar("Failed to save game statistics.", "error");
    console.error("Failed to save game statistics: ", error);
  }

  const playAgainButton = createButton("Play again", () => {
    modal.classList.add("hidden");

    gameStatus = "playing";
    slowInterval = null;
    fastInterval = null;

    renderGamePage();
  }, "mb-[6px] mx-auto");
  const returnToMenuButton = createButton("<- Return to menu", () => {
    modal.classList.add("hidden");
    navigateTo("menu");
  }, "mx-auto");

  content.append(header, description, playAgainButton, returnToMenuButton);
  modal.appendChild(content);

  clearInterval(slowInterval);
  clearInterval(fastInterval);
  clearInterval(currentInterval);
  seconds = 0;
  coinsCollected = 0;
  gameStatus = null;
  lossCause = "";
  playerMoves = 0;
  keydownHandler = null;
  areControlsShown = false;
}


// ⚫ Game history page
const renderGameHistoryPage = async () => {
  const container = createElement(
    "div",
    "flex flex-col p-8 max-w-[1000px] mx-auto"
  );

  let gameStats = [];
  try {
    gameStats = await fetchGameStats();
  } catch (error) {
    showNotificationBar("Failed to fetch game history.", "error");
    console.error("Failed to fetch game history: ", error);
  }

  const sectionTitleContainer = createElement("div", "border-b pb-1 relative")
  const sectionTitle = createElement("h2", "text-3xl font-black");
  sectionTitleContainer.appendChild(sectionTitle);
  sectionTitle.textContent = "Game History";

  const clearHistoryButton = createElement("button", `font-normal text-[${colors.eraser}] absolute right-0 bottom-2 text-[13px] border rounded duration-400 transition text-[#${colors.eraser}] border-[${colors.eraser}] hover:bg-[${colors.eraser}] hover:text-white hover:shadow-md hover:shadow-[${colors.eraser}] px-5 py-1`);
  clearHistoryButton.textContent = "Clear History";

  sectionTitleContainer.appendChild(clearHistoryButton);

  clearHistoryButton.addEventListener("click", async() => {
    try {
      await deleteGameStats();
      
      showNotificationBar("History has been cleared.");

      render();
    } catch (error) {
      showNotificationBar("Failed to delete game stats.", "error");
      console.error("Failed to delete game stats: ", error);
    }
  });

  const statsCardsList = createElement("div", `grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-[40px]`);

  gameStats.sort((a, b) => a.date - b.date);

  gameStats.forEach((stats) => {
    const statsCard = createElement("div", "flex flex-col border rounded p-3 text-[13px] hover:ring-2 hover:ring-purple-300 duration-400 transition cursor-pointer hover:scale-[1.01]");

    const title = createElement("p", "font-black mt-2");
    title.textContent = "Game from " + formatDate(new Date(stats.date));

    const preset = createElement("p", "font-light text-gray-500");
    preset.textContent = "Preset: ";
    const presetValue = createElement("span", "font-bold");
    presetValue.textContent = stats.preset.title;
    preset.appendChild(presetValue);

    const gameStatus = createElement("p", "font-light text-gray-500");
    gameStatus.textContent = "Result: ";
    const gameStatusValue = createElement("span", "font-bold " + (stats.status === "loss" ? "text-red-400" : "text-emerald-500"));
    gameStatusValue.textContent = stats.status.charAt(0).toUpperCase() + stats.status.slice(1);
    gameStatus.appendChild(gameStatusValue);

    const lossCause = createElement("p", "font-light text-gray-500");
    lossCause.textContent = "Cause: ";
    const lossCauseValue = createElement("span", "font-bold");
    lossCauseValue.textContent = stats.lossCause;
    lossCause.appendChild(lossCauseValue);

    const size = createElement("p", "font-light text-gray-500");
    size.textContent = "Size: ";
    const sizeValue = createElement("span", "font-bold");
    sizeValue.textContent = `${stats.preset.height}x${stats.preset.width}`
    size.appendChild(sizeValue);

    const coinsToCollect = createElement("p", "font-light text-gray-500");
    coinsToCollect.textContent = "Coins to collect: ";
    const coinsToCollectValue = createElement("span", "font-bold");
    coinsToCollectValue.textContent = countElementsInGrid(stats.preset, "coin");
    coinsToCollect.appendChild(coinsToCollectValue);

    const timeAlive = createElement("p", "font-light text-gray-500");
    timeAlive.textContent = "Game duration: ";
    const timeAliveValue = createElement("span", "font-bold");
    timeAliveValue.textContent = stats.timeAlive + "s";
    timeAlive.appendChild(timeAliveValue);

    const coinsCollected = createElement("p", "font-light text-gray-500");
    coinsCollected.textContent = "Coins collected: ";
    const coinsCollectedValue = createElement("span", "font-bold");
    coinsCollectedValue.textContent = stats.coinsCollected;
    coinsCollected.appendChild(coinsCollectedValue);

    const mobsList = createElement("div", "flex mt-2 gap-2 flex-wrap");
    const lavamanCount = countElementsInGrid(stats.preset, "lavaman");
    const electroCount = countElementsInGrid(stats.preset, "electro");
    const normalCount = countElementsInGrid(stats.preset, "normal");

    let colorsList = [colors.coin, colors.obstacle, colors.player];
    if (lavamanCount > 0) {
      const lavamanItem = createElement("div", `border border-[${colors.lavaman}] text-[${colors.lavaman}] rounded px-2 py-1`);
      lavamanItem.textContent = "Lavaman x" + lavamanCount;
      mobsList.appendChild(lavamanItem);
      colorsList.push(colors.lavaman);
    }
    if (electroCount > 0) {
      const electroItem = createElement("div", `border border-[${colors.electro}] text-[${colors.electro}] rounded px-2 py-1`);
      electroItem.textContent = "Electro x" + electroCount;
      mobsList.appendChild(electroItem);
      colorsList.push(colors.electro);
    }
    if (normalCount > 0) {
      const normalItem = createElement("div", `border border-[${colors.normal}] text-[${colors.normal}] rounded px-2 py-1`);
      normalItem.textContent = "Normal x" + normalCount;
      mobsList.appendChild(normalItem);
      colorsList.push(colors.normal);
    }

    const imageContainer = createElement("div", "border rounded h-[110px] relative overflow-hidden");
    const item = createElement("div", `w-[150px] h-[150px] sm:w-[70px] sm:h-[70px] rotate-[${Math.floor(Math.random() * 45)}deg] absolute top-${Math.floor(Math.random() * 10)} right-${Math.floor(Math.random() * 20)} bg-[${colorsList[Math.floor(Math.random() * colorsList.length)]}] rounded-md`);
    const secondItem = createElement("div", `w-[150px] h-[150px] sm:w-[70px] sm:h-[70px] rotate-[${Math.floor(Math.random() * 45)}deg] absolute top-${Math.floor(Math.random() * 10)} right-${Math.floor(Math.random() * 20)} bg-[${colorsList[Math.floor(Math.random() * colorsList.length)]}] rounded-md`);
    const backdrop = createElement("div", "w-full h-full absolute bg-white/50 rounded backdrop-blur-[10px]");
    imageContainer.append(item, secondItem, backdrop);


    statsCard.append(imageContainer, title, preset, gameStatus);
    if (stats.status === "loss") statsCard.append(lossCause, timeAlive);
    statsCard.append(coinsToCollect);
    if (stats.status === "loss") statsCard.appendChild(coinsCollected);
    statsCard.append(size, mobsList);

    statsCardsList.appendChild(statsCard);
  })

  if (gameStats.length === 0) {
    statsCardsList.className = "";
    const description = createElement("p", "font-light text-gray-400 mx-auto mt-[60px] text-center");
    description.textContent = "Here will be you game history displayed.";
    statsCardsList.appendChild(description);
  }

  const btnBack = createButton("<- Back to Menu", () =>
    navigateTo("menu")
  , "mx-auto mt-[60px]");

  container.append(sectionTitleContainer, statsCardsList, btnBack);
  root.append(container);
}

// Helpers
const createElement = (tag, className = "") => {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

const createButton = (text, onClick, classNames = "") => {
  const btn = createElement(
    "button",
    "bg-transparent text-purple-600 hover:text-white rounded hover:bg-purple-600 duration-400 transition border border-purple-600 hover:shadow-md hover:shadow-purple-500 w-[220px] py-2 " +
      classNames
  );
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

const createControlButton = (name, color, value) => {
  const baseClass = `control-button text-[13px] border rounded py-1 px-2 duration-400 transition w-[80px]`;
  const selectedClass = `text-white bg-[${color}] shadow-md shadow-[${color}]`;
  const unselectedClass = `text-[${color}] border-[${color}] hover:text-white hover:bg-[${color}] hover:shadow-md hover:shadow-[${color}]`;

  const btn = createElement(
    "button",
    `${baseClass} ${
      selectedControlButton === value ? selectedClass : unselectedClass
    }`
  );
  btn.textContent = name;
  btn.dataset.color = color;

  btn.addEventListener("click", () => {
    selectedControlButton = value;

    btn.className =
      baseClass +
      ` text-white bg-[${btn.dataset.color}] shadow-md shadow-[${btn.dataset.color}]`;

    if (value === "eraser") btn.className += " absolute right-0 top-[-10px]";

    document.querySelectorAll(".control-button").forEach((controlButton) => {
      if (controlButton.dataset.color !== btn.dataset.color) {
        const currentButtonColor = controlButton.dataset.color;

        controlButton.className =
          baseClass +
          ` text-[${currentButtonColor}] border-[${currentButtonColor}] hover:text-white hover:bg-[${currentButtonColor}] hover:shadow-md hover:shadow-[${currentButtonColor}]`;

        if (controlButton.dataset.color === colors.eraser)
          controlButton.className += " absolute right-0 top-[-10px]";
      }
    });
  });
  return btn;
}

const createInput = (placeholderText = "", classNames = "") => {
  const input = createElement(
    "input",
    "font-light px-3 py-2 rounded duration-400 transition focus:ring-2 focus:ring-purple-500 hover:ring-2 hover:ring-purple-300 outline-none border " +
      classNames
  );
  input.placeholder = placeholderText;
  return input;
}

const regeneratePreviewGrid = () => {
  const { width, height } = currentPreset;
  const previewGrid = document.getElementById("preview-grid");
  previewGrid.innerHTML = "";

  if (height > 0 && width > 0) {

    // :o
    if (currentScreen !== "edit-preset")
      currentPreset.grid = Array.from({ length: height }, (_, i) =>
        Array.from({ length: width }, (_, j) => ({ y: i + 1, x: j + 1, value: null }))
      );

    for (let i = 1; i <= height; i++) {
      const currentRow = createElement("div", "flex space-x-[2px]");

      for (let j = 1; j <= width; j++) {
        const cell = createElement(
          "div",
          "cell w-[20px] h-[20px] rounded border hover:ring-2 hover:ring-gray-200 duration-400 transition cursor-pointer"
        );
        cell.dataset.y = i;
        cell.dataset.x = j;

        cell.addEventListener("click", () => {
          if (!selectedControlButton) return;

          cell.classList.forEach(cls => {
            if (/^bg-\[.*\]$/.test(cls)) cell.classList.remove(cls);
          });

          const gridCell = currentPreset.grid[i - 1][j - 1];

          if (selectedControlButton === "eraser") {
            gridCell.value = null;
          } else {
            cell.classList.add(`bg-[${colors[selectedControlButton]}]`);

            if (mobs.includes(selectedControlButton)) {
              gridCell.value = { name: selectedControlButton, intelligence: "low", speed: "slow" };
            } else {
              gridCell.value = { name: selectedControlButton };
            }
          }

          updateMobsParameters();
        });

        const gridCell = currentPreset.grid[i - 1][j - 1];
        if (currentScreen === "edit-preset" && gridCell.value) {
          cell.classList.add(`bg-[${colors[gridCell.value.name]}]`);
        }

        currentRow.appendChild(cell);
      }
      previewGrid.appendChild(currentRow);
    }
  } else {
    previewGrid.innerHTML = "Here map will be shown.";
  }
};

const updateMobsParameters = () => {
  const mobsParametersList = document.getElementById("mobs-parameters-list");
  mobsParametersList.innerHTML = "";
  let mobsExist = false;

  const buttonBaseClass = "border border-gray-400 w-[70px] py-1 duration-400 transition rounded";

  function createToggleButton(label, isActive, onClick) {
    const button = createElement("button", buttonBaseClass);

    button.textContent = label;
    button.className += isActive ? " bg-gray-400 text-white border-white shadow-md shadow-gray-400" : " bg-white text-gray-400 hover:bg-gray-400 hover:shadow-md hover:shadow-gray-400 hover:text-white";
    button.addEventListener("click", onClick);

    return button;
  }

  currentPreset.grid.forEach((rowItem, y) => {
    rowItem.forEach((colItem, x) => {
      const value = colItem.value;

      if (value && mobs.includes(value.name)) {
        mobsExist = true;

        const parametersCard = createElement("div", "flex flex-col border p-3 rounded space-y-2");

        // Mob Name
        const mob = createElement("p", "text-gray-500");
        mob.textContent = "Mob: ";
        const mobValue = createElement("span", "font-bold text-gray-500");
        mobValue.textContent = value.name.charAt(0).toUpperCase() + value.name.slice(1);
        mob.appendChild(mobValue);

        // Position
        const position = createElement("p", "text-gray-500");
        position.textContent = "Position: ";
        const positionValue = createElement("span", "font-bold text-gray-500");
        positionValue.textContent = `${colItem.y}x${colItem.x}`;
        position.appendChild(positionValue);

        // Intelligence
        const intelligence = createElement("div", "flex flex-col");
        const intelligenceHeader = createElement("p", "text-gray-500");
        intelligenceHeader.textContent = "Intelligence:";
        const intelligenceControls = createElement("div", "flex space-x-[3px]");

        const buttonLow = createToggleButton("Low", value.intelligence === "low", () => {
          currentPreset.grid[y][x].value.intelligence = "low";
          updateMobsParameters();
        });

        const buttonMedium = createToggleButton("Medium", value.intelligence === "medium", () => {
          currentPreset.grid[y][x].value.intelligence = "medium";
          updateMobsParameters();
        });

        const buttonHigh = createToggleButton("High", value.intelligence === "high", () => {
          currentPreset.grid[y][x].value.intelligence = "high";
          updateMobsParameters();
        });

        intelligenceControls.append(buttonLow, buttonMedium, buttonHigh);
        intelligence.append(intelligenceHeader, intelligenceControls);

        // Speed
        const speed = createElement("div", "flex flex-col");
        const speedHeader = createElement("p", "text-gray-500");
        speedHeader.textContent = "Speed:";
        const speedControls = createElement("div", "flex space-x-[3px]");

        const buttonSlow = createToggleButton("Slow", value.speed === "slow", () => {
          currentPreset.grid[y][x].value.speed = "slow";
          updateMobsParameters();
        });

        const buttonFast = createToggleButton("Fast", value.speed === "fast", () => {
          currentPreset.grid[y][x].value.speed = "fast";
          updateMobsParameters();
        });

        speedControls.append(buttonSlow, buttonFast);
        speed.append(speedHeader, speedControls);

        // Combine all
        parametersCard.append(mob, position, intelligence, speed);
        mobsParametersList.appendChild(parametersCard);
      }
    });
  });

  if (!mobsExist) {
    mobsParametersList.innerHTML = "Here parameters of each mob will be displayed.";
  }
}

const formatDate = (date) => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

const fetchPresets = async () => {
  const storedPresets = localStorage.getItem("presets");
  const presets = storedPresets ? JSON.parse(storedPresets) : [];
  return presets;
}

const fetchGameStats = async () => {
  const storedStats = localStorage.getItem("gameStats");
  const stats = localStorage.getItem("gameStats") ? JSON.parse(storedStats) : [];
  return stats;
}

const savePreset = async (preset) => {
  const presets = await fetchPresets();
  presets.push(preset);
  localStorage.setItem("presets", JSON.stringify(presets));
};

const saveAllPresets = async (presets) => {
  localStorage.setItem("presets", JSON.stringify(presets));
}

const deletePreset = async (presetId) => {
  let presets = await fetchPresets();
  presets = presets.filter(preset => preset.id !== presetId);
  saveAllPresets(presets);
}

const deleteGameStats = async () => {
  localStorage.removeItem("gameStats");
}

const saveGameStats = async (newGameStats) => {
  const stats = await fetchGameStats();
  stats.push(newGameStats);
  localStorage.setItem("gameStats", JSON.stringify(stats));
}

const countElementsInGrid = (preset, element) => {
  return preset.grid && preset.grid.reduce((totalCount, currentRow) => {
    const rowCount = currentRow.reduce((rowCount, currentRowCell) => {
      return rowCount + (currentRowCell.value && currentRowCell.value.name === element);
    }, 0)
    return totalCount + rowCount;
  }, 0)
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

applyBaseStyles();
createNotificationBar();
render();

// Good job scrolling this far. You win nothing, but hey — respect. 😎


