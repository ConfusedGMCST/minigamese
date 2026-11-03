
/*
    EVIL DIPTERS
    Main landing page navigation.

    Each tile links directly to its own minigame folder.
*/

const gameTiles = document.querySelectorAll(".game-tile");

gameTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
        // Browser follows the tile's normal href.
        // No extra navigation code is required.
        console.log("Opening minigame:", tile.getAttribute("href"));
    });
});
